import React, { useState, useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { ethers } from "ethers";
import TokensContext from "../state/TokensContext";
import "../styles/faucet.scss";
import { isValidAddress, errorNotification } from "../utils/utils";

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

  const printDAI = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (tokens) {
      const validAddress = await isValidAddress(walletAddress);
      if (validAddress && tokens.daiToken) {
        if (parseFloat(amount) < 1000) {
          const value = ethers.utils.parseEther(amount.toString());
          await tokens.daiToken.mint(validAddress, value);
          setWalletAddress("");
          setAmount("");
        } else {
          errorNotification("Mint amount too high, try 1000 DAI");
        }
      }
    }
  };

  const printWBTC = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (tokens) {
      const validAddress = await isValidAddress(walletAddress);
      if (validAddress && tokens.wbtcToken) {
        if (parseFloat(amount) <= 1) {
          const value = ethers.utils.parseEther(amount.toString());
          await tokens.wbtcToken.mint(validAddress, value);
        } else {
          errorNotification("Mint amount too high, try 1 WBTC");
        }

        setWalletAddress("");
        setAmount("");
      }
    }
  };

  const wrapETH = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (tokens) {
      const validAddress = await isValidAddress(walletAddress);
      if (validAddress && tokens.wethToken) {
        const value = ethers.utils.parseEther(amount.toString());
        await tokens.wethToken.deposit({ value });
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
              <h4>Print DAI</h4>
              <p>Fake DAI will be created</p>
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
                <Button variant="pink" className="" onClick={printDAI}>
                  Print
                </Button>
              </Form.Group>
            </Form>
          </Card>
          <Card>
            <div className="info">
              <h4>Print WBTC</h4>
              <p>Fake WBTC will be created</p>
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
                <Button variant="pink" className="" onClick={printWBTC}>
                  Print
                </Button>
              </Form.Group>
            </Form>
          </Card>
          <Card>
            <div className="info">
              <h4>Wrap ETH</h4>
              <p>You ETH will be turned into WETH</p>
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

                <Button variant="pink" className="" onClick={wrapETH}>
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
