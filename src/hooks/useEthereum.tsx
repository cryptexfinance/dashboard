import React, { useState } from "react";
import { Contract } from "ethers-multicall";
import { IEthereumContext } from "../state";

export const useEthereum = (): IEthereumContext => {
  const [tcapTokenRead, setTcapTokenRead] = useState<Contract>();
  const [ctxTokenRead, setCtxTokenRead] = useState<Contract>();
  const [ctxPoolTokenRead, setCtxPoolTokenRead] = useState<Contract>();
  const [tcapOracleRead, setTcapOracleRead] = useState<Contract>();
  const [wethOracleRead, setWethOracleRead] = useState<Contract>();
  const [daiOracleRead, setDaiOracleRead] = useState<Contract>();
  const [aaveOracleRead, setAaveOracleRead] = useState<Contract>();
  const [linkOracleRead, setLinkOracleRead] = useState<Contract>();
  const [wbtcOracleRead, setWbtcOracleRead] = useState<Contract>();
  const [usdcOracleRead, setUsdcOracleRead] = useState<Contract>();

  const setCurrentTcapTokenRead = React.useCallback((currentTcapTokenRead: Contract): void => {
    setTcapTokenRead(currentTcapTokenRead);
  }, []);
  const setCurrentCtxTokenRead = React.useCallback((currentCtxTokenRead: Contract): void => {
    setCtxTokenRead(currentCtxTokenRead);
  }, []);
  const setCurrentCtxPoolTokenRead = React.useCallback(
    (currentCtxPoolTokenRead: Contract): void => {
      setCtxPoolTokenRead(currentCtxPoolTokenRead);
    },
    []
  );
  const setCurrentTcapOracleRead = React.useCallback((currentTcapOracleRead: Contract): void => {
    setTcapOracleRead(currentTcapOracleRead);
  }, []);
  const setCurrentWethOracleRead = React.useCallback((currentWethOracleRead: Contract): void => {
    setWethOracleRead(currentWethOracleRead);
  }, []);
  const setCurrentDaiOracleRead = React.useCallback((currentDaiOracleRead: Contract): void => {
    setDaiOracleRead(currentDaiOracleRead);
  }, []);
  const setCurrentAaveOracleRead = React.useCallback((currentAaveOracleRead: Contract): void => {
    setAaveOracleRead(currentAaveOracleRead);
  }, []);
  const setCurrentLinkOracleRead = React.useCallback((currentLinkOracleRead: Contract): void => {
    setLinkOracleRead(currentLinkOracleRead);
  }, []);
  const setCurrentWbtcOracleRead = React.useCallback((currentWbtcOracleRead: Contract): void => {
    setWbtcOracleRead(currentWbtcOracleRead);
  }, []);
  const setCurrentUsdcOracleRead = React.useCallback((currentUsdcOracleRead: Contract): void => {
    setUsdcOracleRead(currentUsdcOracleRead);
  }, []);

  return {
    tcapTokenRead,
    setCurrentTcapTokenRead,
    ctxTokenRead,
    setCurrentCtxTokenRead,
    ctxPoolTokenRead,
    setCurrentCtxPoolTokenRead,
    tcapOracleRead,
    setCurrentTcapOracleRead,
    wethOracleRead,
    setCurrentWethOracleRead,
    daiOracleRead,
    setCurrentDaiOracleRead,
    aaveOracleRead,
    setCurrentAaveOracleRead,
    linkOracleRead,
    setCurrentLinkOracleRead,
    wbtcOracleRead,
    setCurrentWbtcOracleRead,
    usdcOracleRead,
    setCurrentUsdcOracleRead,
  };
};
