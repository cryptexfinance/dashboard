import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Spinner from "react-bootstrap/Spinner";
import { BigNumber, ethers } from "ethers";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { networkContext, oraclesContext, signerContext, tokensContext } from "../../state";
import { ReactComponent as StakeIcon } from "../../assets/images/graph/stake.svg";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../../assets/images/graph/DAI.svg";
import { ReactComponent as AAVEIcon } from "../../assets/images/graph/aave.svg";
import { ReactComponent as LINKIcon } from "../../assets/images/graph/chainlink.svg";
import { ReactComponent as UNIIcon } from "../../assets/images/graph/uni.svg";
import { ReactComponent as SNXIcon } from "../../assets/images/graph/snx.svg";
import { ReactComponent as POLYGONIcon } from "../../assets/images/graph/polygon3.svg";
import { ReactComponent as WBTCIcon } from "../../assets/images/graph/wbtc.svg";
import { ReactComponent as USDCIcon } from "../../assets/images/graph/usdc.svg";
import cryptexJson from "../../contracts/cryptex.json";
import {
  isArbitrum,
  isInLayer1,
  isOptimism,
  isPolygon,
  isUndefined,
  toUSD,
  validOracles,
} from "../../utils/utils";
import { NETWORKS } from "../../utils/constants";

type props = {
  data: any;
};

