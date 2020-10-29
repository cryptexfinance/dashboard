import React from "react";
import Button from "react-bootstrap/esm/Button";
import "../styles/vault.scss";
import { ReactComponent as WETHIcon } from "../assets/images/vault/eth.svg";

const Vault = () => (
  <div className="vault">
    <div>
      <h3>The Vault</h3>
      <p>Select your Collateral</p>
      <div className="icon-container">
        <WETHIcon className="weth" />
        <div className="select-container">
          <select>
            <option>ETH</option>
            <option>WETH</option>
            <option>WBTC</option>
            <option>DAI</option>
          </select>
          <p className="number">$0.2320</p>
        </div>
      </div>

      <h3 className="action-title">Create Vault</h3>
      <p>
        No vault Created. Please Create a Vault and approve your collateral to start minting TCAP
        tokens.
      </p>
      <Button variant="pink neon-pink">Create Vault</Button>
    </div>
  </div>
);

export default Vault;
