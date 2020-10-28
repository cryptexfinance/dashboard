import React from "react";
import "../styles/graph.scss";
import Card from "react-bootstrap/esm/Card";
import { ReactComponent as StakeIcon } from "../assets/images/graph/stake.svg";
import { ReactComponent as H24Icon } from "../assets/images/graph/24h.svg";
import { ReactComponent as TcapIcon } from "../assets/images/graph/TCAP.svg";
import { ReactComponent as WETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as WBTCIcon } from "../assets/images/graph/WBTC.svg";
import { ReactComponent as DAIIcon } from "../assets/images/graph/DAI.svg";

const Graph = () => (
  <div className="graph">
    <div className="grid">
      <Card>
        <StakeIcon className="stake" />
        <h4>Total Staked in USD</h4>
        <h5 className="number neon-green">$352,329,704,715</h5>
      </Card>
      <Card>
        <H24Icon className="h24" />
        <h4>24hr Volume</h4>
        <h5 className="number neon-blue">$352,329,704,715</h5>
      </Card>
      <Card>
        <TcapIcon className="tcap" />
        <h4>TCAP Price</h4>
        <h5 className="number neon-highlight">$40.05</h5>
      </Card>
      <Card>
        <WETHIcon className="weth" />
        <h4>Total Staked in ETH</h4>
        <h5 className="number neon-highlight">50 ETH</h5>
      </Card>
      <Card>
        <WBTCIcon className="wbtc" />
        <h4>Total Staked in WBTC</h4>
        <h5 className="number neon-yellow">2 WBTC</h5>
      </Card>
      <Card>
        <DAIIcon className="dai" />
        <h4>Total Staked in DAI</h4>
        <h5 className="number neon-orange">1000 DAI</h5>
      </Card>
    </div>
  </div>
);

export default Graph;
