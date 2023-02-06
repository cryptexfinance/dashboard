import React from "react";
import { Contract } from "ethers-multicall";

export interface IOptimismContext {
  tcapTokenRead?: Contract;
  setCurrentTcapTokenRead: (currentTokenRead: Contract) => void;
  tcapOracleRead?: Contract;
  setCurrentTcapOracleRead: (currentOracleRead: Contract) => void;
  wethOracleRead?: Contract;
  setCurrentWethOracleRead: (currentOracleRead: Contract) => void;
  daiOracleRead?: Contract;
  setCurrentDaiOracleRead: (currentOracleRead: Contract) => void;
  linkOracleRead?: Contract;
  setCurrentLinkOracleRead: (currentOracleRead: Contract) => void;
  snxOracleRead?: Contract;
  setCurrentSnxOracleRead: (currentOracleRead: Contract) => void;
  uniOracleRead?: Contract;
  setCurrentUniOracleRead: (currentOracleRead: Contract) => void;
}

export const OPTIMISM_DEFAULT_VALUE = {
  setCurrentTcapTokenRead: () => {},
  setCurrentTcapOracleRead: () => {},
  setCurrentWethOracleRead: () => {},
  setCurrentDaiOracleRead: () => {},
  setCurrentLinkOracleRead: () => {},
  setCurrentSnxOracleRead: () => {},
  setCurrentUniOracleRead: () => {},
};

export const optimismContext = React.createContext<IOptimismContext>(OPTIMISM_DEFAULT_VALUE);
