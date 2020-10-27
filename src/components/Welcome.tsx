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
      <Row>
        <Col>
          <h2 className="number neon-highlight">$352,328,704,715</h2>
          <p>Total Cryptocurrency Market Capitalization</p>
        </Col>
        <Col sm={6} md={7}>
          <h2 className="number neon-blue">$35.23</h2>
          <p>Total Cryptocurrency Market Capitalization Token</p>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Card className="balance">
            <div className="mb-2">
              <h2>My Total Balance</h2>
              <p>
                Connected Account <b className="ml-2">crisgarner.eth</b>
              </p>
            </div>
            <Row className="mt-4">
              <Col>
                <h3 className="number neon-blue">
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
            <div className="mt-4">
              <Button variant="warning" className="neon-orange">
                Trade
              </Button>
              <Button variant="primary" className="neon-highlight">
                Mint
              </Button>
            </div>{" "}
          </Card>
        </Col>
      </Row>
    </div>
  </div>
);
export default Welcome;
