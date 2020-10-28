import React from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import "../styles/welcome.scss";
import { ReactComponent as WethIcon } from "../assets/images/welcome/weth.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";

const Welcome = () => (
  <div className="welcome">
    <div>
      <Row className="data">
        <Col>
          <h2 className="number neon-highlight">$352,328,704,715</h2>
          <p>Total Cryptocurrency Market Capitalization</p>
        </Col>
        <Col sm={6} md={7}>
          <h2 className="number neon-dark-blue">$35.23</h2>
          <p>Total Cryptocurrency Market Capitalization Token</p>
        </Col>
      </Row>
      <Row className="card-wrapper">
        <Col>
          <Card className="balance">
            <div className="">
              <h2>My Total Balance</h2>
              <p>
                Connected Account <b className="ml-2">crisgarner.eth</b>
              </p>
            </div>
            <Row className="">
              <Col>
                <h3 className="number neon-dark-blue">
                  <WethIcon />
                  1,220
                </h3>
                <p>ETH Balance</p>
              </Col>
              <Col>
                <h3 className="number neon-blue">
                  <TcapIcon className="tcap-neon" />
                  4.1
                </h3>
                <p>TCAP Balance</p>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col sm={6} md={7}>
          <Card className="diamond">
            <h2>Use TCAP</h2>
            <p>Trade TCAP using uniswap or create new supply using a vault</p>
            <Row className="">
              <Col>
                <Button variant="warning" className="neon-orange">
                  Trade
                </Button>
                <Button variant="primary" className="neon-highlight">
                  Mint
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  </div>
);
export default Welcome;
