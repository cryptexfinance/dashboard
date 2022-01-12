import React from "react";
import { ethers, utils } from "ethers";
import { Fragment, JsonFragment } from "@ethersproject/abi";
import { toast } from "react-toastify";
import toasty from "../assets/images/toasty.png";
import { FEATURES, NETWORKS } from "./constants";

export const makeShortAddress = (address: string) => {
  const shortAddress = `${address.substr(0, 6).toString()}...${address
    .substr(address.length - 4, address.length)
    .toString()}`;
  return shortAddress;
};

export const isUndefined = (value: any): boolean => typeof value === "undefined";

export const getENS = async (address: string) => {
  const provider = ethers.getDefaultProvider(NETWORKS.mainnet.name, {
    infura: process.env.REACT_APP_INFURA_ID,
    alchemy: process.env.REACT_APP_ALCHEMY_KEY,
  });
  const ens = await provider.lookupAddress(address);
  if (ens) {
    return ens;
  }
  return null;
};

export const getAddressFromENS = async (ens: string) => {
  const provider = ethers.getDefaultProvider();
  const address = await provider.resolveName(ens);
  if (address) {
    return address;
  }
  return null;
};

export const getENSAvatar = async (resolver: ethers.providers.Resolver) => {
  const avatar = await resolver.getText("avatar");
  return avatar;
};

export const isValidAddress = async (address: string) => {
  try {
    const currentAddress = ethers.utils.getAddress(address);
    return currentAddress;
  } catch (error) {
    try {
      const tempProvider = ethers.getDefaultProvider("mainnet", {
        infura: process.env.REACT_APP_INFURA_ID,
        alchemy: process.env.REACT_APP_ALCHEMY_KEY,
      });
      const currentAddress = await tempProvider.resolveName(address);
      return currentAddress;
    } catch (e) {
      return null;
    }
  }
};

export const parseUint = (value: string) => {
  if (parseInt(value) < 0) {
    return "0";
  }
  return value;
};

export const toUSD = (amount: string, price: string) => parseFloat(amount) * parseFloat(price);

export const tsToDateString = (ts: number) => {
  const dt = new Date(ts * 1000);
  return dt.toLocaleDateString();
};

export const sendNotification = async (
  title: string,
  body: string,
  duration: number | false = 3000,
  fn: any = () => {},
  delay: number = 0,
  className: string = ""
) => {
  const toastConstant = (
    <div className="body">
      <img src={toasty} alt="toasty" className="toasty" />
      <h5>{title}</h5>
      <p>{body}</p>
    </div>
  );
  toast(toastConstant, {
    // @ts-ignore
    position: toast.POSITION.TOP_RIGHT,
    autoClose: duration,
    hideProgressBar: true,
    delay,
    className,
    onClose: () => {
      fn();
    },
  });
};

export const errorNotification = async (body: string) => {
  const title = "❌ Whoopsie!";
  sendNotification(title, body, 3000, () => {}, 0, "error");
};

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const notifyUser = async (tx: ethers.ContractTransaction, fn: any = () => {}) => {
  try {
    let notificationTitle = "⏰ Transaction Sent!";
    let notificationBody = "Plz wait for the transaction confirmation.";
    sendNotification(notificationTitle, notificationBody, false);
    await tx.wait(1);
    toast.dismiss();

    notificationTitle = "✔️ Transaction Confirmed!";
    notificationBody = "All set, please wait for another confirmation";
    sendNotification(notificationTitle, notificationBody, 3000, fn, 1000, "success");
    // In case the graph isn't updated on the first transaction, try to update on second transaction.
    await tx.wait(2);
    fn();
  } catch (error) {
    // catch error when vault screen changes in the middle of an update
  }
};

export const getRatio = async (
  collateral: string,
  collateralPrice: string,
  debt: string,
  tcapPrice: string
) => {
  const c = parseFloat(collateral);
  const cp = parseFloat(collateralPrice);
  const d = parseFloat(debt);
  const tp = parseFloat(tcapPrice);
  if (d === 0 || tp === 0) return 0;
  const ratio = (c * cp * 100) / (d * tp);
  return ratio;
};

