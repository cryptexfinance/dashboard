import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { useTranslation } from "react-i18next";
import { ethers, BigNumber } from "ethers";
import NumberFormat from "react-number-format";
import { useHistory } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import NetworkContext from "../../state/NetworkContext";
import SignerContext from "../../state/SignerContext";
import TokensContext from "../../state/TokensContext";
import OraclesContext from "../../state/OraclesContext";
import { Web3ModalContext } from "../../state/Web3ModalContext";
import { makeShortAddress, getPriceInUSDFromPair, getENS, isInLayer1 } from "../../utils/utils";
import "../../styles/welcome.scss";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import { ReactComponent as CtxIcon } from "../../assets/images/ctx-coin.svg";
import { NETWORKS } from "../../utils/constants";
import Loading from "../Loading";

type props = {
  signerAddress: string;
};

const Welcome = ({ signerAddress }: props) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [tcapBalance, setTcapBalance] = useState("0.0");
  const [tcapUSDBalance, setTcapUSDBalance] = useState("0.0");
  const [totalPrice, setTotalPrice] = useState("0.0");
  const [tcapPrice, setTcapPrice] = useState("0.0");
  const [ctxUSDBalance, setCtxUSDBalance] = useState("0.0");
  const [ctxBalance, setCtxBalance] = useState("0.0");
  const [isLoading, setIsLoading] = useState(true);
  const currentNetwork = useContext(NetworkContext);
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const history = useHistory();
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);

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
      if (signer.signer && tokens.tcapToken && oracles.tcapOracle && tokens.tcapTokenRead) {
        if (signerAddress !== "" && signerAddress !== currentAddress) {
          const ens = await getENS(signerAddress);
          if (ens) {
            setAddress(ens);
          } else {
            setAddress(makeShortAddress(signerAddress));
          }

          const currentTcapBalanceCall = await tokens.tcapTokenRead?.balanceOf(signerAddress);
          const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
          // @ts-ignore
          const [currentTcapBalance, wethOraclePrice] = await signer.ethcallProvider?.all([
            currentTcapBalanceCall,
            wethOraclePriceCall,
          ]);
          const tcapString = ethers.utils.formatEther(currentTcapBalance);
          setTcapBalance(tcapString);
          const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));

          if (isInLayer1(currentNetwork.chainId)) {
            const currentCtxBalanceCall = await tokens.ctxTokenRead?.balanceOf(signerAddress);
            const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
            // @ts-ignore
            const [currentCtxBalance, reservesCtxPool] = await signer.ethcallProvider?.all([
              currentCtxBalanceCall,
              reservesCtxPoolCall,
            ]);
            const ctxString = ethers.utils.formatEther(currentCtxBalance);
            setCtxBalance(ctxString);
            const currentPriceCTX = await getPriceInUSDFromPair(
              reservesCtxPool[0],
              reservesCtxPool[1],
              parseFloat(currentPriceETH)
            );
            const ctxUSD = parseFloat(ctxString) * currentPriceCTX;
            setCtxUSDBalance(ctxUSD.toString());
          }
          setCurrentAddress(signerAddress);
        }
      }
      if (data) {
        let currentTotalPrice = BigNumber.from(0);
        const prices = await data?.oracles;
        if (prices.length > 0) {
          currentTotalPrice = BigNumber.from(prices[0].answer);
        }
        const TotalTcapPrice = currentTotalPrice.mul(10000000000);
        setTotalPrice(ethers.utils.formatEther(TotalTcapPrice));
        setTcapPrice(ethers.utils.formatEther(TotalTcapPrice.div(10000000000)));
        const tcapUSD = parseFloat(tcapBalance) * parseFloat(tcapPrice);
        setTcapUSDBalance(tcapUSD.toString());
        setIsLoading(false);
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [signerAddress, tcapUSDBalance, data]);

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
              {t("welcome.tcap")}
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={<Tooltip id="tooltip-bottom">{t("welcome.tcap-info")}</Tooltip>}
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
            <p>{t("welcome.tcap-token")}</p>
          </Col>
        </Row>
        <Row className="card-wrapper">
          <Col xs={12} md={6} lg={6}>
            {address !== "" ? (
              <Card className="balance">
                <div className="">
                  <h2>{t("welcome.title1")}</h2>
                  <p>
                    {t("welcome.subtitle1")} <b className="">{address}</b>
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
                    <p className="title tcap">{t("welcome.tcap-balance")}</p>
                  </Col>
                  {(currentNetwork.chainId === NETWORKS.mainnet.chainId ||
                    currentNetwork.chainId === NETWORKS.rinkeby.chainId) && (
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
                      <p className="title tcap">{t("welcome.ctx-balance")}</p>
                    </Col>
                  )}
                </Row>
              </Card>
            ) : (
              <Card className="balance">
                <div className="">
                  <h2>{t("welcome.title3")}</h2>
                  <p>{t("welcome.subtitle3")}</p>
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
                      {t("connect")}
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} className="use-tcap">
            <Card className="diamond">
              <h2>{t("welcome.title2")}</h2>
              <p>{t("welcome.subtitle2")}</p>
              <Row className="">
                <Col>
                  <Button
                    variant="primary"
                    className="neon-pink"
                    onClick={() => {
                      window.open(
                        `${NETWORKS.mainnet.lpUrl}/swap?inputCurrency=ETH?outputCurrency=${tokens.tcapToken?.address}`,
                        "_blank"
                      );
                    }}
                  >
                    {t("trade")}
                  </Button>
                  {address !== "" ? (
                    <Button
                      variant="success"
                      className="neon-green"
                      onClick={() => {
                        history.push("/vault");
                      }}
                    >
                      {t("mint")}
                    </Button>
                  ) : (
                    <Button variant="dark" className="" disabled>
                      {t("mint")}
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
                      {t("pool")}
                    </Button>
                  ) : (
                    <Button variant="dark" className="" disabled>
                      {t("pool")}
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
                      {t("farm")}
                    </Button>
                  ) : (
                    <Button variant="dark" className="" disabled>
                      {t("farm")}
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
