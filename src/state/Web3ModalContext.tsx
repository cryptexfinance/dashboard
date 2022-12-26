import React from "react";

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import { NETWORKS } from "../utils/constants";

let network = "mainnet";

switch (process.env.REACT_APP_NETWORK_ID) {
  case "1":
    network = "mainnet";
    break;
  case "3":
    network = "ropsten";
    break;
  case "4":
    network = "rinkeby";
    break;
  case "5":
    network = "goerli";
    break;
  case "69":
    network = "optimism-kovan";
    break;
  case "137":
    network = "polygon";
    break;
  default:
    break;
}

const providerOptions = {
  walletlink: {
    package: WalletLink, // Required
    options: {
      appName: "Cryptex Finance", // Required
      infuraId: process.env.REACT_APP_INFURA_ID,
    },
  },
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID, // required
    },
  },
  "custom-example": {
    display: {
      logo: "data:image/gif;base64,INSERT_BASE64_STRING",
      name: "OKX",
      description: "Connect to your example provider account"
    },
  }
};

const web3Modal = new Web3Modal({
  network,
  cacheProvider: true, // optional
  providerOptions, // required
  theme: {
    background: "#1d1d3c",
    main: "white",
    secondary: "#f5f5f5",
    border: "#e440f2",
    hover: "rgba(241, 36, 255, 0.0)",
  },
});

export const Web3ModalContext = React.createContext(web3Modal);
