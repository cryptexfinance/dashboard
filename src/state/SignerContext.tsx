import React from "react";
import { Provider } from "ethers-multicall";
import { ethers } from "ethers";

export interface SignerContext {
  signer?: ethers.Signer;
  setCurrentSigner: (currentSigner: ethers.Signer) => void;
  ethcallProvider?: Provider;
  setCurrentEthcallProvider: (currentSigner: Provider) => void;
}

export const SIGNER_DEFAULT_VALUE = {
  setCurrentSigner: () => {},
  setCurrentEthcallProvider: () => {},
};

const signerContext = React.createContext<SignerContext>(SIGNER_DEFAULT_VALUE);

export default signerContext;
