import React, { useState, useEffect, useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import ethers, { BigNumber } from "ethers";
import NumberFormat from "react-number-format";
import { Web3ModalContext } from "../state/Web3ModalContext";
import OraclesContext from "../state/OraclesContext";
import TokensContext from "../state/TokensContext";
import VaultsContext from "../state/VaultsContext";
import SignerContext from "../state/SignerContext";
import "../styles/vault.scss";
import { ReactComponent as WETHIcon } from "../assets/images/vault/eth.svg";
import { ReactComponent as ETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as RatioIcon } from "../assets/images/vault/ratio.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";

const Vault = () => {
  const web3Modal = useContext(Web3ModalContext);
  const oracles = useContext(OraclesContext);
  const tokens = useContext(TokensContext);
  const vaults = useContext(VaultsContext);
  const signer = useContext(SignerContext);
  const [isCreated, setIsCreated] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [tokenBalanceUSD, setTokenBalanceUSD] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [title, setTitle] = useState("Create Vault");
  const [text, setText] = useState(
    "No vault Created. Please Create a Vault and approve your collateral to start minting TCAP tokens."
  );

  const [isLoading, setIsLoading] = useState(true);
  // Vault Data
  const [vaultDebt, setVaultDebt] = useState("0");
  const [vaultDebtUSD, setVaultDebtUSD] = useState("0");
  const [vaultCollateral, setVaultCollateral] = useState("0");
  const [vaultCollateralUSD, setVaultCollateralUSD] = useState("0");
  const [vaultRatio, setVaultRatio] = useState("0");
  const [collateralPrice, setCollateralPrice] = useState("0");
  const [selectedVault, setSelectedVault] = useState("ETH");
  const [selectedVaultContract, setSelectedVaultContract] = useState<ethers.Contract>();
  const [selectedVaultId, setSelectedVaultId] = useState("0");

  // Inputs
  const [addCollateral, setAddCollateral] = useState("");
  const [addCollateralUSD, setAddCollateralUSD] = useState("0");
  const [removeCollateral, setRemoveCollateral] = useState("");
  const [removeCollateralUSD, setRemoveCollateralUSD] = useState("0");

  function toUSD(amount: string, price: string) {
    return parseFloat(amount) * parseFloat(price);
  }

  // forms
  const onChangeAddCollateral = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddCollateral(event.target.value);
    let usd = toUSD(collateralPrice, event.target.value);
    if (!usd) {
      usd = 0;
    }
    setAddCollateralUSD(usd.toString());
  };

  const onChangeRemoveCollateral = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemoveCollateral(event.target.value);
    let usd = toUSD(collateralPrice, event.target.value);
    if (!usd) {
      usd = 0;
    }
    setRemoveCollateralUSD(usd.toString());
  };

  const stakeCollateral = async () => {
    const amount = ethers.utils.parseEther(addCollateral);
    console.log("Vault -> selectedVaultContract", selectedVaultContract);
    if (selectedVault === "ETH") {
      const tx = await selectedVaultContract?.addCollateralETH({
        value: amount,
      });

      console.log("Vault -> tx", tx);
    } else {
      const tx = await selectedVaultContract?.addCollateral(amount);
      console.log("Vault -> tx", tx);
    }
  };

  const loadVault = async (vaultId: string, vaultContract: ethers.Contract) => {
    const ratio = await vaultContract.getVaultRatio(vaultId);
    const vault = await vaultContract.getVault(vaultId);
    setVaultDebt(ethers.utils.formatEther(vault[3]));
    setVaultRatio(ratio.toString());
    setVaultCollateral(ethers.utils.formatEther(vault[1]));
  };

  useEffect(() => {
    async function load() {
      if (vaults.wethVault && signer.signer && oracles.wethOracle) {
        // TODO: get network from env
        const network = "rinkeby";
        const address = await signer.signer.getAddress();
        const currentVault = await vaults.wethVault.vaultToUser(address);
        const wethPrice = await oracles.wethOracle.getLatestAnswer();
        const currentWethPrice = ethers.utils.formatEther(wethPrice.mul(10000000000));
        setCollateralPrice(currentWethPrice);
        const provider = ethers.getDefaultProvider(network);
        const balance = await provider.getBalance(address);
        const currentBalance = ethers.utils.formatEther(balance);
        setTokenBalance(currentBalance);
        const usd = toUSD(currentWethPrice, currentBalance);
        setTokenBalanceUSD(usd.toString());
        if (currentVault.toString() !== "0") {
          setIsApproved(true);
          setSelectedVaultContract(vaults.wethVault);
          loadVault(currentVault.toString(), vaults.wethVault);
          // setIsCreated(true);
          // setText("One last step! Approve your collateral to start minting TCAP tokens.");
          // setTitle("Approve Vault");
        }
      }
      if (!signer.signer) {
        setText(
          "No wallet connected. Please Connect your wallet to Create a Vault and approve your collateral to start minting TCAP tokens."
        );
        setTitle("Connect Wallet");
      }

      setIsLoading(false);
    }
    load();
    // eslint-disable-next-line
  }, [isCreated, signer.signer]);

  if (isLoading) {
    return <></>;
  }
  return (
    <div className="vault">
      <div>
        <h3>The Vault</h3>
        <p>Select your Collateral</p>
        <div className="icon-container">
          <WETHIcon className="weth" />
          <div className="select-container">
            <select>
              <option>ETH</option>
              <option>WETH</option>
              <option>WBTC</option>
              <option>DAI</option>
            </select>
            <p className="number">
              <NumberFormat
                className="number"
                value={tokenBalanceUSD}
                displayType="text"
                thousandSeparator
                prefix="$"
                decimalScale={2}
              />
            </p>
          </div>
        </div>
        {isApproved ? (
          <div className="actions-container">
            <div className="form-card">
              <Card>
                <div className="info">
                  <h4>Staked Collateral</h4>
                  <div>
                    <div className="amount">
                      <WETHIcon className="" />
                      <h4 className=" ml-2 number neon-dark-blue">
                        <NumberFormat
                          className="number"
                          value={vaultCollateral}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </h4>
                    </div>
                    <p className="number">
                      <NumberFormat
                        className="number"
                        value={vaultCollateralUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </p>
                  </div>
                </div>
                <Form>
                  <Form.Group>
                    <Form.Label>Add Collateral</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder=""
                        className="neon-green"
                        value={addCollateral}
                        onChange={onChangeAddCollateral}
                      />
                      <InputGroup.Append>
                        <Button className="neon-green" onClick={stakeCollateral}>
                          +
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      <NumberFormat
                        className="number"
                        value={addCollateralUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="remove">
                    <Form.Label>Remove Collateral</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder=""
                        className="neon-orange"
                        value={removeCollateral}
                        onChange={onChangeRemoveCollateral}
                      />
                      <InputGroup.Append>
                        <Button className="neon-orange">-</Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      <NumberFormat
                        className="number"
                        value={removeCollateralUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </Form.Text>
                  </Form.Group>
                </Form>
              </Card>
            </div>
            <div className="balance">
              <Card>
                <ETHIcon className="eth" />
                <div className="info">
                  <h4>{selectedVault} Balance</h4>
                  <div>
                    <div className="amount">
                      <WETHIcon className="small" />
                      <h4 className=" ml-2 number neon-highlight">
                        <NumberFormat
                          className="number"
                          value={tokenBalance}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </h4>
                    </div>
                    <p className="number">
                      <NumberFormat
                        className="number"
                        value={tokenBalanceUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <RatioIcon className="ratio" />
                <div className="info">
                  <h4>Vault Ratio</h4>
                  <div>
                    <div className="amount">
                      <h4 className=" ml-2 number neon-blue">{vaultRatio}%</h4>
                    </div>
                    <p className="number">SAFE</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="form-card">
              <Card>
                <div className="info">
                  <h4>Vault Debt</h4>
                  <div>
                    <div className="amount">
                      <TcapIcon className="tcap-neon" />
                      <h4 className=" ml-2 number neon-pink">
                        <NumberFormat
                          className="number"
                          value={vaultDebt}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </h4>
                    </div>
                    <p className="number">
                      <NumberFormat
                        className="number"
                        value={vaultDebtUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </p>
                  </div>
                </div>
                <Form>
                  <Form.Group>
                    <Form.Label>Mint TCAP</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" placeholder="" className="neon-green" />
                      <InputGroup.Append>
                        <Button className="neon-green">+</Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">$200</Form.Text>
                  </Form.Group>
                  <Form.Group className="remove">
                    <Form.Label>Burn TCAP</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" placeholder="" className="neon-orange" />
                      <InputGroup.Append>
                        <Button className="neon-orange">-</Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">$121</Form.Text>
                  </Form.Group>
                </Form>
              </Card>
            </div>
          </div>
        ) : (
          <div className="pre-actions">
            <h3 className="action-title">{title}</h3>
            <p>{text}</p>
            {!signer.signer ? (
              <Button
                variant="pink neon-pink"
                onClick={() => {
                  web3Modal.toggleModal();
                }}
              >
                {title}
              </Button>
            ) : (
              <Button variant="pink neon-pink">{title}</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
