import React, { useState } from "react";
import { ethers } from "ethers";
import { TokensContext } from "../state/TokensContext";

export const useTokens = (): TokensContext => {
  const [wethToken, setETHToken] = useState<ethers.Contract>();
  const [daiToken, setDAIToken] = useState<ethers.Contract>();
  const [wbtcToken, setWBTCToken] = useState<ethers.Contract>();
  const [tcapToken, setTCAPToken] = useState<ethers.Contract>();
  const [wethPoolToken, setWETHPoolToken] = useState<ethers.Contract>();
  const [daiPoolToken, setDAIPoolToken] = useState<ethers.Contract>();
  const [wbtcPoolToken, setWBTCPoolToken] = useState<ethers.Contract>();
  const [ctxPoolToken, setCTXPoolToken] = useState<ethers.Contract>();

  const setCurrentWETHToken = React.useCallback((currentWETHToken: ethers.Contract): void => {
    setETHToken(currentWETHToken);
  }, []);
  const setCurrentDAIToken = React.useCallback((currentDAIToken: ethers.Contract): void => {
    setDAIToken(currentDAIToken);
  }, []);
  const setCurrentWBTCToken = React.useCallback((currentWBTCToken: ethers.Contract): void => {
    setWBTCToken(currentWBTCToken);
  }, []);
  const setCurrentTCAPToken = React.useCallback((currentTCAPToken: ethers.Contract): void => {
    setTCAPToken(currentTCAPToken);
  }, []);
  const setCurrentWETHPoolToken = React.useCallback(
    (currentWETHPoolToken: ethers.Contract): void => {
      setWETHPoolToken(currentWETHPoolToken);
    },
    []
  );
  const setCurrentDAIPoolToken = React.useCallback((currentDAIPoolToken: ethers.Contract): void => {
    setDAIPoolToken(currentDAIPoolToken);
  }, []);
  const setCurrentWBTCPoolToken = React.useCallback(
    (currentWBTCPoolToken: ethers.Contract): void => {
      setWBTCPoolToken(currentWBTCPoolToken);
    },
    []
  );
  const setCurrentCTXPoolToken = React.useCallback((currentCTXPoolToken: ethers.Contract): void => {
    setCTXPoolToken(currentCTXPoolToken);
  }, []);
  return {
    wethToken,
    setCurrentWETHToken,
    daiToken,
    setCurrentDAIToken,
    wbtcToken,
    setCurrentWBTCToken,
    tcapToken,
    setCurrentTCAPToken,
    wethPoolToken,
    setCurrentWETHPoolToken,
    daiPoolToken,
    setCurrentDAIPoolToken,
    wbtcPoolToken,
    setCurrentWBTCPoolToken,
    ctxPoolToken,
    setCurrentCTXPoolToken,
  };
};
