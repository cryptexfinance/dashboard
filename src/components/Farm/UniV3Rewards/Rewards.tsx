import React, { useContext, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Table from "react-bootstrap/esm/Table";
import Tooltip from "react-bootstrap/esm/Tooltip";
import Spinner from "react-bootstrap/Spinner";
import { useTranslation } from "react-i18next";
import { BigNumber, ethers } from "ethers";
import NumberFormat from "react-number-format";
import { Contract } from "ethers-multicall";
import { useQuery, gql } from "@apollo/client";
import { FaArrowsAltH } from "react-icons/fa";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { ReactComponent as CtxIcon } from "../../../assets/images/ctx-coin.svg";
import { ReactComponent as WETHIcon } from "../../../assets/images/graph/weth.svg";
import { ReactComponent as UNIIconSmall } from "../../../assets/images/vault/uni.svg";
import NetworkContext from "../../../state/NetworkContext";
import { SignerContext } from "../../../state/SignerContext";
import TokensContext from "../../../state/TokensContext";
import { NETWORKS } from "../../../utils/constants";
import { UNIV3, computeIncentiveId } from "../../../utils/univ3";
import {
  capitalize,
  calculateCumulativePrice,
  errorNotification,
  notifyUser,
  numberFormatStr,
} from "../../../utils/utils";
import { IncentiveType, PositionType, positionDefaultValues, StakeStatus } from "./types";
import ClaimReward from "./ClaimReward";
import Stake from "./Stake";

type props = {
  ownerAddress: string;
  signer: SignerContext;
  stakerContract: ethers.Contract | undefined;
  stakerContractRead: Contract | undefined;
  nfpmContract: ethers.Contract | undefined;
  nfpmContractRead: Contract | undefined;
  poolContractRead: Contract | undefined;
};

type btnProps = {
  position: PositionType;
};

type infoMsgProps = {
  message: string;
};

const Rewards = ({
  ownerAddress,
  signer,
  stakerContract,
  stakerContractRead,
  nfpmContract,
  nfpmContractRead,
  poolContractRead,
}: props) => {
  const { t } = useTranslation();
  const tokens = useContext(TokensContext);
  const currentNetwork = useContext(NetworkContext);
  const [ethTcapIncentive, setEthTcapIncentive] = useState<Array<IncentiveType>>([]);
  const [ethTcapPositions, setEthTcapPositions] = useState<Array<PositionType>>([]);
  const [cumulativePrice, setCumulativePrice] = useState(0);
  const [availableReward, setAvailableReward] = useState(0);
  const [showClaim, setShowClaim] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const OWNER_POSITIONS = gql`
    query ownerPools($owner: String!) {
      positions(where: { owner: $owner, liquidity_gt: 0 }, orderBy: id) {
        id
        poolAddress
        tickLower {
          tickIdx
          price0
          price1
        }
        tickUpper {
          tickIdx
          price0
          price1
        }
        liquidity
      }
    }
  `;

  const loadData = async (positionsData: any) => {
    let ethTcapPool = UNIV3.mainnet.tcapPool;
    switch (currentNetwork.chainId) {
      case NETWORKS.rinkeby.chainId:
        ethTcapPool = UNIV3.rinkeby.tcapPool;
        break;
      default:
        ethTcapPool = UNIV3.mainnet.tcapPool;
        break;
    }
    setEthTcapIncentive(ethTcapPool.incentives);
    const ethPositions = new Array<PositionType>();

    // Read pool price
    const poolObserveCall = await poolContractRead?.observe([0, 10]);
    // @ts-ignore
    const [observations] = await signer.ethcallProvider?.all([poolObserveCall]);
    const tickCumulative0 = observations.tickCumulatives[0];
    const tickCumulative1 = observations.tickCumulatives[1];

    const currentCumPrice = calculateCumulativePrice(tickCumulative0, tickCumulative1, 10);
    setCumulativePrice(currentCumPrice);

    positionsData.positions.forEach(async (p: any) => {
      if (p.poolAddress === ethTcapPool.id.toLowerCase()) {
        const position = { ...positionDefaultValues };
        const incentiveId = computeIncentiveId(ethTcapPool.incentives[0]);
        position.lpTokenId = p.id;
        position.poolId = p.poolAddress;
        position.tickLower = parseInt(p.tickLower.tickIdx);
        position.tickLowerPrice0 = p.tickLower.price0;
        position.tickLowerPrice1 = p.tickLower.price1;
        position.tickUpper = parseInt(p.tickUpper.tickIdx);
        position.tickUpperPrice0 = p.tickUpper.price0;
        position.tickUpperPrice1 = p.tickUpper.price1;
        position.incetiveId = incentiveId;
        position.liquidity = ethers.utils.formatEther(p.liquidity);

        const nfpCall = await nfpmContractRead?.getApproved(p.id);
        const lpDepositsCall = await stakerContractRead?.deposits(p.id);
        const lpStakesCall = await stakerContractRead?.stakes(p.id, incentiveId);
        const availableRewardCall = await stakerContractRead?.rewards(
          ethTcapPool.incentives[0].rewardToken,
          ownerAddress
        );
        // @ts-ignore
        const [nfpAddress, depositsEth, stakesEth, availableRewardWei] =
          await signer.ethcallProvider?.all([
            nfpCall,
            lpDepositsCall,
            lpStakesCall,
            availableRewardCall,
          ]);
        setAvailableReward(parseFloat(ethers.utils.formatEther(availableRewardWei)));
        if (
          depositsEth.owner === ownerAddress &&
          depositsEth.tickLower === position.tickLower &&
          depositsEth.tickUpper === position.tickUpper
        ) {
          position.status = StakeStatus.deposited;
          if (stakesEth.liquidity > BigNumber.from("0")) {
            position.status = StakeStatus.staked;
            const rewardInfoCall = await stakerContractRead?.getRewardInfo(
              ethTcapPool.incentives[0],
              p.id
            );
            // @ts-ignore
            const [rewardInfo] = await signer.ethcallProvider?.all([rewardInfoCall]);
            position.reward = parseFloat(ethers.utils.formatEther(rewardInfo.reward));
          }
        } else if (nfpAddress.toLowerCase() !== UNIV3.stakerAddress.toLowerCase()) {
          position.status = StakeStatus.not_approved;
        }

        // Check if it is in range
        position.priceInRange =
          currentCumPrice >= position.tickUpperPrice1 &&
          currentCumPrice <= position.tickLowerPrice1;

        ethPositions.push(position);
        setEthTcapPositions([...ethPositions]);
      }
    });
  };

  const { loading, data, error, refetch } = useQuery(OWNER_POSITIONS, {
    fetchPolicy: "no-cache",
    pollInterval: 60000,
    notifyOnNetworkStatusChange: true,
    variables: { owner: ownerAddress.toLowerCase() },
    onError: () => {
      console.log(error);
    },
    onCompleted: () => {
      if (signer.signer && ownerAddress !== "") {
        loadData(data);
        setFirstLoad(false);
      }
    },
  });

  const refresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const lpUrl = () => {
    const tcapAddress = tokens.tcapToken?.address;
    let { feeTier } = UNIV3.mainnet.tcapPool;
    let wethAddress = NETWORKS.mainnet.eth;
    if (currentNetwork.chainId === NETWORKS.rinkeby.chainId) {
      feeTier = UNIV3.rinkeby.tcapPool.feeTier;
      wethAddress = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    }

    return `https://app.uniswap.org/#/add/${wethAddress}/${tcapAddress}/${feeTier}?chain=${currentNetwork.name}`;
  };

  const withdraw = async (lpTokenId: number) => {
    if (stakerContract) {
      try {
        const tx = await stakerContract.withdrawToken(lpTokenId, ownerAddress, "0x");
        notifyUser(tx, refresh);
        refresh();
      } catch (error) {
        errorNotification("Transaction Rejected");
        console.log(error);
      }
    }
  };

  const ClaimButton = () => {
    const btnDisabled = !(availableReward > 0);
    return (
      <Button
        onClick={() => {
          setShowClaim(true);
        }}
        variant="success"
        className=" ml-4 claim"
        disabled={btnDisabled}
      >
        {t("claim")}
      </Button>
    );
  };

  const WithdrawButton = ({ position }: btnProps) => {
    const title = t("exit");
    let btnDisabled = true;

    // eslint-disable-next-line
    if (position.status === StakeStatus.deposited) {
      btnDisabled = false;
    }

    return (
      <Button
        variant="warning"
        className=" ml-4 small"
        disabled={btnDisabled}
        onClick={() => withdraw(position.lpTokenId)}
      >
        {title}
      </Button>
    );
  };

  const InfoMessage = ({ message }: infoMsgProps) => (
    <div className="info-message">
      <h6>{message}</h6>
    </div>
  );

  const sortPositions = (p1: PositionType, p2: PositionType) => p1.lpTokenId - p2.lpTokenId;

  const RenderRewards = () => (
    <>
      <div className="rewards">
        <div className="rewards-tier">
          <h6>Fee tier:</h6>
          <NumberFormat
            className="number"
            value="0.3"
            displayType="text"
            thousandSeparator
            prefix=""
            suffix="%"
            decimalScale={4}
          />
        </div>
        <div className="rewards-total">
          <h6>
            {t("farming.univ3.available-claim")}
            <OverlayTrigger
              key="bottom"
              placement="bottom"
              overlay={<Tooltip id="tooltip-bottom">{t("farming.univ3.claim-info")}</Tooltip>}
            >
              <Button variant="dark" className="question-small">
                ?
              </Button>
            </OverlayTrigger>
            :
          </h6>
          <div className="amount">
            <NumberFormat
              className="number"
              value={availableReward}
              displayType="text"
              thousandSeparator
              prefix=""
              decimalScale={4}
            />
            <CtxIcon />
          </div>
          <div className="claim-button">
            <ClaimButton />
          </div>
        </div>
      </div>
      <Table hover className="mt-2">
        <thead>
          <th />
          <th>
            {t("farming.univ3.position")}
            <OverlayTrigger
              key="top"
              placement="right"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="ttip-position" className="univ3-status-tooltip">
                  {t("farming.univ3.position-info1")} <br />
                  {t("farming.univ3.position-info2")}{" "}
                  <span className={StakeStatus.staked}>
                    {numberFormatStr(cumulativePrice.toString(), 4, 4)}
                  </span>{" "}
                  TCAP per WETH
                </Tooltip>
              }
            >
              <Button variant="dark">?</Button>
            </OverlayTrigger>
          </th>
          <th className="status">
            {t("status")}
            <OverlayTrigger
              key="top"
              placement="right"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="ttip-status" className="univ3-status-tooltip">
                  <span className={StakeStatus.not_approved}>Pending</span>:{" "}
                  {t("farming.univ3.pending-info")} <br />
                  <span className={StakeStatus.empty}>Unstaked</span>:{" "}
                  {t("farming.univ3.unstaked-info")} <br />
                  <span className={StakeStatus.deposited}>Deposited</span>:{" "}
                  {t("farming.univ3.deposited-info")} <br />
                  <span className={StakeStatus.staked}>Staked</span>:{" "}
                  {t("farming.univ3.staked-info")} <br />
                  <span className={StakeStatus.out_range}>Out of range</span>:{" "}
                  {t("farming.univ3.out-of-range-info")}
                </Tooltip>
              }
            >
              <Button variant="dark">?</Button>
            </OverlayTrigger>
          </th>
          <th>
            {t("farming.univ3.current-reward")}
            <OverlayTrigger
              key="top"
              placement="auto"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="ttip-status" className="univ3-status-tooltip">
                  {t("farming.univ3.current-reward-info")}
                </Tooltip>
              }
            >
              <Button variant="dark">?</Button>
            </OverlayTrigger>
          </th>
          <th>APR</th>
          <th />
        </thead>
        <tbody>
          {ethTcapPositions.sort(sortPositions).map((position, index) => {
            console.log("");
            return (
              <tr key={index}>
                <td>
                  <WETHIcon className="weth" />
                  <TcapIcon className="tcap" />
                </td>
                <td className="position">
                  <div className="ranges">
                    <div className="min-range">
                      <span>Min: {numberFormatStr(position.tickUpperPrice1.toString(), 4, 4)}</span>
                    </div>
                    <FaArrowsAltH />
                    <div className="max-range">
                      <span>Max: {numberFormatStr(position.tickLowerPrice1.toString(), 4, 4)}</span>
                    </div>
                  </div>
                  <div className="description">
                    <span className="tokens">TCAP/WETH Pool</span>
                    <small>Uniswap</small>
                  </div>
                </td>
                <td>
                  <div className="status">
                    {position.priceInRange ? (
                      <span className={position.status}>
                        {position.status === StakeStatus.not_approved
                          ? "Pending"
                          : capitalize(position.status)}
                      </span>
                    ) : (
                      <span className={StakeStatus.out_range}>Out of range</span>
                    )}
                  </div>
                </td>
                <td className="number">
                  <NumberFormat
                    className="number"
                    value={position.reward}
                    displayType="text"
                    thousandSeparator
                    prefix=""
                    decimalScale={2}
                  />{" "}
                  CTX
                </td>
                <td>
                  <NumberFormat
                    className="number"
                    value={90}
                    displayType="text"
                    thousandSeparator
                    suffix="%"
                    decimalScale={0}
                  />
                </td>
                <td align="right">
                  <>
                    <Stake
                      ownerAddress={ownerAddress}
                      position={position}
                      incentive={ethTcapIncentive[0]}
                      nfpmContract={nfpmContract}
                      stakerContract={stakerContract}
                      refresh={() => refresh()}
                    />
                    <WithdrawButton position={position} />
                  </>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );

  const RenderEmptyLP = () => (
    <div className="empty-lp">
      <div className="lp-box">
        <div className="lp-info">
          <div className="icons">
            <WETHIcon className="weth" />
            <TcapIcon className="tcap" />
          </div>
          <div className="description">
            <a target="_blank" rel="noreferrer" href={lpUrl()}>
              WETH/TCAP Pool <br />
              <UNIIconSmall className="uni" />
              <small> Fee tier: 0.3%</small>
            </a>
          </div>
        </div>
        <a className="btn" target="_blank" rel="noreferrer" href={lpUrl()}>
          Create Position
        </a>
      </div>
    </div>
  );

  return (
    <Card className="diamond mb-2 univ3">
      <Card.Header>
        <h2>Uniswap V3 {t("farming.liquidity")}</h2>
      </Card.Header>
      <Card.Body>
        {ownerAddress !== "" ? (
          <>
            {loading && firstLoad ? (
              <Spinner variant="danger" className="spinner" animation="border" />
            ) : (
              <>{ethTcapPositions.length === 0 ? RenderEmptyLP() : RenderRewards()}</>
            )}
          </>
        ) : (
          <InfoMessage message="Connect your Wallet" />
        )}
      </Card.Body>
      <ClaimReward
        show={showClaim}
        ownerAddress={ownerAddress}
        currentReward={availableReward}
        incentive={ethTcapIncentive[0]}
        stakerContract={stakerContract}
        onHide={() => {
          setShowClaim(false);
        }}
        refresh={() => refresh()}
      />
    </Card>
  );
};

export default Rewards;
