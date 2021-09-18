import React, { useContext, useEffect, useState } from "react";
import "../styles/graph.scss";
import Card from "react-bootstrap/esm/Card";
import { BigNumber, ethers } from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import NetworkContext from "../state/NetworkContext";
import TokensContext from "../state/TokensContext";
import SignerContext from "../state/SignerContext";
import OraclesContext from "../state/OraclesContext";
import { ReactComponent as StakeIcon } from "../assets/images/graph/stake.svg";
import { ReactComponent as H24Icon } from "../assets/images/graph/24h.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as POLYGONIcon } from "../assets/images/graph/polygon3.svg";
import { ReactComponent as DAIIcon } from "../assets/images/graph/DAI.svg";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";
import cryptexJson from "../contracts/cryptex.json";
import { getPriceInUSDFromPair, toUSD } from "../utils/utils";
import { NETWORKS } from "../utils/constants";
import Loading from "./Loading";

const Graph = () => {
  const network = useContext(NetworkContext);
  const tokens = useContext(TokensContext);
  const signer = useContext(SignerContext);
  const oracles = useContext(OraclesContext);

  const [tcapPrice, setTcapPrice] = useState("0.0");
  const [ctxPrice, setCtxPrice] = useState("0.0");
  const [ETHStake, setETHStake] = useState("0");
  const [DAIStake, setDAIStake] = useState("0");
  const [MATICStake, setMATICStake] = useState("0");
  const [TotalStake, setTotalStake] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0.0");
  const [loading, setLoading] = useState(true);

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
    pollInterval: 5000,
    fetchPolicy: "no-cache",
  });

  const loadEthereum = async (currentPriceETH: string) => {
    if (signer) {
      const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
      // @ts-ignore
      const [reservesCtxPool] = await signer.ethcallProvider?.all([reservesCtxPoolCall]);
      const currentPriceCTX = getPriceInUSDFromPair(
        // @ts-ignore
        reservesCtxPool[0], // @ts-ignore
        reservesCtxPool[1],
        parseFloat(currentPriceETH)
      );
      setCtxPrice(currentPriceCTX.toString());
    }
  };

  const getMaticUSD = async () => {
    const maticOraclePriceCall = await oracles.maticOracleRead?.getLatestAnswer();
    // @ts-ignore
    const [maticOraclePrice] = await signer.ethcallProvider?.all([maticOraclePriceCall]);
    const maticUSD = ethers.utils.formatEther(maticOraclePrice.mul(10000000000));
    return maticUSD;
  };

  useEffect(() => {
    const load = async () => {
      if (oracles && tokens && data && signer && oracles.tcapOracleRead) {
        const currentTotalPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
        const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
        const daiOraclePriceCall = await oracles.daiOracleRead?.getLatestAnswer();
        const currentTotalSupplyCall = await tokens.tcapTokenRead?.totalSupply();

        // @ts-ignore
        const [currentTotalPrice, wethOraclePrice, daiOraclePrice, currentTotalSupply] =
          await signer.ethcallProvider?.all([
            currentTotalPriceCall,
            wethOraclePriceCall,
            daiOraclePriceCall,
            currentTotalSupplyCall,
          ]);

        const TotalTcapPrice = currentTotalPrice.mul(10000000000);
        setTcapPrice(ethers.utils.formatEther(TotalTcapPrice.div(10000000000)));
        let currentDAIStake = BigNumber.from(0);
        let currentWETHStake = BigNumber.from(0);
        let currentMATICStake = BigNumber.from(0);
        let maticVaultAddress = "";
        await data.states.forEach((s: any) => {
          let contracts;

          switch (network.chainId) {
            case 1:
              contracts = cryptexJson[1].mainnet.contracts;
              break;
            case 4:
              contracts = cryptexJson[4].rinkeby.contracts;
              break;
            case 137:
              contracts = cryptexJson[137].polygon.contracts;
              maticVaultAddress = contracts.MATICVaultHandler.address;
              break;
            default:
              contracts = cryptexJson[4].rinkeby.contracts;
              break;
          }
          switch (s.id.toLowerCase()) {
            case contracts.DAIVaultHandler.address.toLowerCase():
              currentDAIStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
              break;
            case contracts.WETHVaultHandler.address.toLowerCase():
              currentWETHStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
              break;
            case maticVaultAddress.toLowerCase():
              currentMATICStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
              break;
            default:
              break;
          }
        });

        const formatDAI = ethers.utils.formatEther(currentDAIStake);
        setDAIStake(formatDAI);
        const formatETH = ethers.utils.formatEther(currentWETHStake);
        setETHStake(formatETH);
        const formatMATIC = ethers.utils.formatEther(currentMATICStake);
        setMATICStake(formatMATIC);
        const ethUSD = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
        const daiUSD = ethers.utils.formatEther(daiOraclePrice.mul(10000000000));
        let totalMaticUSD = 0;
        if (network.chainId === NETWORKS.polygon.chainId) {
          totalMaticUSD = toUSD(await getMaticUSD(), formatMATIC);
        }
        const totalUSD = toUSD(ethUSD, formatETH) + toUSD(daiUSD, formatDAI) + totalMaticUSD;
        setTotalStake(totalUSD.toString());
        setTotalSupply(ethers.utils.formatEther(currentTotalSupply));

        const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
        if (network.chainId !== NETWORKS.polygon.chainId) {
          loadEthereum(currentPriceETH);
        }
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [data]);

  if (loading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="graph">
      <div className="grid">
        <Card>
          <StakeIcon className="stake" />
          <h4>Total Staked in USD</h4>
          <h5 className="number neon-green">
            <NumberFormat
              value={TotalStake}
              displayType="text"
              thousandSeparator
              decimalScale={2}
              prefix="$"
            />
          </h5>
        </Card>
        <Card>
          <H24Icon className="h24" />
          <h4>Total Supply</h4>
          <h5 className="number neon-blue">
            <NumberFormat
              value={totalSupply}
              displayType="text"
              thousandSeparator
              decimalScale={2}
            />{" "}
            TCAP
          </h5>
        </Card>
        <Card>
          <TcapIcon className="tcap" />
          <h4>TCAP Price</h4>
          <h5 className="number neon-highlight">
            <NumberFormat
              value={tcapPrice}
              displayType="text"
              thousandSeparator
              decimalScale={2}
              prefix="$"
            />
          </h5>
        </Card>
        <Card>
          <WETHIcon className="weth" />
          <h4>Total Staked in ETH</h4>
          <h5 className="number neon-highlight">
            <NumberFormat value={ETHStake} displayType="text" thousandSeparator decimalScale={2} />{" "}
            ETH
          </h5>
        </Card>
        <Card>
          <DAIIcon className="dai" />
          <h4>Total Staked in DAI</h4>
          <h5 className="number neon-orange">
            <NumberFormat value={DAIStake} displayType="text" thousandSeparator decimalScale={2} />{" "}
            DAI
          </h5>
        </Card>
        <Card>
          {network.chainId !== NETWORKS.polygon.chainId ? (
            <>
              <CtxIcon className="ctx" />
              <h4>CTX Price</h4>
            </>
          ) : (
            <>
              <POLYGONIcon className="eth" />
              <h4>Total Staked in MATIC</h4>
            </>
          )}
          <h5 className="number neon-blue">
            <NumberFormat
              value={network.chainId !== NETWORKS.polygon.chainId ? ctxPrice : MATICStake}
              displayType="text"
              thousandSeparator
              decimalScale={2}
              prefix={network.chainId !== NETWORKS.polygon.chainId ? "$" : ""}
            />
            {network.chainId === NETWORKS.polygon.chainId ? " MATIC" : ""}
          </h5>
        </Card>
      </div>
    </div>
  );
};

export default Graph;
