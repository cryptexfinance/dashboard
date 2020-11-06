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
}

export const TOKENS_DEFAULT_VALUE = {
  setCurrentWETHToken: () => {},
  setCurrentDAIToken: () => {},
  setCurrentWBTCToken: () => {},
  setCurrentTCAPToken: () => {},
};

const tokensContext = React.createContext<TokensContext>(TOKENS_DEFAULT_VALUE);

export default tokensContext;
