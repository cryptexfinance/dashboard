import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Col from "react-bootstrap/esm/Col";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { FaArrowRight } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import {
  networkContext,
  oraclesContext,
  signerContext,
  tokensContext,
  Web3ModalContext,
} from "../../state";
import {
  makeShortAddress,
  getPriceInUSDFromPair,
  getENS,
  isInLayer1,
  isGoerli,
} from "../../utils/utils";
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
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);
  const web3Modal = useContext(Web3ModalContext);
  const tokens = useContext(tokensContext);
  const oracles = useContext(oraclesContext);

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
        if (
          !isGoerli(currentNetwork.chainId) &&
          (signerAddress === "" || isInLayer1(currentNetwork.chainId))
        ) {
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
              overlay={
                <Tooltip id="tooltip-bottom">
                  <>{t("welcome.tcap-info")}</>
                </Tooltip>
              }
            >
              <Button variant="dark" className="question">
                ?
              </Button>
            </OverlayTrigger>
          </h4>
          <h4 className="title">
            <>{t("welcome.tcap")}:</>
          </h4>
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
          <h4>
            <>{t("welcome.tcap-price")}:</>
          </h4>
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
            <h4>
              <>{t("welcome.ctx-price")}:</>
            </h4>
          </div>
        )}
      </div>
      <div className="summary-protocol">
        <Col xs={12} sm={12} md={6} lg={6} className="col-wrapper features">
          <Button className="btn-feature">
            <div className="feature-content">
              <p>Creating vaults & minting index tokens</p>
            </div>
            <div className="feature-action">
              <FaArrowRight size={20} />
            </div>
          </Button>
          <Button className="btn-feature">
            <div className="feature-content">
              <p>Providing liquidity</p>
            </div>
            <div className="feature-action">
              <FaArrowRight size={20} />
            </div>
          </Button>
          <Button className="btn-feature">
            <div className="feature-content">
              <p>Staking & delegating to Crypt Keepers</p>
            </div>
            <div className="feature-action">
              <FaArrowRight size={20} />
            </div>
          </Button>
          <Button className="btn-feature">
            <div className="feature-content">
              <p>Going on quests with Sewage Fruitz</p>
            </div>
            <div className="feature-action">
              <FaArrowRight size={20} />
            </div>
          </Button>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} className="col-wrapper">
          <Protocol data={data} />
        </Col>
      </div>
    </div>
  );
};

export default Summary;
