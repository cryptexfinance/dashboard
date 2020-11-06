import React, { useState } from "react";
import { ethers } from "ethers";
import { SignerContext } from "../state/SignerContext";

export const useSigner = (): SignerContext => {
  const [signer, setSigner] = useState<ethers.Signer>();
  const setCurrentSigner = React.useCallback((currentSigner: ethers.Signer): void => {
    setSigner(currentSigner);
  }, []);
  return {
    signer,
    setCurrentSigner,
  };
};
