import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import Table from "react-bootstrap/esm/Table";
import ethers from "ethers";
import NumberFormat from "react-number-format";
import { useHistory } from "react-router-dom";
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

const Governance = () => {
  const [address, setAddress] = useState("");
  const [tcapBalance, setCtxBalance] = useState("0.0");
  const [currentVotes, setCurrentVotes] = useState("0.0");
  const [isLoading, setIsLoading] = useState(true);
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);
  const governance = useContext(GovernanceContext);
  const [noDelegate, setNoDelegate] = useState(false);
  const [delegateAddresstxt, setDelegateAddresstxt] = useState("");

  const TCAP_PRICE = gql`
    query {
      oracles(first: 1, orderBy: updatedAt, orderDirection: desc) {
        answer
      }
    }
  `;

  const { data } = useQuery(TCAP_PRICE);

  // forms
  const onChangeDelegateAddress = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setDelegateAddresstxt(event.target.value);
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
        setCurrentVotes(votes.toString());
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
        <Row className="card-wrapper">
          <Col xs={12} lg={3}>
            {address !== "" ? (
              <Card className="balance">
                <div className="">
                  <h2>My Total Balance</h2>
                  <p>
                    {noDelegate ? (
                      <>No votes delegated</>
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
                      <CtxIcon className="tcap-neon" />
                      <NumberFormat
                        className="number"
                        value={tcapBalance}
                        displayType="text"
                        thousandSeparator
                        decimalScale={2}
                      />
                    </h3>
                    <p>CTX Balance</p>
                  </Col>
                  {/* <Col>
                    <h3 className="number neon-dark-blue">
                      <NumberFormat
                        className="number"
                        value={currentVotes}
                        displayType="text"
                        thousandSeparator
                        // prefix="$"
                        // decimalScale={parseFloat(currentVotes) > 1000 ? 0 : 2}
                      />
                    </h3>
                    <p>Current Votes</p>
                  </Col> */}
                </Row>
                <br />
                <Button variant="dark" className="" disabled>
                  Delegate
                </Button>
                <br />
                <Button className="neon-highlight">New Proposal</Button> <br />
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
              <p>Trade TCAP using uniswap or create new supply using a vault</p>
              <Row className="">
                <Table hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Proposal</th>
                      <th>Proposer</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Raise ETH Vault Fee</td>
                      <td>0x1234...1234</td>
                      <td>Active</td>
                      <td>
                        <Button variant="primary" className="neon-highlight">
                          Vote
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Raise ETH Vault Fee</td>
                      <td>0x1234...1234</td>
                      <td>Active</td>
                      <td>
                        <Button variant="primary" className="neon-highlight">
                          Vote
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Raise ETH Vault Fee</td>
                      <td>0x1234...1234</td>
                      <td>Active</td>
                      <td>
                        <Button variant="primary" className="neon-highlight">
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
    </div>
  );
};
export default Governance;
