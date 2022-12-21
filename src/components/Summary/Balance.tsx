import React, { useContext, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap/esm/";
import { ethers } from "ethers";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { Provider } from "ethers-multicall";
import { oraclesContext, tokensContext } from "../../state";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import { ReactComponent as CtxIcon } from "../../assets/images/ctx-coin.svg";
import { getPriceInUSDFromPair, isUndefined, isInLayer1 } from "../../utils/utils";
import { NETWORKS } from "../../utils/constants";

type props = {
  currentChainId: number;
  ethCallProvider: Provider | undefined;
  signerAddress: string;
};

const Balance = ({ currentChainId, ethCallProvider, signerAddress }: props) => {
  const { t } = useTranslation();
  const oracles = useContext(oraclesContext);
  const tokens = useContext(tokensContext);
  const [loading, setLoading] = useState(true);
  const [indexBalance, setIndexBalance] = useState("0.0");
  const [ctxBalance, setCtxBalance] = useState("0.0");
  const [indexUsdBalance, setIndexUsdBalance] = useState("0.0");
  const [ctxUsdBalance, setCtxUsdBalance] = useState("0.0");

  const loadData = async () => {
    if (oracles.tcapOracleRead && tokens && !isUndefined(tokens.tcapTokenRead) && ethCallProvider) {
      const currentIndexPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
      // @ts-ignore
      const [currentIndexPrice] = await ethCallProvider?.all([currentIndexPriceCall]);
      const totalIndexPrice = currentIndexPrice.mul(10000000000);
      const indexPrice = ethers.utils.formatEther(totalIndexPrice.div(10000000000));

      let currentPriceCTX = 0;
      if (signerAddress === "" || currentChainId === NETWORKS.mainnet.chainId) {
        const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
        const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
        // @ts-ignore
        const [wethOraclePrice, reservesCtxPool] = await ethCallProvider?.all([
          wethOraclePriceCall,
          reservesCtxPoolCall,
        ]);
        const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
        currentPriceCTX = await getPriceInUSDFromPair(
          reservesCtxPool[0],
          reservesCtxPool[1],
          parseFloat(currentPriceETH)
        );
      }

      if (tokens.tcapTokenRead && signerAddress !== "") {
        const currentTcapBalanceCall = await tokens.tcapTokenRead?.balanceOf(signerAddress);
        // @ts-ignore
        const [currentIndexBalance] = await ethCallProvider?.all([currentTcapBalanceCall]);
        const indexString = ethers.utils.formatEther(currentIndexBalance);
        setIndexBalance(indexString);
        const indexUSD = parseFloat(indexString) * parseFloat(indexPrice);
        if (indexUSD < 0.0001) {
          setIndexUsdBalance("0.0");
        } else {
          setIndexUsdBalance(indexUSD.toString());
        }
        if (currentChainId === NETWORKS.mainnet.chainId) {
          const currentCtxBalanceCall = await tokens.ctxTokenRead?.balanceOf(signerAddress);
          // @ts-ignore
          const [currentCtxBalance] = await ethCallProvider?.all([currentCtxBalanceCall]);
          const ctxString = ethers.utils.formatEther(currentCtxBalance);
          setCtxBalance(ctxString);
          const ctxUSD = parseFloat(ctxString) * currentPriceCTX;
          setCtxUsdBalance(ctxUSD.toString());
        } else {
          setCtxBalance("21.5");
          setCtxUsdBalance("67.08");
        }
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
  }, [currentChainId, ethCallProvider, signerAddress]);

  return (
    <div className="balance">
      {loading ? (
        <div className="spinner-container">
          <Spinner variant="danger" className="spinner" animation="border" />
        </div>
      ) : (
        <div className="detail">
          <div className="totals">
            <TcapIcon className="stake" />
            <div className="staked">
              <h6>
                <>{t("welcome.tcap-balance")}</>
              </h6>
              <h5 className="number neon-green">
                <NumberFormat
                  value={indexBalance}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                />
              </h5>
            </div>
          </div>
          <div className="totals">
            <TcapIcon className="h24" />
            <div className="staked">
              <h6>TCAP USD Balance</h6>
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
          <div className="asset">
            <CtxIcon className="h24" />
            <div className="staked">
              <h6>
                <>{t("welcome.ctx-balance")}</>
              </h6>
              <h5 className="number neon-blue">
                <NumberFormat
                  value={ctxBalance}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                />
              </h5>
            </div>
          </div>
          <div className="totals">
            <CtxIcon className="h24" />
            <div className="staked">
              <h6>CTX USD Balance</h6>
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
      )}
    </div>
  );
};

export default Balance;
