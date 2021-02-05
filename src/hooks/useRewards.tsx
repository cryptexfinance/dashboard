import React, { useState } from "react";
import { ethers } from "ethers";
import { RewardsContext } from "../state/RewardsContext";

export const useRewards = (): RewardsContext => {
  const [wethReward, setWETHReward] = useState<ethers.Contract>();
  const [daiReward, setDAIReward] = useState<ethers.Contract>();
  const [wbtcReward, setWBTCReward] = useState<ethers.Contract>();

  const setCurrentWETHReward = React.useCallback((currentWETHReward: ethers.Contract): void => {
    setWETHReward(currentWETHReward);
  }, []);
  const setCurrentDAIReward = React.useCallback((currentDAIReward: ethers.Contract): void => {
    setDAIReward(currentDAIReward);
  }, []);
  const setCurrentWBTCReward = React.useCallback((currentWBTCReward: ethers.Contract): void => {
    setWBTCReward(currentWBTCReward);
  }, []);
  return {
    wethReward,
    setCurrentWETHReward,
    daiReward,
    setCurrentDAIReward,
    wbtcReward,
    setCurrentWBTCReward,
  };
};
