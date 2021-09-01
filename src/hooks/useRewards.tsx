import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { RewardsContext } from "../state/RewardsContext";

export const useRewards = (): RewardsContext => {
  const [wethReward, setWETHReward] = useState<ethers.Contract>();
  const [daiReward, setDAIReward] = useState<ethers.Contract>();
  const [wbtcReward, setWBTCReward] = useState<ethers.Contract>();
  const [wethPoolReward, setWETHPoolReward] = useState<ethers.Contract>();
  const [daiPoolReward, setDAIPoolReward] = useState<ethers.Contract>();
  const [wbtcPoolReward, setWBTCPoolReward] = useState<ethers.Contract>();
  const [ctxPoolReward, setCTXPoolReward] = useState<ethers.Contract>();
  const [wethRewardRead, setWETHRewardRead] = useState<Contract>();
  const [daiRewardRead, setDAIRewardRead] = useState<Contract>();
  const [wbtcRewardRead, setWBTCRewardRead] = useState<Contract>();
  const [wethPoolRewardRead, setWETHPoolRewardRead] = useState<Contract>();
  const [daiPoolRewardRead, setDAIPoolRewardRead] = useState<Contract>();
  const [wbtcPoolRewardRead, setWBTCPoolRewardRead] = useState<Contract>();
  const [ctxPoolRewardRead, setCTXPoolRewardRead] = useState<Contract>();

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
  const setCurrentWETHRewardRead = React.useCallback((currentWETHReward: Contract): void => {
    setWETHRewardRead(currentWETHReward);
  }, []);
  const setCurrentDAIRewardRead = React.useCallback((currentDAIReward: Contract): void => {
    setDAIRewardRead(currentDAIReward);
  }, []);
  const setCurrentWBTCRewardRead = React.useCallback((currentWBTCReward: Contract): void => {
    setWBTCRewardRead(currentWBTCReward);
  }, []);
  const setCurrentWETHPoolRewardRead = React.useCallback(
    (currentWETHPoolReward: Contract): void => {
      setWETHPoolRewardRead(currentWETHPoolReward);
    },
    []
  );
  const setCurrentDAIPoolRewardRead = React.useCallback((currentDAIPoolReward: Contract): void => {
    setDAIPoolRewardRead(currentDAIPoolReward);
  }, []);
  const setCurrentWBTCPoolRewardRead = React.useCallback(
    (currentWBTCPoolReward: Contract): void => {
      setWBTCPoolRewardRead(currentWBTCPoolReward);
    },
    []
  );
  const setCurrentCTXPoolRewardRead = React.useCallback((currentCTXPoolReward: Contract): void => {
    setCTXPoolRewardRead(currentCTXPoolReward);
  }, []);
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
    wethRewardRead,
    setCurrentWETHRewardRead,
    daiRewardRead,
    setCurrentDAIRewardRead,
    wbtcRewardRead,
    setCurrentWBTCRewardRead,
    wethPoolRewardRead,
    setCurrentWETHPoolRewardRead,
    daiPoolRewardRead,
    setCurrentDAIPoolRewardRead,
    wbtcPoolRewardRead,
    setCurrentWBTCPoolRewardRead,
    ctxPoolRewardRead,
    setCurrentCTXPoolRewardRead,
  };
};
