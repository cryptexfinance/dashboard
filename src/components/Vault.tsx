import React, { useState, useEffect, useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import ethers, { BigNumber } from "ethers";
import { toast } from "react-toastify";
import NumberFormat from "react-number-format";
import { Web3ModalContext } from "../state/Web3ModalContext";
import OraclesContext from "../state/OraclesContext";
import TokensContext from "../state/TokensContext";
import VaultsContext from "../state/VaultsContext";
import SignerContext from "../state/SignerContext";
import "../styles/vault.scss";
import { ReactComponent as ETHIconSmall } from "../assets/images/vault/eth.svg";
import { ReactComponent as BTCIconSmall } from "../assets/images/vault/bitcoin.svg";
import { ReactComponent as ETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../assets/images/graph/DAI.svg";
import { ReactComponent as WBTCIcon } from "../assets/images/graph/WBTC.svg";
import { ReactComponent as RatioIcon } from "../assets/images/vault/ratio.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { notifyUser } from "../utils/utils";

// TODO: Refactor names
const Vault = () => {
  const web3Modal = useContext(Web3ModalContext);
  const oracles = useContext(OraclesContext);
  const tokens = useContext(TokensContext);
  const vaults = useContext(VaultsContext);
  const signer = useContext(SignerContext);

  // Actions
  const [title, setTitle] = useState("Create Vault");
  const [text, setText] = useState(
    "No vault Created. Please Create a Vault and approve your collateral to start minting TCAP tokens."
  );
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vault Data
  const [selectedVaultId, setSelectedVaultId] = useState("0");
  const [vaultDebt, setVaultDebt] = useState("0");
  const [vaultDebtUSD, setVaultDebtUSD] = useState("0");
  const [vaultCollateral, setVaultCollateral] = useState("0");
  const [vaultCollateralUSD, setVaultCollateralUSD] = useState("0");
  const [vaultRatio, setVaultRatio] = useState("0");
  const [collateralPrice, setCollateralPrice] = useState("0");
  const [selectedVault, setSelectedVault] = useState("ETH");
  const [selectedVaultContract, setSelectedVaultContract] = useState<ethers.Contract>();
  const [selectedCollateralContract, setSelectedCollateralContract] = useState<ethers.Contract>();

  // General Data
  const [tokenBalanceUSD, setTokenBalanceUSD] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenBalanceDecimals, setTokenBalanceDecimals] = useState(2);
  const [tcapPrice, setTcapPrice] = useState("0");

  // Inputs
  const [addCollateralTxt, setAddCollateralTxt] = useState("");
  const [addCollateralUSD, setAddCollateralUSD] = useState("0");
  const [removeCollateralTxt, setRemoveCollateralTxt] = useState("");
  const [removeCollateralUSD, setRemoveCollateralUSD] = useState("0");
  const [mintTxt, setMintTxt] = useState("");
  const [mintUSD, setMintUSD] = useState("0");
  const [burnTxt, setBurnTxt] = useState("");
  const [burnUSD, setBurnUSD] = useState("0");
  const [burnFee, setBurnFee] = useState("0");

  // Infinite Approval
  const approveValue = BigNumber.from("1157920892373161954235709850086879078532699");

  function toUSD(amount: string, price: string) {
    return parseFloat(amount) * parseFloat(price);
  }

  // forms
  const onChangeAddCollateral = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddCollateralTxt(event.target.value);
    let usd = toUSD(collateralPrice, event.target.value);
    if (!usd) {
      usd = 0;
    }
    setAddCollateralUSD(usd.toString());
  };

  const onChangeRemoveCollateral = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemoveCollateralTxt(event.target.value);
    let usd = toUSD(collateralPrice, event.target.value);
    if (!usd) {
      usd = 0;
    }
    setRemoveCollateralUSD(usd.toString());
  };

  const onChangeMint = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMintTxt(event.target.value);
    let usd = toUSD(tcapPrice, event.target.value);
    if (!usd) {
      usd = 0;
    }
    setMintUSD(usd.toString());
  };

  const onChangeBurn = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setBurnTxt(event.target.value);
    let usd = toUSD(tcapPrice, event.target.value);
    if (!usd) {
      usd = 0;
    }
    setBurnUSD(usd.toString());
    if (event.target.value !== "") {
      const currentBurnFee = await selectedVaultContract?.getFee(
        ethers.utils.parseEther(event.target.value)
      );
      const ethFee = ethers.utils.formatEther(currentBurnFee);
      setBurnFee(ethFee.toString());
    } else {
      setBurnFee("0");
    }
  };

  const addCollateral = async () => {
    // const amount = ethers.utils.parseEther(addCollateralTxt);
    // if (selectedVault === "ETH") {
    //   // eslint-disable-next-line
    //   const tx = await selectedVaultContract?.addCollateralETH({
    //     value: amount,
    //   });
    //   notifyUser(tx, () => {});
    // } else {
    //   // eslint-disable-next-line
    //   const tx = await selectedVaultContract?.addCollateral(amount);
    //   notifyUser(tx, () => {});
    // }
    const as = (
      <div className="body">
        <h5>⏰ Transaction Sent!</h5>
        <p>Lorem ipsum dolor sit amet, consec tetur adip scing elit</p>
      </div>
    );
    toast(as, {
      // @ts-ignore
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 10002000,
      hideProgressBar: true,
    });
  };

  const removeCollateral = async () => {
    const amount = ethers.utils.parseEther(removeCollateralTxt);
    if (selectedVault === "ETH") {
      // eslint-disable-next-line
      const tx = await selectedVaultContract?.removeCollateralETH(amount);
    } else {
      // eslint-disable-next-line
      const tx = await selectedVaultContract?.removeCollateral(amount);
    }
  };

  const mintTCAP = async () => {
    const amount = ethers.utils.parseEther(mintTxt);
    // eslint-disable-next-line
    const tx = await selectedVaultContract?.mint(amount);
  };

  const burnTCAP = async () => {
    const amount = ethers.utils.parseEther(burnTxt);
    const fee = ethers.utils.parseEther(burnFee);
    // eslint-disable-next-line
    const tx = await selectedVaultContract?.burn(amount, { value: fee });
  };

  const action = async () => {
    if (selectedVaultId === "0") {
      // eslint-disable-next-line
      const tx = await selectedVaultContract?.createVault();
    } else {
      const amount = approveValue;
      // eslint-disable-next-line
      const tx = await selectedCollateralContract?.approve(selectedVaultContract?.address, amount);
    }
  };

  const loadVault = async (vaultType: string) => {
    if (
      signer.signer &&
      oracles.wethOracle &&
      oracles.daiOracle &&
      oracles.wbtcOracle &&
      oracles.tcapOracle &&
      vaults.wethVault &&
      vaults.daiVault &&
      vaults.wbtcVault &&
      tokens.wethToken &&
      tokens.daiToken &&
      tokens.wbtcToken
    ) {
      let currentVault;
      let currentOracle;
      let currentToken;
      let balance;
      switch (vaultType) {
        case "ETH":
          currentVault = vaults.wethVault;
          currentOracle = oracles.wethOracle;
          currentToken = tokens.wethToken;
          break;
        case "WETH":
          currentVault = vaults.wethVault;
          currentOracle = oracles.wethOracle;
          currentToken = tokens.wethToken;
          break;
        case "DAI":
          currentVault = vaults.daiVault;
          currentOracle = oracles.daiOracle;
          currentToken = tokens.daiToken;
          break;
        case "WBTC":
          currentVault = vaults.wbtcVault;
          currentOracle = oracles.wbtcOracle;
          currentToken = tokens.wbtcToken;
          break;
        default:
          currentVault = vaults.wethVault;
          currentOracle = oracles.wethOracle;
          currentToken = tokens.wethToken;
          break;
      }

      // TODO: get network from env
      const network = "rinkeby";
      const address = await signer.signer.getAddress();
      const provider = ethers.getDefaultProvider(network);

      // TODO: Optimize with Graph
      const vaultId = await currentVault.vaultToUser(address);
      setSelectedVaultContract(currentVault);
      setSelectedCollateralContract(currentToken);
      setSelectedVaultId(vaultId.toString());

      if (vaultType === "ETH") {
        setIsApproved(true);
        balance = await provider.getBalance(address);
      } else {
        balance = await currentToken.balanceOf(address);
        const allowance: BigNumber = await currentToken.allowance(address, currentVault.address);
        if (!allowance.isZero()) {
          setIsApproved(true);
        } else {
          setText(
            "Vault not approved. Please approve your collateral to start minting TCAP tokens."
          );
          setTitle("Approve Vault");
          setIsApproved(false);
        }
      }

      let currentPrice = await currentOracle.getLatestAnswer();
      currentPrice = ethers.utils.formatEther(currentPrice.mul(10000000000));
      setCollateralPrice(currentPrice);

      const currentBalance = ethers.utils.formatEther(balance);
      if (parseFloat(currentBalance) < 0.09) {
        setTokenBalanceDecimals(4);
      }
      setTokenBalance(currentBalance);
      let usd = toUSD(currentPrice, currentBalance);
      setTokenBalanceUSD(usd.toString());

      if (vaultId.toString() !== "0") {
        const ratio = await currentVault.getVaultRatio(vaultId);
        const vault = await currentVault.getVault(vaultId);
        const debt = ethers.utils.formatEther(vault[3]);

        setVaultRatio(ratio.toString());
        const currentCollateral = ethers.utils.formatEther(vault[1]);
        setVaultCollateral(currentCollateral);
        usd = toUSD(currentPrice, currentCollateral);
        setVaultCollateralUSD(usd.toString());

        let currentTCAPPrice = await oracles.tcapOracle.getLatestAnswer();
        currentTCAPPrice = ethers.utils.formatEther(currentTCAPPrice);
        setTcapPrice(currentTCAPPrice);
        setVaultDebt(debt);
        usd = toUSD(currentTCAPPrice, debt);
        setVaultDebtUSD(usd.toString());
      } else {
        setText(
          "No vault Created. Please Create a Vault and approve your collateral to start minting TCAP tokens."
        );
        setTitle("Create Vault");
        setIsApproved(false);
      }
    }
  };

  const onChangeVault = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVault(event.target.value);
    loadVault(event.target.value);
  };

  useEffect(() => {
    async function load() {
      if (!signer.signer) {
        setText(
          "No wallet connected. Please Connect your wallet to Create a Vault and approve your collateral to start minting TCAP tokens."
        );
        setTitle("Connect Wallet");
      } else {
        await loadVault("ETH");
      }
      setIsLoading(false);
    }
    load();
    // eslint-disable-next-line
  }, [signer.signer]);

  if (isLoading) {
    return <></>;
  }
  return (
    <div className="vault">
      <div>
        <h3>The Vault</h3>
        <p>Select your Collateral</p>
        <div className="icon-container">
          {(() => {
            switch (selectedVault) {
              case "DAI":
                return <DAIIcon className="eth" />;
              case "WBTC":
                return <BTCIconSmall className="btc" />;
              default:
                return <ETHIconSmall className="weth" />;
            }
          })()}

          <div className="select-container">
            <Form.Control as="select" onChange={onChangeVault} value={selectedVault}>
              <option value="ETH">ETH</option>
              <option>WETH</option>
              <option>WBTC</option>
              <option>DAI</option>
            </Form.Control>
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
            <div className="balance">
              <Card>
                {(() => {
                  switch (selectedVault) {
                    case "DAI":
                      return <DAIIcon className="eth" />;
                    case "WBTC":
                      return <WBTCIcon className="eth" />;
                    default:
                      return <ETHIcon className="eth" />;
                  }
                })()}
                <div className="info">
                  <h4>{selectedVault} Balance</h4>
                  <div>
                    <div className="amount">
                      {(() => {
                        switch (selectedVault) {
                          case "DAI":
                            return <DAIIcon className="eth" />;
                          case "WBTC":
                            return <BTCIconSmall className="btc small" />;
                          default:
                            return <ETHIconSmall className="small" />;
                        }
                      })()}
                      <h4 className=" ml-2 number neon-highlight">
                        <NumberFormat
                          className="number"
                          value={tokenBalance}
                          displayType="text"
                          thousandSeparator
                          decimalScale={tokenBalanceDecimals}
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
                    <p className="number neon-blue">SAFE</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="form-card">
              <Card>
                <div className="info">
                  <h4>Staked Collateral</h4>
                  <div>
                    <div className="amount">
                      {(() => {
                        switch (selectedVault) {
                          case "DAI":
                            return <DAIIcon className="eth" />;
                          case "WBTC":
                            return <BTCIconSmall className="btc" />;
                          default:
                            return <ETHIconSmall className="weth" />;
                        }
                      })()}
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
                        value={addCollateralTxt}
                        onChange={onChangeAddCollateral}
                      />
                      <InputGroup.Append>
                        <Button className="neon-green" onClick={addCollateral}>
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
                        value={removeCollateralTxt}
                        onChange={onChangeRemoveCollateral}
                      />
                      <InputGroup.Append>
                        <Button className="neon-orange" onClick={removeCollateral}>
                          -
                        </Button>
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
                      <Form.Control
                        type="text"
                        placeholder=""
                        className="neon-green"
                        value={mintTxt}
                        onChange={onChangeMint}
                      />
                      <InputGroup.Append>
                        <Button className="neon-green" onClick={mintTCAP}>
                          +
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      <NumberFormat
                        className="number"
                        value={mintUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="remove">
                    <Form.Label>Burn TCAP</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder=""
                        className="neon-orange"
                        value={burnTxt}
                        onChange={onChangeBurn}
                      />
                      <InputGroup.Append>
                        <Button className="neon-orange" onClick={burnTCAP}>
                          -
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      <NumberFormat
                        className="number"
                        value={burnUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </Form.Text>
                    <Form.Text className="text-muted burn-fee">
                      Burn Fee:{" "}
                      <NumberFormat
                        className="number neon-pink"
                        value={burnFee}
                        displayType="text"
                        thousandSeparator
                        decimalScale={4}
                      />{" "}
                      ETH
                    </Form.Text>
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
              <Button variant="pink neon-pink" onClick={action}>
                {title}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
