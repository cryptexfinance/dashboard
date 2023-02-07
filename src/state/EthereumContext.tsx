import React from "react";
import { Contract } from "ethers-multicall";

export interface IEthereumContext {
  tcapTokenRead?: Contract;
  setCurrentTcapTokenRead: (currentTokenRead: Contract) => void;
  ctxTokenRead?: Contract;
  setCurrentCtxTokenRead: (currentCtx: Contract) => void;
  ctxPoolTokenRead?: Contract;
  setCurrentCtxPoolTokenRead: (currentPoolTokenRead: Contract) => void;
  tcapOracleRead?: Contract;
  setCurrentTcapOracleRead: (currentOracle: Contract) => void;
  wethOracleRead?: Contract;
  setCurrentWethOracleRead: (currentOracle: Contract) => void;
  daiOracleRead?: Contract;
  setCurrentDaiOracleRead: (currentOracle: Contract) => void;
  aaveOracleRead?: Contract;
  setCurrentAaveOracleRead: (currentOracle: Contract) => void;
  linkOracleRead?: Contract;
  setCurrentLinkOracleRead: (currentOracle: Contract) => void;
  wbtcOracleRead?: Contract;
  setCurrentWbtcOracleRead: (currentOracle: Contract) => void;
  usdcOracleRead?: Contract;
  setCurrentUsdcOracleRead: (currentOracle: Contract) => void;
}

export const ETHEREUM_DEFAULT_VALUE = {
  setCurrentTcapTokenRead: () => {},
  setCurrentCtxTokenRead: () => {},
  setCurrentCtxPoolTokenRead: () => {},
  setCurrentTcapOracleRead: () => {},
  setCurrentWethOracleRead: () => {},
  setCurrentDaiOracleRead: () => {},
  setCurrentAaveOracleRead: () => {},
  setCurrentLinkOracleRead: () => {},
  setCurrentWbtcOracleRead: () => {},
  setCurrentUsdcOracleRead: () => {},
};

export const ethereumContext = React.createContext<IEthereumContext>(ETHEREUM_DEFAULT_VALUE);
