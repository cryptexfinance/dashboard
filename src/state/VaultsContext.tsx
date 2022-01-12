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
  aaveVault?: ethers.Contract;
  setCurrentAAVEVault: (currentVault: ethers.Contract) => void;
  linkVault?: ethers.Contract;
  setCurrentLINKVault: (currentVault: ethers.Contract) => void;
  maticVault?: ethers.Contract;
  setCurrentMaticVault: (currentVault: ethers.Contract) => void;
  wethVaultRead?: Contract;
  setCurrentWETHVaultRead: (currentVaultRead: Contract) => void;
  daiVaultRead?: Contract;
  setCurrentDAIVaultRead: (currentVaultRead: Contract) => void;
  wbtcVaultRead?: Contract;
  setCurrentWBTCVaultRead: (currentVaultRead: Contract) => void;
  aaveVaultRead?: Contract;
  setCurrentAAVEVaultRead: (currentVaultRead: Contract) => void;
  linkVaultRead?: Contract;
  setCurrentLINKVaultRead: (currentVaultRead: Contract) => void;
  maticVaultRead?: Contract;
  setCurrentMaticVaultRead: (currentVaultRead: Contract) => void;
}

export const VAULTS_DEFAULT_VALUE = {
  setCurrentWETHVault: () => {},
  setCurrentDAIVault: () => {},
  setCurrentWBTCVault: () => {},
  setCurrentAAVEVault: () => {},
  setCurrentLINKVault: () => {},
  setCurrentMaticVault: () => {},
  setCurrentWETHVaultRead: () => {},
  setCurrentDAIVaultRead: () => {},
  setCurrentWBTCVaultRead: () => {},
  setCurrentAAVEVaultRead: () => {},
  setCurrentLINKVaultRead: () => {},
  setCurrentMaticVaultRead: () => {},
};

const vaultsContext = React.createContext<VaultsContext>(VAULTS_DEFAULT_VALUE);

export default vaultsContext;
