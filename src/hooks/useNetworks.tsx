import React, { useState } from "react";
import { NetworkContext } from "../state/NetworkContext";

export const useNetworks = (): NetworkContext => {
  const [chainId, setChainId] = useState<number>();
  const [name, setName] = useState<string>();
  const [wethAddress, setWETHAddress] = useState<string>("");
  const [daiAddress, setDAIAddress] = useState<string>("");
  const [maticAddress, setMATICAddress] = useState<string>();
  const [wallet, setWallet] = useState<string>();
  const [isBrowserWallet, setIsBrowserWallet] = useState<boolean>();

  const setCurrentChainId = React.useCallback((currentChainId: number): void => {
    setChainId(currentChainId);
  }, []);
  const setCurrentName = React.useCallback((currentName: string): void => {
    setName(currentName);
  }, []);
  const setCurrentWETHAddress = React.useCallback((currentWETHAddress: string): void => {
    setWETHAddress(currentWETHAddress);
  }, []);
  const setCurrentDAIAddress = React.useCallback((currentDAIAddress: string): void => {
    setDAIAddress(currentDAIAddress);
  }, []);
  const setCurrentMATICAddress = React.useCallback((currentMATICAddress: string): void => {
    setMATICAddress(currentMATICAddress);
  }, []);
  const setCurrentWallet = React.useCallback((currentWallet: string): void => {
    setWallet(currentWallet);
  }, []);
  const setCurrentIsBrowserWallet = React.useCallback((currentIsBrowserWallet: boolean): void => {
    setIsBrowserWallet(currentIsBrowserWallet);
  }, []);
  return {
    chainId,
    setCurrentChainId,
    name,
    setCurrentName,
    wethAddress,
    setCurrentWETHAddress,
    daiAddress,
    setCurrentDAIAddress,
    maticAddress,
    setCurrentMATICAddress,
    wallet,
    setCurrentWallet,
    isBrowserWallet,
    setCurrentIsBrowserWallet,
  };
};
