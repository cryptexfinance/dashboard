import React, { useContext, useEffect, useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import Button from "react-bootstrap/esm/Button";
import "../styles/header.scss";
import ethers from "ethers";
import NumberFormat from "react-number-format";
import SignerContext from "../state/SignerContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import TokensContext from "../state/TokensContext";
import { makeShortAddress } from "../utils/utils";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";

const Header = () => {
  const web3Modal = useContext(Web3ModalContext);
  const signer = useContext(SignerContext);
  const tokens = useContext(TokensContext);
  const [address, setAddress] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0.0");

  useEffect(() => {
    const loadAddress = async () => {
      if (signer.signer && tokens.tcapToken) {
        const currentAddress = await signer.signer?.getAddress();
        setAddress(makeShortAddress(currentAddress));
        const currentTcapBalance = await tokens.tcapToken.balanceOf(currentAddress);
        setTokenBalance(ethers.utils.formatEther(currentTcapBalance));
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [signer]);

  return (
    <Nav className="header">
      {signer.signer ? (
        <>
          <TcapIcon className="tcap-neon" />
          <h5>
            <NumberFormat
              className="number mx-2 neon-pink"
              value={tokenBalance}
              displayType="text"
              thousandSeparator
              prefix=""
              decimalScale={2}
            />
          </h5>
          <h5>{address}</h5>
        </>
      ) : (
        <Button
          variant="pink"
          className="neon-pink"
          onClick={() => {
            web3Modal.toggleModal();
          }}
        >
          Connect Wallet
        </Button>
      )}
    </Nav>
  );
};

export default Header;
