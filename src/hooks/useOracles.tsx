import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { OraclesContext } from "../state/OraclesContext";

export const useOracles = (): OraclesContext => {
  const [wethOracle, setETHOracle] = useState<ethers.Contract>();
  const [daiOracle, setDAIOracle] = useState<ethers.Contract>();
  const [wbtcOracle, setWBTCOracle] = useState<ethers.Contract>();
  const [tcapOracle, setTCAPOracle] = useState<ethers.Contract>();
  const [wethOracleRead, setETHOracleRead] = useState<Contract>();
  const [daiOracleRead, setDAIOracleRead] = useState<Contract>();
  const [wbtcOracleRead, setWBTCOracleRead] = useState<Contract>();
  const [tcapOracleRead, setTCAPOracleRead] = useState<Contract>();

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
  const setCurrentWETHOracleRead = React.useCallback((currentWETHOracleRead: Contract): void => {
    setETHOracleRead(currentWETHOracleRead);
  }, []);
  const setCurrentDAIOracleRead = React.useCallback((currentDAIOracleRead: Contract): void => {
    setDAIOracleRead(currentDAIOracleRead);
  }, []);
  const setCurrentWBTCOracleRead = React.useCallback((currentWBTCOracleRead: Contract): void => {
    setWBTCOracleRead(currentWBTCOracleRead);
  }, []);
  const setCurrentTCAPOracleRead = React.useCallback((currentTCAPOracleRead: Contract): void => {
    setTCAPOracleRead(currentTCAPOracleRead);
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
    wethOracleRead,
    setCurrentWETHOracleRead,
    daiOracleRead,
    setCurrentDAIOracleRead,
    wbtcOracleRead,
    setCurrentWBTCOracleRead,
    tcapOracleRead,
    setCurrentTCAPOracleRead,
  };
};
