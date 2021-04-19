import React, { useState } from "react";
import { ethers } from "ethers";
import { Provider } from "ethers-multicall";

import { SignerContext } from "../state/SignerContext";

export const useSigner = (): SignerContext => {
  const [signer, setSigner] = useState<ethers.Signer>();
  const [ethcallProvider, setEthcallProvider] = useState<Provider>();
  const setCurrentSigner = React.useCallback((currentSigner: ethers.Signer): void => {
    setSigner(currentSigner);
  }, []);
  const setCurrentEthcallProvider = React.useCallback((currentProvider: Provider): void => {
    setEthcallProvider(currentProvider);
  }, []);
  return {
    signer,
    setCurrentSigner,
    ethcallProvider,
    setCurrentEthcallProvider,
  };
};
