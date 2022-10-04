import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import NetworkContext from "../../state/NetworkContext";
import SignerContext from "../../state/SignerContext";
import TokensContext from "../../state/TokensContext";
import OraclesContext from "../../state/OraclesContext";
import { Web3ModalContext } from "../../state/Web3ModalContext";
import { makeShortAddress, getPriceInUSDFromPair, getENS, isInLayer1 } from "../../utils/utils";
import "../../styles/summary.scss";
import Protocol from "./Protocol";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import { ReactComponent as CtxIcon } from "../../assets/images/ctx-coin.svg";
import Loading from "../Loading";

type props = {
  signerAddress: string;
  loadingContracts: boolean;
};

const Summary = ({ signerAddress, loadingContracts }: props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [address, setAddress] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [tcapBalance, setTcapBalance] = useState("0.0");
  const [tcapUSDBalance, setTcapUSDBalance] = useState("0.0");
  const [totalPrice, setTotalPrice] = useState("0.0");
  const [tcapPrice, setTcapPrice] = useState("0.0");
  const [ctxPrice, setCtxPrice] = useState("0.0");
  const [ctxUSDBalance, setCtxUSDBalance] = useState("0.0");
  const [ctxBalance, setCtxBalance] = useState("0.0");
  const [isLoading, setIsLoading] = useState(true);
  const currentNetwork = useContext(NetworkContext);
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);

  const VAULTS_STATE = gql`
    {
      states {
        amountStaked
        id
      }
    }
  `;

  const { data } = useQuery(VAULTS_STATE, {
    notifyOnNetworkStatusChange: true,
    pollInterval: 35000,
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    const loadAddress = async () => {
      if (oracles.tcapOracleRead) {
        const currentTcapPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
        // @ts-ignore
        const [currentTcapPrice] = await signer.ethcallProvider?.all([currentTcapPriceCall]);
        const TotalTcapPrice = currentTcapPrice.mul(10000000000);
        const tPrice = ethers.utils.formatEther(TotalTcapPrice.div(10000000000));
        setTotalPrice(ethers.utils.formatEther(TotalTcapPrice));
        setTcapPrice(tPrice);

        let currentPriceCTX = 0;
        if (signerAddress === "" || isInLayer1(currentNetwork.chainId)) {
          const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
          const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
          // @ts-ignore
          const [wethOraclePrice, reservesCtxPool] = await signer.ethcallProvider?.all([
            wethOraclePriceCall,
            reservesCtxPoolCall,
          ]);
          const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
          currentPriceCTX = await getPriceInUSDFromPair(
            reservesCtxPool[0],
            reservesCtxPool[1],
            parseFloat(currentPriceETH)
          );
          setCtxPrice(currentPriceCTX.toString());
        }

        if (
          signer.signer &&
          tokens.tcapTokenRead &&
          signerAddress !== "" &&
          signerAddress !== currentAddress
        ) {
          const ens = await getENS(signerAddress);
          if (ens) {
            setAddress(ens);
          } else {
            setAddress(makeShortAddress(signerAddress));
          }

          const currentTcapBalanceCall = await tokens.tcapTokenRead?.balanceOf(signerAddress);
          // @ts-ignore
          const [currentTcapBalance] = await signer.ethcallProvider?.all([currentTcapBalanceCall]);
          const tcapString = ethers.utils.formatEther(currentTcapBalance);
          setTcapBalance(tcapString);
          const tcapUSD = parseFloat(tcapString) * parseFloat(tPrice);
          if (tcapUSD < 0.0001) {
            setTcapUSDBalance("0.0");
          } else {
            setTcapUSDBalance(tcapUSD.toString());
          }
          if (isInLayer1(currentNetwork.chainId)) {
            const currentCtxBalanceCall = await tokens.ctxTokenRead?.balanceOf(signerAddress);
            // @ts-ignore
            const [currentCtxBalance] = await signer.ethcallProvider?.all([currentCtxBalanceCall]);
            const ctxString = ethers.utils.formatEther(currentCtxBalance);
            setCtxBalance(ctxString);
            const ctxUSD = parseFloat(ctxString) * currentPriceCTX;
            setCtxUSDBalance(ctxUSD.toString());
          }
          setCurrentAddress(signerAddress);
        }
        setIsLoading(false);
      }
    };
    loadAddress();

    // eslint-disable-next-line
  }, [signerAddress, loadingContracts]);

  if (isLoading) {
    return <Loading title={t("loading")} message={t("wait")} />;
  }

  return (
    <div className="summary">
      <div className="prices">
        <div className="token-price total">
          <h4 className="number neon-dark-blue">
            <NumberFormat
              className="number"
              value={totalPrice}
              displayType="text"
              thousandSeparator
              prefix="$"
              decimalScale={0}
            />
            <OverlayTrigger
              key="bottom"
              placement="bottom"
              overlay={<Tooltip id="tooltip-bottom">{t("welcome.tcap-info")}</Tooltip>}
            >
              <Button variant="dark" className="question">
                ?
              </Button>
            </OverlayTrigger>
          </h4>
          <h4 className="title">{t("welcome.tcap")}:</h4>
        </div>
        <div className="token-price">
          <h4 className="number neon-dark-blue">
            <NumberFormat
              className="number"
              value={tcapPrice}
              displayType="text"
              thousandSeparator
              prefix="$"
              decimalScale={2}
            />
          </h4>
          <h4>{t("welcome.tcap-price")}:</h4>
        </div>
        {isInLayer1(currentNetwork.chainId) && (
          <div className="token-price">
            <h4 className="number neon-dark-blue">
              <NumberFormat
                className="number"
                value={ctxPrice}
                displayType="text"
                thousandSeparator
                prefix="$"
                decimalScale={2}
              />
            </h4>
            <h4>{t("welcome.ctx-price")}:</h4>
          </div>
        )}
        <div
          id="crypto-widget-CoinList"
          data-transparent="true"
          data-theme="dark"
          data-design="modern"
          data-coin-ids="4434,4784"
        />
      </div>
      <div className="summary2">
        <Col xs={12} sm={12} md={6} lg={6} className="col-wrapper">
          {address !== "" ? (
            <Card className="balance">
              <Card.Header>
                <div className="">
                  <h2>{t("welcome.title1")}</h2>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="balance-section">
                  <div className="balance-box">
                    <div className="title">
                      <h5 className="tcap">{t("welcome.tcap-balance")}</h5>
                    </div>
                    <div className="values">
                      <div className="asset-value">
                        <h5 className="number neon-blue">
                          <NumberFormat
                            className="number"
                            value={tcapBalance}
                            displayType="text"
                            thousandSeparator
                            decimalScale={2}
                          />
                        </h5>
                        <TcapIcon className="tcap-neon" />
                      </div>
                      <p className="number usd-balance">
                        <NumberFormat
                          className="number"
                          value={tcapUSDBalance}
                          displayType="text"
                          thousandSeparator
                          prefix="$"
                          decimalScale={2}
                        />
                      </p>
                    </div>
                  </div>
                  {isInLayer1(currentNetwork.chainId) && (
                    <div className="balance-box">
                      <div className="title">
                        <h5 className="tcap">{t("welcome.ctx-balance")}</h5>
                      </div>
                      <div className="values">
                        <div className="asset-value">
                          <h5 className="number neon-dark-blue">
                            <NumberFormat
                              className="number"
                              value={ctxBalance}
                              displayType="text"
                              thousandSeparator
                              decimalScale={2}
                            />
                          </h5>
                          <CtxIcon className="tcap-neon" />
                        </div>
                        <p className="number usd-balance">
                          <NumberFormat
                            className="number"
                            value={ctxUSDBalance}
                            displayType="text"
                            thousandSeparator
                            prefix="$"
                            decimalScale={2}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="balance">
              <Card.Header>
                <h2>{t("welcome.title3")}</h2>
              </Card.Header>
              <Card.Body>
                <Row className="">
                  <p>{t("welcome.subtitle3")}</p>
                  <div>
                    <Button
                      variant="primary"
                      id="connect"
                      className="neon-pink btn-connect"
                      onClick={() => {
                        web3Modal.toggleModal();
                      }}
                    >
                      {t("connect")}
                    </Button>
                  </div>
                </Row>
              </Card.Body>
            </Card>
          )}
          <Card className="diamond">
            <Card.Header>
              <h2>{t("welcome.title2")}</h2>
            </Card.Header>
            <Card.Body>
              <p>{t("welcome.subtitle2")}</p>
              <Row className="">
                <Col>
                  <Button
                    variant="primary"
                    className="neon-pink"
                    onClick={() => {
                      window.open("https://app.uniswap.org/#/swap", "_blank");
                    }}
                  >
                    {t("trade")}
                  </Button>
                  <Button
                    variant="success"
                    className="neon-green"
                    onClick={() => {
                      history.push("/vault");
                    }}
                    disabled={address === ""}
                  >
                    {t("mint")}
                  </Button>
                </Col>
              </Row>
              <Row className="">
                <Col>
                  <Button
                    variant="info"
                    className="neon-blue"
                    onClick={() => {
                      history.push("/vault-monitoring", { address: signerAddress });
                    }}
                    disabled={address === ""}
                  >
                    {t("my-vaults")}
                  </Button>
                  <Button
                    variant="warning"
                    className="neon-orange"
                    onClick={() => {
                      history.push("/farm");
                    }}
                    disabled={address === ""}
                  >
                    {t("farm")}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} className="col-wrapper">
          <Protocol data={data} />
        </Col>
      </div>
    </div>
  );
};

export default Summary;