const Protocol2 = ({ data }: props) => {
  const { t } = useTranslation();
  const currentNetwork = useContext(networkContext);
  const tokens = useContext(tokensContext);
  const signer = useContext(signerContext);
  const oracles = useContext(oraclesContext);
  const [ethStake, setETHStake] = useState("0");
  const [daiStake, setDAIStake] = useState("0");
  const [maticStake, setMATICStake] = useState("0");
  const [aaveStake, setAaveStake] = useState("0");
  const [linkStake, setLinkStake] = useState("0");
  const [snxStake, setSNXStake] = useState("0");
  const [uniStake, setUNIStake] = useState("0");
  const [wbtcStake, setWBTCStake] = useState("0");
  const [usdcStake, setUSDCStake] = useState("0");
  const [TotalStake, setTotalStake] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0.0");
  const [loading, setLoading] = useState(true);

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
        const daiOraclePriceCall = await oracles.daiOracleRead?.getLatestAnswer();
        const currentTotalSupplyCall = await tokens.tcapTokenRead?.totalSupply();
        const ethcalls = [daiOraclePriceCall, currentTotalSupplyCall];

        if (isInLayer1(currentNetwork.chainId)) {
          const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
          const aaveOraclePriceCall = await oracles.aaveOracleRead?.getLatestAnswer();
          const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
          const wbtcOraclePriceCall = await oracles.wbtcOracleRead?.getLatestAnswer();
          const usdcOraclePriceCall = await oracles.usdcOracleRead?.getLatestAnswer();
          ethcalls.push(wethOraclePriceCall);
          ethcalls.push(aaveOraclePriceCall);
          ethcalls.push(linkOraclePriceCall);
          ethcalls.push(wbtcOraclePriceCall);
          ethcalls.push(usdcOraclePriceCall);
        }
        if (isOptimism(currentNetwork.chainId)) {
          const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
          const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
          const snxOraclePriceCall = await oracles.snxOracleRead?.getLatestAnswer();
          const uniOraclePriceCall = await oracles.uniOracleRead?.getLatestAnswer();
          ethcalls.push(wethOraclePriceCall);
          ethcalls.push(linkOraclePriceCall);
          ethcalls.push(snxOraclePriceCall);
          ethcalls.push(uniOraclePriceCall);
        }
        if (isPolygon(currentNetwork.chainId)) {
          const wbtcOraclePriceCall = await oracles.wbtcOracleRead?.getLatestAnswer();
          ethcalls.push(wbtcOraclePriceCall);
        }
        if (isArbitrum(currentNetwork.chainId)) {
          const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
          ethcalls.push(wethOraclePriceCall);
        }

        let daiOraclePrice;
        let currentTotalSupply;
        let wethOraclePrice;
        let aaveOraclePrice;
        let linkOraclePrice;
        let snxOraclePrice;
        let uniOraclePrice;
        let wbtcOraclePrice;
        let usdcOraclePrice;

        if (isInLayer1(currentNetwork.chainId)) {
          // @ts-ignore
          [
            daiOraclePrice,
            currentTotalSupply,
            wethOraclePrice,
            aaveOraclePrice,
            linkOraclePrice,
            wbtcOraclePrice,
            usdcOraclePrice,
          ] = await signer.ethcallProvider?.all(ethcalls);
        } else if (isArbitrum(currentNetwork.chainId)) {
          // @ts-ignore
          [daiOraclePrice, currentTotalSupply, wethOraclePrice] = await signer.ethcallProvider?.all(
            ethcalls
          );
        } else if (isOptimism(currentNetwork.chainId)) {
          // @ts-ignore
          [
            daiOraclePrice,
            currentTotalSupply,
            wethOraclePrice,
            linkOraclePrice,
            snxOraclePrice,
            uniOraclePrice,
          ] = await signer.ethcallProvider?.all(ethcalls);
        } else {
          // @ts-ignore
          [daiOraclePrice, currentTotalSupply, wbtcOraclePrice] = await signer.ethcallProvider?.all(
            ethcalls
          );
        }

        let currentDAIStake = BigNumber.from(0);
        let currentWETHStake = BigNumber.from(0);
        let currentAAVEStake = BigNumber.from(0);
        let currentLINKStake = BigNumber.from(0);
        let currentSNXStake = BigNumber.from(0);
        let currentUNIStake = BigNumber.from(0);
        let currentMATICStake = BigNumber.from(0);
        let currentWBTCStake = BigNumber.from(0);
        let currentUSDCStake = BigNumber.from(0);

        const networkId = currentNetwork.chainId;
        // @ts-ignore
        let contracts;
        switch (networkId) {
          case NETWORKS.mainnet.chainId:
            contracts = cryptexJson[1].mainnet.contracts;
            break;
          case NETWORKS.goerli.chainId:
            contracts = cryptexJson[5].goerli.contracts;
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
          case NETWORKS.arbitrum.chainId:
            contracts = cryptexJson[42161].arbitrum.contracts;
            break;
          case NETWORKS.arbitrum_goerli.chainId:
            contracts = cryptexJson[421613].arbitrum_goerli.contracts;
            break;
          case NETWORKS.mumbai.chainId:
            contracts = cryptexJson[80001].mumbai.contracts;
            break;
          default:
            contracts = cryptexJson[5].goerli.contracts;
            break;
        }

        await data.states.forEach((s: any) => {
          const cAddress = s.id.toLowerCase();
          // @ts-ignore
          if (cAddress === contracts.DAIVaultHandler.address.toLowerCase()) {
            currentDAIStake = currentDAIStake.add(
              s.amountStaked ? s.amountStaked : BigNumber.from(0)
            );
          }

          if (isPolygon(currentNetwork.chainId)) {
            // @ts-ignore
            if (cAddress === contracts.MATICVaultHandler.address.toLowerCase()) {
              currentMATICStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
            }
          }
          if (isInLayer1(currentNetwork.chainId) || isPolygon(currentNetwork.chainId)) {
            // @ts-ignore
            if (cAddress === contracts.HardWBTCVaultHandler.address.toLowerCase()) {
              currentWBTCStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
            }
          }
          if (isInLayer1(currentNetwork.chainId) || isOptimism(currentNetwork.chainId)) {
            // @ts-ignore
            if (cAddress === contracts.WETHVaultHandler.address.toLowerCase()) {
              currentWETHStake = currentWETHStake.add(
                s.amountStaked ? s.amountStaked : BigNumber.from(0)
              );
            }
            // @ts-ignore
            if (cAddress === contracts.LinkVaultHandler.address.toLowerCase()) {
              currentLINKStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
            }
          }

          if (isInLayer1(currentNetwork.chainId)) {
            // @ts-ignore
            if (cAddress === contracts.AaveVaultHandler.address.toLowerCase()) {
              currentAAVEStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
            }
            // @ts-ignore
            if (cAddress === contracts.HardUSDCVaultHandler.address.toLowerCase()) {
              currentUSDCStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
            }
            // @ts-ignore
            if (cAddress === contracts.HardWETHVaultHandler.address.toLowerCase()) {
              currentWETHStake = currentWETHStake.add(
                s.amountStaked ? s.amountStaked : BigNumber.from(0)
              );
            }
            // @ts-ignore
            if (cAddress === contracts.HardDaiVaultHandler.address.toLowerCase()) {
              currentDAIStake = currentDAIStake.add(
                s.amountStaked ? s.amountStaked : BigNumber.from(0)
              );
            }
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

          if (isArbitrum(currentNetwork.chainId)) {
            // @ts-ignore
            if (cAddress === contracts.WETHVaultHandler.address.toLowerCase()) {
              currentWETHStake = currentWETHStake.add(
                s.amountStaked ? s.amountStaked : BigNumber.from(0)
              );
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
        const formatWBTC = ethers.utils.formatUnits(currentWBTCStake, 8);
        setWBTCStake(formatWBTC);
        const formatUSDC = ethers.utils.formatUnits(currentUSDCStake, 6);
        setUSDCStake(formatUSDC);

        const daiUSD = ethers.utils.formatEther(daiOraclePrice.mul(10000000000));
        let ethUSD = "0";
        let aaveUSD = "0";
        let linkUSD = "0";
        let snxUSD = "0";
        let uniUSD = "0";
        let maticUSD = "0";
        let wbtcUSD = "0";
        let usdcUSD = "0";
        if (isInLayer1(currentNetwork.chainId)) {
          ethUSD = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
          aaveUSD = ethers.utils.formatEther(aaveOraclePrice.mul(10000000000));
          linkUSD = ethers.utils.formatEther(linkOraclePrice.mul(10000000000));
          wbtcUSD = ethers.utils.formatEther(wbtcOraclePrice.mul(10000000000));
          usdcUSD = ethers.utils.formatEther(usdcOraclePrice.mul(10000000000));
        }
        if (isArbitrum(currentNetwork.chainId)) {
          ethUSD = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
        }
        if (isOptimism(currentNetwork.chainId)) {
          ethUSD = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
          linkUSD = ethers.utils.formatEther(linkOraclePrice.mul(10000000000));
          snxUSD = ethers.utils.formatEther(snxOraclePrice.mul(10000000000));
          uniUSD = ethers.utils.formatEther(uniOraclePrice.mul(10000000000));
        }
        if (isPolygon(currentNetwork.chainId)) {
          maticUSD = await getMaticUSD();
          wbtcUSD = ethers.utils.formatEther(wbtcOraclePrice.mul(10000000000));
        }

        const totalUSD =
          toUSD(ethUSD, formatETH) +
          toUSD(daiUSD, formatDAI) +
          toUSD(aaveUSD, formatAAVE) +
          toUSD(linkUSD, formatLINK) +
          toUSD(snxUSD, formatSNX) +
          toUSD(uniUSD, formatUNI) +
          toUSD(maticUSD, formatMATIC) +
          toUSD(wbtcUSD, formatWBTC) +
          toUSD(usdcUSD, formatUSDC);
        setTotalStake(totalUSD.toString());
        setTotalSupply(ethers.utils.formatEther(currentTotalSupply));
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [data]);

  return (
    <Card className="protocol">
      <Card.Header>
        <h2>
          <>{t("welcome.summary.title")}</>
        </h2>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="spinner-container">
            <Spinner variant="danger" className="spinner" animation="border" />
          </div>
        ) : (
          <div className="detail">
            <div className="totals">
              <StakeIcon className="stake" />
              <div className="staked">
                <h6>
                  <>{t("welcome.summary.staked-usd")}</>
                </h6>
                <h5 className="number neon-green">
                  <NumberFormat
                    value={TotalStake}
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
            {!isPolygon(currentNetwork.chainId) && (
              <div className="asset">
                <WETHIcon className="weth" />
                <div className="staked">
                  <h6>
                    <>{t("welcome.summary.staked-eth")}</>
                  </h6>
                  <h5 className="number neon-highlight">
                    <NumberFormat
                      value={ethStake}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                    />
                  </h5>
                </div>
              </div>
            )}
            <div className="asset">
              <DAIIcon className="dai" />
              <div className="staked">
                <h6>
                  <>{t("welcome.summary.staked-dai")}</>
                </h6>
                <h5 className="number neon-orange">
                  <NumberFormat
                    value={daiStake}
                    displayType="text"
                    thousandSeparator
                    decimalScale={2}
                  />
                </h5>
              </div>
            </div>
            {isInLayer1(currentNetwork.chainId) && (
              <div className="asset">
                <AAVEIcon className="ctx" />
                <div className="staked">
                  <h6>
                    <>{t("welcome.summary.staked-aave")}</>
                  </h6>
                  <h5 className="number neon-highlight">
                    <NumberFormat
                      value={aaveStake}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                    />
                  </h5>
                </div>
              </div>
            )}
            {!isPolygon(currentNetwork.chainId) && (
              <div className="asset">
                <LINKIcon className="ctx" />
                <div className="staked">
                  <h6>
                    <>{t("welcome.summary.staked-link")}</>
                  </h6>
                  <h5 className="number neon-highlight">
                    <NumberFormat
                      value={linkStake}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                    />
                  </h5>
                </div>
              </div>
            )}
            {isOptimism(currentNetwork.chainId) && (
              <>
                <div className="asset">
                  <UNIIcon className="ctx" />
                  <div className="staked">
                    <h4>
                      <>{t("welcome.summary.staked-uni")}</>
                    </h4>
                    <h5 className="number neon-highlight">
                      <NumberFormat
                        value={uniStake}
                        displayType="text"
                        thousandSeparator
                        decimalScale={2}
                      />
                    </h5>
                  </div>
                </div>
                <div className="asset">
                  <SNXIcon className="ctx" />
                  <div className="staked">
                    <h4>
                      <>{t("welcome.summary.staked-snx")}</>
                    </h4>
                    <h5 className="number neon-highlight">
                      <NumberFormat
                        value={snxStake}
                        displayType="text"
                        thousandSeparator
                        decimalScale={2}
                      />
                    </h5>
                  </div>
                </div>
              </>
            )}
            {isPolygon(currentNetwork.chainId) && (
              <div className="asset">
                <POLYGONIcon className="eth" />
                <div className="staked">
                  <h6>
                    <>{t("welcome.summary.staked-matic")}</>
                  </h6>
                  <h5 className="number neon-blue">
                    <NumberFormat
                      value={maticStake}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                    />
                  </h5>
                </div>
              </div>
            )}
            {!isOptimism(currentNetwork.chainId) && (
              <div className="asset">
                <WBTCIcon className="eth" />
                <div className="staked">
                  <h6>
                    <>{t("welcome.summary.staked-wbtc")}</>
                  </h6>
                  <h5 className="number neon-blue">
                    <NumberFormat
                      value={wbtcStake}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                    />
                  </h5>
                </div>
              </div>
            )}
            <div className="asset">
              <USDCIcon className="eth" />
              <div className="staked">
                <h6>
                  <>{t("welcome.summary.staked-usdc")}</>
                </h6>
                <h5 className="number neon-blue">
                  <NumberFormat
                    value={usdcStake}
                    displayType="text"
                    thousandSeparator
                    decimalScale={2}
                  />
                </h5>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Protocol2;
