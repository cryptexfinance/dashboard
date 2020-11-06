import React, { useContext, useEffect, useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import Button from "react-bootstrap/esm/Button";
import "../styles/header.scss";
import SignerContext from "../state/SignerContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { makeShortAddress } from "../utils/utils";

const Header = () => {
  const web3Modal = useContext(Web3ModalContext);
  const [address, setAddress] = useState("");
  const signer = useContext(SignerContext);

  useEffect(() => {
    const loadAddress = async () => {
      if (signer.signer) {
        const currentAddress = await signer.signer?.getAddress();
        setAddress(makeShortAddress(currentAddress));
      }
    };

    loadAddress();
  }, [signer]);

  return (
    <Nav className="header">
      {signer.signer ? (
        <h5>{address}</h5>
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
