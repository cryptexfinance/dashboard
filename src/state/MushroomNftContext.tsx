import React from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";

export interface IMushroomNftContext {
  mushroomNft?: ethers.Contract;
  setCurrentMushroomNft: (currentMushroom: ethers.Contract) => void;
  mushroomNftRead?: Contract;
  setCurrentMushroomNftRead: (currentMushroomRead: Contract) => void;
}

export const MUSHROOM_VALUE = {
  setCurrentMushroomNft: () => {},
  setCurrentMushroomNftRead: () => {},
};

export const mushroomNftContext = React.createContext<IMushroomNftContext>(MUSHROOM_VALUE);
