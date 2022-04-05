import React from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";

export interface HardVaultsContext {
  wethVault?: ethers.Contract;
  setCurrentWETHVault: (currentVault: ethers.Contract) => void;
  wethVaultRead?: Contract;
  setCurrentWETHVaultRead: (currentVaultRead: Contract) => void;
}

export const HARD_VAULTS_DEFAULT_VALUE = {
  setCurrentWETHVault: () => {},
  setCurrentWETHVaultRead: () => {},
};

const hardVaultsContext = React.createContext<HardVaultsContext>(HARD_VAULTS_DEFAULT_VALUE);

export default hardVaultsContext;
