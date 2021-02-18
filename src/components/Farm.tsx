import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Table from "react-bootstrap/esm/Table";
import ethers from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import VaultsContext from "../state/VaultsContext";
import OraclesContext from "../state/OraclesContext";
import GovernanceContext from "../state/GovernanceContext";
import RewardsContext from "../state/RewardsContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import "../styles/farm.scss";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-neon.svg";
import { ReactComponent as UniIcon } from "../assets/images/uni.svg";
import { ReactComponent as WETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as WBTCIcon } from "../assets/images/graph/WBTC.svg";
import { ReactComponent as DAIIcon } from "../assets/images/graph/DAI.svg";
import Loading from "./Loading";
import { notifyUser, errorNotification } from "../utils/utils";

const Farm = () => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [ethRewards, setEthRewards] = useState("0");
  const [wbtcRewards, setWbtcRewards] = useState("0");
  const [daiRewards, setDaiRewards] = useState("0");
  const [ethDebt, setEthDebt] = useState("0.0");
  const [wbtcDebt, setWbtcDebt] = useState("0.0");
  const [daiDebt, setDaiDebt] = useState("0.0");
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const tokens = useContext(TokensContext);
  const vaults = useContext(VaultsContext);
  const oracles = useContext(OraclesContext);
  const governance = useContext(GovernanceContext);
  const rewards = useContext(RewardsContext);

  const USER_VAULTS = gql`
    query getVault($owner: String!) {
      vaults(where: { owner: $owner }) {
        id
        vaultId
        owner
        collateral
        debt
        currentRatio
        address
        owner
      }
    }
  `;

  async function setDebt(vaultData: any) {
    await vaultData.vaults.forEach((v: any) => {
      switch (v.address.toLowerCase()) {
        case vaults?.wethVault?.address.toLowerCase():
          setEthDebt(ethers.utils.formatEther(v.debt));
          break;
        case vaults?.wbtcVault?.address.toLowerCase():
          setWbtcDebt(ethers.utils.formatEther(v.debt));
          break;
        case vaults?.daiVault?.address.toLowerCase():
          setDaiDebt(ethers.utils.formatEther(v.debt));
          break;
        default:
          break;
      }
    });
  }

  const { data, refetch } = useQuery(USER_VAULTS, {
    variables: { owner: address },
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setDebt(data);
    },
  });

  const refresh = async () => {
    try {
      await refetch();
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
        governance.ctxToken &&
        governance.governorAlpha &&
        governance.timelock
      ) {
        const currentAddress = await signer.signer.getAddress();
        setAddress(currentAddress);
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

  const claimRewards = async (vaultType: string) => {
    try {
      let tx: ethers.ContractTransaction;
      switch (vaultType) {
        case "ETH":
          tx = await rewards?.wethReward?.getReward();
          break;
        case "WBTC":
          tx = await rewards?.wbtcReward?.getReward();
          break;
        case "DAI":
          tx = await rewards?.daiReward?.getReward();
          break;
        case "ETHPOOL":
          tx = await rewards?.wethPoolReward?.getReward();
          break;
        case "WBTCPOOL":
          tx = await rewards?.wbtcPoolReward?.getReward();
          break;
        case "DAIPOOL":
          tx = await rewards?.daiPoolReward?.getReward();
          break;
        case "CTXPOOL":
          tx = await rewards?.ctxPoolReward?.getReward();
          break;
        default:
          tx = await rewards?.wethReward?.getReward();
          break;
      }
      notifyUser(tx, refresh());
    } catch (error) {
      if (error.code === 4001) {
        errorNotification("Transaction rejected");
      } else {
        errorNotification("Insufficient funds to stake");
      }
    }
  };

  return (
    <div className="farm">
      <div>
        <h3>Farming </h3>{" "}
        {/* <Row className="data">
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
            <p>Current Balance</p>
          </Col>
        </Row> */}
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
            <Card className="diamond">
              <Table hover>
                <thead>
                  <tr>
                    <th />
                    <th>Description</th>
                    <th>Current Mint</th>
                    <th>Current Reward</th>
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <WETHIcon className="weth" />
                    </td>
                    <td>ETH Vault</td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={ethDebt}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      TCAP
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={ethRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <Button variant="primary" className="neon-highlight" href="vault/ETH">
                        Mint
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          claimRewards("ETH");
                        }}
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <WBTCIcon className="wbtc" />
                    </td>
                    <td>WBTC Vault</td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={wbtcDebt}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      TCAP
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={wbtcRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <Button variant="primary" className="neon-highlight" href="vault/WBTC">
                        Mint
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          claimRewards("WBTC");
                        }}
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <DAIIcon className="dai" />
                    </td>
                    <td>DAI Vault</td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={daiDebt}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      TCAP
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={daiRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <Button variant="primary" className="neon-highlight" href="vault/DAI">
                        Mint
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          claimRewards("DAI");
                        }}
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <th />
                    <th>Description</th>
                    <th>Current Stake</th>
                    <th>Current Reward</th>
                    <th />
                    <th />
                  </tr>
                  <tr>
                    <td>
                      <UniIcon className="uni" />
                      <WETHIcon className="weth" />
                    </td>
                    <td>Uniswap ETH/TCAP Pool</td>
                    <td className="number">0 ETHTCAP</td>
                    <td className="number">0 CTX</td>
                    <td>
                      <Button variant="primary" className="neon-highlight" onClick={() => {}}>
                        Stake
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          claimRewards("ETHPOOL");
                        }}
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <UniIcon className="uni" />
                      <WBTCIcon className="wbtc" />
                    </td>
                    <td>Uniswap WBTC/TCAP Pool</td>
                    <td className="number">0 WBTCTCAP</td>
                    <td className="number">0 CTX</td>
                    <td>
                      <Button variant="primary" className="neon-highlight" onClick={() => {}}>
                        Stake
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          claimRewards("WBTCPOOL");
                        }}
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <UniIcon className="uni" />
                      <DAIIcon className="dai" />
                    </td>
                    <td>Uniswap DAI/TCAP Pool</td>
                    <td className="number">0 DAITCAP</td>
                    <td className="number">0 CTX</td>
                    <td>
                      <Button variant="primary" className="neon-highlight" onClick={() => {}}>
                        Stake
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          claimRewards("DAIPOOL");
                        }}
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <UniIcon className="uni" />
                      <CtxIcon className="ctx-neon" />
                    </td>
                    <td>Uniswap CTX/ETH Pool</td>
                    <td className="number">0 ETHCTX</td>
                    <td className="number">0 CTX</td>
                    <td>
                      <Button variant="primary" className="neon-highlight" onClick={() => {}}>
                        Stake
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          claimRewards("CTXPOOL");
                        }}
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          )}
        </Row>
      </div>
    </div>
  );
};
export default Farm;
