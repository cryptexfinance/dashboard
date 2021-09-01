import React from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";

export interface VaultsContext {
  wethVault?: ethers.Contract;
  setCurrentWETHVault: (currentVault: ethers.Contract) => void;
  daiVault?: ethers.Contract;
  setCurrentDAIVault: (currentVault: ethers.Contract) => void;
  wbtcVault?: ethers.Contract;
  setCurrentWBTCVault: (currentVault: ethers.Contract) => void;
  maticVault?: ethers.Contract;
  setCurrentMaticVault: (currentVault: ethers.Contract) => void;
  wethVaultRead?: Contract;
  setCurrentWETHVaultRead: (currentVaultRead: Contract) => void;
  daiVaultRead?: Contract;
  setCurrentDAIVaultRead: (currentVaultRead: Contract) => void;
  wbtcVaultRead?: Contract;
  setCurrentWBTCVaultRead: (currentVaultRead: Contract) => void;
  maticVaultRead?: Contract;
  setCurrentMaticVaultRead: (currentVaultRead: Contract) => void;
}

export const VAULTS_DEFAULT_VALUE = {
  setCurrentWETHVault: () => {},
  setCurrentDAIVault: () => {},
  setCurrentWBTCVault: () => {},
  setCurrentMaticVault: () => {},
  setCurrentWETHVaultRead: () => {},
  setCurrentDAIVaultRead: () => {},
  setCurrentWBTCVaultRead: () => {},
  setCurrentMaticVaultRead: () => {},
};

const vaultsContext = React.createContext<VaultsContext>(VAULTS_DEFAULT_VALUE);

export default vaultsContext;
