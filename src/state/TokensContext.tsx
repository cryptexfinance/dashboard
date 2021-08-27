import React from "react";
import { Contract } from "ethers-multicall";
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
  ctxToken?: ethers.Contract;
  setCurrentCtxToken: (currentCtx: ethers.Contract) => void;
  maticToken?: ethers.Contract;
  setCurrentMATICToken: (currentMATIC: ethers.Contract) => void;
  wethPoolToken?: ethers.Contract;
  setCurrentWETHPoolToken: (currentPoolToken: ethers.Contract) => void;
  daiPoolToken?: ethers.Contract;
  setCurrentDAIPoolToken: (currentPoolToken: ethers.Contract) => void;
  wbtcPoolToken?: ethers.Contract;
  setCurrentWBTCPoolToken: (currentPoolToken: ethers.Contract) => void;
  ctxPoolToken?: ethers.Contract;
  setCurrentCTXPoolToken: (currentPoolToken: ethers.Contract) => void;
  wethTokenRead?: Contract;
  setCurrentWETHTokenRead: (currentTokenRead: Contract) => void;
  daiTokenRead?: Contract;
  setCurrentDAITokenRead: (currentTokenRead: Contract) => void;
  wbtcTokenRead?: Contract;
  setCurrentWBTCTokenRead: (currentTokenRead: Contract) => void;
  tcapTokenRead?: Contract;
  setCurrentTCAPTokenRead: (currentTokenRead: Contract) => void;
  ctxTokenRead?: Contract;
  setCurrentCtxTokenRead: (currentCtx: Contract) => void;
  maticTokenRead?: Contract;
  setCurrentMATICTokenRead: (currentMATIC: Contract) => void;
  wethPoolTokenRead?: Contract;
  setCurrentWETHPoolTokenRead: (currentPoolTokenRead: Contract) => void;
  daiPoolTokenRead?: Contract;
  setCurrentDAIPoolTokenRead: (currentPoolTokenRead: Contract) => void;
  wbtcPoolTokenRead?: Contract;
  setCurrentWBTCPoolTokenRead: (currentPoolTokenRead: Contract) => void;
  ctxPoolTokenRead?: Contract;
  setCurrentCTXPoolTokenRead: (currentPoolTokenRead: Contract) => void;
}

export const TOKENS_DEFAULT_VALUE = {
  setCurrentWETHToken: () => {},
  setCurrentDAIToken: () => {},
  setCurrentWBTCToken: () => {},
  setCurrentTCAPToken: () => {},
  setCurrentCtxToken: () => {},
  setCurrentMATICToken: () => {},
  setCurrentWETHPoolToken: () => {},
  setCurrentDAIPoolToken: () => {},
  setCurrentWBTCPoolToken: () => {},
  setCurrentCTXPoolToken: () => {},
  setCurrentWETHTokenRead: () => {},
  setCurrentDAITokenRead: () => {},
  setCurrentWBTCTokenRead: () => {},
  setCurrentTCAPTokenRead: () => {},
  setCurrentCtxTokenRead: () => {},
  setCurrentMATICTokenRead: () => {},
  setCurrentWETHPoolTokenRead: () => {},
  setCurrentDAIPoolTokenRead: () => {},
  setCurrentWBTCPoolTokenRead: () => {},
  setCurrentCTXPoolTokenRead: () => {},
};

const tokensContext = React.createContext<TokensContext>(TOKENS_DEFAULT_VALUE);

export default tokensContext;
