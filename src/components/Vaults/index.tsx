import React, { useContext, useEffect, useState } from "react";
import Monitoring from "./monitoring";
import Vault from "./vault/index";
import { signerContext } from "../../state";
import { VaultToUpdateType } from "./types";

const Vaults = () => {
  const signer = useContext(signerContext);
  const [currentAddress, setCurrentAddress] = useState("");
  const [isMinting, setMinting] = useState(false);
  const [currrentVault, setCurrentVault] = useState({
    vaultId: "0",
    assetSymbol: "",
    collateralSymbol: "",
    isHardVault: true,
  });

  const setVaultToUpdate = (vaultToUpdate: VaultToUpdateType) => {
    setCurrentVault({
      vaultId: vaultToUpdate.vaultId,
      assetSymbol: vaultToUpdate.assetSymbol,
      collateralSymbol: vaultToUpdate.collateralSymbol,
      isHardVault: vaultToUpdate.isHardVault,
    });
    setMinting(true);
  };

  useEffect(
    () => {
      const load = async () => {
        if (signer && signer.signer) {
          const cAddress = await signer.signer.getAddress();
          setCurrentAddress(cAddress);
        }
      };
      load();
    },
    // eslint-disable-next-line
    [signer.signer]
  );

  if (isMinting) {
    return (
      <>
        <Vault
          currentAddress={currentAddress}
          vaultInitData={currrentVault}
          goBack={() => setMinting(false)}
        />
      </>
    );
  }

  return (
    <>
      <Monitoring setVaultToUpdate={setVaultToUpdate} />
    </>
  );
};

export default Vaults;
