import React from "react";
import { Image, Badge } from "react-bootstrap";
import Davatar from "@davatar/react";
import ethereumImg from "../../assets/images/Ethereum-ETH-icon.png";

type badgeProps = {
  address: string;
  amount: string;
  label: string;
};

type imageProps = {
  address: string;
  image: string;
};

const etherscanUrl = () => {
  if (process.env.REACT_APP_NETWORK_NAME === "mainnet") {
    return "https://etherscan.io";
  }
  return "https://rinkeby.etherscan.io";
};

export const VoteBadge = ({ address, amount, label }: badgeProps) => (
  <Badge pill variant="highlight">
    <img src={ethereumImg} className="ethereum" alt="ethereum logo" />
    <a href={`${etherscanUrl()}/address/${address}`} target="_blank" rel="noreferrer">
      {amount} {label}
    </a>
  </Badge>
);

export const ProfileImage = ({ address, image }: imageProps) => (
  <>
    {image ? (
      <a
        href="/"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
        }}
      >
        <Image src={"images/".concat(image)} roundedCircle className="avatar" />
      </a>
    ) : (
      <a
        href="/"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
        }}
      >
        <Davatar size={25} address={address} generatedAvatarType="jazzicon" />
      </a>
    )}
  </>
);
