import React, { useState } from "react";
import { Contract } from "ethers-multicall";
import { IArbitrumContext } from "../state";

export const useArbitrum = (): IArbitrumContext => {
  const [jpegzTokenRead, setJpegzTokenRead] = useState<Contract>();
  const [jpegzOracleRead, setJpegzOracleRead] = useState<Contract>();
  const [wethOracleRead, setWethOracleRead] = useState<Contract>();
  const [daiOracleRead, setDaiOracleRead] = useState<Contract>();

  const setCurrentJpegzTokenRead = React.useCallback((currentJpegzTokenRead: Contract): void => {
    setJpegzTokenRead(currentJpegzTokenRead);
  }, []);
  const setCurrentJpegzOracleRead = React.useCallback((currentJpegzOracleRead: Contract): void => {
    setJpegzOracleRead(currentJpegzOracleRead);
  }, []);
  const setCurrentWethOracleRead = React.useCallback((currentWethOracleRead: Contract): void => {
    setWethOracleRead(currentWethOracleRead);
  }, []);
  const setCurrentDaiOracleRead = React.useCallback((currentDaiOracleRead: Contract): void => {
    setDaiOracleRead(currentDaiOracleRead);
  }, []);

  return {
    jpegzTokenRead,
    setCurrentJpegzTokenRead,
    jpegzOracleRead,
    setCurrentJpegzOracleRead,
    wethOracleRead,
    setCurrentWethOracleRead,
    daiOracleRead,
    setCurrentDaiOracleRead,
  };
};
