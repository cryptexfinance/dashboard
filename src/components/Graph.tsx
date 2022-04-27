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
import { ReactComponent as UNIIcon } from "../assets/images/graph/uni.svg";
import { ReactComponent as SNXIcon } from "../assets/images/graph/snx.svg";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";
import cryptexJson from "../contracts/cryptex.json";
import {
  getPriceInUSDFromPair,
  isInLayer1,
  isOptimism,
  isPolygon,
  isUndefined,
  toUSD,
  validOracles,
} from "../utils/utils";
import { NETWORKS, FEATURES } from "../utils/constants";
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
  const [snxStake, setSNXStake] = useState("0");
  const [uniStake, setUNIStake] = useState("0");
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

  const getMaticUSD = async () => {
    const maticOraclePriceCall = await oracles.maticOracleRead?.getLatestAnswer();
    // @ts-ignore
    const [maticOraclePrice] = await signer.ethcallProvider?.all([maticOraclePriceCall]);
    const maticUSD = ethers.utils.formatEther(maticOraclePrice.mul(10000000000));
    return maticUSD;
  };

  useEffect(() => {
    const load = async () => {
      if (
        oracles &&
        tokens &&
        data &&
        signer &&
        !isUndefined(tokens.tcapTokenRead) &&
        validOracles(currentNetwork.chainId || 1, oracles)
      ) {
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

        if (isInLayer1(currentNetwork.chainId)) {
          const aaveOraclePriceCall = await oracles.aaveOracleRead?.getLatestAnswer();
          const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
          const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
          ethcalls.push(aaveOraclePriceCall);
          ethcalls.push(linkOraclePriceCall);
          ethcalls.push(reservesCtxPoolCall);
        }
        if (isOptimism(currentNetwork.chainId)) {
          const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
          const snxOraclePriceCall = await oracles.snxOracleRead?.getLatestAnswer();
          const uniOraclePriceCall = await oracles.uniOracleRead?.getLatestAnswer();
          ethcalls.push(linkOraclePriceCall);
          ethcalls.push(snxOraclePriceCall);
          ethcalls.push(uniOraclePriceCall);
        }
        let currentTotalPrice;
        let wethOraclePrice;
        let daiOraclePrice;
        let currentTotalSupply;
        let aaveOraclePrice;
        let linkOraclePrice;
        let snxOraclePrice;
        let uniOraclePrice;
        let reservesCtxPool;

        if (isInLayer1(currentNetwork.chainId)) {
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
        } else if (isOptimism(currentNetwork.chainId)) {
          // @ts-ignore
          [
            currentTotalPrice,
            wethOraclePrice,
            daiOraclePrice,
            currentTotalSupply,
            linkOraclePrice,
            snxOraclePrice,
            uniOraclePrice,
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
        let currentSNXStake = BigNumber.from(0);
        let currentUNIStake = BigNumber.from(0);
        let currentMATICStake = BigNumber.from(0);

        const networkId = currentNetwork.chainId;
        // @ts-ignore
        let contracts;
        switch (networkId) {
          case NETWORKS.mainnet.chainId:
            contracts = cryptexJson[1].mainnet.contracts;
            break;
          case NETWORKS.rinkeby.chainId:
            contracts = cryptexJson[4].rinkeby.contracts;
            break;
          case NETWORKS.optimism.chainId:
            contracts = cryptexJson[10].optimism.contracts;
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
        await data.states.forEach((s: any) => {
          const cAddress = s.id.toLowerCase();
          // @ts-ignore
          if (cAddress === contracts.DAIVaultHandler.address.toLowerCase()) {
            currentDAIStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
          }
          // @ts-ignore
          if (cAddress === contracts.WETHVaultHandler.address.toLowerCase()) {
            currentWETHStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
          }

          if (isPolygon(currentNetwork.chainId)) {
            // @ts-ignore
            if (cAddress === contracts.MATICVaultHandler.address.toLowerCase()) {
              currentMATICStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
            }
            // @ts-ignore
          } else if (cAddress === contracts.LinkVaultHandler.address.toLowerCase()) {
            currentLINKStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
          }

          if (
            isInLayer1(currentNetwork.chainId) &&
            // @ts-ignore
            cAddress === contracts.AaveVaultHandler.address.toLowerCase()
          ) {
            currentAAVEStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
          }
          if (isOptimism(currentNetwork.chainId)) {
            // @ts-ignore
            if (cAddress === contracts.SNXVaultHandler.address.toLowerCase()) {
              currentSNXStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
            }
            // @ts-ignore
            if (cAddress === contracts.UNIVaultHandler.address.toLowerCase()) {
              currentUNIStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
            }
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
        const formatSNX = ethers.utils.formatEther(currentSNXStake);
        setSNXStake(formatSNX);
        const formatUNI = ethers.utils.formatEther(currentUNIStake);
        setUNIStake(formatUNI);
        const formatMATIC = ethers.utils.formatEther(currentMATICStake);
        setMATICStake(formatMATIC);

        const ethUSD = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
        const daiUSD = ethers.utils.formatEther(daiOraclePrice.mul(10000000000));
        let aaveUSD = "0";
        let linkUSD = "0";
        let snxUSD = "0";
        let uniUSD = "0";
        let maticUSD = "0";
        if (isInLayer1(currentNetwork.chainId)) {
          aaveUSD = ethers.utils.formatEther(aaveOraclePrice.mul(10000000000));
          linkUSD = ethers.utils.formatEther(linkOraclePrice.mul(10000000000));
        }
        if (isOptimism(currentNetwork.chainId)) {
          linkUSD = ethers.utils.formatEther(linkOraclePrice.mul(10000000000));
          snxUSD = ethers.utils.formatEther(snxOraclePrice.mul(10000000000));
          uniUSD = ethers.utils.formatEther(uniOraclePrice.mul(10000000000));
        }
        if (currentNetwork.chainId === NETWORKS.polygon.chainId) {
          maticUSD = await getMaticUSD();
        }

        const totalUSD =
          toUSD(ethUSD, formatETH) +
          toUSD(daiUSD, formatDAI) +
          toUSD(aaveUSD, formatAAVE) +
          toUSD(linkUSD, formatLINK) +
          toUSD(snxUSD, formatSNX) +
          toUSD(uniUSD, formatUNI) +
          toUSD(maticUSD, formatMATIC);
        setTotalStake(totalUSD.toString());
        setTotalSupply(ethers.utils.formatEther(currentTotalSupply));
        if (signer) {
          const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
          if (isInLayer1(currentNetwork.chainId)) {
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
        {isInLayer1(currentNetwork.chainId) && (
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
            {FEATURES.NEW_VAULTS && (
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
            )}
          </>
        )}
        {!isPolygon(currentNetwork.chainId) && FEATURES.NEW_VAULTS && (
          <>
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
        {isOptimism(currentNetwork.chainId) && FEATURES.NEW_VAULTS && (
          <>
            <Card>
              <UNIIcon className="ctx" />
              <h4>Total Staked in UNI</h4>
              <h5 className="number neon-highlight">
                <NumberFormat
                  value={uniStake}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                />{" "}
                UNI
              </h5>
            </Card>
            <Card>
              <SNXIcon className="ctx" />
              <h4>Total Staked in SNX</h4>
              <h5 className="number neon-highlight">
                <NumberFormat
                  value={snxStake}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                />{" "}
                SNX
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
