import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Row from "react-bootstrap/esm/Row";
import Table from "react-bootstrap/esm/Table";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { ethers } from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import VaultsContext from "../state/VaultsContext";
import OraclesContext from "../state/OraclesContext";
import GovernanceContext from "../state/GovernanceContext";
import RewardsContext from "../state/RewardsContext";

import "../styles/farm.scss";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../assets/images/graph/DAI.svg";
import Loading from "./Loading";
import {
  notifyUser,
  errorNotification,
  tsToDateString,
  getPriceInUSDFromPair,
} from "../utils/utils";
import { Stake } from "./modals/Stake";

const Farm = () => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [ethRewards, setEthRewards] = useState("0");
  const [daiRewards, setDaiRewards] = useState("0");
  const [ethPoolRewards, setEthPoolRewards] = useState("0.0");
  const [ctxPoolRewards, setCtxPoolRewards] = useState("0.0");
  const [vethPoolRewards, setVEthPoolRewards] = useState("0.0");
  const [vctxPoolRewards, setVCtxPoolRewards] = useState("0.0");
  const [ethDebt, setEthDebt] = useState("0.0");
  const [daiDebt, setDaiDebt] = useState("0.0");
  const [ethPoolStake, setEthPoolStake] = useState("0.0");
  const [ctxPoolStake, setCtxPoolStake] = useState("0.0");
  const [ethPoolBalance, setEthPoolBalance] = useState("0.0");
  const [ctxPoolBalance, setCtxPoolBalance] = useState("0.0");
  const [vestingEndTime, setVestingEndTime] = useState(0);
  const [ctxVestingEndTime, setCtxVestingEndTime] = useState(0);
  const signer = useContext(SignerContext);

  const tokens = useContext(TokensContext);
  const vaults = useContext(VaultsContext);
  const oracles = useContext(OraclesContext);
  const governance = useContext(GovernanceContext);
  const rewards = useContext(RewardsContext);
  const [stakeShow, setStakeShow] = useState(false);
  const [stakeBalance, setStakeBalance] = useState("0");
  const [selectedPoolTitle, setSelectedPoolTitle] = useState("");
  const [selectedPool, setSelectedPool] = useState<ethers.Contract>();
  const [selectedPoolToken, setSelectedPoolToken] = useState<ethers.Contract>();
  // APY
  const [, setEthVaultAPY] = useState("0");
  const [, setDaiVaultAPY] = useState("0");
  const [ethPoolAPY, setEthPoolAPY] = useState("0");
  const [ctxPoolAPY, setCtxPoolAPY] = useState("0");

  const oneYear = 60 * 60 * 24 * 365;

  const lpURL = process.env.REACT_APP_LP_URL;
  const phase = process.env.REACT_APP_PHASE ? parseInt(process.env.REACT_APP_PHASE) : 0;

  const USER_VAULTS = gql`
    query getVault($owner: String!) {
      vaults(where: { owner: $owner }) {
        id
        vaultId
        owner
        collateral
        debt
        currentRatio
        address
        owner
      }
    }
  `;

  async function getAPYFromVaultRewards(
    totalTcapDebt: number,
    rate: number,
    ctxPrice: number,
    tcapPrice: number
  ) {
    const apy = ((rate * oneYear * ctxPrice) / (tcapPrice * totalTcapDebt)) * 100;
    return apy.toString();
  }

  async function getAPYFromLPRewards(
    rate: number,
    LPsStaked: number,
    reserves: any,
    totalSupplyPool: number,
    ctxPrice: number,
    ethPrice: number
  ) {
    const token0Price = await getPriceInUSDFromPair(reserves[0], reserves[1], ethPrice);
    const valuePerLPToken = (token0Price * reserves[0] + ethPrice * reserves[1]) / totalSupplyPool;
    const apy = ((rate * oneYear * ctxPrice) / (valuePerLPToken * LPsStaked)) * 100;

    if (Number.isNaN(apy)) {
      return "0";
    }

    return apy.toString();
  }

  async function setDebt(vaultData: any) {
    // TODO: fix if no graph
    await vaultData.vaults.forEach((v: any) => {
      switch (v.address.toLowerCase()) {
        case vaults?.wethVault?.address.toLowerCase():
          setEthDebt(ethers.utils.formatEther(v.debt));
          break;
        case vaults?.wbtcVault?.address.toLowerCase():
          // setWbtcDebt(ethers.utils.formatEther(v.debt));
          break;
        case vaults?.daiVault?.address.toLowerCase():
          setDaiDebt(ethers.utils.formatEther(v.debt));
          break;
        default:
          break;
      }
    });
  }

  const { data, refetch } = useQuery(USER_VAULTS, {
    variables: { owner: address },
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setDebt(data);
    },
  });

  const refresh = async () => {
    try {
      await refetch();
    } catch (error) {
      // catch error in case the vault screen is changed
    }
  };

  useEffect(() => {
    const loadAddress = async () => {
      if (
        tokens.tcapToken &&
        tokens.wethPoolToken &&
        oracles.tcapOracle &&
        tokens.ctxToken &&
        oracles.wethOracle &&
        governance.governorAlpha &&
        governance.timelock &&
        rewards.wethReward &&
        rewards.daiReward &&
        rewards.wethPoolReward
      ) {
        // Batch Calls
        const wethOracleCall = oracles.wethOracleRead?.getLatestAnswer();
        const tcapOracleCall = oracles.tcapOracleRead?.getLatestAnswer();
        const totalTcapDebtWethCall = await rewards.wethRewardRead?.totalSupply();
        const rateWethCall = await rewards.wethRewardRead?.rewardRate();
        const totalTcapDebtDaihCall = await rewards.daiRewardRead?.totalSupply();
        const rateDaiCall = await rewards.daiRewardRead?.rewardRate();
        const reservesEthPoolCall = await tokens.wethPoolTokenRead?.getReserves();
        const totalSupplyEthPoolCall = await tokens.wethPoolTokenRead?.totalSupply();
        const rateEthPoolCall = await rewards.wethPoolRewardRead?.rewardRate();
        const LPsStakedCall = await rewards.wethPoolRewardRead?.totalSupply();
        const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
        const totalSupplyCtxPoolCall = await tokens.ctxPoolTokenRead?.totalSupply();
        const rateCtxPoolCall = await rewards.ctxPoolRewardRead?.rewardRate();
        const ctxLPsStakedCall = await rewards.ctxPoolRewardRead?.totalSupply();
        const wethPoolVestingRatioCall = await rewards.wethPoolRewardRead?.vestingRatio();
        const wethPoolVestingTimeCall = await rewards.wethPoolRewardRead?.vestingEnd();
        const ctxVestingRatioCall = await rewards.ctxPoolRewardRead?.vestingRatio();
        const ctxVestingTimeCall = await rewards.ctxPoolRewardRead?.vestingEnd();

        // @ts-ignore
        const [
          wethOraclePrice,
          tcapPrice,
          totalTcapDebtWeth,
          rateWeth,
          totalTcapDebtDai,
          rateDai,
          reservesEthPool,
          totalSupplyEthPool,
          rateEthPool,
          LPsStaked,
          reservesCtxPool,
          totalSupplyCtxPool,
          rateCtxPool,
          ctxLPsStaked,
          wethPoolVestingRatio,
          wethPoolVestingTime,
          ctxVestingRatio,
          ctxVestingTime,
        ] = await signer.ethcallProvider?.all([
          wethOracleCall,
          tcapOracleCall,
          totalTcapDebtWethCall,
          rateWethCall,
          totalTcapDebtDaihCall,
          rateDaiCall,
          reservesEthPoolCall,
          totalSupplyEthPoolCall,
          rateEthPoolCall,
          LPsStakedCall,
          reservesCtxPoolCall,
          totalSupplyCtxPoolCall,
          rateCtxPoolCall,
          ctxLPsStakedCall,
          wethPoolVestingRatioCall,
          wethPoolVestingTimeCall,
          ctxVestingRatioCall,
          ctxVestingTimeCall,
        ]);

        const currentPriceTCAP = ethers.utils.formatEther(tcapPrice);
        const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));

        // REACT_APP_POOL_CTX
        const currentPriceCTX = await getPriceInUSDFromPair(
          reservesCtxPool[0],
          reservesCtxPool[1],
          parseFloat(currentPriceETH)
        );
        // ETH VAULT APY
        setEthVaultAPY(
          await getAPYFromVaultRewards(
            totalTcapDebtWeth,
            rateWeth,
            currentPriceCTX,
            parseFloat(currentPriceTCAP)
          )
        );

        // DAI VAULT APY
        setDaiVaultAPY(
          await getAPYFromVaultRewards(
            totalTcapDebtDai,
            rateDai,
            currentPriceCTX,
            parseFloat(currentPriceTCAP)
          )
        );

        // ETH Pool APY
        setEthPoolAPY(
          await getAPYFromLPRewards(
            rateEthPool,
            LPsStaked,
            reservesEthPool,
            totalSupplyEthPool,
            currentPriceCTX,
            parseFloat(currentPriceETH)
          )
        );

        // CTX Pool APY
        setCtxPoolAPY(
          await getAPYFromLPRewards(
            rateCtxPool,
            ctxLPsStaked,
            reservesCtxPool,
            totalSupplyCtxPool,
            currentPriceCTX,
            parseFloat(currentPriceETH)
          )
        );

        setVestingEndTime(wethPoolVestingTime);
        setCtxVestingEndTime(ctxVestingTime);

        if (signer.signer) {
          const currentAddress = await signer.signer.getAddress();
          setAddress(currentAddress);

          const currentEthRewardCall = await rewards?.wethRewardRead?.earned(currentAddress);
          const currentDaiRewardCall = await rewards?.daiRewardRead?.earned(currentAddress);
          const currentEthPoolRewardCall = await rewards.wethPoolRewardRead?.earned(currentAddress);
          const currentVEthPoolRewardCall = await rewards.wethPoolRewardRead?.vestingAmounts(
            currentAddress
          );
          const currentEthPoolStakeCall = await rewards.wethPoolRewardRead?.balanceOf(
            currentAddress
          );
          const currentEthPoolBalanceCall = await tokens.wethPoolTokenRead?.balanceOf(
            currentAddress
          );
          const currentCtxPoolRewardCall = await rewards.ctxPoolRewardRead?.earned(currentAddress);
          const currentVCtxPoolRewardCall = await rewards.ctxPoolRewardRead?.vestingAmounts(
            currentAddress
          );
          const currentCtxPoolStakeCall = await rewards.ctxPoolRewardRead?.balanceOf(
            currentAddress
          );
          const currentCtxPoolBalanceCall = await tokens.ctxPoolTokenRead?.balanceOf(
            currentAddress
          );

          // @ts-ignore
          const [
            currentEthReward,
            currentDaiReward,
            currentEthPoolReward,
            currentVEthPoolReward,
            currentEthPoolStake,
            currentEthPoolBalance,
            currentCtxPoolReward,
            currentVCtxPoolReward,
            currentCtxPoolStake,
            currentCtxPoolBalance,
          ] = await signer.ethcallProvider?.all([
            currentEthRewardCall,
            currentDaiRewardCall,
            currentEthPoolRewardCall,
            currentVEthPoolRewardCall,
            currentEthPoolStakeCall,
            currentEthPoolBalanceCall,
            currentCtxPoolRewardCall,
            currentVCtxPoolRewardCall,
            currentCtxPoolStakeCall,
            currentCtxPoolBalanceCall,
          ]);

          setEthRewards(ethers.utils.formatEther(currentEthReward));
          setDaiRewards(ethers.utils.formatEther(currentDaiReward));

          if (phase > 1) {
            setEthPoolRewards(
              ethers.utils.formatEther(
                currentEthPoolReward.mul(100 - wethPoolVestingRatio).div(100)
              )
            );
            setVEthPoolRewards(
              ethers.utils.formatEther(
                currentVEthPoolReward.add(currentEthPoolReward.mul(wethPoolVestingRatio).div(100))
              )
            );
            setEthPoolStake(ethers.utils.formatEther(currentEthPoolStake));
            setEthPoolBalance(ethers.utils.formatEther(currentEthPoolBalance));
            setCtxPoolRewards(
              ethers.utils.formatEther(currentCtxPoolReward.mul(100 - ctxVestingRatio).div(100))
            );
            setVCtxPoolRewards(
              ethers.utils.formatEther(
                currentVCtxPoolReward.add(currentCtxPoolReward.mul(ctxVestingRatio).div(100))
              )
            );
            setCtxPoolStake(ethers.utils.formatEther(currentCtxPoolStake));
            setCtxPoolBalance(ethers.utils.formatEther(currentCtxPoolBalance));
          }
        }
      }
      setIsLoading(false);
    };

    loadAddress();
    // eslint-disable-next-line
  }, [data]);

  if (isLoading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  const claimRewards = async (vaultType: string) => {
    try {
      let tx: ethers.ContractTransaction;
      switch (vaultType) {
        case "ETH":
          tx = await rewards?.wethReward?.getReward();
          break;
        case "WBTC":
          tx = await rewards?.wbtcReward?.getReward();
          break;
        case "DAI":
          tx = await rewards?.daiReward?.getReward();
          break;
        case "ETHPOOL":
          tx = await rewards?.wethPoolReward?.getReward();
          break;
        case "WBTCPOOL":
          tx = await rewards?.wbtcPoolReward?.getReward();
          break;
        case "DAIPOOL":
          tx = await rewards?.daiPoolReward?.getReward();
          break;
        case "CTXPOOL":
          tx = await rewards?.ctxPoolReward?.getReward();
          break;
        default:
          tx = await rewards?.wethReward?.getReward();
          break;
      }
      notifyUser(tx, refresh);
    } catch (error) {
      if (error.code === 4001) {
        errorNotification("Transaction rejected");
      } else {
        errorNotification("Insufficient funds to stake");
      }
    }
  };

  const claimVest = async (vaultType: string) => {
    try {
      let tx: ethers.ContractTransaction;
      switch (vaultType) {
        case "ETH":
          tx = await rewards?.wethReward?.claimVest();
          break;
        case "WBTC":
          tx = await rewards?.wbtcReward?.claimVest();
          break;
        case "DAI":
          tx = await rewards?.daiReward?.claimVest();
          break;
        case "ETHPOOL":
          tx = await rewards?.wethPoolReward?.claimVest();
          break;
        case "WBTCPOOL":
          tx = await rewards?.wbtcPoolReward?.claimVest();
          break;
        case "DAIPOOL":
          tx = await rewards?.daiPoolReward?.claimVest();
          break;
        case "CTXPOOL":
          tx = await rewards?.ctxPoolReward?.claimVest();
          break;
        default:
          tx = await rewards?.wethReward?.claimVest();
          break;
      }
      notifyUser(tx, refresh);
    } catch (error) {
      if (error.code === 4001) {
        errorNotification("Transaction rejected");
      } else {
        errorNotification("Error claiming vest");
      }
    }
  };

  const exitRewards = async (vaultType: string) => {
    try {
      let tx: ethers.ContractTransaction;
      switch (vaultType) {
        case "ETHPOOL":
          tx = await rewards?.wethPoolReward?.exit();
          break;
        case "WBTCPOOL":
          tx = await rewards?.wbtcPoolReward?.exit();
          break;
        case "DAIPOOL":
          tx = await rewards?.daiPoolReward?.exit();
          break;
        case "CTXPOOL":
          tx = await rewards?.ctxPoolReward?.exit();
          break;
        default:
          tx = await rewards?.wethPoolReward?.exit();
          break;
      }
      notifyUser(tx, refresh);
    } catch (error) {
      if (error.code === 4001) {
        errorNotification("Transaction rejected");
      } else {
        errorNotification("Insufficient funds to exit");
      }
    }
  };

  return (
    <div className="farm">
      <div>
        <h3>Farming</h3>{" "}
        <Row className="card-wrapper">
          <Row>
            <Card className="diamond mb-2">
              <h2>Minting Rewards </h2>
              <Table hover className="mt-2">
                <thead>
                  <tr>
                    <th />
                    <th>Description</th>
                    <th>Current Mint</th>
                    <th>
                      <div className="rewards">
                        <div className="title-current">Current Reward</div>
                        <div className="button-current">
                          <OverlayTrigger
                            key="top"
                            placement="right"
                            trigger={["hover", "click"]}
                            overlay={
                              <Tooltip id="ttip-current-reward" className="farm-tooltip">
                                Early adopters rewards are issued over 14 days for a total of
                                500,000 CTX. Assuming approximately 6500 Ethereum blocks per day
                                over 14 days (91,000 Ethereum blocks), the per block reward would be
                                5.4945 CTX split across the debtors at that point in time. 100% of
                                the reward is immediately available.
                              </Tooltip>
                            }
                          >
                            <Button variant="dark">?</Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                    </th>{" "}
                    <th>APY</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <WETHIcon className="weth" />
                    </td>
                    <td>
                      <a href="vault/ETH">ETH Vault</a>
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={ethDebt}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      TCAP
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={ethRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <b className="fire">Inactive</b>
                    </td>
                    <td align="right">
                      {address === "" ? (
                        <>
                          <Button variant="dark" className="" disabled>
                            Mint
                          </Button>

                          <Button variant="dark" className="ml-4" disabled>
                            Claim
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="primary" className="" href="vault/ETH">
                            Mint
                          </Button>

                          <Button
                            variant="success"
                            className=" ml-4"
                            onClick={() => {
                              claimRewards("ETH");
                            }}
                          >
                            Claim
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <DAIIcon className="dai" />
                    </td>
                    <td>
                      <a href="vault/DAI">DAI Vault</a>
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={daiDebt}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      TCAP
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={daiRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <b className="fire">Inactive</b>
                    </td>
                    <td align="right">
                      {address === "" ? (
                        <>
                          <Button variant="dark" className="" disabled>
                            Mint
                          </Button>

                          <Button variant="dark" className="ml-4" disabled>
                            Claim
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="primary" className="" href="vault/DAI">
                            Mint
                          </Button>

                          <Button
                            variant="success"
                            className="ml-4"
                            onClick={() => {
                              claimRewards("DAI");
                            }}
                          >
                            Claim
                          </Button>
                        </>
                      )}
                    </td>{" "}
                  </tr>
                </tbody>
              </Table>
            </Card>

            {phase > 1 && (
              <Card className="diamond mt-4">
                <h2>Liquidity Rewards </h2>
                <Table hover className="mt-2">
                  <thead>
                    <tr>
                      <th />
                      <th>Description</th>
                      <th>Balance</th>
                      <th>Stake</th>
                      <th>
                        <div className="rewards">
                          <div className="title">Unlocked Reward</div>
                          <div className="button">
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              trigger={["hover", "click"]}
                              overlay={
                                <Tooltip id="ttip-vreward" className="farm-tooltip">
                                  Available to claim immediately.
                                </Tooltip>
                              }
                            >
                              <Button variant="dark">?</Button>
                            </OverlayTrigger>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="rewards">
                          <div className="title">Locked Reward</div>
                          <div className="button">
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              trigger={["hover", "click"]}
                              overlay={
                                <Tooltip id="tooltip-top" className="farm-tooltip">
                                  Rewards are unlocked 6 months after the start of the pool.
                                </Tooltip>
                              }
                            >
                              <Button variant="dark">?</Button>
                            </OverlayTrigger>
                          </div>
                        </div>
                      </th>{" "}
                      <th>APY</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <WETHIcon className="weth" />
                        <TcapIcon className="tcap" />
                      </td>
                      <td>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`${lpURL}/#/add/${tokens.tcapToken?.address}/ETH`}
                        >
                          ETH/TCAP Pool <br /> <small> SushiSwap </small>
                        </a>
                      </td>
                      <td className="number">
                        <NumberFormat
                          className="number"
                          value={ethPoolBalance}
                          displayType="text"
                          thousandSeparator
                          prefix=""
                          decimalScale={2}
                        />{" "}
                      </td>
                      <td className="number">
                        <NumberFormat
                          className="number"
                          value={ethPoolStake}
                          displayType="text"
                          thousandSeparator
                          prefix=""
                          decimalScale={2}
                        />{" "}
                      </td>
                      <td className="number">
                        <NumberFormat
                          className="number"
                          value={ethPoolRewards}
                          displayType="text"
                          thousandSeparator
                          prefix=""
                          decimalScale={2}
                        />{" "}
                        CTX
                      </td>
                      <td className="vested-reward">
                        <div>
                          <NumberFormat
                            className="number"
                            value={vethPoolRewards}
                            displayType="text"
                            thousandSeparator
                            prefix=""
                            decimalScale={2}
                          />{" "}
                          CTX
                        </div>
                        <div>
                          <small>
                            <span className="end-date">{tsToDateString(vestingEndTime)}</span>
                          </small>
                        </div>
                      </td>
                      <td>
                        <b className="fire">
                          <NumberFormat
                            className=""
                            value={ethPoolAPY}
                            displayType="text"
                            thousandSeparator
                            prefix=""
                            decimalScale={0}
                          />
                          %
                        </b>
                      </td>
                      <td align="right">
                        {address === "" ? (
                          <>
                            <Button variant="dark" className="" disabled>
                              Mint
                            </Button>

                            <Button variant="dark" className="ml-4" disabled>
                              Claim
                            </Button>

                            <Button variant="dark" className="ml-4" disabled>
                              Claim Vest
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              className=""
                              onClick={() => {
                                setStakeBalance(ethPoolBalance);
                                setSelectedPoolTitle("SushiSwap ETH/TCAP Pool");
                                if (rewards.wethPoolReward) {
                                  setSelectedPool(rewards.wethPoolReward);
                                  setSelectedPoolToken(tokens.wethPoolToken);
                                }
                                setStakeShow(true);
                              }}
                            >
                              Stake
                            </Button>

                            <Button
                              variant="success"
                              className=" ml-4"
                              onClick={() => {
                                claimRewards("ETHPOOL");
                              }}
                            >
                              Claim
                            </Button>

                            <Button
                              variant="warning"
                              className=" ml-4"
                              onClick={() => {
                                claimVest("ETHPOOL");
                              }}
                            >
                              Claim Vest
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <WETHIcon className="weth" />
                        <CtxIcon className="ctx-neon" />
                      </td>
                      <td>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`${lpURL}/#/add/${tokens.ctxToken?.address}/ETH`}
                        >
                          ETH/CTX Pool <br /> <small> SushiSwap </small>
                        </a>
                      </td>
                      <td className="number">
                        <NumberFormat
                          className="number"
                          value={ctxPoolBalance}
                          displayType="text"
                          thousandSeparator
                          prefix=""
                          decimalScale={2}
                        />{" "}
                      </td>{" "}
                      <td className="number">
                        <NumberFormat
                          className="number"
                          value={ctxPoolStake}
                          displayType="text"
                          thousandSeparator
                          prefix=""
                          decimalScale={2}
                        />{" "}
                      </td>
                      <td className="number">
                        <NumberFormat
                          className="number"
                          value={ctxPoolRewards}
                          displayType="text"
                          thousandSeparator
                          prefix=""
                          decimalScale={2}
                        />{" "}
                        CTX
                      </td>{" "}
                      <td className="vested-reward">
                        <div>
                          <NumberFormat
                            className="number"
                            value={vctxPoolRewards}
                            displayType="text"
                            thousandSeparator
                            prefix=""
                            decimalScale={2}
                          />{" "}
                          CTX
                        </div>
                        <div>
                          <small>
                            <span className="end-date">{tsToDateString(ctxVestingEndTime)}</span>
                          </small>
                        </div>
                      </td>
                      <td>
                        <b className="fire">
                          <NumberFormat
                            className=""
                            value={ctxPoolAPY}
                            displayType="text"
                            thousandSeparator
                            prefix=""
                            decimalScale={0}
                          />
                          %
                        </b>
                      </td>
                      <td align="right">
                        {address === "" ? (
                          <>
                            <Button variant="dark" className="" disabled>
                              Mint
                            </Button>

                            <Button variant="dark" className="ml-4" disabled>
                              Claim
                            </Button>

                            <Button variant="dark" className="ml-4" disabled>
                              Exit
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              className=""
                              onClick={() => {
                                setStakeBalance(ctxPoolBalance);
                                setSelectedPoolTitle("SushiSwap ETH/CTX Pool");
                                if (rewards.ctxPoolReward) {
                                  setSelectedPool(rewards.ctxPoolReward);
                                  setSelectedPoolToken(tokens.ctxPoolToken);
                                }
                                setStakeShow(true);
                              }}
                            >
                              Stake
                            </Button>

                            <Button
                              variant="success"
                              className=" ml-4"
                              onClick={() => {
                                claimRewards("CTXPOOL");
                              }}
                            >
                              Claim
                            </Button>

                            <Button
                              variant="warning"
                              className=" ml-4"
                              onClick={() => {
                                exitRewards("CTXPOOL");
                              }}
                            >
                              Exit
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            )}
          </Row>
        </Row>
      </div>
      <Stake
        pool={selectedPool}
        poolTitle={selectedPoolTitle}
        poolToken={selectedPoolToken}
        balance={stakeBalance}
        show={stakeShow}
        onHide={() => setStakeShow(false)}
        refresh={() => refresh()}
      />
    </div>
  );
};
export default Farm;
