import React from "react";
import { ethers } from "ethers";

export interface VaultsContext {
  wethVault?: ethers.Contract;
  setCurrentWETHVault: (currentVault: ethers.Contract) => void;
  daiVault?: ethers.Contract;
  setCurrentDAIVault: (currentVault: ethers.Contract) => void;
  wbtcVault?: ethers.Contract;
  setCurrentWBTCVault: (currentVault: ethers.Contract) => void;
}

export const VAULTS_DEFAULT_VALUE = {
  setCurrentWETHVault: () => {},
  setCurrentDAIVault: () => {},
  setCurrentWBTCVault: () => {},
};

const vaultsContext = React.createContext<VaultsContext>(VAULTS_DEFAULT_VALUE);

export default vaultsContext;
