import React, { useContext, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Table from "react-bootstrap/esm/Table";
import Tooltip from "react-bootstrap/esm/Tooltip";
import Spinner from "react-bootstrap/Spinner";
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
import Apr from "./Apr";

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

const Rewards = ({
  ownerAddress,
  signer,
  stakerContract,
  stakerContractRead,
  nfpmContract,
  nfpmContractRead,
  poolContractRead,
}: props) => {
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

  const confIncetive = (): any => {
    let ethTcapPool = UNIV3.mainnet.tcapPool;
    switch (currentNetwork.chainId) {
      case NETWORKS.rinkeby.chainId:
        ethTcapPool = UNIV3.rinkeby.tcapPool;
        break;
      default:
        ethTcapPool = UNIV3.mainnet.tcapPool;
        break;
    }
    // console.log(computeIncentiveId(ethTcapPool.incentives[0]));
    setEthTcapIncentive(ethTcapPool.incentives);

    return ethTcapPool;
  };

  const loadData = async (positionsData: any) => {
    const ethTcapPool = confIncetive();
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
    pollInterval: 90000,
    notifyOnNetworkStatusChange: true,
    variables: { owner: ownerAddress.toLowerCase() },
    onError: () => {
      console.log(error);
    },
    onCompleted: () => {
      if (signer.signer && ownerAddress !== "") {
        loadData(data);
        setFirstLoad(false);
      } else {
        confIncetive();
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
        Claim
      </Button>
    );
  };

  const WithdrawButton = ({ position }: btnProps) => {
    const title = "Exit";
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

  const sortPositions = (p1: PositionType, p2: PositionType) => p1.lpTokenId - p2.lpTokenId;

  const RenderRewards = () => (
    <>
      <div className="rewards">
        <div className="rewards-tier">
          <div className="rewards-item">
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
          <div className="rewards-item">
            <h6>APR:</h6>
            <Apr incentive={ethTcapIncentive[0]} stakerContractRead={stakerContractRead} />
          </div>
        </div>
        <div className="rewards-total">
          <h6>
            Available to Claim
            <OverlayTrigger
              key="bottom"
              placement="bottom"
              overlay={
                <Tooltip id="tooltip-bottom">
                  In order to claim rewards, you need to unstake your token.
                </Tooltip>
              }
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
            Position
            <OverlayTrigger
              key="top"
              placement="right"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="ttip-position" className="univ3-status-tooltip">
                  Position Min and Max price represents TCAP per WETH. <br />
                  Current price is{" "}
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
            Status
            <OverlayTrigger
              key="top"
              placement="right"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="ttip-status" className="univ3-status-tooltip">
                  <span className={StakeStatus.not_approved}>Pending</span>: LP token needs to be
                  approved in order to be staked. <br />
                  <span className={StakeStatus.empty}>Unstaked</span>: LP token hasn't been staked
                  or deposited. <br />
                  <span className={StakeStatus.deposited}>Deposited</span>: LP token needs to be
                  stake to earn rewards. <br />
                  <span className={StakeStatus.staked}>Staked</span>: LP token is staked and earning
                  rewards. <br />
                  <span className={StakeStatus.out_range}>Out of range</span>: You aren't earning
                  rewards because the price is out of your position range.
                </Tooltip>
              }
            >
              <Button variant="dark">?</Button>
            </OverlayTrigger>
          </th>
          <th>
            <div className="current-rewards">
              <div className="title">Current Reward</div>
              <div className="button">
                <OverlayTrigger
                  key="top"
                  placement="auto"
                  trigger={["hover", "click"]}
                  overlay={
                    <Tooltip id="ttip-status" className="univ3-status-tooltip">
                      Amount of CTX that it's been earn while the LP token is staked. You must
                      unstake the LP token in order to claim the reward.
                    </Tooltip>
                  }
                >
                  <Button variant="dark">?</Button>
                </OverlayTrigger>
              </div>
            </div>
          </th>
          <th />
        </thead>
        <tbody>
          {ethTcapPositions.sort(sortPositions).map((position, index) => (
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
          ))}
        </tbody>
      </Table>
    </>
  );

  const RenderEmptyLP = () => (
    <div className="empty-lp">
      <div className="lp-box">
        <div className="lp-info">
          <div className="row1">
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
          <div className="row2">
            <h6>Current APR:</h6>
            <Apr incentive={ethTcapIncentive[0]} stakerContractRead={stakerContractRead} />
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
        <h2>Uniswap V3 Liquidity Rewards</h2>
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
          <RenderEmptyLP />
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
