import React, { useContext, useEffect, useState } from "react";
import Monitoring from "./monitoring/index";
import MonitoringArb from "./monitoring/index2";
import Vault from "./vault/index";
import { signerContext, networkContext } from "../../state";
import { VaultToUpdateType } from "./types";
import { isArbitrum } from "../../utils/utils";

const Vaults = () => {
  const signer = useContext(signerContext);
  const currentNetwork = useContext(networkContext);
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
      {!isArbitrum(currentNetwork.chainId) ? (
        <Monitoring setVaultToUpdate={setVaultToUpdate} />
      ) : (
        <MonitoringArb setVaultToUpdate={setVaultToUpdate} currentAddress={currentAddress} />
      )}
    </>
  );
};

export default Vaults;
