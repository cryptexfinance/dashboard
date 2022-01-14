import React from "react";

import Web3Modal from "web3modal";
import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Authereum from "authereum";
import WalletLink from "walletlink";

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
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID, // required
    },
  },
  walletlink: {
    package: WalletLink, // Required
    options: {
      appName: "Cryptex Finance", // Required
      infuraId: process.env.REACT_APP_INFURA_ID,
    },
  },
  /* fortmatic: {
    package: Fortmatic,
    options: {
      key: process.env.REACT_APP_FORTMATIC_KEY,
      network: {
        chainId: process.env.REACT_APP_NETWORK_ID,
        rpcUrl:
          process.env.REACT_APP_NETWORK_ID === "1"
            ? NETWORKS.mainnet.infuraRpcUrl
            : NETWORKS.rinkeby.infuraRpcUrl,
      }, // if we don't pass it, it will default to localhost:8454
    },
  }, */
  portis: {
    package: Portis, // required
    options: {
      id: process.env.REACT_APP_PORTIS_ID,
    },
  },
  authereum: {
    package: Authereum, // required
  },
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
