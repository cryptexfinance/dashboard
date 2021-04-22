import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Row from "react-bootstrap/esm/Row";
import Table from "react-bootstrap/esm/Table";
import ethers from "ethers";
import NumberFormat from "react-number-format";

import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import GovernanceContext from "../state/GovernanceContext";
import { toUSD } from "../utils/utils";
import "../styles/farm.scss";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as FarmIcon } from "../assets/images/welcome/farm.svg";
import Loading from "./Loading";

const Farm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ethLiquidity, setEthLiquidity] = useState("0");
  const [ethLiquidityUNI, setEthLiquidityUNI] = useState("0");
  const [ctxLiquidity, setCtxLiquidity] = useState("0");

  const signer = useContext(SignerContext);
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);
  const governance = useContext(GovernanceContext);

  const lpURL = process.env.REACT_APP_LP_URL;
  const lpUniURL = process.env.REACT_APP_LP_URL_UNI;
  const visionURL = process.env.REACT_APP_LP_VISION;
  const uniVisionURL = process.env.REACT_APP_LP_UNI_VISION;

  const one = ethers.utils.parseEther("1");

  async function getPriceInUSDFromPair(
    reserves0: ethers.BigNumber,
    reservesWETH: ethers.BigNumber,
    ethPrice: number
  ) {
    // if ((await pair.token1()) != WETH) {
    //   throw "UniswapV2Pair must be paired with WETH"; // Being lazy for now.
    // }

    // const reserves0 = resp[0];
    // const reservesWETH = resp[1];

    // amount of token0 required to by 1 WETH
    const amt = parseFloat(ethers.utils.formatEther(one.mul(reserves0).div(reservesWETH)));
    return ethPrice / amt;
  }

  useEffect(() => {
    const loadAddress = async () => {
      if (
        signer &&
        tokens.tcapToken &&
        tokens.ctxToken &&
        oracles.tcapOracle &&
        governance.governorAlpha &&
        governance.timelock &&
        tokens.ctxTokenRead
      ) {
        const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
        const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
        const tcapOraclePriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
        const currentPoolWethCall = await tokens.wethTokenRead?.balanceOf(
          process?.env?.REACT_APP_POOL_ETH
        );
        const currentWethTCAPCall = await tokens.tcapTokenRead?.balanceOf(
          process?.env?.REACT_APP_POOL_ETH
        );
        const currentPoolWethCtxCall = await tokens.wethTokenRead?.balanceOf(
          process?.env?.REACT_APP_POOL_CTX
        );
        const currentPoolCtxCall = await tokens.ctxTokenRead?.balanceOf(
          process?.env?.REACT_APP_POOL_CTX
        );
        const currentPoolWethUNICall = await tokens.wethTokenRead?.balanceOf(
          process?.env?.REACT_APP_POOL_ETH_UNI
        );
        const currentWethTCAPUNICall = await tokens.tcapTokenRead?.balanceOf(
          process?.env?.REACT_APP_POOL_ETH_UNI
        );

        // @ts-ignore
        const [
          reservesCtxPool,
          wethOraclePrice,
          tcapOraclePrice,
          currentPoolWeth,
          currentWethTCAP,
          currentPoolWethCtx,
          currentPoolCtx,
          currentPoolWethUNI,
          currentWethTCAPUNI,
        ] = await signer.ethcallProvider?.all([
          reservesCtxPoolCall,
          wethOraclePriceCall,
          tcapOraclePriceCall,
          currentPoolWethCall,
          currentWethTCAPCall,
          currentPoolWethCtxCall,
          currentPoolCtxCall,
          currentPoolWethUNICall,
          currentWethTCAPUNICall,
        ]);

        const ethUSD = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));

        const currentPriceCTX = await getPriceInUSDFromPair(
          reservesCtxPool[0],
          reservesCtxPool[1],
          parseFloat(ethUSD)
        );

        const tcapUSD = ethers.utils.formatEther(tcapOraclePrice);
        let formatPair1 = ethers.utils.formatEther(currentPoolWeth);
        let formatPair2 = ethers.utils.formatEther(currentWethTCAP);
        let totalUSD = toUSD(formatPair1, ethUSD) + toUSD(formatPair2, tcapUSD);
        setEthLiquidity(totalUSD.toString());

        formatPair1 = ethers.utils.formatEther(currentPoolWethCtx);
        formatPair2 = ethers.utils.formatEther(currentPoolCtx);
        totalUSD = toUSD(formatPair1, ethUSD) + toUSD(formatPair2, currentPriceCTX.toString());
        setCtxLiquidity(totalUSD.toString());

        formatPair1 = ethers.utils.formatEther(currentPoolWethUNI);
        formatPair2 = ethers.utils.formatEther(currentWethTCAPUNI);

        totalUSD = toUSD(formatPair1, ethUSD) + toUSD(formatPair2, tcapUSD);
        setEthLiquidityUNI(totalUSD.toString());
      }
      setIsLoading(false);
    };

    loadAddress();
    // eslint-disable-next-line
  }, [tokens]);

  if (isLoading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="farm">
      <div>
        <h3>Pools </h3>{" "}
        <Row className="card-wrapper">
          <>
            <Card className="diamond pool mt-4">
              <h2>Enabled Pools </h2>
              <Table hover className="mt-2">
                <thead>
                  <tr>
                    <th />
                    <th>Available Pools</th>
                    <th>Liquidity</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <WETHIcon className="weth" />
                      <TcapIcon className="tcap" />
                    </td>
                    <td>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${visionURL}/${process?.env?.REACT_APP_POOL_ETH}`}
                      >
                        ETH/TCAP <br />
                        <small>SushiSwap</small>
                      </a>
                      <a href="/farm">
                        <FarmIcon className="incentive" />
                      </a>
                    </td>
                    <td className="number">
                      $
                      <NumberFormat
                        className="number"
                        value={ethLiquidity}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                    </td>
                    <td className="number">
                      <Button
                        variant="primary"
                        className=""
                        target="_blank"
                        href={`${lpURL}/#/add/${tokens.tcapToken?.address}/ETH`}
                      >
                        Pool
                      </Button>
                    </td>
                  </tr>{" "}
                  <tr>
                    <td>
                      <WETHIcon className="weth" />
                      <CtxIcon className="ctx-neon" />
                    </td>
                    <td>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${visionURL}/${process?.env?.REACT_APP_POOL_CTX}`}
                      >
                        ETH/CTX <br />
                        <small>SushiSwap</small>
                      </a>
                      <a href="/farm">
                        <FarmIcon className="incentive" />
                      </a>
                    </td>
                    <td className="number">
                      $
                      <NumberFormat
                        className="number"
                        value={ctxLiquidity}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                    </td>{" "}
                    <td className="number">
                      <Button
                        variant="primary"
                        className=""
                        target="_blank"
                        href={`${lpURL}/#/add/ETH/${tokens.ctxToken?.address}`}
                      >
                        Pool
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <WETHIcon className="weth" />
                      <TcapIcon className="tcap" />
                    </td>
                    <td>
                      <a
                        className="uniswap"
                        target="_blank"
                        rel="noreferrer"
                        href={`${uniVisionURL}/${process?.env?.REACT_APP_POOL_ETH_UNI}`}
                      >
                        ETH/TCAP <br />
                        <small>UniSwap V2</small>
                      </a>
                    </td>
                    <td className="number">
                      $
                      <NumberFormat
                        className="number"
                        value={ethLiquidityUNI}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                    </td>
                    <td className="number">
                      <Button
                        variant="primary"
                        className=""
                        target="_blank"
                        href={`${lpUniURL}/#/add/${tokens.tcapToken?.address}/ETH`}
                      >
                        Pool
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </>
        </Row>
      </div>
    </div>
  );
};
export default Farm;
