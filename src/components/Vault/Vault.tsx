import React, { useState, useEffect, useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import { useTranslation } from "react-i18next";
import { Web3ModalContext } from "../../state/Web3ModalContext";
import SignerContext from "../../state/SignerContext";
import "../../styles/vault.scss";

import Loading from "../Loading";
import Details from "./Details";

export const Vault = () => {
  const { t } = useTranslation();
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
    return <Loading title={t("loading")} message={t("wait")} />;
  }

  return (
    <div className="vault">
      <div>
        <h3>{t("vault.title1")}</h3>
        {!signer.signer ? (
          <div className="pre-actions">
            <h5 className="action-title mt-4 pt-2">{t("connect")}</h5>
            <p>{t("vault.no-connected")}</p>
            <Button
              variant="pink neon-pink"
              onClick={() => {
                web3Modal.toggleModal();
              }}
            >
              {t("connect")}
            </Button>
          </div>
        ) : (
          <Details address={address} t={t} />
        )}
      </div>
    </div>
  );
};
