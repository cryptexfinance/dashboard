import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Table, OverlayTrigger, Tooltip } from "react-bootstrap/esm";
import { ethers } from "ethers";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import {
  governanceContext,
  oraclesContext,
  rewardsContext,
  signerContext,
  tokensContext,
} from "../../../state";
import { ReactComponent as CtxIcon } from "../../../assets/images/ctx-coin.svg";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../../../assets/images/graph/weth.svg";
import Loading from "../../Loading";
import { notifyUser, errorNotification, getPriceInUSDFromPair } from "../../../utils/utils";

const ctxClaimVestShowDate = new Date(1634511235 * 1000);

const LiquidityRewards = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const signer = useContext(signerContext);
  const tokens = useContext(tokensContext);
  const oracles = useContext(oraclesContext);
  const governance = useContext(governanceContext);
  const rewards = useContext(rewardsContext);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [ethPoolRewards, setEthPoolRewards] = useState("0.0");
  const [ctxPoolRewards, setCtxPoolRewards] = useState("0.0");
  const [vethPoolRewards, setVEthPoolRewards] = useState("0.0");
  const [vctxPoolRewards, setVCtxPoolRewards] = useState("0.0");
  const [ethPoolStake, setEthPoolStake] = useState("0.0");
  const [ctxPoolStake, setCtxPoolStake] = useState("0.0");
  const [ethPoolBalance, setEthPoolBalance] = useState("0.0");
  const [ctxPoolBalance, setCtxPoolBalance] = useState("0.0");
  const [ethVestAmount, setEthVestAmount] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [ctxVestAmount, setCtxVestAmount] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [updateData, setUpdateData] = useState(false);

  // APY
  const [, setEthVaultAPY] = useState("0");
  const [, setDaiVaultAPY] = useState("0");

  const oneYear = 60 * 60 * 24 * 365;

  const lpURL = "https://app.sushi.com";
  const phase = process.env.REACT_APP_PHASE ? parseInt(process.env.REACT_APP_PHASE) : 0;

  async function getAPYFromVaultRewards(
    totalTcapDebt: number,
    rate: number,
    ctxPrice: number,
    tcapPrice: number
  ) {
    const apy = ((rate * oneYear * ctxPrice) / (tcapPrice * totalTcapDebt)) * 100;
    return apy.toString();
  }

  const refresh = async () => {
    try {
      setUpdateData(!updateData);
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
        const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
        const wethPoolVestingRatioCall = await rewards.wethPoolRewardRead?.vestingRatio();
        const ctxVestingRatioCall = await rewards.ctxPoolRewardRead?.vestingRatio();

        // @ts-ignore
        const [
          wethOraclePrice,
          tcapPrice,
          totalTcapDebtWeth,
          rateWeth,
          totalTcapDebtDai,
          rateDai,
          reservesCtxPool,
          wethPoolVestingRatio,
          ctxVestingRatio,
        ] = await signer.ethcallProvider?.all([
          wethOracleCall,
          tcapOracleCall,
          totalTcapDebtWethCall,
          rateWethCall,
          totalTcapDebtDaihCall,
          rateDaiCall,
          reservesCtxPoolCall,
          wethPoolVestingRatioCall,
          ctxVestingRatioCall,
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

        if (signer.signer) {
          const currentAddress = await signer.signer.getAddress();
          setAddress(currentAddress);

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
            currentEthPoolReward,
            currentVEthPoolReward,
            currentEthPoolStake,
            currentEthPoolBalance,
            currentCtxPoolReward,
            currentVCtxPoolReward,
            currentCtxPoolStake,
            currentCtxPoolBalance,
          ] = await signer.ethcallProvider?.all([
            currentEthPoolRewardCall,
            currentVEthPoolRewardCall,
            currentEthPoolStakeCall,
            currentEthPoolBalanceCall,
            currentCtxPoolRewardCall,
            currentVCtxPoolRewardCall,
            currentCtxPoolStakeCall,
            currentCtxPoolBalanceCall,
          ]);

          setEthVestAmount(currentVEthPoolReward);
          setCtxVestAmount(currentVCtxPoolReward);
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
  }, [updateData]);

  if (isLoading) {
    return <Loading title={t("loading")} message={t("wait")} />;
  }

  const showCtxClaimVest = (): boolean => {
    const today = new Date();
    return today > ctxClaimVestShowDate;
  };

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
        errorNotification(t("errors.tran-rejected"));
      } else {
        errorNotification(t("errors.no-funds"));
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
      if (error.code === 4001 || error.code === -32603) {
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
      if (error.code === 4001 || error.code === -32603) {
        errorNotification("Transaction rejected");
      } else {
        errorNotification("Insufficient funds to exit");
      }
    }
  };

  const RenderEthTcapBtnActions = () => (
    <>
      {ethVestAmount.eq(0) ? (
        <Button
          variant="success"
          className="ml-4"
          onClick={() => {
            claimRewards("ETHPOOL");
          }}
          disabled={address === ""}
        >
          <>{t("claim")}</>
        </Button>
      ) : (
        <Button
          variant="success"
          className="claim-vest ml-4"
          onClick={() => {
            claimVest("ETHPOOL");
          }}
          disabled={address === ""}
        >
          <>{t("claim-vest")}</>
        </Button>
      )}
      <Button
        variant="warning"
        className=" ml-4"
        onClick={() => {
          exitRewards("ETHPOOL");
        }}
        disabled={address === ""}
      >
        <>{t("exit")}</>
      </Button>
    </>
  );

  const RenderEthCtxBtnActions = () => (
    <>
      {ctxVestAmount.gt(0) && showCtxClaimVest() ? (
        <Button
          variant="success"
          className="claim-vest ml-4"
          onClick={() => {
            claimVest("CTXPOOL");
          }}
          disabled={address === ""}
        >
          <>{t("claim-vest")}</>
        </Button>
      ) : (
        <Button
          variant="success"
          className=" ml-4"
          onClick={() => {
            claimRewards("CTXPOOL");
          }}
          disabled={address === ""}
        >
          <>{t("claim")}</>
        </Button>
      )}
      <Button
        variant="warning"
        className=" ml-4"
        onClick={() => {
          exitRewards("CTXPOOL");
        }}
        disabled={address === ""}
      >
        <>{t("exit")}</>
      </Button>
    </>
  );

  const RenderMobile = () => (
    <div className="liquidity-rewards">
      <Card className="liquidity-reward">
        <Card.Header className="liquidity-reward-header">
          <div className="icons">
            <WETHIcon className="weth" />
            <TcapIcon className="tcap" />
          </div>
          <div className="title">
            <a
              target="_blank"
              rel="noreferrer"
              href={`${lpURL}/#/add/${tokens.tcapToken?.address}/ETH`}
            >
              <>
                {t("farming.eth-tcap-pool")} <br /> <small> SushiSwap </small>
              </>
            </a>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="box">
            <div className="title">
              <h6>
                <>{t("balance")}</>:
              </h6>
            </div>
            <div className="value">
              <NumberFormat
                className="number"
                value={ethPoolBalance}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />
            </div>
          </div>
          <div className="box">
            <div className="title">
              <h6>
                <>{t("stake")}</>:
              </h6>
            </div>
            <div className="value">
              <NumberFormat
                className="number"
                value={ethPoolStake}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />
            </div>
          </div>
          <div className="box">
            <div className="title">
              <h6>
                <>{t("farming.unlocked")}</>:
              </h6>
            </div>
            <div className="value">
              <NumberFormat
                className="number"
                value={ethPoolRewards}
                displayType="text"
                thousandSeparator
                suffix=" CTX"
                decimalScale={2}
              />
            </div>
          </div>
          <div className="box">
            <div className="title">
              <h6>
                <>{t("farming.locked")}</>:
              </h6>
            </div>
            <div className="value">
              <NumberFormat
                className="number"
                value={vethPoolRewards}
                displayType="text"
                thousandSeparator
                suffix=" CTX"
                decimalScale={2}
              />
            </div>
          </div>
          <div className="box">
            <div className="title">
              <h6>APR:</h6>
            </div>
            <div className="value">
              <b className="fire">Expired</b>
            </div>
          </div>
        </Card.Body>
        <Card.Footer className="liquidity-reward-actions">
          <RenderEthTcapBtnActions />
        </Card.Footer>
      </Card>
      <Card className="liquidity-reward">
        <Card.Header className="liquidity-reward-header">
          <div className="icons">
            <WETHIcon className="weth" />
            <CtxIcon className="ctx-neon" />
          </div>
          <div className="title">
            <a
              target="_blank"
              rel="noreferrer"
              href={`${lpURL}/#/add/${tokens.ctxToken?.address}/ETH`}
            >
              <>
                {t("farming.eth-ctx-pool")} <br /> <small> SushiSwap </small>
              </>
            </a>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="box">
            <div className="title">
              <h6>
                <>{t("balance")}</>:
              </h6>
            </div>
            <div className="value">
              <NumberFormat
                className="number"
                value={ctxPoolBalance}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />
            </div>
          </div>
          <div className="box">
            <div className="title">
              <h6>
                <>{t("stake")}</>:
              </h6>
            </div>
            <div className="value">
              <NumberFormat
                className="number"
                value={ctxPoolStake}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />
            </div>
          </div>
          <div className="box">
            <div className="title">
              <h6>
                <>{t("farming.unlocked")}</>:
              </h6>
            </div>
            <div className="value">
              <NumberFormat
                className="number"
                value={ctxPoolRewards}
                displayType="text"
                thousandSeparator
                suffix=" CTX"
                decimalScale={2}
              />
            </div>
          </div>
          <div className="box">
            <div className="title">
              <h6>
                <>{t("farming.locked")}</>:
              </h6>
            </div>
            <div className="value">
              <NumberFormat
                className="number"
                value={vctxPoolRewards}
                displayType="text"
                thousandSeparator
                suffix=" CTX"
                decimalScale={2}
              />
            </div>
          </div>
          <div className="box">
            <div className="title">
              <h6>APR:</h6>
            </div>
            <div className="value">
              <b className="fire">Expired</b>
            </div>
          </div>
        </Card.Body>
        <Card.Footer className="liquidity-reward-actions">
          <RenderEthCtxBtnActions />
        </Card.Footer>
      </Card>
    </div>
  );

  return (
    <Card className="mt-4 liquidity">
      <h2>
        <>{t("farming.liquidity")}</>
      </h2>
      {!isMobile ? (
        <Table hover className="mt-2">
          <thead>
            <tr>
              <th />
              <th>
                <>{t("description")}</>
              </th>
              <th>
                <>{t("balance")}</>
              </th>
              <th>
                <>{t("stake")}</>
              </th>
              <th>
                <div className="rewards">
                  <div className="title">
                    <>{t("farming.unlocked")}</>
                  </div>
                  <div className="button">
                    <OverlayTrigger
                      key="top"
                      placement="top"
                      trigger={["hover", "click"]}
                      overlay={
                        <Tooltip id="ttip-vreward" className="farm-tooltip">
                          <>{t("farming.unlocked-info")}</>
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
                  <div className="title">
                    <>{t("farming.locked")}</>
                  </div>
                  <div className="button">
                    <OverlayTrigger
                      key="top"
                      placement="top"
                      trigger={["hover", "click"]}
                      overlay={
                        <Tooltip id="tooltip-top" className="farm-tooltip">
                          <>{t("farming.locked-info")}</>
                        </Tooltip>
                      }
                    >
                      <Button variant="dark">?</Button>
                    </OverlayTrigger>
                  </div>
                </div>
              </th>{" "}
              <th>APR</th>
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
                  <>
                    {t("farming.eth-tcap-pool")} <br /> <small> SushiSwap </small>
                  </>
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
              </td>
              <td>
                <b className="fire">Expired</b>
              </td>
              <td align="right">
                <RenderEthTcapBtnActions />
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
                  <>
                    {t("farming.eth-ctx-pool")} <br /> <small> SushiSwap </small>
                  </>
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
              </td>
              <td>
                <b className="fire">
                  <b className="fire">Expired</b>
                </b>
              </td>
              <td align="right">
                <RenderEthCtxBtnActions />
              </td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <RenderMobile />
      )}
    </Card>
  );
};

export default LiquidityRewards;
