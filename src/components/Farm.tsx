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
import { Stake } from "./modals/Stake";

const Farm = () => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [ethRewards, setEthRewards] = useState("0");
  const [wbtcRewards, setWbtcRewards] = useState("0");
  const [daiRewards, setDaiRewards] = useState("0");
  const [ethPoolRewards, setEthPoolRewards] = useState("0.0");
  const [wbtcPoolRewards, setWbtcPoolRewards] = useState("0.0");
  const [daiPoolRewards, setDaiPoolRewards] = useState("0.0");
  const [ctxPoolRewards, setCtxPoolRewards] = useState("0.0");
  const [ethDebt, setEthDebt] = useState("0.0");
  const [wbtcDebt, setWbtcDebt] = useState("0.0");
  const [daiDebt, setDaiDebt] = useState("0.0");
  const [ethPoolStake, setEthPoolStake] = useState("0.0");
  const [wbtcPoolStake, setWbtcPoolStake] = useState("0.0");
  const [daiPoolStake, setDaiPoolStake] = useState("0.0");
  const [ctxPoolStake, setCtxPoolStake] = useState("0.0");
  const [ethPoolBalance, setEthPoolBalance] = useState("0.0");
  const [wbtcPoolBalance, setWbtcPoolBalance] = useState("0.0");
  const [daiPoolBalance, setDaiPoolBalance] = useState("0.0");
  const [ctxPoolBalance, setCtxPoolBalance] = useState("0.0");
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const tokens = useContext(TokensContext);
  const vaults = useContext(VaultsContext);
  const oracles = useContext(OraclesContext);
  const governance = useContext(GovernanceContext);
  const rewards = useContext(RewardsContext);
  const [stakeShow, setStakeShow] = useState(false);
  const [stakeBalance, setStakeBalance] = useState("0");
  const [selectedPoolTitle, setSelectedPoolTitle] = useState("");
  const [selectedPool, setSelectedPool] = useState<ethers.Contract>();
  const [selectedPoolToken, setSelectedPoolToken] = useState<ethers.Contract>();

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

        const currentEthPoolReward = await rewards.wethPoolReward?.earned(currentAddress);
        setEthPoolRewards(ethers.utils.formatEther(currentEthPoolReward));
        const currentWbtcPoolReward = await rewards.wbtcPoolReward?.earned(currentAddress);
        setWbtcPoolRewards(ethers.utils.formatEther(currentWbtcPoolReward));
        const currentDaiPoolReward = await rewards.daiPoolReward?.earned(currentAddress);
        setDaiPoolRewards(ethers.utils.formatEther(currentDaiPoolReward));
        const currentCtxPoolReward = await rewards.ctxPoolReward?.earned(currentAddress);
        setCtxPoolRewards(ethers.utils.formatEther(currentCtxPoolReward));

        const currentEthPoolStake = await rewards.wethPoolReward?.balanceOf(currentAddress);
        setEthPoolStake(ethers.utils.formatEther(currentEthPoolStake));
        const currentWbtcPoolStake = await rewards.wbtcPoolReward?.balanceOf(currentAddress);
        setWbtcPoolStake(ethers.utils.formatEther(currentWbtcPoolStake));
        const currentDaiPoolStake = await rewards.daiPoolReward?.balanceOf(currentAddress);
        setDaiPoolStake(ethers.utils.formatEther(currentDaiPoolStake));
        const currentCtxPoolStake = await rewards.ctxPoolReward?.balanceOf(currentAddress);
        setCtxPoolStake(ethers.utils.formatEther(currentCtxPoolStake));

        const currentEthPoolBalance = await tokens.wethPoolToken?.balanceOf(currentAddress);
        setEthPoolBalance(ethers.utils.formatEther(currentEthPoolBalance));
        const currentWbtcPoolBalance = await tokens.wbtcPoolToken?.balanceOf(currentAddress);
        setWbtcPoolBalance(ethers.utils.formatEther(currentWbtcPoolBalance));
        const currentDaiPoolBalance = await tokens.daiPoolToken?.balanceOf(currentAddress);
        setDaiPoolBalance(ethers.utils.formatEther(currentDaiPoolBalance));
        const currentCtxPoolBalance = await tokens.ctxPoolToken?.balanceOf(currentAddress);
        setCtxPoolBalance(ethers.utils.formatEther(currentCtxPoolBalance));

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
      notifyUser(tx, refresh);
    } catch (error) {
      if (error.code === 4001) {
        errorNotification("Transaction rejected");
      } else {
        errorNotification("Insufficient funds to stake");
      }
    }
  };

  const exitRewards = async (vaultType: string) => {
    try {
      let tx: ethers.ContractTransaction;
      switch (vaultType) {
        case "ETHPOOL":
          tx = await rewards?.wethPoolReward?.exit();
          break;
        case "WBTCPOOL":
          tx = await rewards?.wbtcPoolReward?.exit();
          break;
        case "DAIPOOL":
          tx = await rewards?.daiPoolReward?.exit();
          break;
        case "CTXPOOL":
          tx = await rewards?.ctxPoolReward?.exit();
          break;
        default:
          tx = await rewards?.wethPoolReward?.exit();
          break;
      }
      notifyUser(tx, refresh);
    } catch (error) {
      if (error.code === 4001) {
        errorNotification("Transaction rejected");
      } else {
        errorNotification("Insufficient funds to exit");
      }
    }
  };

  return (
    <div className="farm">
      <div>
        <h3>Farming </h3>{" "}
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
                    <th /> <th />
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
                    <td />
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
                    </td>{" "}
                    <td />
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
                    </td>{" "}
                    <td />
                  </tr>
                  <tr>
                    <th />
                    <th>Description</th>
                    <th>Current Stake</th>
                    <th>Current Reward</th>
                    <th />
                    <th /> <th />
                  </tr>
                  <tr>
                    <td>
                      <UniIcon className="uni" />
                      <WETHIcon className="weth" />
                    </td>
                    <td>Uniswap ETH/TCAP Pool</td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={ethPoolStake}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      ETHTCAP
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={ethPoolRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          setStakeBalance(ethPoolBalance);
                          setSelectedPoolTitle("Uniswap ETH/TCAP Pool");
                          if (rewards.wethPoolReward) {
                            setSelectedPool(rewards.wethPoolReward);
                            setSelectedPoolToken(tokens.wethPoolToken);
                          }
                          setStakeShow(true);
                        }}
                      >
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
                    <td>
                      <Button
                        variant="warning"
                        className="neon-ora"
                        onClick={() => {
                          exitRewards("ETHPOOL");
                        }}
                      >
                        Exit
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <UniIcon className="uni" />
                      <WBTCIcon className="wbtc" />
                    </td>
                    <td>Uniswap WBTC/TCAP Pool</td>
                    <td className="number">
                      {" "}
                      <NumberFormat
                        className="number"
                        value={wbtcPoolStake}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      WBTCTCAP
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={wbtcPoolRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          setStakeBalance(wbtcPoolBalance);
                          setSelectedPoolTitle("Uniswap WBTC/TCAP Pool");
                          if (rewards.wbtcPoolReward) {
                            setSelectedPool(rewards.wbtcPoolReward);
                            setSelectedPoolToken(tokens.wbtcPoolToken);
                          }
                          setStakeShow(true);
                        }}
                      >
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
                    </td>{" "}
                    <td>
                      <Button
                        variant="warning"
                        className="neon-orange"
                        onClick={() => {
                          exitRewards("WBTCPOOL");
                        }}
                      >
                        Exit
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <UniIcon className="uni" />
                      <DAIIcon className="dai" />
                    </td>
                    <td>Uniswap DAI/TCAP Pool</td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={daiPoolStake}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      DAITCAP
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={daiPoolRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          setStakeBalance(daiPoolBalance);
                          setSelectedPoolTitle("Uniswap DAI/TCAP Pool");
                          if (rewards.daiPoolReward) {
                            setSelectedPool(rewards.daiPoolReward);
                            setSelectedPoolToken(tokens.daiPoolToken);
                          }
                          setStakeShow(true);
                        }}
                      >
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
                    </td>{" "}
                    <td>
                      <Button
                        variant="warning"
                        className="neon-orange"
                        onClick={() => {
                          exitRewards("DAIPOOL");
                        }}
                      >
                        Exit
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <UniIcon className="uni" />
                      <CtxIcon className="ctx-neon" />
                    </td>
                    <td>Uniswap CTX/ETH Pool</td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={ctxPoolStake}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      ETHCTX
                    </td>
                    <td className="number">
                      <NumberFormat
                        className="number"
                        value={ctxPoolRewards}
                        displayType="text"
                        thousandSeparator
                        prefix=""
                        decimalScale={2}
                      />{" "}
                      CTX
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="neon-highlight"
                        onClick={() => {
                          setStakeBalance(ctxPoolBalance);
                          setSelectedPoolTitle("Uniswap ETH/CTX Pool");
                          if (rewards.ctxPoolReward) {
                            setSelectedPool(rewards.ctxPoolReward);
                            setSelectedPoolToken(tokens.ctxPoolToken);
                          }
                          setStakeShow(true);
                        }}
                      >
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
                    </td>{" "}
                    <td>
                      <Button
                        variant="warning"
                        className="neon-orange"
                        onClick={() => {
                          exitRewards("CTXPOOL");
                        }}
                      >
                        Exit
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          )}
        </Row>
      </div>
      <Stake
        pool={selectedPool}
        poolTitle={selectedPoolTitle}
        poolToken={selectedPoolToken}
        balance={stakeBalance}
        show={stakeShow}
        onHide={() => setStakeShow(false)}
        refresh={() => refresh()}
      />
    </div>
  );
};
export default Farm;
