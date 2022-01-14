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
  size: number;
};

const etherscanUrl = () => {
  if (process.env.REACT_APP_NETWORK_ID === "1") {
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

export const ProfileImage = ({ address, image, size }: imageProps) => (
  <>
    {image ? (
      <a
        href="/"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
        }}
      >
        <Image src={image} roundedCircle className="avatar" />
      </a>
    ) : (
      <a
        href="/"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
        }}
      >
        <Davatar size={size} address={address} generatedAvatarType="jazzicon" />
      </a>
    )}
  </>
);
