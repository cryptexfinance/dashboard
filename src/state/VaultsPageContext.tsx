import React from "react";

export interface IVaultPageContext {
  isMinting?: boolean;
  setCurrentMintingValue: (value: boolean) => void;
}

export const PAGE_DEFAULT_VALUE = {
  setCurrentMintingValue: () => {},
};

export const vaultsPageContext = React.createContext<IVaultPageContext>(PAGE_DEFAULT_VALUE);
