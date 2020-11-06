import React, { useState } from "react";
import { ethers } from "ethers";
import { OraclesContext } from "../state/OraclesContext";

export const useOracles = (): OraclesContext => {
  const [wethOracle, setETHOracle] = useState<ethers.Contract>();
  const [daiOracle, setDAIOracle] = useState<ethers.Contract>();
  const [wbtcOracle, setWBTCOracle] = useState<ethers.Contract>();
  const [tcapOracle, setTCAPOracle] = useState<ethers.Contract>();

  const setCurrentWETHOracle = React.useCallback((currentWETHOracle: ethers.Contract): void => {
    setETHOracle(currentWETHOracle);
  }, []);
  const setCurrentDAIOracle = React.useCallback((currentDAIOracle: ethers.Contract): void => {
    setDAIOracle(currentDAIOracle);
  }, []);
  const setCurrentWBTCOracle = React.useCallback((currentWBTCOracle: ethers.Contract): void => {
    setWBTCOracle(currentWBTCOracle);
  }, []);
  const setCurrentTCAPOracle = React.useCallback((currentTCAPOracle: ethers.Contract): void => {
    setTCAPOracle(currentTCAPOracle);
  }, []);
  return {
    wethOracle,
    setCurrentWETHOracle,
    daiOracle,
    setCurrentDAIOracle,
    wbtcOracle,
    setCurrentWBTCOracle,
    tcapOracle,
    setCurrentTCAPOracle,
  };
};
