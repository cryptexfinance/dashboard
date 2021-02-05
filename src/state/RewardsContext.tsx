import React from "react";
import { ethers } from "ethers";

export interface RewardsContext {
  wethReward?: ethers.Contract;
  setCurrentWETHReward: (currentReward: ethers.Contract) => void;
  daiReward?: ethers.Contract;
  setCurrentDAIReward: (currentReward: ethers.Contract) => void;
  wbtcReward?: ethers.Contract;
  setCurrentWBTCReward: (currentReward: ethers.Contract) => void;
}

export const REWARDS_DEFAULT_VALUE = {
  setCurrentWETHReward: () => {},
  setCurrentDAIReward: () => {},
  setCurrentWBTCReward: () => {},
};

const rewardsContext = React.createContext<RewardsContext>(REWARDS_DEFAULT_VALUE);

export default rewardsContext;
