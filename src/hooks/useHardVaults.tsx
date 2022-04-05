import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { HardVaultsContext } from "../state/HardVaultsContext";

export const useHardVaults = (): HardVaultsContext => {
  const [wethVault, setWETHVault] = useState<ethers.Contract>();
  const [wethVaultRead, setWETHVaultRead] = useState<Contract>();
  const setCurrentWETHVault = React.useCallback((currentWETHVault: ethers.Contract): void => {
    setWETHVault(currentWETHVault);
  }, []);
  const setCurrentWETHVaultRead = React.useCallback((currentWETHVaultRead: Contract): void => {
    setWETHVaultRead(currentWETHVaultRead);
  }, []);

  return {
    wethVault,
    setCurrentWETHVault,
    wethVaultRead,
    setCurrentWETHVaultRead,
  };
};
