import React from "react";
import { ethers } from "ethers";

export interface GovernanceContext {
  ctxToken?: ethers.Contract;
  setCurrentCtxToken: (currentCtx: ethers.Contract) => void;
  governorAlpha?: ethers.Contract;
  setCurrentGovernorAlpha: (currentGovernorAlpha: ethers.Contract) => void;
  timelock?: ethers.Contract;
  setCurrentTimelock: (currentTimelock: ethers.Contract) => void;
}

export const GOVERNANCE_DEFAULT_VALUE = {
  setCurrentCtxToken: () => {},
  setCurrentGovernorAlpha: () => {},
  setCurrentTimelock: () => {},
};

const governanceContext = React.createContext<GovernanceContext>(GOVERNANCE_DEFAULT_VALUE);

export default governanceContext;
