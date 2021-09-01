import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import Table from "react-bootstrap/esm/Table";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
import { ethers } from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import GovernanceContext from "../state/GovernanceContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { makeShortAddress, getProposalStatus, notifyUser, errorNotification } from "../utils/utils";
import "../styles/governance.scss";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";
import Loading from "./Loading";
import { NewProposal } from "./modals/NewProposal";
import { Delegate } from "./modals/Delegate";
import { Vote } from "./modals/Vote";

const Governance = () => {
  const [address, setAddress] = useState("");
  const [ctxBalance, setCtxBalance] = useState("0");
  const [currentVotes, setCurrentVotes] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);
  const governance = useContext(GovernanceContext);
  const [noDelegate, setNoDelegate] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [newProposalShow, setNewProposalShow] = useState(false);
  const [delegateShow, setDelegateShow] = useState(false);
  const [proposerThreshold, setProposerThreshold] = useState("0");
  const [quorumVotes, setQuorumVotes] = useState("0");
  const [currentBlock, setCurrentBlock] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [gracePeriod, setGracePeriod] = useState(0);

  // Vote Modal
  const [voteShow, setVoteShow] = useState(false);
  const [voteProposal, setVoteProposal] = useState<any>();
  const [voteFor, setVoteFor] = useState(0);
  const [voteAgainst, setVoteAgainst] = useState(0);
  const [voteEndTime, setVoteEndTime] = useState("");
  const [voteStatus, setVoteStatus] = useState("");

  const etherscanURL = process?.env?.REACT_APP_ETHERSCAN;

  function clickVote(
    proposal: any,
    forVote: number,
    against: number,
    endTime: string,
    status: string
  ) {
    setVoteProposal(proposal);
    setVoteFor(forVote);
    setVoteAgainst(against);
    setVoteEndTime(endTime);
    setVoteStatus(status);
    setVoteShow(true);
  }

  const PROPOSALS = gql`
    query {
      proposals(orderBy: id, orderDirection: desc) {
        id
        proposer {
          id
        }
        targets
        values
        signatures
        calldatas
        status
        description
        startBlock
        endBlock
        executionETA
        votes {
          id
          support
          votes
        }
      }
    }
  `;

  const { data } = useQuery(PROPOSALS);

  const refresh = async () => {
    try {
      if (signer.signer && tokens.tcapToken && oracles.tcapOracle && tokens.ctxToken) {
        const currentAddress = await signer.signer.getAddress();
        const delegateAddress = await tokens.ctxToken.delegates(currentAddress);
        if (delegateAddress === ethers.constants.AddressZero) {
          setNoDelegate(true);
        } else {
          setNoDelegate(false);
        }
        setAddress(makeShortAddress(delegateAddress));
        const currentCtxBalance = await tokens.ctxToken.balanceOf(currentAddress);
        const tcapString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(tcapString);
        const votes = await tokens.ctxToken.getCurrentVotes(currentAddress);
        setCurrentVotes(votes.toString());
      }
    } catch (error) {
      // catch error in case the vault screen is changed
    }
  };

  useEffect(() => {
    const loadAddress = async () => {
      if (
        signer.signer &&
        tokens.tcapToken &&
        oracles.tcapOracle &&
        tokens.ctxToken &&
        governance.governorAlpha &&
        governance.timelock
      ) {
        const currentAddress = await signer.signer.getAddress();

        const delegateAddress = await tokens.ctxToken.delegates(currentAddress);
        if (delegateAddress === ethers.constants.AddressZero) {
          setNoDelegate(true);
        } else {
          setNoDelegate(false);
        }
        setAddress(makeShortAddress(delegateAddress));
        const currentCtxBalance = await tokens.ctxToken.balanceOf(currentAddress);
        const tcapString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(tcapString);
        const votes = await tokens.ctxToken.getCurrentVotes(currentAddress);
        setCurrentVotes(ethers.utils.formatEther(votes));
        const currentThreshold = await governance.governorAlpha.proposalThreshold();
        setProposerThreshold(ethers.utils.formatEther(currentThreshold));
        const currentQuorum = await governance.governorAlpha.quorumVotes();
        setQuorumVotes(ethers.utils.formatEther(currentQuorum));
        const currentGrace = await governance.timelock.GRACE_PERIOD();
        setGracePeriod(currentGrace);
      }
      if (data) {
        const currentProposals: any[] = [];
        await data.proposals.forEach((p: any) => {
          currentProposals.push(p);
        });
        setProposals(currentProposals);
        const network = process.env.REACT_APP_NETWORK_NAME;
        const provider = ethers.getDefaultProvider(network, {
          infura: process.env.REACT_APP_INFURA_ID,
          alchemy: process.env.REACT_APP_ALCHEMY_KEY,
        });
        const block = await provider.getBlockNumber();
        setCurrentBlock(block);
        const timestamp = Date.now();
        setCurrentTimestamp(timestamp);
        setIsLoading(false);
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [data]);

  async function queueTransaction(id: number) {
    if (governance.governorAlpha) {
      try {
        const tx = await governance.governorAlpha.queue(id);
        notifyUser(tx, refresh);
      } catch (error) {
        if (error.code === 4001) {
          errorNotification("Transaction rejected");
        }
      }
    }
  }

  async function executeTransaction(id: number) {
    if (governance.governorAlpha) {
      try {
        const tx = await governance.governorAlpha.execute(id);
        notifyUser(tx, refresh);
      } catch (error) {
        if (error.code === 4001) {
          errorNotification("Transaction rejected");
        }
      }
    }
  }

  if (isLoading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="governance-dashboard">
      <div>
        <h3>Governance Portal</h3>
        <Row className="data">
          <Col md={3} sm={6} xs={7}>
            <h2 className="number neon-highlight">
              <CtxIcon className="ctx-neon" />
              <NumberFormat
                className="number"
                value="10,000,000"
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={0}
              />{" "}
            </h2>
            <p>Total Supply</p>
          </Col>
          <Col md={3} sm={6} xs={5}>
            <h2 className="number neon-highlight">
              <CtxIcon className="ctx-neon" />
              <NumberFormat
                className="number"
                value={quorumVotes}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={0}
              />{" "}
            </h2>
            <p>Quorum Required</p>
          </Col>
          <Col className="token-price" md={3} sm={6} xs={7}>
            <h2 className="number neon-dark-blue">
              <CtxIcon className="ctx-neon" />
              <NumberFormat
                className="number"
                value={proposerThreshold}
                displayType="text"
                thousandSeparator
                decimalScale={0}
              />
            </h2>
            <p>Proposal Threshold</p>
          </Col>
          <Col className="token-price" md={3} sm={6} xs={5}>
            <h2 className="number neon-dark-blue">
              <NumberFormat
                className="number"
                value="3 "
                displayType="text"
                thousandSeparator
                decimalScale={2}
              />{" "}
              days
            </h2>
            <p>Voting Period</p>
          </Col>
        </Row>
        <Row className="card-wrapper">
          <Col xs={12} lg={3}>
            {address !== "" ? (
              <Card className="balance">
                <div className="">
                  <h2>Balance</h2>
                  <p>
                    {noDelegate ? (
                      <></>
                    ) : (
                      <>
                        Delegated Account <b className="">{address}</b>
                      </>
                    )}
                  </p>
                </div>
                <Row className="">
                  <Col>
                    <h3 className="number neon-blue">
                      <CtxIcon className="ctx-neon" />
                      <NumberFormat
                        className="number"
                        value={ctxBalance}
                        displayType="text"
                        thousandSeparator
                        decimalScale={2}
                      />
                    </h3>
                    <p>CTX Balance</p>
                  </Col>
                </Row>
                {currentVotes !== "0" && currentVotes !== "0.0" && (
                  <>
                    <Row className="">
                      <Col>
                        <h3 className="number neon-blue">
                          <CtxIcon className="ctx-neon" />
                          <NumberFormat
                            className="number"
                            value={currentVotes}
                            displayType="text"
                            thousandSeparator
                            decimalScale={2}
                          />
                        </h3>
                        <p>Delegated Votes</p>
                      </Col>
                    </Row>
                  </>
                )}
                <br />
                <Button className="neon-highlight" onClick={() => setDelegateShow(true)}>
                  Delegate
                </Button>
                <Button
                  className="neon-green"
                  variant="success"
                  onClick={() => setNewProposalShow(true)}
                >
                  Propose
                </Button>{" "}
              </Card>
            ) : (
              <Card className="balance">
                <div className="">
                  <h2>Connect Your Account</h2>
                  <p>Vote and delegate with your CTX tokens connecting your account</p>
                </div>
                <Row className="">
                  <Col>
                    <Button
                      variant="primary"
                      id="connect"
                      className="neon-pink"
                      onClick={() => {
                        web3Modal.toggleModal();
                      }}
                    >
                      Connect Wallet
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          </Col>
          <Col xs={12} sm={12} lg={9} className="use-tcap">
            <Card className="diamond">
              <h2>Proposals</h2>
              <p>Delegate CTX to yourself or others, to vote on the future of the protocol.</p>
              <Row className="">
                <Table hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Proposer</th>
                      <th>Votes</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((proposal, i) => {
                      let forVotes = 0;
                      let againstVotes = 0;
                      let {
                        id,
                        description,
                        status,
                        executionETA,
                        startBlock,
                        endBlock,
                        votes,
                        proposer,
                      } = proposal;
                      votes.forEach((vote: any) => {
                        if (vote.support) {
                          forVotes += parseInt(vote.votes);
                        } else {
                          againstVotes += parseInt(vote.votes);
                        }
                      });

                      const denominator = forVotes + againstVotes;
                      const forRate = denominator !== 0 ? (forVotes / denominator) * 100 : 0;
                      const againstRate =
                        denominator !== 0 ? (againstVotes / denominator) * 100 : 0;

                      const timeBlock = endBlock - currentBlock;
                      const eta = executionETA || 0;
                      const endTimeMili = currentTimestamp + timeBlock * 13 * 1000;
                      let endTime = new Date(endTimeMili).toDateString();
                      if (status !== "EXECUTED") {
                        status = getProposalStatus(
                          startBlock,
                          endBlock,
                          currentBlock,
                          forVotes,
                          againstVotes,
                          parseInt(quorumVotes),
                          eta,
                          gracePeriod
                        );
                      }

                      if (eta !== 0) {
                        endTime = new Date(eta * 1000).toDateString();
                      }

                      const animated = status === "PENDING" || status === "ACTIVE";
                      const row = (
                        <tr key={i}>
                          <td>{id}</td>
                          <td>{description}</td>
                          <td>
                            <a href={`${etherscanURL}/address/${proposer.id}`}>
                              {makeShortAddress(proposer.id)}
                            </a>
                          </td>
                          <td>
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top">
                                  👍: {forVotes.toLocaleString()}
                                  <br /> 👎: {againstVotes.toLocaleString()}
                                </Tooltip>
                              }
                            >
                              <ProgressBar>
                                <ProgressBar
                                  animated={animated}
                                  variant="highlight"
                                  now={forRate}
                                  key={1}
                                />
                                <ProgressBar
                                  animated={animated}
                                  variant="warning"
                                  now={againstRate}
                                  key={2}
                                />
                              </ProgressBar>
                            </OverlayTrigger>
                          </td>
                          <td>
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={<Tooltip id="tooltip-top">Closes on {endTime}</Tooltip>}
                            >
                              <span>
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                                {(status === "PENDING" ||
                                  status === "ACTIVE" ||
                                  status === "QUEUED") && <span> ⏰</span>}
                              </span>
                            </OverlayTrigger>
                          </td>
                          <td>
                            {(() => {
                              switch (status) {
                                case "SUCCEEDED":
                                  return (
                                    <Button
                                      variant="primary"
                                      className="neon-highlight"
                                      onClick={() => {
                                        queueTransaction(id);
                                      }}
                                    >
                                      Queue
                                    </Button>
                                  );
                                case "READY":
                                  return (
                                    <Button
                                      variant="primary"
                                      className="neon-highlight"
                                      onClick={() => {
                                        executeTransaction(id);
                                      }}
                                    >
                                      Execute
                                    </Button>
                                  );
                                default:
                                  return (
                                    <Button
                                      variant="primary"
                                      className="neon-highlight"
                                      onClick={() => {
                                        clickVote(
                                          proposal,
                                          forVotes,
                                          againstVotes,
                                          endTime,
                                          status
                                        );
                                      }}
                                    >
                                      {status === "ACTIVE" ? <>Vote</> : <>Details</>}
                                    </Button>
                                  );
                              }
                            })()}
                          </td>
                        </tr>
                      );
                      return row;
                    })}
                  </tbody>
                </Table>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
      <Delegate
        show={delegateShow}
        onHide={() => setDelegateShow(false)}
        refresh={() => refresh()}
      />
      <NewProposal
        show={newProposalShow}
        onHide={() => setNewProposalShow(false)}
        refresh={() => refresh()}
      />
      <Vote
        show={voteShow}
        onHide={() => {
          setVoteShow(false);
        }}
        proposal={voteProposal}
        forVote={voteFor}
        against={voteAgainst}
        endTime={voteEndTime}
        status={voteStatus}
      />
    </div>
  );
};
export default Governance;
