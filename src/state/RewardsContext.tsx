import React from "react";
import { ethers } from "ethers";

export interface RewardsContext {
  wethReward?: ethers.Contract;
  setCurrentWETHReward: (currentReward: ethers.Contract) => void;
  daiReward?: ethers.Contract;
  setCurrentDAIReward: (currentReward: ethers.Contract) => void;
  wbtcReward?: ethers.Contract;
  setCurrentWBTCReward: (currentReward: ethers.Contract) => void;
  wethPoolReward?: ethers.Contract;
  setCurrentWETHPoolReward: (currentPoolReward: ethers.Contract) => void;
  daiPoolReward?: ethers.Contract;
  setCurrentDAIPoolReward: (currentPoolReward: ethers.Contract) => void;
  wbtcPoolReward?: ethers.Contract;
  setCurrentWBTCPoolReward: (currentPoolReward: ethers.Contract) => void;
  ctxPoolReward?: ethers.Contract;
  setCurrentCTXPoolReward: (currentPoolReward: ethers.Contract) => void;
}

export const REWARDS_DEFAULT_VALUE = {
  setCurrentWETHReward: () => {},
  setCurrentDAIReward: () => {},
  setCurrentWBTCReward: () => {},
  setCurrentWETHPoolReward: () => {},
  setCurrentDAIPoolReward: () => {},
  setCurrentWBTCPoolReward: () => {},
  setCurrentCTXPoolReward: () => {},
};

const rewardsContext = React.createContext<RewardsContext>(REWARDS_DEFAULT_VALUE);

export default rewardsContext;
