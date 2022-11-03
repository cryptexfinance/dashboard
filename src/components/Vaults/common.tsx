import { OraclePricesType, VaultsRatioType } from "./types";

export const getMinRatio = (ratios: VaultsRatioType, symbol: string, isHardVault: boolean) => {
  let minRatio = 200;
  switch (symbol) {
    case "ETH":
      minRatio = isHardVault ? ratios.hardEthRatio : ratios.ethRatio;
      break;
    case "WETH":
      minRatio = isHardVault ? ratios.hardWethRatio : ratios.ethRatio;
      break;
    case "DAI":
      minRatio = isHardVault ? ratios.hardDaiRatio : ratios.daiRatio;
      break;
    case "AAVE":
      minRatio = ratios.aaveRatio;
      break;
    case "LINK":
      minRatio = ratios.linkRatio;
      break;
    case "UNI":
      minRatio = ratios.uniRatio;
      break;
    case "SNX":
      minRatio = ratios.snxRatio;
      break;
    case "MATIC":
      minRatio = ratios.maticRatio;
      break;
    case "WBTC":
      minRatio = ratios.wbtcRatio;
      break;
    case "USDC":
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
    case "ETH":
      price = prices.wethOraclePrice;
      break;
    case "WETH":
      price = prices.wethOraclePrice;
      break;
    case "DAI":
      price = prices.daiOraclePrice;
      break;
    case "AAVE":
      price = prices.aaveOraclePrice;
      break;
    case "LINK":
      price = prices.linkOraclePrice;
      break;
    case "UNI":
      price = prices.uniOraclePrice;
      break;
    case "SNX":
      price = prices.snxOraclePrice;
      break;
    case "MATIC":
      price = prices.maticOraclePrice;
      break;
    case "WBTC":
      price = prices.wbtcOraclePrice;
      break;
    case "USDC":
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
