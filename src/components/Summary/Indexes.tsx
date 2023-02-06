import React, { useEffect, useState } from "react";
import { Image, Spinner } from "react-bootstrap/esm/";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { Provider } from "ethers-multicall";
import jpegzIcon from "../../assets/images/jpegz-coin.png";
import { BalancesType, OraclePricesType } from "../../hooks/types";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import { isArbitrum } from "../../utils/utils";
import { TOKENS_SYMBOLS } from "../../utils/constants";

type props = {
  currentChainId: number;
  ethCallProvider: Provider | undefined;
  balances: BalancesType;
  prices: OraclePricesType;
};

const Indexes = ({ currentChainId, ethCallProvider, balances, prices }: props) => {
  const { t } = useTranslation();
  const currentIndexName = isArbitrum(currentChainId) ? TOKENS_SYMBOLS.JPEGz : TOKENS_SYMBOLS.TCAP;
  const [loading, setLoading] = useState(true);
  const [marketCap, setMarketCap] = useState("0.0");
  const [indexOraclePrice, setIndexOraclePrice] = useState("0.0");
  const [indexMarketPrice, setIndexMarketPrice] = useState("0.0");
  const [totalSupply, setTotalSupply] = useState("0.0");

  const loadData = async () => {
    if (!isArbitrum(currentChainId)) {
      setTotalSupply(balances.tcapSupplly);
      setIndexOraclePrice(prices.tcapOraclePrice);
      setMarketCap(prices.tcapMarketCap);
    } else {
      setTotalSupply(balances.jpegzSupplly);
      setIndexOraclePrice(prices.jpegzOraclePrice);
      setMarketCap(prices.jpegzMarketCap);
    }

    // @ts-ignore
    const urlParams = new URLSearchParams({
      ids: "total-crypto-market-cap-token",
      vs_currencies: "usd",
      include_last_updated_at: true,
      precision: 10,
    });

    if (!isArbitrum(currentChainId)) {
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
    } else {
      setIndexMarketPrice("0");
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
  }, [currentChainId, ethCallProvider, balances, prices]);

  const IndexIcon = () => {
    if (!isArbitrum(currentChainId)) {
      return <TcapIcon className="h24" />;
    }
    return <Image className="jpegz-icon" src={jpegzIcon} alt="JPEGz icon" />;
  };

  return (
    <div className="indexes">
      {loading ? (
        <div className="spinner-container">
          <Spinner variant="danger" className="spinner" animation="border" />
        </div>
      ) : (
        <div className="detail">
          <div className="totals market-cap">
            <IndexIcon />
            <div className="staked">
              <h6>
                <>{t("welcome.tcap")}</>
              </h6>
              <h5 className="number neon-blue">
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
            <IndexIcon />
            <div className="staked">
              <h6>{currentIndexName} Oracle Price</h6>
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
          {!isArbitrum(currentChainId) && (
            <div className="totals">
              <IndexIcon />
              <div className="staked">
                <h6>{currentIndexName} Market Price</h6>
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
          )}
          <div className="asset">
            <IndexIcon />
            <div className="staked">
              <h6>{currentIndexName} Supply</h6>
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
