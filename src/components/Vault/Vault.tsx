import React, { useState, useEffect, useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import { Web3ModalContext } from "../../state/Web3ModalContext";
import SignerContext from "../../state/SignerContext";
import "../../styles/vault.scss";

import Loading from "../Loading";
import Details from "./Details";

const Vault = () => {
  const web3Modal = useContext(Web3ModalContext);
  const signer = useContext(SignerContext);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function load() {
      if (!signer.signer) {
        setIsLoading(false);
      } else if (signer.signer) {
        const currentAddress = await signer.signer.getAddress();
        setAddress(currentAddress);
        setIsLoading(false);
      }
    }
    load();
    // eslint-disable-next-line
  }, [signer.signer, address]);

  if (isLoading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="vault">
      <div>
        <h3>The Vault</h3>
        {!signer.signer ? (
          <div className="pre-actions">
            <h5 className="action-title mt-4 pt-2">Connect Wallet</h5>
            <p>
              No wallet connected. Please Connect your wallet to Create a Vault and approve your
              collateral to start minting TCAP tokens.
            </p>
            <Button
              variant="pink neon-pink"
              onClick={() => {
                web3Modal.toggleModal();
              }}
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <Details address={address} />
        )}
      </div>
    </div>
  );
};

export default Vault;
