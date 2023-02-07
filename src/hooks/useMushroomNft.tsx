import React, { useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { IMushroomNftContext } from "../state";

export const useMushroomNft = (): IMushroomNftContext => {
  const [mushroomNft, setMushroomNft] = useState<ethers.Contract>();
  const [mushroomNftRead, setMushroomNftRead] = useState<Contract>();

  const setCurrentMushroomNft = React.useCallback((currentMushroomNft: ethers.Contract): void => {
    setMushroomNft(currentMushroomNft);
  }, []);
  const setCurrentMushroomNftRead = React.useCallback((currentMushroomNftRead: Contract): void => {
    setMushroomNftRead(currentMushroomNftRead);
  }, []);

  return {
    mushroomNft,
    setCurrentMushroomNft,
    mushroomNftRead,
    setCurrentMushroomNftRead,
  };
};
