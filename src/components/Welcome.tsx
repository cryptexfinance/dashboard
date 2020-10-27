import React from "react";
import Button from "react-bootstrap/esm/Button";
import "../styles/welcome.scss";

const Welcome = () => (
  <div className="container welcome">
    <div>
      <div>
        <h2 className="number">$352,328,704,715</h2>
        <p>Total Cryptocurrency Market Capitalization</p>
        <div>
          <h2>My Total Balance</h2>
          <p>
            Connected Account <b>crisgarner.eth</b>
          </p>
        </div>
        <div>
          <h3 className="number">
            <span>ETH ICON</span>1,220
          </h3>
          <p>ETH Balance</p>
        </div>
        <div>
          <h3 className="number">
            <span>TCAP ICON</span>4.1
          </h3>
          <p>TCAP Balance</p>
        </div>
      </div>
      <div>
        <h2 className="number">$35.23</h2>
        <p>Total Cryptocurrency Market Capitalization Token</p>
        <div>
          <h2>Use TCAP</h2>
          <p>Trade TCAP using uniswap or create new supply using a vault</p>
          <div>
            <Button variant="warning">Trade</Button>
            <Button variant="primary">Mint</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
export default Welcome;
