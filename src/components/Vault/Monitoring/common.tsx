import React from "react";
import { VaultsType } from "./types";
import { ReactComponent as WETHIcon } from "../../../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../../../assets/images/graph/DAI.svg";
import { ReactComponent as AAVEIcon } from "../../../assets/images/graph/aave.svg";
import { ReactComponent as LINKIcon } from "../../../assets/images/graph/chainlink.svg";
import { ReactComponent as UNIIcon } from "../../../assets/images/graph/uni.svg";
import { ReactComponent as SNXIcon } from "../../../assets/images/graph/snx.svg";
import { ReactComponent as MATICIcon } from "../../../assets/images/graph/polygon.svg";
import { ReactComponent as WBTCIcon } from "../../../assets/images/graph/wbtc.svg";

type iconProps = {
  name: string;
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const CollateralIcon = ({ name }: iconProps) => {
  switch (name) {
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
    default:
      return <></>;
  }
};

export const numberFormatStr = (
  value: string,
  minDecimals: number | undefined,
  maxDecimals: number | undefined
) => {
  const numberFormat = new Intl.NumberFormat([], {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
  if (minDecimals) {
    return numberFormat.format(parseFloat(parseFloat(value).toFixed(maxDecimals)));
  }
  return numberFormat.format(parseFloat(value));
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

export const sortRewardAsc = (a: VaultsType, b: VaultsType) => a.ratio - b.ratio;

export const sortRewardDesc = (a: VaultsType, b: VaultsType) => a.ratio - b.ratio;
