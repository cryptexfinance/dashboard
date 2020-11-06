import React, { useState } from "react";
import { ethers } from "ethers";
import { TokensContext } from "../state/TokensContext";

export const useTokens = (): TokensContext => {
  const [wethToken, setETHToken] = useState<ethers.Contract>();
  const [daiToken, setDAIToken] = useState<ethers.Contract>();
  const [wbtcToken, setWBTCToken] = useState<ethers.Contract>();
  const [tcapToken, setTCAPToken] = useState<ethers.Contract>();

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
  return {
    wethToken,
    setCurrentWETHToken,
    daiToken,
    setCurrentDAIToken,
    wbtcToken,
    setCurrentWBTCToken,
    tcapToken,
    setCurrentTCAPToken,
  };
};
