import React from "react";
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

export const numberFormat = new Intl.NumberFormat();

export const numberFormatStr = (value: string, decimals: number | undefined) => {
  if (decimals) {
    return numberFormat.format(parseFloat(parseFloat(value).toFixed(decimals)));
  }
  return numberFormat.format(parseFloat(value));
};
