import React from "react";
import { ethers } from "ethers";

export interface ProviderContext {
  provider: ethers.providers.Provider;
  setCurrentProvider: (currentProvider: ethers.providers.Provider) => void;
}

export const PROVIDER_DEFAULT_VALUE = {
  provider: ethers.providers.getDefaultProvider(),
  setCurrentProvider: () => {},
};

const providerContext = React.createContext<ProviderContext>(PROVIDER_DEFAULT_VALUE);

export default providerContext;
