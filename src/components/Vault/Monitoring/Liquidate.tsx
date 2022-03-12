import React, { useContext, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ethers, BigNumber } from "ethers";
import InputGroup from "react-bootstrap/esm/InputGroup";
import Modal from "react-bootstrap/esm/Modal";
import NumberFormat from "react-number-format";
import "../../../styles/modal.scss";
import NetworkContext from "../../../state/NetworkContext";
import SignerContext from "../../../state/SignerContext";
import VaultContext from "../../../state/VaultsContext";
import OracleContext from "../../../state/OraclesContext";
import { errorNotification, notifyUser, toUSD } from "../../../utils/utils";
import { NETWORKS } from "../../../utils/constants";

type props = {
  show: boolean;
  currentAddress: string;
  vaultId: string;
  vaultType: string;
  onHide: () => void;
  refresh: () => void;
};

const Liquidate = ({ show, currentAddress, vaultId, vaultType, onHide, refresh }: props) => {
  const currentNetwork = useContext(NetworkContext);
  const signer = useContext(SignerContext);
  const vaults = useContext(VaultContext);
  const oracles = useContext(OracleContext);
  const [currentVault, setCurrentVault] = useState<ethers.Contract>();
  const [tcapPrice, setTcapPrice] = useState("0");
  const [requiredTcap, setRequiredTcap] = useState("0");
  const [maxTcap, setMaxTcap] = useState("0");
  const [maxTcapUSD, setMaxTcapUSD] = useState("0");
  const [reward, setReward] = useState("0");
  const [rewardUSD, setRewardUSD] = useState("0");
  const [liquidationFee, setLiquidationFee] = useState("0");
  const [canLiquidate, setCanLiquidate] = useState(true);

  useEffect(() => {
    async function load() {
      if (currentAddress !== "" && vaults) {
        let cVault = vaults.wethVault;
        let cVaultRead = vaults.wethVaultRead;
        let oracleRead = oracles.wethOracleRead;
        switch (vaultType) {
          case "DAI":
            cVault = vaults.daiVault;
            cVaultRead = vaults.daiVaultRead;
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
          default:
            cVault = vaults.wethVault;
            cVaultRead = vaults.wethVaultRead;
            oracleRead = oracles.wethOracleRead;
            break;
        }
        if (vaultId !== "" && cVault && cVaultRead) {
          setCurrentVault(cVault);
          const tcapPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
          const reqTcapCall = await cVaultRead?.requiredLiquidationTCAP(BigNumber.from(vaultId));
          const liqRewardCall = await cVaultRead?.liquidationReward(BigNumber.from(vaultId));
          const oraclePriceCall = await oracleRead?.getLatestAnswer();
          // @ts-ignore
          const [tcapOraclePrice, reqTcap, liqReward, collateralPrice] =
            await signer.ethcallProvider?.all([
              tcapPriceCall,
              reqTcapCall,
              liqRewardCall,
              oraclePriceCall,
            ]);
          const tcapPriceText = ethers.utils.formatEther(tcapOraclePrice);
          const reqTcapText = ethers.utils.formatEther(reqTcap);
          const liqRewardText = ethers.utils.formatEther(liqReward);
          const priceText = ethers.utils.formatEther(collateralPrice.mul(10000000000));
          const currentLiqFee = await cVault?.getFee(reqTcap);
          const increasedFee = currentLiqFee.add(currentLiqFee.div(100)).toString();
          const ethFee = ethers.utils.formatEther(increasedFee);

          setTcapPrice(tcapPriceText);
          setRequiredTcap(reqTcapText);
          setReward(liqRewardText);
          setRewardUSD(toUSD(liqRewardText, priceText).toFixed(2));
          setLiquidationFee(ethFee.toString());
        }
      }
    }
    load();
    // eslint-disable-next-line
  }, [currentAddress, vaultId]);

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
    if (currentAddress && canLiquidate && currentVault) {
      setCanLiquidate(false);
      if (maxTcap && parseFloat(maxTcap) > 0) {
        if (parseFloat(maxTcap) >= parseFloat(requiredTcap)) {
          try {
            const currentLiqFee = await currentVault?.getFee(ethers.utils.parseEther(requiredTcap));
            const increasedFee = currentLiqFee.add(currentLiqFee.div(100)).toString();
            const ethFee = ethers.utils.formatEther(increasedFee);
            setLiquidationFee(ethFee);
            const tx = await currentVault.liquidateVault(
              BigNumber.from(vaultId),
              ethers.utils.parseEther(maxTcap),
              { value: increasedFee }
            );
            notifyUser(tx, refresh);
            refresh();
            setMaxTcap("");
            onHide();
          } catch (error) {
            errorNotification("Burn fee less than required.");
          }
        } else {
          errorNotification("Tcap amount is less than required");
        }
      } else {
        errorNotification("Field can't be empty");
      }
      setCanLiquidate(true);
    }
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => {
        setMaxTcap("");
        onHide();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Liquidate Vault</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="diamond" />
        <Form>
          <Form.Group className="" controlId="">
            <>
              <Form.Label>Amount of TCAP</Form.Label>
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
                  <NumberFormat
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
                    Reward:{" "}
                    <NumberFormat
                      className="number neon-pink"
                      value={reward}
                      displayType="text"
                      thousandSeparator
                      decimalScale={4}
                    />{" "}
                    {vaultType === "WETH" ? "ETH" : vaultType}
                  </div>
                  <div>
                    USD:{" "}
                    <NumberFormat
                      className="number neon-pink  reward-usd"
                      value={rewardUSD}
                      displayType="text"
                      thousandSeparator
                      decimalScale={4}
                      prefix=" $"
                    />
                  </div>
                </Form.Text>

                <Form.Text className="text-muted liquidation-fee">
                  Burn Fee:{" "}
                  <NumberFormat
                    className="number neon-pink"
                    value={liquidationFee}
                    displayType="text"
                    thousandSeparator
                    decimalScale={4}
                  />{" "}
                  {currentNetwork.chainId === NETWORKS.polygon.chainId ? "MATIC" : "ETH"}
                </Form.Text>
              </div>
            </>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="pink"
          className="mt-3 mb-4 w-100"
          onClick={liquidate}
          disabled={!canLiquidate}
        >
          {canLiquidate ? "Liquidate Vault" : "Liquidating"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Liquidate;
