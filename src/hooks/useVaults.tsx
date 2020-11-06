import React, { useState } from "react";
import { ethers } from "ethers";
import { VaultsContext } from "../state/VaultsContext";

export const useVaults = (): VaultsContext => {
  const [wethVault, setWETHVault] = useState<ethers.Contract>();
  const [daiVault, setDAIVault] = useState<ethers.Contract>();
  const [wbtcVault, setWBTCVault] = useState<ethers.Contract>();

  const setCurrentWETHVault = React.useCallback((currentWETHVault: ethers.Contract): void => {
    setWETHVault(currentWETHVault);
  }, []);
  const setCurrentDAIVault = React.useCallback((currentDAIVault: ethers.Contract): void => {
    setDAIVault(currentDAIVault);
  }, []);
  const setCurrentWBTCVault = React.useCallback((currentWBTCVault: ethers.Contract): void => {
    setWBTCVault(currentWBTCVault);
  }, []);
  return {
    wethVault,
    setCurrentWETHVault,
    daiVault,
    setCurrentDAIVault,
    wbtcVault,
    setCurrentWBTCVault,
  };
};
