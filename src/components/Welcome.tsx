import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import ethers from "ethers";
import NumberFormat from "react-number-format";
import { useHistory } from "react-router-dom";
import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { makeShortAddress } from "../utils/utils";
import "../styles/welcome.scss";
// import { ReactComponent as WethIcon } from "../assets/images/welcome/weth.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";

const Welcome = () => {
  const [address, setAddress] = useState("");
  const [tcapBalance, setTcapBalance] = useState("0.0");
  const [tcapUSDBalance, setTcapUSDBalance] = useState("0.0");
  const [totalPrice, setTotalPrice] = useState("0.0");
  const [tcapPrice, setTcapPrice] = useState("0.0");
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const history = useHistory();
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);

  useEffect(() => {
    const loadAddress = async () => {
      if (signer.signer && tokens.tcapToken && oracles.tcapOracle) {
        const currentAddress = await signer.signer.getAddress();
        setAddress(makeShortAddress(currentAddress));
        const currentTcapBalance = await tokens.tcapToken.balanceOf(currentAddress);
        const tcapString = ethers.utils.formatEther(currentTcapBalance);
        setTcapBalance(tcapString);
        const currentTotalPrice = await oracles.tcapOracle.getLatestAnswer();
        const TotalTcapPrice = currentTotalPrice.mul(10000000000);
        setTotalPrice(ethers.utils.formatEther(TotalTcapPrice));
        setTcapPrice(ethers.utils.formatEther(TotalTcapPrice.div(10000000000)));
        const tcapUSD = parseFloat(tcapBalance) * parseFloat(tcapPrice);

        setTcapUSDBalance(tcapUSD.toString());
      }
    };
    loadAddress();
  }, [signer, tcapUSDBalance]);
  return (
    <div className="welcome">
      <div>
        <Row className="data">
          <Col>
            <h2 className="number neon-highlight">
              <NumberFormat
                className="number"
                value={totalPrice}
                displayType="text"
                thousandSeparator
                prefix="$"
                decimalScale={0}
              />
            </h2>
            <p>Total Cryptocurrency Market Capitalization</p>
          </Col>
          <Col sm={6} md={7}>
            <h2 className="number neon-dark-blue">
              <NumberFormat
                className="number"
                value={tcapPrice}
                displayType="text"
                thousandSeparator
                prefix="$"
                decimalScale={2}
              />
            </h2>
            <p>Total Cryptocurrency Market Capitalization Token</p>
          </Col>
        </Row>
        <Row className="card-wrapper">
          <Col>
            {address !== "" ? (
              <Card className="balance">
                <div className="">
                  <h2>My Total Balance</h2>
                  <p>
                    Connected Account <b className="ml-2">{address}</b>
                  </p>
                </div>
                <Row className="">
                  <Col>
                    <h3 className="number neon-blue">
                      <TcapIcon className="tcap-neon" />
                      <NumberFormat
                        className="number"
                        value={tcapBalance}
                        displayType="text"
                        thousandSeparator
                        decimalScale={2}
                      />
                    </h3>
                    <p>TCAP Balance</p>
                  </Col>
                  <Col>
                    <h3 className="number neon-dark-blue">
                      <NumberFormat
                        className="number"
                        value={tcapUSDBalance}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </h3>
                    <p>USD Balance</p>
                  </Col>
                </Row>
              </Card>
            ) : (
              <Card className="balance">
                <div className="">
                  <h2>Connect Your Account</h2>
                  <p>Mint TCAP,or check your balance connecting your account</p>
                </div>
                <Row className="">
                  <Col>
                    <Button
                      variant="primary"
                      id="connect"
                      className="neon-pink"
                      onClick={() => {
                        web3Modal.toggleModal();
                      }}
                    >
                      Connect Wallet
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          </Col>
          <Col sm={6} md={7}>
            <Card className="diamond">
              <h2>Use TCAP</h2>
              <p>Trade TCAP using uniswap or create new supply using a vault</p>
              <Row className="">
                <Col>
                  <Button
                    variant="warning"
                    className="neon-orange"
                    onClick={() => {
                      window.open("https://app.uniswap.org/#/swap", "_blank");
                    }}
                  >
                    Trade
                  </Button>
                  {address !== "" ? (
                    <Button
                      variant="primary"
                      className="neon-highlight"
                      onClick={() => {
                        history.push("/vault");
                      }}
                    >
                      Mint
                    </Button>
                  ) : (
                    <Button variant="dark" className="" disabled>
                      Mint
                    </Button>
                  )}
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default Welcome;
