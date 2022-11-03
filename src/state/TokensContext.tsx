import React from "react";
import { Contract } from "ethers-multicall";
import { ethers } from "ethers";

export interface ITokensContext {
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
  aaveToken?: ethers.Contract;
  setCurrentAAVEToken: (currentAave: ethers.Contract) => void;
  linkToken?: ethers.Contract;
  setCurrentLINKToken: (currentLink: ethers.Contract) => void;
  snxToken?: ethers.Contract;
  setCurrentSNXToken: (currentSnx: ethers.Contract) => void;
  uniToken?: ethers.Contract;
  setCurrentUNIToken: (currentUni: ethers.Contract) => void;
  maticToken?: ethers.Contract;
  setCurrentMATICToken: (currentMATIC: ethers.Contract) => void;
  usdcToken?: ethers.Contract;
  setCurrentUSDCToken: (currentUSDC: ethers.Contract) => void;
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
  aaveTokenRead?: Contract;
  setCurrentAAVETokenRead: (currentAave: Contract) => void;
  linkTokenRead?: Contract;
  setCurrentLINKTokenRead: (currentLink: Contract) => void;
  snxTokenRead?: Contract;
  setCurrentSNXTokenRead: (currentSnx: Contract) => void;
  uniTokenRead?: Contract;
  setCurrentUNITokenRead: (currentUni: Contract) => void;
  maticTokenRead?: Contract;
  setCurrentMATICTokenRead: (currentMATIC: Contract) => void;
  usdcTokenRead?: Contract;
  setCurrentUSDCTokenRead: (currentUSDC: Contract) => void;
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
  setCurrentAAVEToken: () => {},
  setCurrentLINKToken: () => {},
  setCurrentSNXToken: () => {},
  setCurrentUNIToken: () => {},
  setCurrentMATICToken: () => {},
  setCurrentUSDCToken: () => {},
  setCurrentWETHPoolToken: () => {},
  setCurrentDAIPoolToken: () => {},
  setCurrentWBTCPoolToken: () => {},
  setCurrentCTXPoolToken: () => {},
  setCurrentWETHTokenRead: () => {},
  setCurrentDAITokenRead: () => {},
  setCurrentWBTCTokenRead: () => {},
  setCurrentTCAPTokenRead: () => {},
  setCurrentCtxTokenRead: () => {},
  setCurrentAAVETokenRead: () => {},
  setCurrentLINKTokenRead: () => {},
  setCurrentSNXTokenRead: () => {},
  setCurrentUNITokenRead: () => {},
  setCurrentMATICTokenRead: () => {},
  setCurrentUSDCTokenRead: () => {},
  setCurrentWETHPoolTokenRead: () => {},
  setCurrentDAIPoolTokenRead: () => {},
  setCurrentWBTCPoolTokenRead: () => {},
  setCurrentCTXPoolTokenRead: () => {},
};

export const tokensContext = React.createContext<ITokensContext>(TOKENS_DEFAULT_VALUE);
