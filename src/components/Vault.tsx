import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import "../styles/vault.scss";
import { ReactComponent as WETHIcon } from "../assets/images/vault/eth.svg";
import { ReactComponent as ETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as RatioIcon } from "../assets/images/vault/ratio.svg";

const Vault = () => {
  const [isCreated, setIsCreated] = useState(true);
  const [isApproved, setIsApproved] = useState(true);
  const [title, setTitle] = useState("Create Vault");
  const [text, setText] = useState(
    "No vault Created. Please Create a Vault and approve your collateral to start minting TCAP tokens."
  );

  useEffect(() => {
    function load() {
      if (isCreated) {
        setText("One last step! Approve your collateral to start minting TCAP tokens.");
        setTitle("Approve Vault");
      }
    }
    load();
  }, []);
  return (
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
        {isApproved ? (
          <div className="actions-container">
            <div className="form-card">
              <Card>
                <div className="info">
                  <h4>Staked Collateral</h4>
                  <div>
                    <div className="amount">
                      <WETHIcon className="" />
                      <h4 className=" ml-2 number neon-dark-blue">1000</h4>
                    </div>
                    <p className="number">$200,000</p>
                  </div>
                </div>
                <Form>
                  <Form.Group>
                    <Form.Label>Add Collateral</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" placeholder="" className="neon-green" />
                      <InputGroup.Append>
                        <Button className="neon-green">+</Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">$200,000</Form.Text>
                  </Form.Group>
                  <Form.Group className="remove">
                    <Form.Label>Remove Collateral</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" placeholder="" className="neon-orange" />
                      <InputGroup.Append>
                        <Button className="neon-orange">-</Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">$200,000</Form.Text>
                  </Form.Group>
                </Form>
              </Card>
            </div>
            <div className="balance">
              <Card>
                <ETHIcon className="eth" />
                <div className="info">
                  <h4>ETH Balance</h4>
                  <div>
                    <div className="amount">
                      <WETHIcon className="small" />
                      <h4 className=" ml-2 number neon-highlight">1000</h4>
                    </div>
                    <p className="number">$200,000</p>
                  </div>
                </div>
              </Card>
              <Card>
                <RatioIcon className="ratio" />
                <div className="info">
                  <h4>Vault Ratio</h4>
                  <div>
                    <div className="amount">
                      <h4 className=" ml-2 number neon-blue">200%</h4>
                    </div>
                    <p className="number">SAFE</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="form-card">
              <Card>
                <div className="info">
                  <h4>TCAP Balance</h4>
                  <div>
                    <div className="amount">
                      <WETHIcon className="" />
                      <h4 className=" ml-2 number neon-pink">200,000</h4>
                    </div>
                    <p className="number">$12,000</p>
                  </div>
                </div>
                <Form>
                  <Form.Group>
                    <Form.Label>Mint TCAP</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" placeholder="" className="neon-green" />
                      <InputGroup.Append>
                        <Button className="neon-green">+</Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">$200</Form.Text>
                  </Form.Group>
                  <Form.Group className="remove">
                    <Form.Label>Burn TCAP</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" placeholder="" className="neon-orange" />
                      <InputGroup.Append>
                        <Button className="neon-orange">-</Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">$121</Form.Text>
                  </Form.Group>
                </Form>
              </Card>
            </div>
          </div>
        ) : (
          <div className="pre-actions">
            <h3 className="action-title">{title}</h3>
            <p>{text}</p>
            <Button variant="pink neon-pink">{title}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
