import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { TokensContext } from "../state/TokensContext";

export const useTokens = (): TokensContext => {
  const [wethToken, setETHToken] = useState<ethers.Contract>();
  const [daiToken, setDAIToken] = useState<ethers.Contract>();
  const [wbtcToken, setWBTCToken] = useState<ethers.Contract>();
  const [tcapToken, setTCAPToken] = useState<ethers.Contract>();
  const [ctxToken, setCtxToken] = useState<ethers.Contract>();
  const [maticToken, setMATICToken] = useState<ethers.Contract>();
  const [wethPoolToken, setWETHPoolToken] = useState<ethers.Contract>();
  const [daiPoolToken, setDAIPoolToken] = useState<ethers.Contract>();
  const [wbtcPoolToken, setWBTCPoolToken] = useState<ethers.Contract>();
  const [ctxPoolToken, setCTXPoolToken] = useState<ethers.Contract>();
  const [wethTokenRead, setETHTokenRead] = useState<Contract>();
  const [daiTokenRead, setDAITokenRead] = useState<Contract>();
  const [wbtcTokenRead, setWBTCTokenRead] = useState<Contract>();
  const [tcapTokenRead, setTCAPTokenRead] = useState<Contract>();
  const [ctxTokenRead, setCtxTokenRead] = useState<Contract>();
  const [maticTokenRead, setMATICTokenRead] = useState<Contract>();
  const [wethPoolTokenRead, setWETHPoolTokenRead] = useState<Contract>();
  const [daiPoolTokenRead, setDAIPoolTokenRead] = useState<Contract>();
  const [wbtcPoolTokenRead, setWBTCPoolTokenRead] = useState<Contract>();
  const [ctxPoolTokenRead, setCTXPoolTokenRead] = useState<Contract>();

  const setCurrentWETHToken = React.useCallback((currentWETHToken: ethers.Contract): void => {
    setETHToken(currentWETHToken);
  }, []);
  const setCurrentDAIToken = React.useCallback((currentDAIToken: ethers.Contract): void => {
    setDAIToken(currentDAIToken);
  }, []);
  const setCurrentWBTCToken = React.useCallback((currentWBTCToken: ethers.Contract): void => {
    setWBTCToken(currentWBTCToken);
  }, []);
  const setCurrentTCAPToken = React.useCallback((currentTCAPToken: ethers.Contract): void => {
    setTCAPToken(currentTCAPToken);
  }, []);
  const setCurrentCtxToken = React.useCallback((currentCtx: ethers.Contract): void => {
    setCtxToken(currentCtx);
  }, []);
  const setCurrentMATICToken = React.useCallback((currentMATIC: ethers.Contract): void => {
    setMATICToken(currentMATIC);
  }, []);
  const setCurrentWETHPoolToken = React.useCallback(
    (currentWETHPoolToken: ethers.Contract): void => {
      setWETHPoolToken(currentWETHPoolToken);
    },
    []
  );
  const setCurrentDAIPoolToken = React.useCallback((currentDAIPoolToken: ethers.Contract): void => {
    setDAIPoolToken(currentDAIPoolToken);
  }, []);
  const setCurrentWBTCPoolToken = React.useCallback(
    (currentWBTCPoolToken: ethers.Contract): void => {
      setWBTCPoolToken(currentWBTCPoolToken);
    },
    []
  );
  const setCurrentCTXPoolToken = React.useCallback((currentCTXPoolToken: ethers.Contract): void => {
    setCTXPoolToken(currentCTXPoolToken);
  }, []);

  const setCurrentWETHTokenRead = React.useCallback((currentWETHTokenRead: Contract): void => {
    setETHTokenRead(currentWETHTokenRead);
  }, []);
  const setCurrentDAITokenRead = React.useCallback((currentDAITokenRead: Contract): void => {
    setDAITokenRead(currentDAITokenRead);
  }, []);
  const setCurrentWBTCTokenRead = React.useCallback((currentWBTCTokenRead: Contract): void => {
    setWBTCTokenRead(currentWBTCTokenRead);
  }, []);
  const setCurrentTCAPTokenRead = React.useCallback((currentTCAPTokenRead: Contract): void => {
    setTCAPTokenRead(currentTCAPTokenRead);
  }, []);
  const setCurrentCtxTokenRead = React.useCallback((currentCtxRead: Contract): void => {
    setCtxTokenRead(currentCtxRead);
  }, []);
  const setCurrentMATICTokenRead = React.useCallback((currentMATICRead: Contract): void => {
    setMATICTokenRead(currentMATICRead);
  }, []);
  const setCurrentWETHPoolTokenRead = React.useCallback(
    (currentWETHPoolTokenRead: Contract): void => {
      setWETHPoolTokenRead(currentWETHPoolTokenRead);
    },
    []
  );
  const setCurrentDAIPoolTokenRead = React.useCallback(
    (currentDAIPoolTokenRead: Contract): void => {
      setDAIPoolTokenRead(currentDAIPoolTokenRead);
    },
    []
  );
  const setCurrentWBTCPoolTokenRead = React.useCallback(
    (currentWBTCPoolTokenRead: Contract): void => {
      setWBTCPoolTokenRead(currentWBTCPoolTokenRead);
    },
    []
  );
  const setCurrentCTXPoolTokenRead = React.useCallback(
    (currentCTXPoolTokenRead: Contract): void => {
      setCTXPoolTokenRead(currentCTXPoolTokenRead);
    },
    []
  );

  return {
    wethToken,
    setCurrentWETHToken,
    daiToken,
    setCurrentDAIToken,
    wbtcToken,
    setCurrentWBTCToken,
    tcapToken,
    setCurrentTCAPToken,
    ctxToken,
    setCurrentCtxToken,
    maticToken,
    setCurrentMATICToken,
    wethPoolToken,
    setCurrentWETHPoolToken,
    daiPoolToken,
    setCurrentDAIPoolToken,
    wbtcPoolToken,
    setCurrentWBTCPoolToken,
    ctxPoolToken,
    setCurrentCTXPoolToken,
    wethTokenRead,
    setCurrentWETHTokenRead,
    daiTokenRead,
    setCurrentDAITokenRead,
    wbtcTokenRead,
    setCurrentWBTCTokenRead,
    tcapTokenRead,
    setCurrentTCAPTokenRead,
    ctxTokenRead,
    setCurrentCtxTokenRead,
    maticTokenRead,
    setCurrentMATICTokenRead,
    wethPoolTokenRead,
    setCurrentWETHPoolTokenRead,
    daiPoolTokenRead,
    setCurrentDAIPoolTokenRead,
    wbtcPoolTokenRead,
    setCurrentWBTCPoolTokenRead,
    ctxPoolTokenRead,
    setCurrentCTXPoolTokenRead,
  };
};
