import React from "react";
import { TOKENS_SYMBOLS } from "../../utils/constants";
import { OraclePricesType, VaultsRatioType, VaultsType } from "./types";
import { ReactComponent as WETHIcon } from "../../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../../assets/images/graph/DAI.svg";
import { ReactComponent as AAVEIcon } from "../../assets/images/graph/aave.svg";
import { ReactComponent as LINKIcon } from "../../assets/images/graph/chainlink.svg";
import { ReactComponent as UNIIcon } from "../../assets/images/graph/uni.svg";
import { ReactComponent as SNXIcon } from "../../assets/images/graph/snx.svg";
import { ReactComponent as MATICIcon } from "../../assets/images/graph/polygon.svg";
import { ReactComponent as USDCIcon } from "../../assets/images/graph/usdc.svg";
import { ReactComponent as WBTCIcon } from "../../assets/images/graph/wbtc.svg";
import { ReactComponent as WETHIconSmall } from "../../assets/images/vault/eth.svg";
import { ReactComponent as DAIIconSmall } from "../../assets/images/vault/dai.svg";
import { ReactComponent as AAVEIconSmall } from "../../assets/images/vault/aave.svg";
import { ReactComponent as LINKIconSmall } from "../../assets/images/vault/chainlink.svg";
import { ReactComponent as UNIIconSmall } from "../../assets/images/vault/uni.svg";
import { ReactComponent as SNXIconSmall } from "../../assets/images/vault/snx2.svg";
import { ReactComponent as MATICIconSmall } from "../../assets/images/vault/polygon.svg";
import { ReactComponent as WBTCIconSmall } from "../../assets/images/vault/bitcoin.svg";
import { ReactComponent as USDCIconSmall } from "../../assets/images/vault/usdc.svg";
import { ReactComponent as TCAPIcon } from "../../assets/images/tcap-coin.svg";

type iconProps = {
  name: string;
};

export const MAINNET_COLLATERALS = [
  TOKENS_SYMBOLS.ETH,
  TOKENS_SYMBOLS.WETH,
  TOKENS_SYMBOLS.DAI,
  TOKENS_SYMBOLS.AAVE,
  TOKENS_SYMBOLS.LINK,
];

export const MAINNET_HARD_COLLATERALS = [
  TOKENS_SYMBOLS.ETH,
  TOKENS_SYMBOLS.WETH,
  TOKENS_SYMBOLS.DAI,
  TOKENS_SYMBOLS.USDC,
  TOKENS_SYMBOLS.WBTC,
];

export const ARBITRUM_COLLATERALS = [TOKENS_SYMBOLS.ETH, TOKENS_SYMBOLS.WETH, TOKENS_SYMBOLS.DAI];

export const OPTIMISM_COLLATERALS = [
  TOKENS_SYMBOLS.ETH,
  TOKENS_SYMBOLS.DAI,
  TOKENS_SYMBOLS.LINK,
  TOKENS_SYMBOLS.UNI,
  TOKENS_SYMBOLS.SNX,
];

export const getMinRatio = (ratios: VaultsRatioType, symbol: string, isHardVault: boolean) => {
  let minRatio = 200;
  switch (symbol) {
    case TOKENS_SYMBOLS.ETH:
      minRatio = isHardVault ? ratios.hardEthRatio : ratios.ethRatio;
      break;
    case TOKENS_SYMBOLS.WETH:
      minRatio = isHardVault ? ratios.hardWethRatio : ratios.ethRatio;
      break;
    case TOKENS_SYMBOLS.DAI:
      minRatio = isHardVault ? ratios.hardDaiRatio : ratios.daiRatio;
      break;
    case TOKENS_SYMBOLS.AAVE:
      minRatio = ratios.aaveRatio;
      break;
    case TOKENS_SYMBOLS.LINK:
      minRatio = ratios.linkRatio;
      break;
    case TOKENS_SYMBOLS.UNI:
      minRatio = ratios.uniRatio;
      break;
    case TOKENS_SYMBOLS.SNX:
      minRatio = ratios.snxRatio;
      break;
    case TOKENS_SYMBOLS.MATIC:
      minRatio = ratios.maticRatio;
      break;
    case TOKENS_SYMBOLS.WBTC:
      minRatio = ratios.wbtcRatio;
      break;
    case TOKENS_SYMBOLS.USDC:
      minRatio = ratios.hardUsdcRatio;
      break;
    default:
      break;
  }

  return minRatio;
};

