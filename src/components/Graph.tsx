import React, { useContext, useEffect, useState } from "react";
import "../styles/graph.scss";
import Card from "react-bootstrap/esm/Card";
import { ethers } from "ethers";
import NumberFormat from "react-number-format";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import { ReactComponent as StakeIcon } from "../assets/images/graph/stake.svg";
import { ReactComponent as H24Icon } from "../assets/images/graph/24h.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as WBTCIcon } from "../assets/images/graph/WBTC.svg";
import { ReactComponent as DAIIcon } from "../assets/images/graph/DAI.svg";
import WETHVault from "../contracts/WETHVaultHandler.json";
import WBTCVault from "../contracts/BTCVaultHandler.json";
import DAIVault from "../contracts/DAIVaultHandler.json";
import { toUSD } from "../utils/utils";

const Graph = () => {
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);

  const [tcapPrice, setTcapPrice] = useState("0.0");
  const [ETHStake, setETHStake] = useState("0");
  const [DAIStake, setDAIStake] = useState("0");
  const [WBTCStake, setWBTCStake] = useState("0");
  const [TotalStake, setTotalStake] = useState("0");

  useEffect(() => {
    const load = async () => {
      if (oracles && tokens) {
        const currentTotalPrice = await oracles.tcapOracle?.getLatestAnswer();
        const TotalTcapPrice = currentTotalPrice.mul(10000000000);
        setTcapPrice(ethers.utils.formatEther(TotalTcapPrice.div(10000000000)));
        const currentDAIStake = await tokens.daiToken?.balanceOf(DAIVault.address);
        const formatDAI = ethers.utils.formatEther(currentDAIStake);
        setDAIStake(formatDAI);

        const currentWBTCStake = await tokens.wbtcToken?.balanceOf(WBTCVault.address);
        const formatWBTC = ethers.utils.formatEther(currentWBTCStake);
        setWBTCStake(formatWBTC);

        const currentWETHStake = await tokens.wethToken?.balanceOf(WETHVault.address);
        const network = "rinkeby";
        const provider = ethers.getDefaultProvider(network, {
          infura: process.env.REACT_APP_INFURA_ID,
          alchemy: process.env.REACT_APP_ALCHEMY_KEY,
        });
        const ethBalance = await provider.getBalance(WETHVault.address);
        const totalEthStake = ethBalance.add(currentWETHStake);

        const formatETH = ethers.utils.formatEther(totalEthStake);
        setETHStake(formatETH);
        const ethUSD = ethers.utils.formatEther(
          (await oracles.wethOracle?.getLatestAnswer()).mul(10000000000)
        );
        const daiUSD = ethers.utils.formatEther(
          (await oracles.daiOracle?.getLatestAnswer()).mul(10000000000)
        );
        const wbtcUSD = ethers.utils.formatEther(
          (await oracles.wbtcOracle?.getLatestAnswer()).mul(10000000000)
        );
        const totalUSD =
          toUSD(ethUSD, formatETH) + toUSD(daiUSD, formatWBTC) + toUSD(wbtcUSD, formatDAI);
        setTotalStake(totalUSD.toString());
      }
    };
    load();
    // eslint-disable-next-line
  }, []);

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
          <h4>24hr Volume</h4>
          <h5 className="number neon-blue">$352,329,704,715</h5>
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
            <NumberFormat value={ETHStake} displayType="text" thousandSeparator decimalScale={4} />{" "}
            ETH
          </h5>
        </Card>
        <Card>
          <WBTCIcon className="wbtc" />
          <h4>Total Staked in WBTC</h4>
          <h5 className="number neon-yellow">
            <NumberFormat value={WBTCStake} displayType="text" thousandSeparator decimalScale={4} />{" "}
            WBTC
          </h5>
        </Card>
        <Card>
          <DAIIcon className="dai" />
          <h4>Total Staked in DAI</h4>
          <h5 className="number neon-orange">
            <NumberFormat value={DAIStake} displayType="text" thousandSeparator decimalScale={4} />{" "}
            DAI
          </h5>
        </Card>
      </div>
    </div>
  );
};

export default Graph;
