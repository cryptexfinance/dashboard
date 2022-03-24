import React, { useContext, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Table from "react-bootstrap/esm/Table";
import { BigNumber, ethers } from "ethers";
import NumberFormat from "react-number-format";
import { Contract } from "ethers-multicall";
import { useQuery, gql } from "@apollo/client";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../../../assets/images/graph/weth.svg";
import NetworkContext from "../../../state/NetworkContext";
import { SignerContext } from "../../../state/SignerContext";
import TokensContext from "../../../state/TokensContext";
import { NETWORKS } from "../../../utils/constants";
import { UNIV3, computeIncentiveId } from "../../../utils/univ3";
import { capitalize } from "../../../utils/utils";
import Stake from "./Stake";
import { IncentiveType, PositionType, StakeStatus } from "./types";

type props = {
  ownerAddress: string;
  signer: SignerContext;
  stakerContract: ethers.Contract | undefined;
  stakerContractRead: Contract | undefined;
  nfpmContract: ethers.Contract | undefined;
  nfpmContractRead: Contract | undefined;
};

type btnProps = {
  position: PositionType;
};

const positionDefault = {
  lpTokenId: 0,
  poolId: "",
  liquidity: "0.00",
  tickLower: 0,
  tickUpper: 0,
  incetiveId: "",
  reward: 0,
  status: StakeStatus.empty,
};

const Rewards = ({
  ownerAddress,
  signer,
  stakerContract,
  stakerContractRead,
  nfpmContract,
  nfpmContractRead,
}: props) => {
  const tokens = useContext(TokensContext);
  const currentNetwork = useContext(NetworkContext);
  const [ethTcapIncentive, setEthTcapIncentive] = useState<Array<IncentiveType>>([]);
  const [ethTcapPositions, setEthTcapPositions] = useState<Array<PositionType>>([]);

  const OWNER_POSITIONS = gql`
    query ownerPools($owner: String!) {
      positions(where: { owner: $owner }) {
        id
        pool {
          id
        }
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
        tickLower {
          tickIdx
        }
        tickUpper {
          tickIdx
        }
        liquidity
      }
    }
  `;

  const loadData = async (positionsData: any) => {
    let ethTcapPool = UNIV3.mainnet.tcapPool;
    switch (currentNetwork.chainId) {
      case NETWORKS.rinkeby.chainId:
        ethTcapPool = UNIV3.mainnet.tcapPool;
        break;
      default:
        ethTcapPool = UNIV3.rinkeby.tcapPool;
        break;
    }
    setEthTcapIncentive(ethTcapPool.incentives);
    const ethPositions = new Array<PositionType>();
    console.log("-- pos ---");
    console.log(positionsData.positions);
    positionsData.positions.forEach(async (p: any) => {
      if (p.pool.id === ethTcapPool.id.toLowerCase()) {
        const position = { ...positionDefault };
        const incentiveId = computeIncentiveId(ethTcapPool.incentives[0]);
        position.lpTokenId = p.id;
        position.poolId = p.pool.id;
        position.tickLower = p.tickLower.tickIdx;
        position.tickUpper = p.tickUpper.tickIdx;
        position.incetiveId = incentiveId;
        position.liquidity = ethers.utils.formatEther(p.liquidity);

        const nfpCall = await nfpmContractRead?.getApproved(p.id);
        const lpDepositsCall = await stakerContractRead?.deposits(p.id);
        const lpStakesCall = await stakerContractRead?.stakes(p.id, incentiveId);

        // @ts-ignore
        const [nfpAddress, depositsEth, stakesEth] = await signer.ethcallProvider?.all([
          nfpCall,
          lpDepositsCall,
          lpStakesCall,
        ]);
        if (nfpAddress.toLowerCase() !== UNIV3.stakerAddress.toLowerCase()) {
          position.status = StakeStatus.not_approved;
        } else if (
          depositsEth.owner === ownerAddress &&
          depositsEth.tickLower === position.tickLower &&
          depositsEth.tickUpper === position.tickUpper
        ) {
          position.status = StakeStatus.deposited;

          if (stakesEth.liquidity > BigNumber.from("0")) {
            position.status = StakeStatus.staked;
          }
        }
        ethPositions.push(position);
        setEthTcapPositions(ethPositions);
      }
    });
  };

  const { loading, data, error, refetch } = useQuery(OWNER_POSITIONS, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: { owner: ownerAddress },
    onError: () => {
      console.log(error);
      console.log(loading);
    },
    onCompleted: () => {
      loadData(data);
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
    const wethAddress = tokens.wethToken?.address;

    return `https://app.uniswap.org/add/${wethAddress}/${tcapAddress}?chain=${currentNetwork.name}`;
  };

  const ClaimButton = ({ position }: btnProps) => {
    let btnDisabled = true;

    // eslint-disable-next-line
    if (position.status !== StakeStatus.staked) {
      btnDisabled = !(position.reward > 0);
    }
    return (
      <Button variant="success" className=" ml-4 small" disabled={btnDisabled}>
        Claim
      </Button>
    );
  };

  const WithdrawButton = ({ position }: btnProps) => {
    let title = "Exit";
    let btnDisabled = true;

    // eslint-disable-next-line
    if (position.status === StakeStatus.staked) {
      title = "Unstake";
      btnDisabled = false;
    }
    // eslint-disable-next-line
    if (position.status === StakeStatus.deposited) {
      btnDisabled = false;
    }

    return (
      <Button variant="warning" className=" ml-4 small" disabled={btnDisabled}>
        {title}
      </Button>
    );
  };

  return (
    <Card className="diamond mb-2 univ3">
      <Table hover className="mt-2">
        <thead>
          <th />
          <th>Description</th>
          <th className="right">Token ID</th>
          <th className="right">Liquidity</th>
          <th className="center">Status</th>
          <th className="right">Reward</th>
          <th className="right">APY</th>
          <th />
        </thead>
        <tbody>
          {ethTcapPositions.map((position, index) => {
            console.log("");
            return (
              <tr key={index}>
                <td>
                  <WETHIcon className="weth" />
                  <TcapIcon className="tcap" />
                </td>
                <td>
                  <a target="_blank" rel="noreferrer" href={lpUrl()}>
                    WETH/TCAP Pool <br /> <small> Uniswap </small>
                  </a>
                </td>
                <td align="right">{position.lpTokenId}</td>
                <td className="number" align="right">
                  <NumberFormat
                    className="number"
                    value={position.liquidity}
                    displayType="text"
                    thousandSeparator
                    prefix=""
                    decimalScale={2}
                  />{" "}
                </td>
                <td align="center">
                  {position.status === StakeStatus.not_approved
                    ? "Not Approved"
                    : capitalize(position.status)}
                </td>
                <td className="number" align="right">
                  <NumberFormat
                    className="number"
                    value={0}
                    displayType="text"
                    thousandSeparator
                    prefix=""
                    decimalScale={2}
                  />{" "}
                  CTX
                </td>
                <td className="number" align="right">
                  <b className="fire">
                    <NumberFormat
                      className="number"
                      value={0}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                    />
                    %
                  </b>
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
                    <ClaimButton position={position} />
                    <WithdrawButton position={position} />
                  </>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
};

export default Rewards;
