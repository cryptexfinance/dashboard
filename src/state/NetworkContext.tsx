import React from "react";
import { NETWORKS } from "../utils/constants";

export interface INetworkContext {
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
  wallet?: string;
  setCurrentWallet: (walletName: string) => void;
  isBrowserWallet?: boolean;
  setCurrentIsBrowserWallet: (isBrowserW: boolean) => void;
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
  wallet: "",
  setCurrentWallet: () => {},
  isBrowserWallet: false,
  setCurrentIsBrowserWallet: () => {},
};

export const networkContext = React.createContext<INetworkContext>(NETWORK_DEFAULT_VALUE);
