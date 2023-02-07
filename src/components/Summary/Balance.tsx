import React, { useContext, useEffect, useState } from "react";
import { Image, Spinner } from "react-bootstrap/esm/";
// import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { Provider } from "ethers-multicall";
import jpegzIcon from "../../assets/images/jpegz-coin.png";
import { ReactComponent as CtxIcon } from "../../assets/images/ctx-coin.svg";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import { BalancesType, OraclePricesType } from "../../hooks/types";
import { ethereumContext } from "../../state";
import { getPriceInUSDFromPair, isArbitrum, isInLayer1 } from "../../utils/utils";
import { NETWORKS, TOKENS_SYMBOLS } from "../../utils/constants";
// import { VaultsWarning } from "./warnings/index";

type props = {
  currentChainId: number;
  ethCallProvider: Provider | undefined;
  signerAddress: string;
  balances: BalancesType;
  prices: OraclePricesType;
};

const Balance = ({ currentChainId, ethCallProvider, signerAddress, balances, prices }: props) => {
  // const { t } = useTranslation();
  const currentIndexName = isArbitrum(currentChainId) ? TOKENS_SYMBOLS.JPEGz : TOKENS_SYMBOLS.TCAP;
  const ethereumContracts = useContext(ethereumContext);
  const [loading, setLoading] = useState(true);
  const [indexBalance, setIndexBalance] = useState("0.0");
  const [ctxBalance, setCtxBalance] = useState("0.0");
  const [indexUsdBalance, setIndexUsdBalance] = useState("0.0");
  const [ctxUsdBalance, setCtxUsdBalance] = useState("0.0");
  const [indexPrice, setIndexPrice] = useState("0.0");
  const [ctxPrice, setCtxPrice] = useState("0.0");

  const loadData = async () => {
    if (ethCallProvider) {
      let currentPriceCTX = 0;
      if (signerAddress === "" || currentChainId === NETWORKS.mainnet.chainId) {
        const reservesCtxPoolCall = await ethereumContracts.ctxPoolTokenRead?.getReserves();
        // @ts-ignore
        const [reservesCtxPool] = await ethCallProvider?.all([reservesCtxPoolCall]);
        currentPriceCTX = await getPriceInUSDFromPair(
          reservesCtxPool[0],
          reservesCtxPool[1],
          parseFloat(prices.wethOraclePrice)
        );
      }

      let indexUSD = 0;
      if (isArbitrum(currentChainId)) {
        indexUSD = parseFloat(balances.jpegzBalance) * parseFloat(prices.jpegzOraclePrice);
        setIndexBalance(balances.jpegzBalance);
        setIndexPrice(prices.jpegzOraclePrice);
      } else {
        indexUSD = parseFloat(balances.tcapBalance) * parseFloat(prices.tcapOraclePrice);
        setIndexBalance(balances.tcapBalance);
        setIndexPrice(prices.tcapOraclePrice);
      }
      if (indexUSD < 0.0001) {
        setIndexUsdBalance("0.0");
      } else {
        setIndexUsdBalance(indexUSD.toString());
      }

      if (currentChainId === NETWORKS.mainnet.chainId) {
        setCtxBalance(balances.ctxBalance);
        const ctxUSD = parseFloat(balances.ctxBalance) * currentPriceCTX;
        setCtxUsdBalance(ctxUSD.toString());
        setCtxPrice(currentPriceCTX.toFixed(8));
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [ethCallProvider, signerAddress, balances]);

  const IndexIcon = () => {
    if (!isArbitrum(currentChainId)) {
      return <TcapIcon className="stake" />;
    }
    return <Image className="jpegz-icon" src={jpegzIcon} alt="JPEGz icon" />;
  };

  return (
    <div className="balance-container">
      {loading ? (
        <div className="spinner-container">
          <Spinner variant="danger" className="spinner" animation="border" />
        </div>
      ) : (
        <>
          <div className="detail">
            <div className="totals">
              <IndexIcon />
              <div className="staked">
                {/* <h6>{currentIndexName} Balance</h6> */}
                <div className="value">
                  <h5 className="number neon-green">
                    <NumberFormat
                      value={indexBalance}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                      suffix={" ".concat(currentIndexName)}
                    />
                  </h5>
                  <h5 className="value-separator">/</h5>
                  <h5 className="number neon-blue">
                    <NumberFormat
                      value={indexUsdBalance}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                      prefix="$"
                    />
                  </h5>
                </div>
              </div>
            </div>
            <div className="totals">
              <IndexIcon />
              <div className="staked">
                <h6>{currentIndexName} Oracle Price</h6>
                <h5 className="number neon-blue">
                  <NumberFormat
                    value={indexPrice}
                    displayType="text"
                    thousandSeparator
                    decimalScale={2}
                    prefix="$"
                  />
                </h5>
              </div>
            </div>
            {isInLayer1(currentChainId) && (
              <>
                <div className="totals">
                  <CtxIcon className="h24" />
                  <div className="staked">
                    {/* <h6>
                      <>{t("welcome.ctx-balance")}</>
                    </h6> */}
                    <div className="value">
                      <h5 className="number neon-green">
                        <NumberFormat
                          value={ctxBalance}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                          suffix=" CTX"
                        />
                      </h5>
                      <h5 className="value-separator">/</h5>
                      <h5 className="number neon-blue">
                        <NumberFormat
                          value={ctxUsdBalance}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                          prefix="$"
                        />
                      </h5>
                    </div>
                  </div>
                </div>
                <div className="totals">
                  <CtxIcon className="h24" />
                  <div className="staked">
                    <h6>CTX Price</h6>
                    <h5 className="number neon-blue">
                      <NumberFormat
                        value={ctxPrice}
                        displayType="text"
                        thousandSeparator
                        decimalScale={2}
                        prefix="$"
                      />
                    </h5>
                  </div>
                </div>
              </>
            )}
          </div>
          {/*  
          <div className="warnings">
            <VaultsWarning ownerAddress={signerAddress} prices={prices} />
            </div>
          */}
        </>
      )}
    </div>
  );
};

export default Balance;