export const getSafeMint = async (
  ratio: string,
  collateral: string,
  collateralPrice: string,
  tcapPrice: string,
  debt: string
) => {
  const r = parseFloat(ratio) + 50;
  const c = parseFloat(collateral);
  const cp = parseFloat(collateralPrice);
  const tp = parseFloat(tcapPrice);
  const d = parseFloat(debt);
  if (r === 0 || tp === 0) return 0;
  const safeMint = (c * cp * 100) / (r * tp);

  const result = safeMint - d;
  if (result < 0) {
    return 0;
  }
  return result;
};

export const getSafeRemoveCollateral = async (
  ratio: string,
  collateral: string,
  collateralPrice: string,
  tcapPrice: string,
  debt: string
) => {
  const r = parseFloat(ratio) + 50;
  const c = parseFloat(collateral);
  const cp = parseFloat(collateralPrice);
  const tp = parseFloat(tcapPrice);
  const d = parseFloat(debt);
  if (cp === 0) return 0;
  const n = (r * d * tp) / (cp * 100);

  const result = c - n;
  if (result < 0) {
    return 0;
  }
  return result;
};

export const getProposalStatus = (
  startBlock: number,
  endBlock: number,
  currentBlock: number,
  forVotes: number,
  againstVotes: number,
  quorumVotes: number,
  eta: number,
  gracePeriod: number
) => {
  const currentBlockTime = currentBlock * 13 * 1000;
  if (currentBlock <= startBlock) {
    return "PENDING";
  }
  if (currentBlock <= endBlock) {
    return "ACTIVE";
  }
  if (forVotes <= againstVotes || forVotes < quorumVotes) {
    return "DEFEATED";
  }
  if (eta === 0) {
    return "SUCCEEDED";
  }
  if (currentBlockTime >= eta + gracePeriod) {
    return "EXPIRED";
  }
  if (currentBlockTime >= eta) {
    return "READY";
  }
  return "QUEUED";
};

export const getPriceInUSDFromPair = (
  reserves0: ethers.BigNumber,
  reservesWETH: ethers.BigNumber,
  ethPrice: number
) => {
  const one = ethers.utils.parseEther("1");
  // if ((await pair.token1()) != WETH) {
  //   throw "UniswapV2Pair must be paired with WETH"; // Being lazy for now.
  // }

  // const reserves0 = resp[0];
  // const reservesWETH = resp[1];

  // amount of token0 required to by 1 WETH
  const amt = parseFloat(ethers.utils.formatEther(one.mul(reserves0).div(reservesWETH)));
  return ethPrice / amt;
};

export function toFragment(abi: JsonFragment[]): Fragment[] {
  const abiFragment = abi.map((item: JsonFragment) => utils.Fragment.from(item));

  if (abiFragment.length > 0 && abiFragment[abiFragment.length - 1] == null) {
    abiFragment.pop();
  }

  return abiFragment;
}

export const isValidNetwork = (chainId: number) => {
  const name = process.env.REACT_APP_NETWORK_NAME || "rinkeby";
  if (name === "mainnet") {
    return (
      chainId === NETWORKS.mainnet.chainId ||
      (FEATURES.OPTIMISM && chainId === NETWORKS.okovan.chainId) ||
      (FEATURES.POLYGON && chainId === NETWORKS.polygon.chainId)
    );
  }
  return (
    chainId === NETWORKS.rinkeby.chainId ||
    (FEATURES.OPTIMISM && chainId === NETWORKS.okovan.chainId) ||
    (FEATURES.POLYGON && chainId === NETWORKS.polygon.chainId)
  );
};

export const isInLayer1 = (chainId: number | undefined) => {
  if (!isUndefined(chainId)) {
    return chainId === NETWORKS.mainnet.chainId || chainId === NETWORKS.rinkeby.chainId;
  }
  return false;
};

export const getDefaultProvider = (chainId: number | undefined, name: string | undefined) => {
  let provider;
  if (chainId === NETWORKS.okovan.chainId) {
    provider = ethers.getDefaultProvider(process.env.REACT_APP_ALCHEMY_URL_OKOVAN);
  } else {
    const alchemyKey =
      chainId === NETWORKS.mainnet.chainId
        ? process.env.REACT_APP_ALCHEMY_KEY
        : process.env.REACT_APP_ALCHEMY_KEY_RINKEBY;
    provider = ethers.getDefaultProvider(name, {
      infura: process.env.REACT_APP_INFURA_ID,
      alchemy: alchemyKey,
    });
  }
  return provider;
};
