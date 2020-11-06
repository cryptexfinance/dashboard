import React from "react";
import { ethers } from "ethers";

export interface OraclesContext {
  wethOracle?: ethers.Contract;
  setCurrentWETHOracle: (currentOracle: ethers.Contract) => void;
  daiOracle?: ethers.Contract;
  setCurrentDAIOracle: (currentOracle: ethers.Contract) => void;
  wbtcOracle?: ethers.Contract;
  setCurrentWBTCOracle: (currentOracle: ethers.Contract) => void;
  tcapOracle?: ethers.Contract;
  setCurrentTCAPOracle: (currentOracle: ethers.Contract) => void;
}

export const ORACLES_DEFAULT_VALUE = {
  setCurrentWETHOracle: () => {},
  setCurrentDAIOracle: () => {},
  setCurrentWBTCOracle: () => {},
  setCurrentTCAPOracle: () => {},
};

const oraclesContext = React.createContext<OraclesContext>(ORACLES_DEFAULT_VALUE);

export default oraclesContext;
