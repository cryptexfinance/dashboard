import React, { useState } from "react";
import { NetworkContext } from "../state/NetworkContext";

export const useNetworks = (): NetworkContext => {
  const [chainId, setChainId] = useState<number>();
  const [name, setName] = useState<string>();
  const [wethAddress, setWETHAddress] = useState<string>("");
  const [daiAddress, setDAIAddress] = useState<string>("");
  const [wallet, setWallet] = useState<string>();

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
  const setCurrentWallet = React.useCallback((currentWallet: string): void => {
    setWallet(currentWallet);
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
    wallet,
    setCurrentWallet,
  };
};
