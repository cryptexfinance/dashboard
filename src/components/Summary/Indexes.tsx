import React, { useContext, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap/esm/";
import { ethers } from "ethers";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { Provider } from "ethers-multicall";
import { oraclesContext, tokensContext } from "../../state";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import { isUndefined } from "../../utils/utils";

type props = {
  currentChainId: number;
  ethCallProvider: Provider | undefined;
};

const Indexes = ({ currentChainId, ethCallProvider }: props) => {
  const { t } = useTranslation();
  const oracles = useContext(oraclesContext);
  const tokens = useContext(tokensContext);
  const [loading, setLoading] = useState(true);
  const [marketCap, setMarketCap] = useState("0.0");
  const [indexOraclePrice, setIndexOraclePrice] = useState("0.0");
  const [indexMarketPrice, setIndexMarketPrice] = useState("0.0");
  const [totalSupply, setTotalSupply] = useState("0.0");

  const loadData = async () => {
    if (
      oracles.tcapOracleRead &&
      tokens &&
      !isUndefined(tokens.tcapTokenRead) &&
      !isUndefined(ethCallProvider)
    ) {
      const currentTotalSupplyCall = await tokens.tcapTokenRead?.totalSupply();
      const currentIndexPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();

      // @ts-ignore
      const [currentTotalSupply, currentIndexPrice] = await ethCallProvider?.all([
        currentTotalSupplyCall,
        currentIndexPriceCall,
      ]);

      setTotalSupply(ethers.utils.formatEther(currentTotalSupply));
      const totalIndexMarketCap = currentIndexPrice.mul(10000000000);
      const indexPrice = ethers.utils.formatEther(totalIndexMarketCap.div(10000000000));
      setMarketCap(ethers.utils.formatEther(totalIndexMarketCap));
      setIndexOraclePrice(indexPrice);

      const urlParams = new URLSearchParams({
        ids: "total-crypto-market-cap-token",
        vs_currencies: "usd",
        include_last_updated_at: true,
        precision: 10,
      });

      const reponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?".concat(urlParams.toString()),
        {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resp = await reponse.json();
      if (resp) {
        setIndexMarketPrice(resp["total-crypto-market-cap-token"].usd);
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
  }, [currentChainId, ethCallProvider]);

  return (
    <div className="indexes">
      {loading ? (
        <div className="spinner-container">
          <Spinner variant="danger" className="spinner" animation="border" />
        </div>
      ) : (
        <div className="detail">
          <div className="totals market-cap">
            <TcapIcon className="stake" />
            <div className="staked">
              <h6>
                <>{t("welcome.tcap")}</>
              </h6>
              <h5 className="number neon-green">
                <NumberFormat
                  value={marketCap}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                  prefix="$"
                />
              </h5>
            </div>
          </div>
          <div className="totals">
            <TcapIcon className="h24" />
            <div className="staked">
              <h6>TCAP Oracle Price</h6>
              <h5 className="number neon-blue">
                <NumberFormat
                  value={indexOraclePrice}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                  prefix="$"
                />
              </h5>
            </div>
          </div>
          <div className="totals">
            <TcapIcon className="h24" />
            <div className="staked">
              <h6>TCAP Market Price</h6>
              <h5 className="number neon-blue">
                <NumberFormat
                  value={indexMarketPrice}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                  prefix="$"
                />
              </h5>
            </div>
          </div>
          <div className="asset">
            <TcapIcon className="h24" />
            <div className="staked">
              <h6>
                <>{t("welcome.summary.total-supply")}</>
              </h6>
              <h5 className="number neon-blue">
                <NumberFormat
                  value={totalSupply}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                />
              </h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Indexes;
