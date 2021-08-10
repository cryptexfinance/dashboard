import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import ethers, { BigNumber } from "ethers";
import NumberFormat from "react-number-format";
import { useHistory } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { makeShortAddress, getPriceInUSDFromPair } from "../utils/utils";
import "../styles/welcome.scss";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";

import Loading from "./Loading";

const Welcome = () => {
  const [address, setAddress] = useState("");
  const [tcapBalance, setTcapBalance] = useState("0.0");
  const [tcapUSDBalance, setTcapUSDBalance] = useState("0.0");
  const [totalPrice, setTotalPrice] = useState("0.0");
  const [tcapPrice, setTcapPrice] = useState("0.0");
  const [ctxUSDBalance, setCtxUSDBalance] = useState("0.0");
  const [ctxBalance, setCtxBalance] = useState("0.0");
  const [isLoading, setIsLoading] = useState(true);
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const history = useHistory();
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);
  const lpURL = process.env.REACT_APP_LP_URL;

  const TCAP_PRICE = gql`
    query {
      oracles(first: 1, orderBy: updatedAt, orderDirection: desc) {
        answer
      }
    }
  `;

  const { data } = useQuery(TCAP_PRICE);

  useEffect(() => {
    const loadAddress = async () => {
      if (
        signer.signer &&
        tokens.tcapToken &&
        tokens.ctxToken &&
        oracles.tcapOracle &&
        tokens.tcapTokenRead
      ) {
        const currentAddress = await signer.signer.getAddress();
        setAddress(makeShortAddress(currentAddress));
        const currentTcapBalanceCall = await tokens.tcapTokenRead?.balanceOf(currentAddress);
        const currentCtxBalanceCall = await tokens.ctxTokenRead?.balanceOf(currentAddress);
        const wethOraclePriceCall = oracles.wethOracleRead?.getLatestAnswer();
        const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();

        // @ts-ignore
        const [
          currentTcapBalance,
          currentCtxBalance,
          wethOraclePrice,
          reservesCtxPool,
        ] = await signer.ethcallProvider?.all([
          currentTcapBalanceCall,
          currentCtxBalanceCall,
          wethOraclePriceCall,
          reservesCtxPoolCall,
        ]);

        const tcapString = ethers.utils.formatEther(currentTcapBalance);
        setTcapBalance(tcapString);
        const ctxString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(ctxString);

        const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
        const currentPriceCTX = await getPriceInUSDFromPair(
          reservesCtxPool[0],
          reservesCtxPool[1],
          parseFloat(currentPriceETH)
        );
        const ctxUSD = parseFloat(ctxString) * currentPriceCTX;
        setCtxUSDBalance(ctxUSD.toString());
      }
      if (data) {
        const currentTotalPrice = BigNumber.from(await data?.oracles[0].answer);
        console.log(`Current TOTAL: ${currentTotalPrice}`);
        const TotalTcapPrice = currentTotalPrice.mul(10000000000);
        console.log(`Total TCAP: ${TotalTcapPrice}`);
        setTotalPrice(ethers.utils.formatEther(TotalTcapPrice));
        setTcapPrice(ethers.utils.formatEther(TotalTcapPrice.div(10000000000)));
        const tcapUSD = parseFloat(tcapBalance) * parseFloat(tcapPrice);
        setTcapUSDBalance(tcapUSD.toString());
        setIsLoading(false);
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [tcapUSDBalance, data, isLoading, address]);

  if (isLoading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="welcome">
      <div>
        <Row className="data">
          <Col xs={12} sm={12} md={6} lg={6}>
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
            <p>
              Total Cryptocurrency Market Capitalization
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-bottom">
                    Total Crypto Market Capitalization is updated on-chain on every 1% movement
                  </Tooltip>
                }
              >
                <Button variant="dark" className="question">
                  ?
                </Button>
              </OverlayTrigger>
            </p>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} className="token-price">
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
          <Col xs={12} md={6} lg={6}>
            {address !== "" ? (
              <Card className="balance">
                <div className="">
                  <h2>My Total Balance</h2>
                  <p>
                    Connected Account <b className="">{address}</b>
                  </p>
                </div>
                <Row className="">
                  <Col>
                    <div className="tcap-balance">
                      <TcapIcon className="tcap-neon" />
                      <div>
                        <h3 className="number neon-blue">
                          <NumberFormat
                            className="number"
                            value={tcapBalance}
                            displayType="text"
                            thousandSeparator
                            decimalScale={2}
                          />
                        </h3>
                        <p className="number usd-balance">
                          <NumberFormat
                            className="number"
                            value={tcapUSDBalance}
                            displayType="text"
                            thousandSeparator
                            prefix="$"
                            decimalScale={parseFloat(tcapUSDBalance) > 1000 ? 0 : 2}
                          />
                        </p>
                      </div>
                    </div>
                    <p className="title tcap">TCAP Balance</p>
                  </Col>
                  <Col>
                    <div className="tcap-balance">
                      <CtxIcon className="tcap-neon" />
                      <div>
                        <h3 className="number neon-dark-blue">
                          <NumberFormat
                            className="number"
                            value={ctxBalance}
                            displayType="text"
                            thousandSeparator
                            decimalScale={2}
                          />
                        </h3>
                        <p className="number usd-balance">
                          <NumberFormat
                            className="number"
                            value={ctxUSDBalance}
                            displayType="text"
                            thousandSeparator
                            prefix="$"
                            decimalScale={parseFloat(ctxUSDBalance) > 1000 ? 0 : 2}
                          />
                        </p>
                      </div>
                    </div>
                    <p className="title tcap">CTX Balance</p>
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
          <Col xs={12} sm={12} md={6} lg={6} className="use-tcap">
            <Card className="diamond">
              <h2>Use TCAP</h2>
              <p>Trade TCAP using SushiSwap or create new supply using a vault</p>
              <Row className="">
                <Col>
                  <Button
                    variant="primary"
                    className="neon-pink"
                    onClick={() => {
                      window.open(
                        `${lpURL}/swap?inputCurrency=ETH?outputCurrency=${tokens.tcapToken?.address}`,
                        "_blank"
                      );
                    }}
                  >
                    Trade
                  </Button>
                  {address !== "" ? (
                    <Button
                      variant="success"
                      className="neon-green"
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
              <Row className="">
                <Col>
                  {address !== "" ? (
                    <Button
                      variant="info"
                      className="neon-blue"
                      onClick={() => {
                        history.push("/pools");
                      }}
                    >
                      Pool
                    </Button>
                  ) : (
                    <Button variant="dark" className="" disabled>
                      Pool
                    </Button>
                  )}
                  {address !== "" ? (
                    <Button
                      variant="warning"
                      className="neon-orange"
                      onClick={() => {
                        history.push("/farm");
                      }}
                    >
                      Farm
                    </Button>
                  ) : (
                    <Button variant="dark" className="" disabled>
                      Farm
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
