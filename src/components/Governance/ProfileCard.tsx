import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button, Card, Badge } from "react-bootstrap";
import "../../styles/delegators.scss";
import { makeShortAddress } from "../../utils/utils";
import ethereumImg from "../../assets/images/Ethereum-ETH-icon.png";
import SignerContext from "../../state/SignerContext";
import Profile from "./Profile";
import { VoteBadge, ProfileImage } from "./common";
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

const ProfileCard = ({ delegator, info, openDelegate, openWithdraw, action }: props) => {
  const [shortAddress, setShortAddress] = useState("");
  const [actionText, setActionText] = useState("");
  const [tokenOwnerStake, setTokenOwnerStake] = useState<{ stake: string; stakeRaw: string }>();
  const signer = useContext(SignerContext);
  const [showProfile, setShowProfile] = useState(false);

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
        setActionText("Delegate");
      } else {
        setActionText("Edit in ENS");
      }
    }

    await getProvider();
  }, [delegator, action]);

  const onRemoveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (tokenOwnerStake) {
      openWithdraw(delegator.id, tokenOwnerStake.stake);
    }
  };

  const onClickShowFull = async (e: React.MouseEvent) => {
    e.preventDefault();
    setShowProfile(true);
  };

  const ethNameFormat = () => {
    if (info?.eth_name.includes(".eth")) {
      return info?.eth_name;
    }
    return makeShortAddress(info?.eth_name);
  };

  const whyBrief = (): string => {
    if (info) {
      if (info.why.length <= 49) {
        return info.why;
      }
      return info.why.slice(0, 50).concat("...");
    }
    return "";
  };

  return (
    <Card>
      <div className="diamond" />
      <Card.Body>
        <ProfileImage
          address={delegator.delegatee}
          image={info?.image}
          setShow={() => setShowProfile(true)}
        />
        <Card.Title className="pb-2">
          <a href="/" onClick={onClickShowFull}>
            <h5 className="mt-2">{info && info.name}</h5>
          </a>
          <a
            href={`${etherscanUrl()}/address/${delegator.delegatee}`}
            target="_blank"
            rel="noreferrer"
          >
            {ethNameFormat()}
          </a>
        </Card.Title>
        <div>
          <a href="/" onClick={onClickShowFull}>
            <Card.Text>{whyBrief()}</Card.Text>
          </a>
        </div>{" "}
        <div>
          <h5>Voting</h5>
          {shortAddress && (
            <>
              <VoteBadge address={delegator.id} amount={delegator.delegatedVotes} label="Votes" />
              <VoteBadge
                address={delegator.id}
                amount={delegator.totalHoldersRepresented.toString()}
                label="Represented"
              />
            </>
          )}
        </div>
        <div>
          <h5 className="mt-2">Delegator Contract</h5>
          <Badge variant="highlight">
            <img src={ethereumImg} className="ethereum" alt="ethereum logo" />
            <a href={`${etherscanUrl()}/address/${delegator.id}`} target="_blank" rel="noreferrer">
              {makeShortAddress(delegator.id)}
            </a>
          </Badge>
        </div>
        {tokenOwnerStake && (
          <div className="holder-stake">
            <h5 className="mt-2">Staked</h5>
            <div className="holder-stake-content">
              <Badge variant="highlight">
                <img src={ethereumImg} className="ethereum" alt="ethereum logo" />{" "}
                {tokenOwnerStake.stake} CTX
              </Badge>
              <div className="remove">
                <a href="/" onClick={onRemoveClick}>
                  REMOVE
                </a>
              </div>
            </div>
          </div>
        )}
        {signer.signer && (
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
        )}
      </Card.Body>
      <Profile
        delegator={delegator}
        info={info}
        show={showProfile}
        onHide={() => setShowProfile(false)}
      />
    </Card>
  );
};

export default ProfileCard;
