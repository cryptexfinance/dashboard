import React from "react";
import { Contract } from "ethers-multicall";

export interface IArbitrumContext {
  jpegzTokenRead?: Contract;
  setCurrentJpegzTokenRead: (currentTokenRead: Contract) => void;
  jpegzOracleRead?: Contract;
  setCurrentJpegzOracleRead: (currentOracle: Contract) => void;
  wethOracleRead?: Contract;
  setCurrentWethOracleRead: (currentOracle: Contract) => void;
  daiOracleRead?: Contract;
  setCurrentDaiOracleRead: (currentOracle: Contract) => void;
}

export const ARBITRUM_DEFAULT_VALUE = {
  setCurrentJpegzTokenRead: () => {},
  setCurrentJpegzOracleRead: () => {},
  setCurrentWethOracleRead: () => {},
  setCurrentDaiOracleRead: () => {},
};

export const arbitrumContext = React.createContext<IArbitrumContext>(ARBITRUM_DEFAULT_VALUE);
