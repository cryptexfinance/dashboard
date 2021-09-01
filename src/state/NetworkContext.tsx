import React from "react";
import { NETWORKS } from "../utils/constants";

export interface NetworkContext {
  chainId?: number;
  setCurrentChainId: (newChainId: number) => void;
  name?: string;
  setCurrentName: (name: string) => void;
  wethAddress: string;
  setCurrentWETHAddress: (address: string) => void;
  daiAddress: string;
  setCurrentDAIAddress: (address: string) => void;
  maticAddress?: string;
  setCurrentMATICAddress: (address: string) => void;
}

const NETWORK_DEFAULT_VALUE = {
  chainId: NETWORKS.mainnet.chainId,
  setCurrentChainId: () => {},
  name: NETWORKS.mainnet.name,
  setCurrentName: () => {},
  wethAddress: NETWORKS.mainnet.weth,
  setCurrentWETHAddress: () => {},
  daiAddress: NETWORKS.mainnet.dai,
  setCurrentDAIAddress: () => {},
  maticAddress: "",
  setCurrentMATICAddress: () => {},
};

const networkContext = React.createContext<NetworkContext>(NETWORK_DEFAULT_VALUE);

export default networkContext;
