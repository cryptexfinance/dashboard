import React, { useState } from "react";
import { Contract } from "ethers-multicall";
import { IOptimismContext } from "../state";

export const useOptimism = (): IOptimismContext => {
  const [tcapTokenRead, setTcapTokenRead] = useState<Contract>();
  const [tcapOracleRead, setTcapOracleRead] = useState<Contract>();
  const [wethOracleRead, setWethOracleRead] = useState<Contract>();
  const [daiOracleRead, setDaiOracleRead] = useState<Contract>();
  const [linkOracleRead, setLinkOracleRead] = useState<Contract>();
  const [snxOracleRead, setSnxOracleRead] = useState<Contract>();
  const [uniOracleRead, setUniOracleRead] = useState<Contract>();

  const setCurrentTcapTokenRead = React.useCallback((currentTcapTokenRead: Contract): void => {
    setTcapTokenRead(currentTcapTokenRead);
  }, []);
  const setCurrentTcapOracleRead = React.useCallback((currentTcapOracleRead: Contract): void => {
    setTcapOracleRead(currentTcapOracleRead);
  }, []);
  const setCurrentWethOracleRead = React.useCallback((currentWethOracleRead: Contract): void => {
    setWethOracleRead(currentWethOracleRead);
  }, []);
  const setCurrentDaiOracleRead = React.useCallback((currentDaiOracleRead: Contract): void => {
    setDaiOracleRead(currentDaiOracleRead);
  }, []);
  const setCurrentLinkOracleRead = React.useCallback((currentLinkOracleRead: Contract): void => {
    setLinkOracleRead(currentLinkOracleRead);
  }, []);
  const setCurrentSnxOracleRead = React.useCallback((currentSnxOracleRead: Contract): void => {
    setSnxOracleRead(currentSnxOracleRead);
  }, []);
  const setCurrentUniOracleRead = React.useCallback((currentUniOracleRead: Contract): void => {
    setUniOracleRead(currentUniOracleRead);
  }, []);

  return {
    tcapTokenRead,
    setCurrentTcapTokenRead,
    tcapOracleRead,
    setCurrentTcapOracleRead,
    wethOracleRead,
    setCurrentWethOracleRead,
    daiOracleRead,
    setCurrentDaiOracleRead,
    linkOracleRead,
    setCurrentLinkOracleRead,
    snxOracleRead,
    setCurrentSnxOracleRead,
    uniOracleRead,
    setCurrentUniOracleRead,
  };
};
