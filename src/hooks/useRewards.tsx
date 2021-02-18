import React, { useState } from "react";
import { ethers } from "ethers";
import { RewardsContext } from "../state/RewardsContext";

export const useRewards = (): RewardsContext => {
  const [wethReward, setWETHReward] = useState<ethers.Contract>();
  const [daiReward, setDAIReward] = useState<ethers.Contract>();
  const [wbtcReward, setWBTCReward] = useState<ethers.Contract>();
  const [wethPoolReward, setWETHPoolReward] = useState<ethers.Contract>();
  const [daiPoolReward, setDAIPoolReward] = useState<ethers.Contract>();
  const [wbtcPoolReward, setWBTCPoolReward] = useState<ethers.Contract>();
  const [ctxPoolReward, setCTXPoolReward] = useState<ethers.Contract>();

  const setCurrentWETHReward = React.useCallback((currentWETHReward: ethers.Contract): void => {
    setWETHReward(currentWETHReward);
  }, []);
  const setCurrentDAIReward = React.useCallback((currentDAIReward: ethers.Contract): void => {
    setDAIReward(currentDAIReward);
  }, []);
  const setCurrentWBTCReward = React.useCallback((currentWBTCReward: ethers.Contract): void => {
    setWBTCReward(currentWBTCReward);
  }, []);
  const setCurrentWETHPoolReward = React.useCallback(
    (currentWETHPoolReward: ethers.Contract): void => {
      setWETHPoolReward(currentWETHPoolReward);
    },
    []
  );
  const setCurrentDAIPoolReward = React.useCallback(
    (currentDAIPoolReward: ethers.Contract): void => {
      setDAIPoolReward(currentDAIPoolReward);
    },
    []
  );
  const setCurrentWBTCPoolReward = React.useCallback(
    (currentWBTCPoolReward: ethers.Contract): void => {
      setWBTCPoolReward(currentWBTCPoolReward);
    },
    []
  );
  const setCurrentCTXPoolReward = React.useCallback(
    (currentCTXPoolReward: ethers.Contract): void => {
      setCTXPoolReward(currentCTXPoolReward);
    },
    []
  );
  return {
    wethReward,
    setCurrentWETHReward,
    daiReward,
    setCurrentDAIReward,
    wbtcReward,
    setCurrentWBTCReward,
    wethPoolReward,
    setCurrentWETHPoolReward,
    daiPoolReward,
    setCurrentDAIPoolReward,
    wbtcPoolReward,
    setCurrentWBTCPoolReward,
    ctxPoolReward,
    setCurrentCTXPoolReward,
  };
};
