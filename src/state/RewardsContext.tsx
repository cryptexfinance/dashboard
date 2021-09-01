import React from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";

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
  wethRewardRead?: Contract;
  setCurrentWETHRewardRead: (currentReward: Contract) => void;
  daiRewardRead?: Contract;
  setCurrentDAIRewardRead: (currentReward: Contract) => void;
  wbtcRewardRead?: Contract;
  setCurrentWBTCRewardRead: (currentReward: Contract) => void;
  wethPoolRewardRead?: Contract;
  setCurrentWETHPoolRewardRead: (currentPoolReward: Contract) => void;
  daiPoolRewardRead?: Contract;
  setCurrentDAIPoolRewardRead: (currentPoolReward: Contract) => void;
  wbtcPoolRewardRead?: Contract;
  setCurrentWBTCPoolRewardRead: (currentPoolReward: Contract) => void;
  ctxPoolRewardRead?: Contract;
  setCurrentCTXPoolRewardRead: (currentPoolReward: Contract) => void;
}

export const REWARDS_DEFAULT_VALUE = {
  setCurrentWETHReward: () => {},
  setCurrentDAIReward: () => {},
  setCurrentWBTCReward: () => {},
  setCurrentWETHPoolReward: () => {},
  setCurrentDAIPoolReward: () => {},
  setCurrentWBTCPoolReward: () => {},
  setCurrentCTXPoolReward: () => {},
  setCurrentWETHRewardRead: () => {},
  setCurrentDAIRewardRead: () => {},
  setCurrentWBTCRewardRead: () => {},
  setCurrentWETHPoolRewardRead: () => {},
  setCurrentDAIPoolRewardRead: () => {},
  setCurrentWBTCPoolRewardRead: () => {},
  setCurrentCTXPoolRewardRead: () => {},
};

const rewardsContext = React.createContext<RewardsContext>(REWARDS_DEFAULT_VALUE);

export default rewardsContext;
