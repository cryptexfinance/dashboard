import React from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";

export interface OraclesContext {
  wethOracle?: ethers.Contract;
  setCurrentWETHOracle: (currentOracle: ethers.Contract) => void;
  daiOracle?: ethers.Contract;
  setCurrentDAIOracle: (currentOracle: ethers.Contract) => void;
  wbtcOracle?: ethers.Contract;
  setCurrentWBTCOracle: (currentOracle: ethers.Contract) => void;
  tcapOracle?: ethers.Contract;
  setCurrentTCAPOracle: (currentOracle: ethers.Contract) => void;
  aaveOracle?: ethers.Contract;
  setCurrentAAVEOracle: (currentOracle: ethers.Contract) => void;
  linkOracle?: ethers.Contract;
  setCurrentLINKOracle: (currentOracle: ethers.Contract) => void;
  wethOracleRead?: Contract;
  setCurrentWETHOracleRead: (currentOracle: Contract) => void;
  daiOracleRead?: Contract;
  setCurrentDAIOracleRead: (currentOracle: Contract) => void;
  wbtcOracleRead?: Contract;
  setCurrentWBTCOracleRead: (currentOracle: Contract) => void;
  tcapOracleRead?: Contract;
  setCurrentTCAPOracleRead: (currentOracle: Contract) => void;
  aaveOracleRead?: Contract;
  setCurrentAAVEOracleRead: (currentOracle: Contract) => void;
  linkOracleRead?: Contract;
  setCurrentLINKOracleRead: (currentOracle: Contract) => void;
}

export const ORACLES_DEFAULT_VALUE = {
  setCurrentWETHOracle: () => {},
  setCurrentDAIOracle: () => {},
  setCurrentWBTCOracle: () => {},
  setCurrentTCAPOracle: () => {},
  setCurrentAAVEOracle: () => {},
  setCurrentLINKOracle: () => {},
  setCurrentWETHOracleRead: () => {},
  setCurrentDAIOracleRead: () => {},
  setCurrentWBTCOracleRead: () => {},
  setCurrentTCAPOracleRead: () => {},
  setCurrentAAVEOracleRead: () => {},
  setCurrentLINKOracleRead: () => {},
};

const oraclesContext = React.createContext<OraclesContext>(ORACLES_DEFAULT_VALUE);

export default oraclesContext;
