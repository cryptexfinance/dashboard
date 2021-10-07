import React, { useContext, useEffect, useState } from "react";
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
import GovernanceContext from "../../state/GovernanceContext";
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
  openWithdraw: (currentDelegator: string, ownerStake: string, withdrawTime: number) => void;
  addWithdrawTime: (waitingTime: number) => void;
  action: string;
};

const ProfileCard = ({
  delegator,
  info,
  openDelegate,
  openWithdraw,
  addWithdrawTime,
  action,
}: props) => {
  const [shortAddress, setShortAddress] = useState("");
  const [actionText, setActionText] = useState("");
  const [briefLength, setBriefLength] = useState(239);
  const [tokenOwnerStake, setTokenOwnerStake] = useState<{ stake: string; stakeRaw: string }>();
  const [withdrawTime, setWithdrawTime] = useState(0);
  const signer = useContext(SignerContext);
  const governance = useContext(GovernanceContext);
  const mediaQuery = useMediaQuery("only screen and (max-height: 850px)");

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
      setShortAddress(makeShortAddress(delegator.delegatee));
      if (delegator.tokenOwners && delegator.tokenOwners.length > 0) {
        setTokenOwnerStake(delegator.tokenOwners[0]);

        if (signer.signer) {
          const currentSignerAddress = await signer.signer.getAddress();
          const currentWaitTimeCall = await governance.delegatorFactoryRead?.stakerWaitTime(
            currentSignerAddress,
            delegator.id
          );
          // @ts-ignore
          const [currentWaitTime] = await signer.ethcallProvider?.all([currentWaitTimeCall]);
          setWithdrawTime(parseInt(currentWaitTime.toString()));
          addWithdrawTime(parseInt(currentWaitTime.toString()) * 1000);
        }
      }
      //  Set actions
      if (action === "delegate") {
        setActionText("Stake & Delegate");
      } else {
        setActionText("Stake & Delegate");
      }
    }

    await getProvider();
  }, [signer, action, delegator, governance, mediaQuery, addWithdrawTime]);

  const onRemoveClick = async () => {
    if (tokenOwnerStake) {
      openWithdraw(delegator.id, tokenOwnerStake.stake, withdrawTime);
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

  const whyHtml = (why: string) => {
    const whyArray = why.split("\n\n");
    return (
      <>
        {whyArray.map((parragraph, index) => (
          <p key={index.toString()}>{parragraph}</p>
        ))}
      </>
    );
  };

  const copyDiscordToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    // Create new element
    const el = document.createElement("textarea");
    // Set value (string to be copied)
    el.value = info.discord;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute("readonly", "");
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand("copy");
    // Remove temporary element
    document.body.removeChild(el);
  };

  const round2 = (num: number): number => {
    const m = Number((Math.abs(num) * 100).toPrecision(15));
    return (Math.round(m) / 100) * Math.sign(num);
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
          <div className="badges-container">
            <div className="badges-container2">
              {shortAddress && (
                <>
                  {tokenOwnerStake && (
                    <Badge variant="highlight">
                      <CtxIcon className="tcap-neon" />
                      <span className="staked-label">
                        {round2(parseFloat(tokenOwnerStake.stake))} Staked
                      </span>
                    </Badge>
                  )}
                  <VoteBadge
                    address={delegator.id}
                    amount={Math.round(parseFloat(delegator.delegatedVotes)).toString()}
                    label="Votes"
                  />
                  <VoteBadge
                    address={delegator.id}
                    amount={delegator.totalHoldersRepresented.toString()}
                    label="Represented"
                  />
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
                      Contract
                    </a>
                  </Badge>
                </>
              )}
              <div className="accounts">
                {info.discord && (
                  <OverlayTrigger
                    key="bottom"
                    placement="bottom"
                    overlay={<Tooltip id="tooltip-bottom">Click to Copy</Tooltip>}
                  >
                    <Badge pill variant="highlight">
                      <img src={discordImg} className="discord" alt="discord logo" />
                      <a href="/" onClick={copyDiscordToClipboard} className="address">
                        {info.discord}
                      </a>
                    </Badge>
                  </OverlayTrigger>
                )}
                {info.twitter && (
                  <Badge pill variant="highlight">
                    <img src={twitterImg} className="twitter" alt="twitter logo" />
                    <a
                      href={`https://twitter.com/${info.twitter}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {info.twitter}
                    </a>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="why">
            <div className="why-title">
              <h5 className="mt-2">Why me?</h5>
            </div>
            <OverlayTrigger
              key="auto"
              placement="auto"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="tooltip-right" className="farm-tooltip">
                  {whyHtml(info.why)}
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
                  openDelegate(delegator.id);
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

export default ProfileCard;
