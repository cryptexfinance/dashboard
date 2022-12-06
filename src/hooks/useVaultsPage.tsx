import React, { useState } from "react";

import { IVaultPageContext } from "../state";

export const useVaultsPage = (): IVaultPageContext => {
  const [isMinting, setMinting] = useState(false);
  const setCurrentMintingValue = React.useCallback((value: boolean): void => {
    setMinting(value);
  }, []);

  return {
    isMinting,
    setCurrentMintingValue,
  };
};
