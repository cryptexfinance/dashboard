import React from "react";
import { Provider } from "ethers-multicall";
import { ethers } from "ethers";

export interface ISignerContext {
  signer?: ethers.Signer;
  setCurrentSigner: (currentSigner: ethers.Signer) => void;
  ethcallProvider?: Provider;
  setCurrentEthcallProvider: (currentSigner: Provider) => void;
}

export const SIGNER_DEFAULT_VALUE = {
  setCurrentSigner: () => {},
  setCurrentEthcallProvider: () => {},
};

export const signerContext = React.createContext<ISignerContext>(SIGNER_DEFAULT_VALUE);
