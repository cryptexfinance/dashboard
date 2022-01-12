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
import { ReactComponent as AAVEIcon } from "../assets/images/graph/aave.svg";
import { ReactComponent as LINKIcon } from "../assets/images/graph/chainlink.svg";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";
import cryptexJson from "../contracts/cryptex.json";
import { getPriceInUSDFromPair, isUndefined, toUSD } from "../utils/utils";
import { NETWORKS } from "../utils/constants";
import Loading from "./Loading";

const Graph = () => {
  const currentNetwork = useContext(NetworkContext);
  const tokens = useContext(TokensContext);
  const signer = useContext(SignerContext);
  const oracles = useContext(OraclesContext);
  const [tcapPrice, setTcapPrice] = useState("0.0");
  const [ctxPrice, setCtxPrice] = useState("0.0");
  const [ETHStake, setETHStake] = useState("0");
  const [DAIStake, setDAIStake] = useState("0");
  const [MATICStake, setMATICStake] = useState("0");
  const [aaveStake, setAaveStake] = useState("0");
  const [linkStake, setLinkStake] = useState("0");
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

  const validOracles = (): boolean => {
    let valid =
      !isUndefined(oracles.wethOracleRead) &&
      !isUndefined(oracles.daiOracleRead) &&
      !isUndefined(oracles.tcapOracleRead) &&
      !isUndefined(tokens.tcapTokenRead);

    if (
      currentNetwork.chainId === NETWORKS.mainnet.chainId ||
      currentNetwork.chainId === NETWORKS.rinkeby.chainId
    ) {
      valid =
        valid &&
        !isUndefined(oracles.aaveOracle) &&
        !isUndefined(oracles.linkOracle) &&
        !isUndefined(tokens.ctxPoolTokenRead);
    }
    if (currentNetwork.chainId === NETWORKS.polygon.chainId) {
      valid = valid && !isUndefined(oracles.maticOracle) && !isUndefined(oracles.maticOracleRead);
    }
    return valid;
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
      if (oracles && tokens && data && signer && validOracles()) {
        const currentTotalPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
        const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
        const daiOraclePriceCall = await oracles.daiOracleRead?.getLatestAnswer();
        const currentTotalSupplyCall = await tokens.tcapTokenRead?.totalSupply();
        const ethcalls = [
          currentTotalPriceCall,
          wethOraclePriceCall,
          daiOraclePriceCall,
          currentTotalSupplyCall,
        ];

        if (
          currentNetwork.chainId === NETWORKS.mainnet.chainId ||
          currentNetwork.chainId === NETWORKS.rinkeby.chainId
        ) {
          const aaveOraclePriceCall = await oracles.aaveOracleRead?.getLatestAnswer();
          const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
          const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
          ethcalls.push(aaveOraclePriceCall);
          ethcalls.push(linkOraclePriceCall);
          ethcalls.push(reservesCtxPoolCall);
        }
        let currentTotalPrice;
        let wethOraclePrice;
        let daiOraclePrice;
        let currentTotalSupply;
        let aaveOraclePrice;
        let linkOraclePrice;
        let reservesCtxPool;

        if (
          currentNetwork.chainId === NETWORKS.mainnet.chainId ||
          currentNetwork.chainId === NETWORKS.rinkeby.chainId
        ) {
          // @ts-ignore
          [
            currentTotalPrice,
            wethOraclePrice,
            daiOraclePrice,
            currentTotalSupply,
            aaveOraclePrice,
            linkOraclePrice,
            reservesCtxPool,
          ] = await signer.ethcallProvider?.all(ethcalls);
        } else {
          // @ts-ignore
          [currentTotalPrice, wethOraclePrice, daiOraclePrice, currentTotalSupply] =
            await signer.ethcallProvider?.all(ethcalls);
        }

        const TotalTcapPrice = currentTotalPrice.mul(10000000000);
        setTcapPrice(ethers.utils.formatEther(TotalTcapPrice.div(10000000000)));
        let currentDAIStake = BigNumber.from(0);
        let currentWETHStake = BigNumber.from(0);
        let currentAAVEStake = BigNumber.from(0);
        let currentLINKStake = BigNumber.from(0);
        let currentMATICStake = BigNumber.from(0);

        await data.states.forEach((s: any) => {
          const networkId = currentNetwork.chainId;
          let contracts;
          switch (networkId) {
            case NETWORKS.mainnet.chainId:
              contracts = cryptexJson[1].mainnet.contracts;
              break;
            case NETWORKS.rinkeby.chainId:
              contracts = cryptexJson[4].rinkeby.contracts;
              break;
            case NETWORKS.okovan.chainId:
              contracts = cryptexJson[69].okovan.contracts;
              break;
            case NETWORKS.polygon.chainId:
              contracts = cryptexJson[137].polygon.contracts;
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
            // @ts-ignore
            case contracts.AaveVaultHandler.address.toLowerCase():
              currentAAVEStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
              break;
            // @ts-ignore
            case contracts.LinkVaultHandler.address.toLowerCase():
              currentLINKStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
              break;
            // @ts-ignore
            case contracts.MATICVaultHandler.address.toLowerCase():
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
        const formatAAVE = ethers.utils.formatEther(currentAAVEStake);
        setAaveStake(formatAAVE);
        const formatLINK = ethers.utils.formatEther(currentLINKStake);
        setLinkStake(formatLINK);
        const formatMATIC = ethers.utils.formatEther(currentMATICStake);
        setMATICStake(formatMATIC);

        const ethUSD = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
        const daiUSD = ethers.utils.formatEther(daiOraclePrice.mul(10000000000));
        let aaveUSD = "0";
        let linkUSD = "0";
        let maticUSD = "0";
        if (
          currentNetwork.chainId === NETWORKS.mainnet.chainId ||
          currentNetwork.chainId === NETWORKS.rinkeby.chainId
        ) {
          aaveUSD = ethers.utils.formatEther(aaveOraclePrice.mul(10000000000));
          linkUSD = ethers.utils.formatEther(linkOraclePrice.mul(10000000000));
        }
        if (currentNetwork.chainId === NETWORKS.polygon.chainId) {
          maticUSD = await getMaticUSD();
        }

        const totalUSD =
          toUSD(ethUSD, formatETH) +
          toUSD(daiUSD, formatDAI) +
          toUSD(aaveUSD, formatAAVE) +
          toUSD(linkUSD, formatLINK) +
          toUSD(maticUSD, formatMATIC);
        setTotalStake(totalUSD.toString());
        setTotalSupply(ethers.utils.formatEther(currentTotalSupply));
        if (signer) {
          const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
          if (
            currentNetwork.chainId === NETWORKS.mainnet.chainId ||
            currentNetwork.chainId === NETWORKS.rinkeby.chainId
          ) {
            const currentPriceCTX = getPriceInUSDFromPair(
              reservesCtxPool[0],
              reservesCtxPool[1],
              parseFloat(currentPriceETH)
            );
            setCtxPrice(currentPriceCTX.toString());
          }
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
        {(currentNetwork.chainId === NETWORKS.mainnet.chainId ||
          currentNetwork.chainId === NETWORKS.rinkeby.chainId) && (
          <>
            <Card>
              <CtxIcon className="ctx" />
              <h4>CTX Price</h4>
              <h5 className="number neon-blue">
                <NumberFormat
                  value={ctxPrice}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                  prefix="$"
                />{" "}
              </h5>
            </Card>
            <Card>
              <AAVEIcon className="ctx" />
              <h4>Total Staked in AAVE</h4>
              <h5 className="number neon-highlight">
                <NumberFormat
                  value={aaveStake}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                />{" "}
                AAVE
              </h5>
            </Card>
            <Card>
              <LINKIcon className="ctx" />
              <h4>Total Staked in LINK</h4>
              <h5 className="number neon-highlight">
                <NumberFormat
                  value={linkStake}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                />{" "}
                LINK
              </h5>
            </Card>
          </>
        )}
        {currentNetwork.chainId === NETWORKS.polygon.chainId && (
          <Card>
            <POLYGONIcon className="eth" />
            <h4>Total Staked in MATIC</h4>
            <h5 className="number neon-blue">
              <NumberFormat
                value={MATICStake}
                displayType="text"
                thousandSeparator
                decimalScale={2}
              />{" "}
              MATIC
            </h5>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Graph;