export const getCollateralPrice = (prices: OraclePricesType, symbol: string) => {
  let price = "0";
  switch (symbol) {
    case TOKENS_SYMBOLS.ETH:
      price = prices.wethOraclePrice;
      break;
    case TOKENS_SYMBOLS.WETH:
      price = prices.wethOraclePrice;
      break;
    case TOKENS_SYMBOLS.DAI:
      price = prices.daiOraclePrice;
      break;
    case TOKENS_SYMBOLS.AAVE:
      price = prices.aaveOraclePrice;
      break;
    case TOKENS_SYMBOLS.LINK:
      price = prices.linkOraclePrice;
      break;
    case TOKENS_SYMBOLS.UNI:
      price = prices.uniOraclePrice;
      break;
    case TOKENS_SYMBOLS.SNX:
      price = prices.snxOraclePrice;
      break;
    case TOKENS_SYMBOLS.MATIC:
      price = prices.maticOraclePrice;
      break;
    case TOKENS_SYMBOLS.WBTC:
      price = prices.wbtcOraclePrice;
      break;
    case TOKENS_SYMBOLS.USDC:
      price = prices.usdcOraclePrice;
      break;
    default:
      break;
  }
  return price;
};

export const VAULT_STATUS = {
  empty: "empty",
  ready: "ready",
  active: "active",
  liquidation: "liquidation",
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const TokenIcon = ({ name }: iconProps) => {
  switch (name.toLowerCase()) {
    case "eth":
      return <WETHIcon className="eth" />;
    case "weth":
      return <WETHIcon className="eth" />;
    case "dai":
      return <DAIIcon className="dai" />;
    case "aave":
      return <AAVEIcon className="aave" />;
    case "link":
      return <LINKIcon className="link" />;
    case "uni":
      return <UNIIcon className="uni" />;
    case "snx":
      return <SNXIcon className="snx" />;
    case "matic":
      return <MATICIcon className="matic" />;
    case "wbtc":
      return <WBTCIcon className="wbtc" />;
    case "tcap":
      return <TCAPIcon className="tcap" />;
    case "usdc":
      return <USDCIcon className="usdc" />;
    default:
      return <></>;
  }
};

export const TokenIconSmall = ({ name }: iconProps) => {
  switch (name.toLowerCase()) {
    case "eth":
      return <WETHIconSmall className="eth small" />;
    case "weth":
      return <WETHIconSmall className="eth small" />;
    case "dai":
      return <DAIIconSmall className="dai small" />;
    case "aave":
      return <AAVEIconSmall className="aave small" />;
    case "link":
      return <LINKIconSmall className="link small" />;
    case "uni":
      return <UNIIconSmall className="uni small" />;
    case "snx":
      return <SNXIconSmall className="snx small" />;
    case "matic":
      return <MATICIconSmall className="matic small" />;
    case "wbtc":
      return <WBTCIconSmall className="wbtc small" />;
    case "tcap":
      return <TCAPIcon className="tcap small" />;
    case "usdc":
      return <USDCIconSmall className="eth small" />;
    default:
      return <></>;
  }
};

export const findNewMainnetVaultCollateral = (collaterals: Array<string>): [string, boolean] => {
  let diff = MAINNET_HARD_COLLATERALS.filter((x) => !collaterals.includes(x));
  let isHardVault = true;
  if (diff.length === 0) {
    diff = MAINNET_COLLATERALS.filter((x) => !collaterals.includes(x));
    if (diff.length === 0) {
      return ["ETH", isHardVault];
    }
    isHardVault = false;
  }
  return [diff[0], isHardVault];
};

export const findNewOptimismVaultCollateral = (collaterals: Array<string>): string => {
  const diff = OPTIMISM_COLLATERALS.filter((x) => !collaterals.includes(x));
  if (diff.length === 0) {
    return "ETH";
  }
  return diff[0];
};

export const findNewArbitrumVaultCollateral = (collaterals: Array<string>): string => {
  const diff = ARBITRUM_COLLATERALS.filter((x) => !collaterals.includes(x));
  if (diff.length === 0) {
    return "ETH";
  }

  return diff[0];
};

export const sortCollateralAsc = (a: VaultsType, b: VaultsType) =>
  parseFloat(a.collateralValue) - parseFloat(b.collateralValue);

export const sortCollateralDesc = (a: VaultsType, b: VaultsType) =>
  parseFloat(b.collateralValue) - parseFloat(a.collateralValue);

export const sortCollateralUsdAsc = (a: VaultsType, b: VaultsType) =>
  parseFloat(a.collateralUsd) - parseFloat(b.collateralUsd);

export const sortCollateralUsdDesc = (a: VaultsType, b: VaultsType) =>
  parseFloat(b.collateralUsd) - parseFloat(a.collateralUsd);

export const sortDebtAsc = (a: VaultsType, b: VaultsType) =>
  parseFloat(a.collateralValue) - parseFloat(b.collateralValue);

export const sortDebtDesc = (a: VaultsType, b: VaultsType) =>
  parseFloat(b.debt) - parseFloat(a.debt);

export const sortRatioAsc = (a: VaultsType, b: VaultsType) => a.ratio - b.ratio;

export const sortRatioDesc = (a: VaultsType, b: VaultsType) => b.ratio - a.ratio;

export const sortRewardAsc = (a: VaultsType, b: VaultsType) => a.netReward - b.netReward;

export const sortRewardDesc = (a: VaultsType, b: VaultsType) => b.netReward - a.netReward;
