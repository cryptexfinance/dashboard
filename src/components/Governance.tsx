import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import Table from "react-bootstrap/esm/Table";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
import ethers from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import GovernanceContext from "../state/GovernanceContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { makeShortAddress } from "../utils/utils";
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

  const TCAP_PRICE = gql`
    query {
      oracles(first: 1, orderBy: updatedAt, orderDirection: desc) {
        answer
      }
    }
  `;

  const { data } = useQuery(TCAP_PRICE);
  const [newProposalShow, setNewProposalShow] = useState(false);
  const [delegateShow, setDelegateShow] = useState(false);
  const [voteShow, setVoteShow] = useState(false);

  const refresh = async () => {
    try {
      if (signer.signer && tokens.tcapToken && oracles.tcapOracle && governance.ctxToken) {
        const currentAddress = await signer.signer.getAddress();
        const delegateAddress = await governance.ctxToken.delegates(currentAddress);
        if (delegateAddress === ethers.constants.AddressZero) {
          setNoDelegate(true);
        } else {
          setNoDelegate(false);
        }
        setAddress(makeShortAddress(delegateAddress));
        const currentCtxBalance = await governance.ctxToken.balanceOf(currentAddress);
        const tcapString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(tcapString);
        const votes = await governance.ctxToken.getCurrentVotes(currentAddress);
        setCurrentVotes(votes.toString());
      }
    } catch (error) {
      // catch error in case the vault screen is changed
    }
  };

  useEffect(() => {
    const loadAddress = async () => {
      if (signer.signer && tokens.tcapToken && oracles.tcapOracle && governance.ctxToken) {
        const currentAddress = await signer.signer.getAddress();
        const delegateAddress = await governance.ctxToken.delegates(currentAddress);
        if (delegateAddress === ethers.constants.AddressZero) {
          setNoDelegate(true);
        } else {
          setNoDelegate(false);
        }
        setAddress(makeShortAddress(delegateAddress));
        const currentCtxBalance = await governance.ctxToken.balanceOf(currentAddress);
        const tcapString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(tcapString);
        const votes = await governance.ctxToken.getCurrentVotes(currentAddress);
        setCurrentVotes(ethers.utils.formatEther(votes));
      }
      if (data) {
        setIsLoading(false);
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [currentVotes, data, isLoading, address]);

  if (isLoading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="governance-dashboard">
      <div>
        <h3>Governance Portal</h3>
        <Row className="data">
          <Col>
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
          <Col>
            <h2 className="number neon-highlight">
              <CtxIcon className="ctx-neon" />
              <NumberFormat
                className="number"
                value="400,000"
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={0}
              />{" "}
            </h2>
            <p>Quorum Required</p>
          </Col>
          <Col className="token-price">
            <h2 className="number neon-dark-blue">
              <CtxIcon className="ctx-neon" />
              <NumberFormat
                className="number"
                value="100,000"
                displayType="text"
                thousandSeparator
                decimalScale={2}
              />
            </h2>
            <p>Proposal Threshold</p>
          </Col>
          <Col className="token-price">
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
                <br />
                <Button
                  className="neon-green"
                  variant="success"
                  onClick={() => setNewProposalShow(true)}
                >
                  Propose
                </Button>{" "}
                <br />
              </Card>
            ) : (
              <Card className="balance">
                <div className="">
                  <h2>Connect Your Account</h2>
                  <p>Mint TCAP,or check your balance connecting your account</p>
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
              <p>User your CTX to vote for TCAP</p>
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
                    <tr>
                      <td>1</td>
                      <td>Raise DAI Vault Fee</td>
                      <td>0x1234...1234</td>
                      <td>
                        <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top">
                              👍: 41,000 <br /> 👎: 61,000
                            </Tooltip>
                          }
                        >
                          <ProgressBar>
                            <ProgressBar animated variant="highlight" now={40} key={1} />
                            <ProgressBar animated variant="warning" now={60} key={2} />
                          </ProgressBar>
                        </OverlayTrigger>
                      </td>
                      <td>Active</td>
                      <td>
                        <Button
                          variant="primary"
                          className="neon-highlight"
                          onClick={() => setVoteShow(true)}
                        >
                          Vote
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Raise WBTC Vault Fee</td>
                      <td>0x1234...1234</td>
                      <td>
                        <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top">
                              👍: 41,000 <br /> 👎: 61,000
                            </Tooltip>
                          }
                        >
                          <ProgressBar>
                            <ProgressBar variant="primary" now={30} key={1} />
                            <ProgressBar variant="warning" now={70} key={2} />
                          </ProgressBar>
                        </OverlayTrigger>
                      </td>
                      <td>Defeated</td>
                      <td>
                        <Button
                          variant="primary"
                          className="neon-highlight"
                          onClick={() => setVoteShow(true)}
                        >
                          Vote
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Raise ETH Vault Fee</td>
                      <td>0x1234...1234</td>
                      <td>
                        <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top">
                              👍: 41,000 <br /> 👎: 61,000
                            </Tooltip>
                          }
                        >
                          <ProgressBar>
                            <ProgressBar variant="primary" now={60} key={1} />
                            <ProgressBar variant="warning" now={40} key={2} />
                          </ProgressBar>
                        </OverlayTrigger>
                      </td>
                      <td>Executed</td>
                      <td>
                        <Button
                          variant="primary"
                          className="neon-highlight"
                          onClick={() => setVoteShow(true)}
                        >
                          Vote
                        </Button>
                      </td>
                    </tr>
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
      <NewProposal show={newProposalShow} onHide={() => setNewProposalShow(false)} />
      <Vote
        show={voteShow}
        onHide={() => {
          setVoteShow(false);
        }}
      />
    </div>
  );
};
export default Governance;
