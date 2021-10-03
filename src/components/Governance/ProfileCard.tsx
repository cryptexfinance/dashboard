import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button, Card, Badge } from "react-bootstrap";
import Col from "react-bootstrap/esm/Col";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { useMediaQuery } from "@react-hook/media-query";
import "../../styles/delegators.scss";
import { makeShortAddress } from "../../utils/utils";
import ethereumImg from "../../assets/images/Ethereum-ETH-icon.png";
import discordImg from "../../assets/images/discord-icon.jpg";
import twitterImg from "../../assets/images/twitter.svg";
import tallyImg from "../../assets/images/tally.png";
import SignerContext from "../../state/SignerContext";
import { VoteBadge, ProfileImage } from "./common";
import { ReactComponent as CtxIcon } from "../../assets/images/ctx-coin.svg";
import { infoType } from "./data";

type props = {
  delegator: {
    id: string;
    delegatee: string;
    delegatedVotes: string;
    delegatedVotesRaw: string;
    tokenOwners: { stake: string; stakeRaw: string }[];
    totalHoldersRepresented: Number;
  };
  info: infoType;
  openDelegate: (currentDelegator: string) => void;
  openWithdraw: (currentDelegator: string, ownerStake: string) => void;
  action: string;
};

const ProfileCardWider2 = ({ delegator, info, openDelegate, openWithdraw, action }: props) => {
  const [shortAddress, setShortAddress] = useState("");
  const [actionText, setActionText] = useState("");
  const [briefLength, setBriefLength] = useState(239);
  const [tokenOwnerStake, setTokenOwnerStake] = useState<{ stake: string; stakeRaw: string }>();
  const signer = useContext(SignerContext);
  const mediaQuery = useMediaQuery("only screen and (max-height: 850px)");

  const edit = async () => {
    window.open(`https://app.ens.domains/address/${delegator.delegatee}`, "_blank");
  };

  const etherscanUrl = () => {
    if (process.env.REACT_APP_NETWORK_NAME === "mainnet") {
      return "https://etherscan.io";
    }
    return "https://rinkeby.etherscan.io";
  };

  // @ts-ignore
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    async function getProvider() {
      if (mediaQuery) {
        setBriefLength(143);
      }
      const provider = ethers.getDefaultProvider();
      const ens = await provider.lookupAddress(delegator.delegatee);
      setShortAddress(makeShortAddress(delegator.delegatee));
      if (delegator.tokenOwners && delegator.tokenOwners.length > 0) {
        setTokenOwnerStake(delegator.tokenOwners[0]);
      }
      if (ens) {
        const resolver = await provider.getResolver(ens);
        let twitterEns = await resolver.getText("com.twitter");
        let descriptionEns = await resolver.getText("keywords");
        let githubEns = await resolver.getText("com.github");

        if (!twitterEns) {
          twitterEns = await resolver.getText("vnd.twitter");
        }
        if (!githubEns) {
          githubEns = await resolver.getText("vnd.github");
        }
        if (!descriptionEns) {
          descriptionEns = await resolver.getText("description");
        }
      }
      //  Set actions
      if (action === "delegate") {
        setActionText("Stake & Delegate");
      } else {
        setActionText("Edit in ENS");
      }
    }

    await getProvider();
  }, [delegator, action, mediaQuery]);

  const onRemoveClick = async () => {
    if (tokenOwnerStake) {
      openWithdraw(delegator.id, tokenOwnerStake.stake);
    }
  };

  const ethNameFormat = () => {
    if (info?.eth_name.includes(".eth")) {
      return info?.eth_name;
    }
    return makeShortAddress(info?.eth_name);
  };

  const whyBrief = (): string => {
    if (info) {
      if (info.why.length <= briefLength) {
        return info.why;
      }
      return info.why.slice(0, briefLength);
    }
    return "";
  };

  return (
    <Card>
      <div className="diamond" />
      <Card.Body>
        <ProfileImage address={delegator.delegatee} image={info?.image} />
        <Col md={12} lg={12} className="content">
          <Card.Title className="pb-2">
            <div className="title-names">
              <h5 className="mt-2">{info && info.name}</h5>
              <a
                href={`${etherscanUrl()}/address/${delegator.delegatee}`}
                target="_blank"
                rel="noreferrer"
              >
                {ethNameFormat()}
              </a>
            </div>
          </Card.Title>
          <div className="why">
            <div className="why-title">
              <h5 className="mt-2">Why me?</h5>
            </div>
            <OverlayTrigger
              key="bottom"
              placement="bottom"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="ttip-current-reward" className="farm-tooltip">
                  {info.why}
                </Tooltip>
              }
            >
              <p>
                {whyBrief()}
                {info.why.length > briefLength && <span className="continue">...</span>}
              </p>
            </OverlayTrigger>
          </div>
          <div className="columns">
            <Col md={12} lg={12} className="content-col1">
              <div>
                <h5 className="mt-2">Expertise</h5>
                <p>{info?.expertise.join(", ")}</p>
              </div>
            </Col>
          </div>
        </Col>
        <div className="badges-container">
          <div className="badges-container2">
            {shortAddress && (
              <>
                <VoteBadge address={delegator.id} amount={delegator.delegatedVotes} label="Votes" />
                <VoteBadge
                  address={delegator.id}
                  amount={delegator.totalHoldersRepresented.toString()}
                  label="Represented"
                />
                {tokenOwnerStake && (
                  <Badge variant="highlight">
                    <CtxIcon className="tcap-neon" />
                    <span className="staked-label">{tokenOwnerStake.stake} Staked</span>
                  </Badge>
                )}
                <Badge variant="highlight">
                  <img src={tallyImg} className="tally" alt="tally logo" />
                  <a
                    href={`https://www.withtally.com/voter/${delegator.delegatee}/governance/cryptex`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    History
                  </a>
                </Badge>
                <Badge variant="highlight">
                  <img src={ethereumImg} className="ethereum" alt="ethereum logo" />
                  <a
                    href={`${etherscanUrl()}/address/${delegator.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {makeShortAddress(delegator.id)}
                  </a>
                </Badge>
              </>
            )}
            <div className="accounts">
              {info.discord && (
                <Badge pill variant="highlight">
                  <img src={discordImg} className="discord" alt="discord logo" />
                  {info.discord}
                </Badge>
              )}
              {info.twitter && (
                <Badge pill variant="highlight">
                  <img src={twitterImg} className="twitter" alt="twitter logo" />
                  {info.twitter}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
      <Card.Footer>
        {signer.signer && (
          <div className="buttons-container">
            {tokenOwnerStake && (
              <Col md={6} lg={6}>
                <Button variant="pink" className="mt-3 mb-4 w-100" onClick={onRemoveClick}>
                  Withdraw
                </Button>
              </Col>
            )}
            <Col md={tokenOwnerStake ? 6 : 12} lg={tokenOwnerStake ? 6 : 12}>
              <Button
                variant="pink"
                className="mt-3 mb-4 w-100"
                onClick={async () => {
                  if (action === "delegate") {
                    openDelegate(delegator.id);
                  } else {
                    await edit();
                  }
                }}
              >
                {actionText}
              </Button>
            </Col>
          </div>
        )}
      </Card.Footer>
    </Card>
  );
};

export default ProfileCardWider2;
