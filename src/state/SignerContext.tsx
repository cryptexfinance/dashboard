import React from "react";
import { ethers } from "ethers";

export interface SignerContext {
  signer?: ethers.Signer;
  setCurrentSigner: (currentSigner: ethers.Signer) => void;
}

export const SIGNER_DEFAULT_VALUE = {
  setCurrentSigner: () => {},
};

const signerContext = React.createContext<SignerContext>(SIGNER_DEFAULT_VALUE);

export default signerContext;
