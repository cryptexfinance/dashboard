import React, { useState } from "react";
import { ProviderContext } from "../state/ProviderContext";
import { ethers } from "ethers";

export const userProvider = (): ProviderContext => {
  const [provider, setProvider] = useState<ethers.providers.Provider>(
    ethers.providers.getDefaultProvider()
  );
  const setCurrentProvider = React.useCallback(
    (currentProvider: ethers.providers.Provider): void => {
      setProvider(currentProvider);
    },
    []
  );
  return {
    provider,
    setCurrentProvider,
  };
};
