import React from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";

export interface IHardVaultsContext {
  wethVault?: ethers.Contract;
  setCurrentWETHVault: (currentVault: ethers.Contract) => void;
  daiVault?: ethers.Contract;
  setCurrentDAIVault: (currentVault: ethers.Contract) => void;
  usdcVault?: ethers.Contract;
  setCurrentUSDCVault: (currentVault: ethers.Contract) => void;
  wbtcVault?: ethers.Contract;
  setCurrentWBTCVault: (currentVault: ethers.Contract) => void;
  wethVaultRead?: Contract;
  setCurrentWETHVaultRead: (currentVaultRead: Contract) => void;
  daiVaultRead?: Contract;
  setCurrentDAIVaultRead: (currentVaultRead: Contract) => void;
  usdcVaultRead?: Contract;
  setCurrentUSDCVaultRead: (currentVaultRead: Contract) => void;
  wbtcVaultRead?: Contract;
  setCurrentWBTCVaultRead: (currentVaultRead: Contract) => void;
}

export const HARD_VAULTS_DEFAULT_VALUE = {
  setCurrentWETHVault: () => {},
  setCurrentDAIVault: () => {},
  setCurrentUSDCVault: () => {},
  setCurrentWBTCVault: () => {},
  setCurrentWETHVaultRead: () => {},
  setCurrentDAIVaultRead: () => {},
  setCurrentUSDCVaultRead: () => {},
  setCurrentWBTCVaultRead: () => {},
};

export const hardVaultsContext = React.createContext<IHardVaultsContext>(HARD_VAULTS_DEFAULT_VALUE);
