import React, { useState } from "react";
import { ethers } from "ethers";
import { GovernanceContext } from "../state/GovernanceContext";

export const useGovernance = (): GovernanceContext => {
  const [ctxToken, setCtxToken] = useState<ethers.Contract>();
  const [governorAlpha, setGovernorAlpha] = useState<ethers.Contract>();
  const [timelock, setTimelock] = useState<ethers.Contract>();

  const setCurrentCtxToken = React.useCallback((currentCtx: ethers.Contract): void => {
    setCtxToken(currentCtx);
  }, []);
  const setCurrentGovernorAlpha = React.useCallback(
    (currentGovernorAlpha: ethers.Contract): void => {
      setGovernorAlpha(currentGovernorAlpha);
    },
    []
  );
  const setCurrentTimelock = React.useCallback((currentTimelock: ethers.Contract): void => {
    setTimelock(currentTimelock);
  }, []);
  return {
    ctxToken,
    setCurrentCtxToken,
    governorAlpha,
    setCurrentGovernorAlpha,
    timelock,
    setCurrentTimelock,
  };
};
