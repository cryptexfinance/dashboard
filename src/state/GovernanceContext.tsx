import React from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";

export interface GovernanceContext {
  governorAlpha?: ethers.Contract;
  setCurrentGovernorAlpha: (currentGovernorAlpha: ethers.Contract) => void;
  timelock?: ethers.Contract;
  setCurrentTimelock: (currentTimelock: ethers.Contract) => void;
  governorAlphaRead?: Contract;
  setCurrentGovernorAlphaRead: (currentGovernorAlpha: Contract) => void;
  timelockRead?: Contract;
  setCurrentTimelockRead: (currentTimelock: Contract) => void;
}

export const GOVERNANCE_DEFAULT_VALUE = {
  setCurrentGovernorAlpha: () => {},
  setCurrentTimelock: () => {},
  setCurrentGovernorAlphaRead: () => {},
  setCurrentTimelockRead: () => {},
};

const governanceContext = React.createContext<GovernanceContext>(GOVERNANCE_DEFAULT_VALUE);

export default governanceContext;
