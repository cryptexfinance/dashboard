import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { VaultsContext } from "../state/VaultsContext";

export const useVaults = (): VaultsContext => {
  const [wethVault, setWETHVault] = useState<ethers.Contract>();
  const [daiVault, setDAIVault] = useState<ethers.Contract>();
  const [wbtcVault, setWBTCVault] = useState<ethers.Contract>();
  const [aaveVault, setAAVEVault] = useState<ethers.Contract>();
  const [linkVault, setLINKVault] = useState<ethers.Contract>();
  const [maticVault, setMaticVault] = useState<ethers.Contract>();
  const [wethVaultRead, setWETHVaultRead] = useState<Contract>();
  const [daiVaultRead, setDAIVaultRead] = useState<Contract>();
  const [wbtcVaultRead, setWBTCVaultRead] = useState<Contract>();
  const [aaveVaultRead, setAAVEVaultRead] = useState<Contract>();
  const [linkVaultRead, setLINKVaultRead] = useState<Contract>();
  const [maticVaultRead, setMaticVaultRead] = useState<Contract>();

  const setCurrentWETHVault = React.useCallback((currentWETHVault: ethers.Contract): void => {
    setWETHVault(currentWETHVault);
  }, []);
  const setCurrentDAIVault = React.useCallback((currentDAIVault: ethers.Contract): void => {
    setDAIVault(currentDAIVault);
  }, []);
  const setCurrentWBTCVault = React.useCallback((currentWBTCVault: ethers.Contract): void => {
    setWBTCVault(currentWBTCVault);
  }, []);
  const setCurrentAAVEVault = React.useCallback((currentAAVEVault: ethers.Contract): void => {
    setAAVEVault(currentAAVEVault);
  }, []);
  const setCurrentLINKVault = React.useCallback((currentLINKVault: ethers.Contract): void => {
    setLINKVault(currentLINKVault);
  }, []);
  const setCurrentMaticVault = React.useCallback((currentMaticVault: ethers.Contract): void => {
    setMaticVault(currentMaticVault);
  }, []);
  const setCurrentWETHVaultRead = React.useCallback((currentWETHVaultRead: Contract): void => {
    setWETHVaultRead(currentWETHVaultRead);
  }, []);
  const setCurrentDAIVaultRead = React.useCallback((currentDAIVaultRead: Contract): void => {
    setDAIVaultRead(currentDAIVaultRead);
  }, []);
  const setCurrentWBTCVaultRead = React.useCallback((currentWBTCVaultRead: Contract): void => {
    setWBTCVaultRead(currentWBTCVaultRead);
  }, []);
  const setCurrentAAVEVaultRead = React.useCallback((currentAAVEVaultRead: Contract): void => {
    setAAVEVaultRead(currentAAVEVaultRead);
  }, []);
  const setCurrentLINKVaultRead = React.useCallback((currentLINKVaultRead: Contract): void => {
    setLINKVaultRead(currentLINKVaultRead);
  }, []);
  const setCurrentMaticVaultRead = React.useCallback((currentMaticVaultRead: Contract): void => {
    setMaticVaultRead(currentMaticVaultRead);
  }, []);
  return {
    wethVault,
    setCurrentWETHVault,
    daiVault,
    setCurrentDAIVault,
    wbtcVault,
    setCurrentWBTCVault,
    aaveVault,
    setCurrentAAVEVault,
    linkVault,
    setCurrentLINKVault,
    maticVault,
    setCurrentMaticVault,
    wethVaultRead,
    setCurrentWETHVaultRead,
    daiVaultRead,
    setCurrentDAIVaultRead,
    wbtcVaultRead,
    setCurrentWBTCVaultRead,
    aaveVaultRead,
    setCurrentAAVEVaultRead,
    linkVaultRead,
    setCurrentLINKVaultRead,
    maticVaultRead,
    setCurrentMaticVaultRead,
  };
};
