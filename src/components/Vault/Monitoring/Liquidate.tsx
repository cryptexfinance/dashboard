import React, { useContext, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { ethers, BigNumber } from "ethers";
import InputGroup from "react-bootstrap/esm/InputGroup";
import Modal from "react-bootstrap/esm/Modal";
import { NumericFormat } from "react-number-format";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { useTranslation } from "react-i18next";
import "../../../styles/modal.scss";
import NetworkContext from "../../../state/NetworkContext";
import SignerContext from "../../../state/SignerContext";
import OracleContext from "../../../state/OraclesContext";
import TokensContext from "../../../state/TokensContext";
import VaultContext from "../../../state/VaultsContext";
import HardVaultsContext from "../../../state/HardVaultsContext";
import { VaultsType } from "./types";
import {
  errorNotification,
  isPolygon,
  notifyUser,
  numberFormatStr,
  toUSD,
} from "../../../utils/utils";

type props = {
  show: boolean;
  currentAddress: string;
  liqVault: VaultsType | null;
  onHide: () => void;
  refresh: () => void;
};

const Liquidate = ({ show, currentAddress, liqVault, onHide, refresh }: props) => {
  const { t } = useTranslation();
  const currentNetwork = useContext(NetworkContext);
  const signer = useContext(SignerContext);
  const oracles = useContext(OracleContext);
  const vaults = useContext(VaultContext);
  const hardVaults = useContext(HardVaultsContext);
  const tokens = useContext(TokensContext);
  const [currentVault, setCurrentVault] = useState<ethers.Contract>();
  const [tcapBalance, setTcapBalance] = useState("0");
  const [tcapPrice, setTcapPrice] = useState("0");
  const [requiredTcap, setRequiredTcap] = useState("0");
  const [maxTcap, setMaxTcap] = useState("0");
  const [maxTcapUSD, setMaxTcapUSD] = useState("0");
  const [reward, setReward] = useState("0");
  const [rewardUSD, setRewardUSD] = useState("0");
  const [burnFee, setBurnFee] = useState("0");
  const [burnFeeUsd, setBurnFeeUsd] = useState("0");
  const [canLiquidate, setCanLiquidate] = useState(true);

  useEffect(() => {
    async function load() {
      if (currentAddress !== "" && liqVault !== null && vaults) {
        let cVault = vaults.wethVault;
        let cVaultRead = vaults.wethVaultRead;
        let oracleRead = oracles.wethOracleRead;
        if (liqVault.isHardVault) {
          cVault = hardVaults.wethVault;
          cVaultRead = hardVaults.wethVaultRead;
        }
        switch (liqVault.collateralSymbol) {
          case "DAI":
            if (liqVault.isHardVault) {
              cVault = hardVaults.daiVault;
              cVaultRead = hardVaults.daiVaultRead;
            } else {
              cVault = vaults.daiVault;
              cVaultRead = vaults.daiVaultRead;
            }
            oracleRead = oracles.daiOracleRead;
            break;
          case "AAVE":
            cVault = vaults.aaveVault;
            cVaultRead = vaults.aaveVaultRead;
            oracleRead = oracles.aaveOracleRead;
            break;
          case "LINK":
            cVault = vaults.linkVault;
            cVaultRead = vaults.linkVaultRead;
            oracleRead = oracles.linkOracleRead;
            break;
          case "SNX":
            cVault = vaults.snxVault;
            cVaultRead = vaults.snxVaultRead;
            oracleRead = oracles.snxOracleRead;
            break;
          case "UNI":
            cVault = vaults.uniVault;
            cVaultRead = vaults.uniVaultRead;
            oracleRead = oracles.uniOracleRead;
            break;
          case "MATIC":
            cVault = vaults.maticVault;
            cVaultRead = vaults.maticVaultRead;
            oracleRead = oracles.maticOracleRead;
            break;
          case "WBTC":
            cVault = vaults.wbtcVault;
            cVaultRead = vaults.wbtcVaultRead;
            oracleRead = oracles.wbtcOracleRead;
            break;
          case "USDC":
            cVault = hardVaults.usdcVault;
            cVaultRead = hardVaults.usdcVaultRead;
            oracleRead = oracles.usdcOracleRead;
            break;
          default:
            if (liqVault.isHardVault) {
              cVault = hardVaults.wethVault;
              cVaultRead = hardVaults.wethVaultRead;
            } else {
              cVault = vaults.wethVault;
              cVaultRead = vaults.wethVaultRead;
            }
            oracleRead = oracles.wethOracleRead;
            break;
        }
        if (liqVault.id !== "" && cVault && cVaultRead) {
          try {
            setCurrentVault(cVault);
            const tcapBalanceCall = await tokens.tcapTokenRead?.balanceOf(currentAddress);
            const tcapPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
            const reqTcapCall = await cVaultRead?.requiredLiquidationTCAP(
              BigNumber.from(liqVault.id)
            );
            const liqRewardCall = await cVaultRead?.liquidationReward(BigNumber.from(liqVault.id));
            const oraclePriceCall = await oracleRead?.getLatestAnswer();
            const ethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
            // @ts-ignore
            const [balance, tcapOraclePrice, reqTcap, liqReward, collateralPrice, ethPrice] =
              await signer.ethcallProvider?.all([
                tcapBalanceCall,
                tcapPriceCall,
                reqTcapCall,
                liqRewardCall,
                oraclePriceCall,
                ethOraclePriceCall,
              ]);
            const tcapBalanceText = ethers.utils.formatEther(balance);
            const tcapPriceText = ethers.utils.formatEther(tcapOraclePrice);
            const reqTcapText = ethers.utils.formatEther(reqTcap);
            const liqRewardText = ethers.utils.formatUnits(liqReward, liqVault.decimals);
            const priceText = ethers.utils.formatEther(collateralPrice.mul(10000000000));
            const ethPriceText = ethers.utils.formatEther(ethPrice.mul(10000000000));
            const currentLiqFee = await cVault?.getFee(reqTcap);
            const increasedFee = currentLiqFee.add(currentLiqFee.div(100)).toString();
            const ethFee = ethers.utils.formatEther(increasedFee);

            setTcapBalance(tcapBalanceText);
            setTcapPrice(tcapPriceText);
            setRequiredTcap(reqTcapText);
            setMaxTcap(reqTcapText);
            setMaxTcapUSD(toUSD(reqTcapText, tcapPriceText).toFixed(2));
            setReward(liqRewardText);
            setRewardUSD(toUSD(liqRewardText, priceText).toFixed(2));
            setBurnFee(ethFee);
            setBurnFeeUsd(toUSD(ethFee, ethPriceText).toFixed(2));
          } catch (error) {
            // Error happens when trying to calculate reward on a not liquidable vault
            if (error.code !== "UNPREDICTABLE_GAS_LIMIT") {
              console.log(error.code);
            }
          }
        }
      }
    }
    load();
    // eslint-disable-next-line
  }, [currentAddress, liqVault]);

  const onChangeMaxTcap = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxTcap(event.target.value);
    setMaxTcapUSD(toUSD(event.target.value, tcapPrice).toFixed(2));
  };

  const minTcap = async (e: React.MouseEvent) => {
    e.preventDefault();
    setMaxTcap(requiredTcap);
    setMaxTcapUSD(toUSD(requiredTcap, tcapPrice).toFixed(2));
  };

  const liquidate = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (currentAddress && liqVault !== null && canLiquidate && currentVault) {
      setCanLiquidate(false);
      const maxAmountTcap = parseFloat(maxTcap);
      if (maxTcap && maxAmountTcap > 0) {
        if (maxAmountTcap >= parseFloat(requiredTcap)) {
          if (maxAmountTcap <= parseFloat(tcapBalance)) {
            try {
              const currentLiqFee = await currentVault?.getFee(
                ethers.utils.parseEther(requiredTcap)
              );
              const increasedFee = currentLiqFee.add(currentLiqFee.div(100)).toString();
              const ethFee = ethers.utils.formatEther(increasedFee);
              setBurnFee(ethFee);
              const tx = await currentVault.liquidateVault(
                BigNumber.from(liqVault.id),
                ethers.utils.parseEther(maxTcap),
                { value: increasedFee }
              );
              notifyUser(tx, refresh);
              await refresh();
              setMaxTcap("");
              onHide();
            } catch (error) {
              errorNotification("Burn fee less than required.");
            }
          } else {
            errorNotification(t("errors.no-tcap"));
          }
        } else {
          errorNotification(t("errors.less-tcap"));
        }
      } else {
        errorNotification(t("errors.empty"));
      }
      setCanLiquidate(true);
    }
  };

  const netReward = parseFloat(rewardUSD) - parseFloat(maxTcapUSD) - parseFloat(burnFeeUsd);

  const getTokeSymbol = () => {
    if (liqVault !== null) {
      if (liqVault.collateralSymbol === "WETH") {
        return "ETH";
      }
      return liqVault.collateralSymbol;
    }
    return "";
  };

  const rewardHelp = () => (
    <Tooltip id="ttip-position" className="univ3-status-tooltip">
      <>{t("monitoring.reward-info")}</>
    </Tooltip>
  );

  const tcapAmountHelp = () => (
    <Tooltip id="ttip-position" className="univ3-status-tooltip">
      <>{t("monitoring.tcap-amount-info")}</>
    </Tooltip>
  );

  const netRewardHelp = () => (
    <Tooltip id="ttip-position" className="univ3-status-tooltip">
      <>
        {t("monitoring.net-reward-info1")}: <br />
        {t("monitoring.net-reward-info2")}
      </>  
    </Tooltip>
  );

  const helpToolTip = (column: number) => {
    let help = rewardHelp();
    if (column === 1) {
      help = tcapAmountHelp();
    } else if (column === 3) {
      help = netRewardHelp();
    }
    return (
      <OverlayTrigger key="top" placement="auto" trigger={["hover", "click"]} overlay={help}>
        <Button variant="dark">?</Button>
      </OverlayTrigger>
    );
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => {
        setMaxTcap("0");
        setMaxTcapUSD("0");
        onHide();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <>{t("monitoring.liquidate-vault")}</>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="diamond" />
        <Form>
          <Form.Group className="" controlId="">
            <>
              <Form.Label>
                <>{t("amount-tcap")}</>
              </Form.Label>
              <Form.Label className="max">
                <a href="/" className="number" onClick={minTcap}>
                  MIN REQUIRED
                </a>
              </Form.Label>
              <InputGroup className="liquidate-input">
                <Form.Control
                  type="text"
                  placeholder="0"
                  className="neon-green"
                  value={maxTcap}
                  onChange={onChangeMaxTcap}
                />
                <Form.Text className="text-muted">
                  <NumericFormat
                    className="number"
                    value={maxTcapUSD}
                    displayType="text"
                    thousandSeparator
                    prefix="$"
                    decimalScale={2}
                  />
                </Form.Text>
              </InputGroup>
              <div className="liquidation-data">
                <Form.Text className="text-muted liquidation-reward">
                  <div>
                    {t("monitoring.reward")}:{" "}
                    <NumericFormat
                      className="number neon-pink"
                      value={reward}
                      displayType="text"
                      thousandSeparator
                      decimalScale={4}
                    />{" "}
                    {getTokeSymbol()}
                  </div>
                </Form.Text>
                <Form.Text className="text-muted liquidation-fee">
                  <div>
                    Burn Fee:{" "}
                    <NumericFormat
                      className="number neon-pink"
                      value={burnFee}
                      displayType="text"
                      thousandSeparator
                      decimalScale={4}
                    />{" "}
                    {isPolygon(currentNetwork.chainId) ? "MATIC" : "ETH"}
                  </div>
                </Form.Text>
              </div>
            </>
          </Form.Group>
        </Form>
        <Table hover className="mt-2 liq-info">
          <thead>
            <th>
              {t("monitoring.reward")}
              {helpToolTip(0)}
            </th>
            <th>
              {t("required-tcap")}
              {helpToolTip(1)}
            </th>
            <th>Burn Fee</th>
            <th>
              {t("monitoring.net-reward")}
              {helpToolTip(3)}
            </th>
          </thead>
          <tbody>
            <td>${numberFormatStr(rewardUSD, 2, 2)}</td>
            <td>${numberFormatStr(maxTcapUSD, 2, 2)}</td>
            <td>${numberFormatStr(burnFeeUsd, 2, 2)}</td>
            <td className="net-reward">${numberFormatStr(netReward.toFixed(2), 2, 2)}</td>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="pink"
          className="mt-3 mb-4 w-100"
          onClick={liquidate}
          disabled={!canLiquidate}
        >
          <>
            {canLiquidate ? t("monitoring.liquidate-vault") : t("monitoring.liquidating")}
          </>  
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Liquidate;
