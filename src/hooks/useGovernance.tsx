import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { GovernanceContext } from "../state/GovernanceContext";

export const useGovernance = (): GovernanceContext => {
  const [governorAlpha, setGovernorAlpha] = useState<ethers.Contract>();
  const [timelock, setTimelock] = useState<ethers.Contract>();
  const [governorAlphaRead, setGovernorAlphaRead] = useState<Contract>();
  const [timelockRead, setTimelockRead] = useState<Contract>();

  const setCurrentGovernorAlpha = React.useCallback(
    (currentGovernorAlpha: ethers.Contract): void => {
      setGovernorAlpha(currentGovernorAlpha);
    },
    []
  );
  const setCurrentTimelock = React.useCallback((currentTimelock: ethers.Contract): void => {
    setTimelock(currentTimelock);
  }, []);
  const setCurrentGovernorAlphaRead = React.useCallback(
    (currentGovernorAlphaRead: Contract): void => {
      setGovernorAlphaRead(currentGovernorAlphaRead);
    },
    []
  );
  const setCurrentTimelockRead = React.useCallback((currentTimelockRead: Contract): void => {
    setTimelockRead(currentTimelockRead);
  }, []);
  return {
    governorAlpha,
    setCurrentGovernorAlpha,
    timelock,
    setCurrentTimelock,
    governorAlphaRead,
    setCurrentGovernorAlphaRead,
    timelockRead,
    setCurrentTimelockRead,
  };
};
