import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { GovernanceContext } from "../state/GovernanceContext";

export const useGovernance = (): GovernanceContext => {
  const [governorAlpha, setGovernorAlpha] = useState<ethers.Contract>();
  const [timelock, setTimelock] = useState<ethers.Contract>();
  const [delegatorFactory, setDelegatorFactory] = useState<ethers.Contract>();
  const [governorAlphaRead, setGovernorAlphaRead] = useState<Contract>();
  const [timelockRead, setTimelockRead] = useState<Contract>();
  const [delegatorFactoryRead, setDelegatorFactoryRead] = useState<Contract>();

  const setCurrentGovernorAlpha = React.useCallback(
    (currentGovernorAlpha: ethers.Contract): void => {
      setGovernorAlpha(currentGovernorAlpha);
    },
    []
  );
  const setCurrentTimelock = React.useCallback((currentTimelock: ethers.Contract): void => {
    setTimelock(currentTimelock);
  }, []);
  const setCurrentDelegatorFactory = React.useCallback(
    (currentDelegatorFactory: ethers.Contract): void => {
      setDelegatorFactory(currentDelegatorFactory);
    },
    []
  );
  const setCurrentGovernorAlphaRead = React.useCallback(
    (currentGovernorAlphaRead: Contract): void => {
      setGovernorAlphaRead(currentGovernorAlphaRead);
    },
    []
  );
  const setCurrentTimelockRead = React.useCallback((currentTimelockRead: Contract): void => {
    setTimelockRead(currentTimelockRead);
  }, []);
  const setCurrentDelegatorFactoryRead = React.useCallback(
    (currentDelegatorFactoryRead: Contract): void => {
      setDelegatorFactoryRead(currentDelegatorFactoryRead);
    },
    []
  );
  return {
    governorAlpha,
    setCurrentGovernorAlpha,
    timelock,
    setCurrentTimelock,
    delegatorFactory,
    setCurrentDelegatorFactory,
    governorAlphaRead,
    setCurrentGovernorAlphaRead,
    timelockRead,
    setCurrentTimelockRead,
    delegatorFactoryRead,
    setCurrentDelegatorFactoryRead,
  };
};
