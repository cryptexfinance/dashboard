import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import ethers from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import GovernanceContext from "../state/GovernanceContext";
import RewardsContext from "../state/RewardsContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
// import { notifyUser, errorNotification } from "../utils/utils";
import "../styles/governance.scss";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";
import Loading from "./Loading";

const Farm = () => {
  const [address, setAddress] = useState("");
  const [ctxBalance, setCtxBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [ethRewards, setEthRewards] = useState("0");
  const [wbtcRewards, setWbtcRewards] = useState("0");
  const [daiRewards, setDaiRewards] = useState("0");
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);
  const governance = useContext(GovernanceContext);
  const rewards = useContext(RewardsContext);

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

  useEffect(() => {
    const loadAddress = async () => {
      if (
        signer.signer &&
        tokens.tcapToken &&
        oracles.tcapOracle &&
        governance.ctxToken &&
        governance.governorAlpha &&
        governance.timelock
      ) {
        const currentAddress = await signer.signer.getAddress();
        setAddress(currentAddress);
        const currentCtxBalance = await governance.ctxToken.balanceOf(currentAddress);
        const ctxString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(ctxString);

        const currentEthReward = await rewards?.wethReward?.earned(currentAddress);
        setEthRewards(ethers.utils.formatEther(currentEthReward));
        const currentWbtcReward = await rewards?.wbtcReward?.earned(currentAddress);
        setWbtcRewards(ethers.utils.formatEther(currentWbtcReward));
        const currentDaiReward = await rewards?.daiReward?.earned(currentAddress);
        setDaiRewards(ethers.utils.formatEther(currentDaiReward));

        setIsLoading(false);
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [data]);

  if (isLoading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="governance-dashboard">
      <div>
        <h3>Farming </h3>{" "}
        <Row className="data">
          <Col>
            <p>Current Balance</p>
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
          </Col>
        </Row>
        <Row className="card-wrapper">
          {address === "" ? (
            <Col xs={12} lg={3}>
              <Card className="balance">
                <div className="">
                  <h2>Connect Your Account</h2>
                  <p>Claim and see your CTX tokens connecting your account</p>
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
            </Col>
          ) : (
            <>
              <Col xs={12} lg={3}>
                <Card className="balance">
                  <div className="">
                    <h2>ETH Vault</h2>
                  </div>
                  <Row className="">
                    <Col>
                      <h3 className="number neon-blue">
                        <CtxIcon className="ctx-neon" />
                        <NumberFormat
                          className="number"
                          value={ethRewards}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </h3>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={12} lg={3}>
                <Card className="balance">
                  <div className="">
                    <h2>WBTC Vault</h2>
                  </div>
                  <Row className="">
                    <Col>
                      <h3 className="number neon-blue">
                        <CtxIcon className="ctx-neon" />
                        <NumberFormat
                          className="number"
                          value={wbtcRewards}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </h3>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={12} lg={3}>
                <Card className="balance">
                  <div className="">
                    <h2>DAI Vault</h2>
                  </div>
                  <Row className="">
                    <Col>
                      <h3 className="number neon-blue">
                        <CtxIcon className="ctx-neon" />
                        <NumberFormat
                          className="number"
                          value={daiRewards}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </h3>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </>
          )}
        </Row>
      </div>
    </div>
  );
};
export default Farm;
