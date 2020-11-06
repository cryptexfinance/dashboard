import React, { useState, useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { ethers } from "ethers";
import TokensContext from "../state/TokensContext";
import "../styles/faucet.scss";
import { isValidAddress } from "../utils/utils";

const Faucet = () => {
  const tokens = useContext(TokensContext);
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");

  const onChangeWallet = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(event.target.value);
  };

  const onChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const printMoney = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (tokens) {
      const validAddress = await isValidAddress(walletAddress);
      if (validAddress && tokens.wethToken && tokens.wbtcToken && tokens.daiToken) {
        const value = ethers.utils.parseEther(amount.toString());
        await tokens.wethToken.deposit({ value });
        await tokens.daiToken.mint(validAddress, value);
        await tokens.wbtcToken.mint(validAddress, value);
        setWalletAddress("");
        setAmount("");
      }
    }
  };

  return (
    <div className="faucet">
      <div>
        <h3>Faucet</h3>
        <div className="actions">
          <Card>
            <div className="info">
              <h4>Print Tokens</h4>
            </div>
            <Form>
              <Form.Group>
                <Form.Label>Wallet Address</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder=""
                    className=""
                    value={walletAddress}
                    onChange={onChangeWallet}
                  />
                </InputGroup>
              </Form.Group>
              <Form.Group className="remove">
                <Form.Label>Amount to Print</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder=""
                    className=""
                    value={amount}
                    onChange={onChangeAmount}
                  />
                </InputGroup>
                <Form.Text className="text-muted">You require that amount on ETH</Form.Text>
                <Button variant="pink" className="" onClick={printMoney}>
                  Print
                </Button>
              </Form.Group>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Faucet;
