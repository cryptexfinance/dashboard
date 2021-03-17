import React from "react";
import { ethers } from "ethers";

export interface TokensContext {
  wethToken?: ethers.Contract;
  setCurrentWETHToken: (currentToken: ethers.Contract) => void;
  daiToken?: ethers.Contract;
  setCurrentDAIToken: (currentToken: ethers.Contract) => void;
  wbtcToken?: ethers.Contract;
  setCurrentWBTCToken: (currentToken: ethers.Contract) => void;
  tcapToken?: ethers.Contract;
  setCurrentTCAPToken: (currentToken: ethers.Contract) => void;
  wethPoolToken?: ethers.Contract;
  setCurrentWETHPoolToken: (currentPoolToken: ethers.Contract) => void;
  daiPoolToken?: ethers.Contract;
  setCurrentDAIPoolToken: (currentPoolToken: ethers.Contract) => void;
  wbtcPoolToken?: ethers.Contract;
  setCurrentWBTCPoolToken: (currentPoolToken: ethers.Contract) => void;
  ctxPoolToken?: ethers.Contract;
  setCurrentCTXPoolToken: (currentPoolToken: ethers.Contract) => void;
}

export const TOKENS_DEFAULT_VALUE = {
  setCurrentWETHToken: () => {},
  setCurrentDAIToken: () => {},
  setCurrentWBTCToken: () => {},
  setCurrentTCAPToken: () => {},
  setCurrentWETHPoolToken: () => {},
  setCurrentDAIPoolToken: () => {},
  setCurrentWBTCPoolToken: () => {},
  setCurrentCTXPoolToken: () => {},
};

const tokensContext = React.createContext<TokensContext>(TOKENS_DEFAULT_VALUE);

export default tokensContext;
