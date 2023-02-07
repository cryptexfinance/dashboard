import React from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";

export interface IVaultsContext {
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
  snxVault?: ethers.Contract;
  setCurrentSNXVault: (currentVault: ethers.Contract) => void;
  uniVault?: ethers.Contract;
  setCurrentUNIVault: (currentVault: ethers.Contract) => void;
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
  snxVaultRead?: Contract;
  setCurrentSNXVaultRead: (currentVaultRead: Contract) => void;
  uniVaultRead?: Contract;
  setCurrentUNIVaultRead: (currentVaultRead: Contract) => void;
  maticVaultRead?: Contract;
  setCurrentMaticVaultRead: (currentVaultRead: Contract) => void;
}

export const VAULTS_DEFAULT_VALUE = {
  setCurrentWETHVault: () => {},
  setCurrentDAIVault: () => {},
  setCurrentWBTCVault: () => {},
  setCurrentAAVEVault: () => {},
  setCurrentLINKVault: () => {},
  setCurrentSNXVault: () => {},
  setCurrentUNIVault: () => {},
  setCurrentMaticVault: () => {},
  setCurrentWETHVaultRead: () => {},
  setCurrentDAIVaultRead: () => {},
  setCurrentWBTCVaultRead: () => {},
  setCurrentAAVEVaultRead: () => {},
  setCurrentLINKVaultRead: () => {},
  setCurrentSNXVaultRead: () => {},
  setCurrentUNIVaultRead: () => {},
  setCurrentMaticVaultRead: () => {},
};

export const vaultsContext = React.createContext<IVaultsContext>(VAULTS_DEFAULT_VALUE);
