import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { ITokensContext } from "../state";

export const useTokens = (): ITokensContext => {
  const [wethToken, setETHToken] = useState<ethers.Contract>();
  const [daiToken, setDAIToken] = useState<ethers.Contract>();
  const [wbtcToken, setWBTCToken] = useState<ethers.Contract>();
  const [tcapToken, setTCAPToken] = useState<ethers.Contract>();
  const [ctxToken, setCtxToken] = useState<ethers.Contract>();
  const [aaveToken, setAAVEToken] = useState<ethers.Contract>();
  const [linkToken, setLINKToken] = useState<ethers.Contract>();
  const [snxToken, setSNXToken] = useState<ethers.Contract>();
  const [uniToken, setUNIToken] = useState<ethers.Contract>();
  const [maticToken, setMATICToken] = useState<ethers.Contract>();
  const [usdcToken, setUSDCToken] = useState<ethers.Contract>();
  const [wethPoolToken, setWETHPoolToken] = useState<ethers.Contract>();
  const [daiPoolToken, setDAIPoolToken] = useState<ethers.Contract>();
  const [wbtcPoolToken, setWBTCPoolToken] = useState<ethers.Contract>();
  const [ctxPoolToken, setCTXPoolToken] = useState<ethers.Contract>();
  const [wethTokenRead, setETHTokenRead] = useState<Contract>();
  const [daiTokenRead, setDAITokenRead] = useState<Contract>();
  const [wbtcTokenRead, setWBTCTokenRead] = useState<Contract>();
  const [tcapTokenRead, setTCAPTokenRead] = useState<Contract>();
  const [ctxTokenRead, setCtxTokenRead] = useState<Contract>();
  const [aaveTokenRead, setAAVETokenRead] = useState<Contract>();
  const [linkTokenRead, setLINKTokenRead] = useState<Contract>();
  const [snxTokenRead, setSNXTokenRead] = useState<Contract>();
  const [uniTokenRead, setUNITokenRead] = useState<Contract>();
  const [maticTokenRead, setMATICTokenRead] = useState<Contract>();
  const [usdcTokenRead, setUSDCTokenRead] = useState<Contract>();
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
  const setCurrentAAVEToken = React.useCallback((currentAAVEToken: ethers.Contract): void => {
    setAAVEToken(currentAAVEToken);
  }, []);
  const setCurrentLINKToken = React.useCallback((currentLINKToken: ethers.Contract): void => {
    setLINKToken(currentLINKToken);
  }, []);
  const setCurrentSNXToken = React.useCallback((currentSNXToken: ethers.Contract): void => {
    setSNXToken(currentSNXToken);
  }, []);
  const setCurrentUNIToken = React.useCallback((currentUNIToken: ethers.Contract): void => {
    setUNIToken(currentUNIToken);
  }, []);
  const setCurrentMATICToken = React.useCallback((currentMATIC: ethers.Contract): void => {
    setMATICToken(currentMATIC);
  }, []);
  const setCurrentUSDCToken = React.useCallback((currentUSDC: ethers.Contract): void => {
    setUSDCToken(currentUSDC);
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
  const setCurrentAAVETokenRead = React.useCallback((currentAAVETokenRead: Contract): void => {
    setAAVETokenRead(currentAAVETokenRead);
  }, []);
  const setCurrentLINKTokenRead = React.useCallback((currentLINKTokenRead: Contract): void => {
    setLINKTokenRead(currentLINKTokenRead);
  }, []);
  const setCurrentSNXTokenRead = React.useCallback((currentSNXTokenRead: Contract): void => {
    setSNXTokenRead(currentSNXTokenRead);
  }, []);
  const setCurrentUNITokenRead = React.useCallback((currentUNITokenRead: Contract): void => {
    setUNITokenRead(currentUNITokenRead);
  }, []);
  const setCurrentMATICTokenRead = React.useCallback((currentMATICRead: Contract): void => {
    setMATICTokenRead(currentMATICRead);
  }, []);
  const setCurrentUSDCTokenRead = React.useCallback((currentUSDCRead: Contract): void => {
    setUSDCTokenRead(currentUSDCRead);
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
    aaveToken,
    setCurrentAAVEToken,
    linkToken,
    setCurrentLINKToken,
    snxToken,
    setCurrentSNXToken,
    uniToken,
    setCurrentUNIToken,
    maticToken,
    setCurrentMATICToken,
    usdcToken,
    setCurrentUSDCToken,
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
    aaveTokenRead,
    setCurrentAAVETokenRead,
    linkTokenRead,
    setCurrentLINKTokenRead,
    snxTokenRead,
    setCurrentSNXTokenRead,
    uniTokenRead,
    setCurrentUNITokenRead,
    maticTokenRead,
    setCurrentMATICTokenRead,
    usdcTokenRead,
    setCurrentUSDCTokenRead,
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
