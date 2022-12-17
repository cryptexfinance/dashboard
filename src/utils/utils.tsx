import React from "react";
import { BigNumber, ethers, utils } from "ethers";
import { Fragment, JsonFragment } from "@ethersproject/abi";
import { toast } from "react-toastify";
import successImg from "../assets/images/noti-success.png";
import errorImg from "../assets/images/noti-error.png";
import { FEATURES, NETWORKS } from "./constants";
import { IHardVaultsContext, IOraclesContext, IVaultsContext } from "../state";

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

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
      {className === "error" ? (
        <img src={errorImg} alt="toasty" className="toasty" />
      ) : (
        <img src={successImg} alt="toasty" className="toasty" />
      )}
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

export const getRatio2 = (
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
  debt: string,
  isHardMode: boolean
) => {
  const r = parseFloat(ratio) + (isHardMode ? 20 : 50);
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
  debt: string,
  isHardMode: boolean
) => {
  const r = parseFloat(ratio) + (isHardMode ? 20 : 50);
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
  if (name.toLowerCase() === "mainnet") {
    return (
      chainId === NETWORKS.mainnet.chainId ||
      chainId === NETWORKS.arbitrum.chainId ||
      (FEATURES.OPTIMISM && chainId === NETWORKS.optimism.chainId) ||
      (FEATURES.POLYGON && chainId === NETWORKS.polygon.chainId)
    );
  }
  return (
    chainId === NETWORKS.goerli.chainId ||
    chainId === NETWORKS.arbitrum_goerli.chainId ||
    (FEATURES.OPTIMISM && chainId === NETWORKS.okovan.chainId) ||
    (FEATURES.POLYGON && chainId === NETWORKS.mumbai.chainId)
  );
};

export const isInLayer1 = (chainId: number | undefined) => {
  if (!isUndefined(chainId)) {
    return chainId === NETWORKS.mainnet.chainId || chainId === NETWORKS.goerli.chainId;
  }
  return false;
};

export const isArbitrum = (chainId: number | undefined) => {
  if (!isUndefined(chainId)) {
    return chainId === NETWORKS.arbitrum.chainId || chainId === NETWORKS.arbitrum_goerli.chainId;
  }
  return false;
};

export const isOptimism = (chainId: number | undefined) => {
  if (!isUndefined(chainId)) {
    return chainId === NETWORKS.optimism.chainId || chainId === NETWORKS.okovan.chainId;
  }
  return false;
};

export const isPolygon = (chainId: number | undefined) => {
  if (!isUndefined(chainId)) {
    return chainId === NETWORKS.polygon.chainId || chainId === NETWORKS.mumbai.chainId;
  }
  return false;
};

export const isGoerli = (chainId: number | undefined) => {
  if (!isUndefined(chainId)) {
    return chainId === NETWORKS.goerli.chainId;
  }
  return false;
};

export const getDefaultProvider = (chainId: number | undefined) => {
  let provider;
  if (chainId === NETWORKS.okovan.chainId) {
    provider = ethers.getDefaultProvider(process.env.REACT_APP_ALCHEMY_URL_OKOVAN);
  } else if (chainId === NETWORKS.optimism.chainId) {
    // provider = ethers.getDefaultProvider(process.env.REACT_APP_ALCHEMY_URL_OPTIMISM);
    provider = ethers.getDefaultProvider(NETWORKS.optimism.infuraRpcUrl);
  } else {
    let alchemyKey;
    switch (chainId) {
      case NETWORKS.mainnet.chainId:
        alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
        break;
      case NETWORKS.goerli.chainId:
        alchemyKey = process.env.REACT_APP_ALCHEMY_KEY_GOERLI;
        break;
      case NETWORKS.polygon.chainId:
        alchemyKey = process.env.REACT_APP_ALCHEMY_KEY_POLYGON;
        break;
      case NETWORKS.mumbai.chainId:
        alchemyKey = process.env.REACT_APP_ALCHEMY_KEY_MUMBAI;
        break;
      default:
        alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
        break;
    }
    provider = ethers.getDefaultProvider(chainId, {
      infura: process.env.REACT_APP_INFURA_ID,
      alchemy: alchemyKey,
    });
  }
  return provider;
};

export const validOracles = (chainId: number, oracles: IOraclesContext): boolean => {
  let valid = !isUndefined(oracles.daiOracleRead) && !isUndefined(oracles.tcapOracleRead);

  if (isInLayer1(chainId)) {
    valid =
      valid &&
      !isUndefined(oracles.wethOracleRead) &&
      !isUndefined(oracles.aaveOracleRead) &&
      !isUndefined(oracles.linkOracleRead) &&
      !isUndefined(oracles.usdcOracleRead) &&
      !isUndefined(oracles.wbtcOracleRead);
  }
  if (isOptimism(chainId)) {
    valid =
      valid &&
      !isUndefined(oracles.wethOracleRead) &&
      !isUndefined(oracles.linkOracleRead) &&
      !isUndefined(oracles.snxOracleRead) &&
      !isUndefined(oracles.uniOracleRead);
  }

  if (isPolygon(chainId)) {
    valid = valid && !isUndefined(oracles.maticOracle) && !isUndefined(oracles.maticOracleRead);
  }
  return valid;
};

export const validVaults = (chainId: number, vaults: IVaultsContext): boolean => {
  let valid = !isUndefined(vaults.daiVaultRead);

  if (isInLayer1(chainId)) {
    valid =
      valid &&
      !isUndefined(vaults.wethVaultRead) &&
      !isUndefined(vaults.aaveVaultRead) &&
      !isUndefined(vaults.linkVaultRead) &&
      !isUndefined(vaults.wbtcVaultRead);
  }
  if (isOptimism(chainId)) {
    valid =
      valid &&
      !isUndefined(vaults.wethVaultRead) &&
      !isUndefined(vaults.linkVaultRead) &&
      !isUndefined(vaults.snxVaultRead) &&
      !isUndefined(vaults.uniVaultRead);
  }

  if (isPolygon(chainId)) {
    valid = valid && !isUndefined(vaults.maticVaultRead) && !isUndefined(vaults.wbtcVaultRead);
  }
  return valid;
};

export const validHardVaults = (chainId: number, hardVaults: IHardVaultsContext): boolean => {
  let valid = true;
  if (isInLayer1(chainId)) {
    valid =
      valid &&
      !isUndefined(hardVaults.wethVaultRead) &&
      !isUndefined(hardVaults.daiVaultRead) &&
      !isUndefined(hardVaults.wbtcVaultRead) &&
      !isUndefined(hardVaults.usdcVaultRead);
  }
  return valid;
};

export const numberFormatStr = (
  value: string,
  minDecimals: number | undefined,
  maxDecimals: number | undefined
) => {
  if (parseFloat(value) < 103849213185522) {
    const numberFormat = new Intl.NumberFormat([], {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });
    if (minDecimals) {
      return numberFormat.format(parseFloat(parseFloat(value).toFixed(maxDecimals)));
    }
    return numberFormat.format(parseFloat(value));
  }
  return Number.parseFloat(value).toExponential(minDecimals);
};

// token0 = TCAP, and token1 = WETH
export const calculateCumulativePrice = (
  tickCumulative0: BigNumber,
  tickCumulative1: BigNumber,
  timeElapsed: number
): number => {
  const difference = tickCumulative1.sub(tickCumulative0);
  const tickReading = difference.div(BigNumber.from(timeElapsed));
  // p(i) = 1.0001**i
  const price = 1.0001 ** tickReading.toNumber();

  return price;
};
