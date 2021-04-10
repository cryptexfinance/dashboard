import React, { useState, useContext, useEffect } from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { ToastContainer } from "react-toastify";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.scss";
import { useSwipeable } from "react-swipeable";
import { useMediaQuery } from "@react-hook/media-query";
import Container from "react-bootstrap/esm/Container";
import Alert from "react-bootstrap/esm/Alert";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Welcome from "./components/Welcome";
import Graph from "./components/Graph";
import Vault from "./components/Vault/Vault";
import Pool from "./components/Pool";
import Governance from "./components/Governance";
import Loading from "./components/Loading";
import Farm from "./components/Farm";
import { useSigner } from "./hooks/useSigner";
import { useVaults } from "./hooks/useVaults";
import { useTokens } from "./hooks/useTokens";
import { useOracles } from "./hooks/useOracles";
import { useGovernance } from "./hooks/useGovernance";
import { useRewards } from "./hooks/useRewards";
import signerContext from "./state/SignerContext";
import vaultsContext from "./state/VaultsContext";
import tokensContext from "./state/TokensContext";
import oraclesContext from "./state/OraclesContext";
import governanceContext from "./state/GovernanceContext";
import rewardsContext from "./state/RewardsContext";
import { Web3ModalContext } from "./state/Web3ModalContext";
import WETHVault from "./contracts/mainnet/WETHVaultHandler.json";
import WBTCVault from "./contracts/mainnet/WBTCVaultHandler.json";
import DAIVault from "./contracts/mainnet/DAIVaultHandler.json";
import WETHOracle from "./contracts/mainnet/WETHOracle.json";
import WBTCOracle from "./contracts/mainnet/BTCOracle.json";
import DAIOracle from "./contracts/mainnet/DAIOracle.json";
import TCAPOracle from "./contracts/mainnet/TCAPOracle.json";
import WETHToken from "./contracts/mainnet/WETH.json";
import WBTCToken from "./contracts/mainnet/WBTC.json";
import DAIToken from "./contracts/mainnet/DAI.json";
import TCAPToken from "./contracts/mainnet/TCAP.json";
import CTXToken from "./contracts/mainnet/Ctx.json";
import GovernorAlpha from "./contracts/mainnet/GovernorAlpha.json";
import Timelock from "./contracts/mainnet/Timelock.json";
import WETHReward from "./contracts/mainnet/WETHRewardHandler.json";
import WBTCReward from "./contracts/mainnet/WBTCRewardHandler.json";
import DAIReward from "./contracts/mainnet/DAIRewardHandler.json";
import WETHPoolReward from "./contracts/mainnet/ETHLiquidityReward.json";
import WBTCPoolReward from "./contracts/mainnet/WBTCLiquidityReward.json";
import DAIPoolReward from "./contracts/mainnet/DAILiquidityReward.json";
import CTXPoolReward from "./contracts/mainnet/CTXLiquidityReward.json";

import rWETHVault from "./contracts/rinkeby/WETHVaultHandler.json";
import rWBTCVault from "./contracts/rinkeby/WBTCVaultHandler.json";
import rDAIVault from "./contracts/rinkeby/DAIVaultHandler.json";
import rWETHOracle from "./contracts/rinkeby/WETHOracle.json";
import rWBTCOracle from "./contracts/rinkeby/BTCOracle.json";
import rDAIOracle from "./contracts/rinkeby/DAIOracle.json";
import rTCAPOracle from "./contracts/rinkeby/TCAPOracle.json";
import rWETHToken from "./contracts/rinkeby/WETH.json";
import rWBTCToken from "./contracts/rinkeby/WBTC.json";
import rDAIToken from "./contracts/rinkeby/DAI.json";
import rTCAPToken from "./contracts/rinkeby/TCAP.json";
import rCTXToken from "./contracts/rinkeby/Ctx.json";
import rGovernorAlpha from "./contracts/rinkeby/GovernorAlpha.json";
import rTimelock from "./contracts/rinkeby/Timelock.json";
import rWETHReward from "./contracts/rinkeby/WETHRewardHandler.json";
import rWBTCReward from "./contracts/rinkeby/WBTCRewardHandler.json";
import rDAIReward from "./contracts/rinkeby/DAIRewardHandler.json";
// import rWETHPoolReward from "./contracts/rinkeby/ETHLiquidityReward.json";
// import rWBTCPoolReward from "./contracts/rinkeby/WBTCLiquidityReward.json";
// import rDAIPoolReward from "./contracts/rinkeby/DAILiquidityReward.json";
// import rCTXPoolReward from "./contracts/rinkeby/CTXLiquidityReward.json";

const clientOracle = new ApolloClient({
  uri: process.env.REACT_APP_GRAPH_URL,
  cache: new InMemoryCache(),
});

const App = () => {
  const signer = useSigner();
  const web3Modal = useContext(Web3ModalContext);
  const [isLoading, setloading] = useState(true);
  const [invalidNetwork, setInvalidNetwork] = useState(false);
  const [show, setShow] = useState(true);
  const [vaultWarning, setVaultWarning] = useState(true);
  const isMobile = useMediaQuery("only screen and (max-width: 600px)");
  const [showSidebar, setShowSidebar] = useState(true);
  const vaults = useVaults();
  const tokens = useTokens();
  const oracles = useOracles();
  const governance = useGovernance();
  const rewards = useRewards();
  const match = useRouteMatch();
  const location = useLocation();

  const setContracts = (currentSigner: ethers.Signer) => {
    let cWETHVault;
    let cDAIVault;
    let cWBTCVault;
    let cWETHToken;
    let cDAIToken;
    let cWBTCToken;
    let cTCAPToken;
    let cWBTCReward;
    let cWETHReward;
    let cDAIReward;
    let cWETHPoolReward;
    let cDAIPoolReward;
    let cWBTCPoolReward;
    let cCTXPoolReward;
    let cWETHOracle;
    let cDAIOracle;
    let cWBTCOracle;
    let cTCAPOracle;
    let cGovernorAlpha;
    let cCTXToken;
    let cTimelock;
    if (process.env.REACT_APP_NETWORK_NAME === "mainnet") {
      cWETHVault = WETHVault;
      cDAIVault = DAIVault;
      cWBTCVault = WBTCVault;
      cWETHToken = WETHToken;
      cDAIToken = DAIToken;
      cWBTCToken = WBTCToken;
      cTCAPToken = TCAPToken;
      cWBTCReward = WBTCReward;
      cWETHReward = WETHReward;
      cDAIReward = DAIReward;
      cWETHPoolReward = WETHPoolReward;
      cDAIPoolReward = DAIPoolReward;
      cWBTCPoolReward = WBTCPoolReward;
      cCTXPoolReward = CTXPoolReward;
      cWETHOracle = WETHOracle;
      cDAIOracle = DAIOracle;
      cWBTCOracle = WBTCOracle;
      cTCAPOracle = TCAPOracle;
      cGovernorAlpha = GovernorAlpha;
      cCTXToken = CTXToken;
      cTimelock = Timelock;
    } else {
      cWETHVault = rWETHVault;
      cDAIVault = rDAIVault;
      cWBTCVault = rWBTCVault;
      cWETHToken = rWETHToken;
      cDAIToken = rDAIToken;
      cWBTCToken = rWBTCToken;
      cTCAPToken = rTCAPToken;
      cWBTCReward = rWBTCReward;
      cWETHReward = rWETHReward;
      cDAIReward = rDAIReward;
      // TODO update pools
      cWETHPoolReward = WETHPoolReward;
      cDAIPoolReward = DAIPoolReward;
      cWBTCPoolReward = WBTCPoolReward;
      cCTXPoolReward = CTXPoolReward;
      cWETHOracle = rWETHOracle;
      cDAIOracle = rDAIOracle;
      cWBTCOracle = rWBTCOracle;
      cTCAPOracle = rTCAPOracle;
      cGovernorAlpha = rGovernorAlpha;
      cCTXToken = rCTXToken;
      cTimelock = rTimelock;
    }
    // Set Vaults
    const currentWETHVault = new ethers.Contract(cWETHVault.address, cWETHVault.abi, currentSigner);
    vaults.setCurrentWETHVault(currentWETHVault);
    const currentDAIVault = new ethers.Contract(cDAIVault.address, cDAIVault.abi, currentSigner);
    vaults.setCurrentDAIVault(currentDAIVault);
    const currentWBTCVault = new ethers.Contract(cWBTCVault.address, WBTCVault.abi, currentSigner);
    vaults.setCurrentWBTCVault(currentWBTCVault);
    // Set Tokens
    const currentWETHToken = new ethers.Contract(cWETHToken.address, cWETHToken.abi, currentSigner);
    tokens.setCurrentWETHToken(currentWETHToken);
    const currentDAIToken = new ethers.Contract(cDAIToken.address, cDAIToken.abi, currentSigner);
    tokens.setCurrentDAIToken(currentDAIToken);
    const currentWBTCToken = new ethers.Contract(cWBTCToken.address, cWBTCToken.abi, currentSigner);
    tokens.setCurrentWBTCToken(currentWBTCToken);
    const currentTCAPToken = new ethers.Contract(cTCAPToken.address, cTCAPToken.abi, currentSigner);
    tokens.setCurrentTCAPToken(currentTCAPToken);

    // TODO:remove this once other pools work
    if (process.env.REACT_APP_POOL_ETH) {
      const currentWETHPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_ETH,
        DAIToken.abi,
        currentSigner
      );

      tokens.setCurrentWETHPoolToken(currentWETHPoolToken);
    }
    if (
      process.env.REACT_APP_POOL_ETH &&
      process.env.REACT_APP_POOL_WBTC &&
      process.env.REACT_APP_POOL_DAI &&
      process.env.REACT_APP_POOL_CTX
    ) {
      // Set Pool Tokens
      const currentWETHPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_ETH,
        DAIToken.abi,
        currentSigner
      );

      tokens.setCurrentWETHPoolToken(currentWETHPoolToken);

      const currentDAIPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_DAI,
        DAIToken.abi,
        currentSigner
      );
      tokens.setCurrentDAIPoolToken(currentDAIPoolToken);

      const currentWBTCPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_WBTC,
        DAIToken.abi,
        currentSigner
      );
      tokens.setCurrentWBTCPoolToken(currentWBTCPoolToken);

      const currentCTXPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_CTX,
        DAIToken.abi,
        currentSigner
      );
      tokens.setCurrentCTXPoolToken(currentCTXPoolToken);
    }

    // Set Rewards
    const currentWETHReward = new ethers.Contract(
      cWETHReward.address,
      cWETHReward.abi,
      currentSigner
    );
    rewards.setCurrentWETHReward(currentWETHReward);

    const currentDAIReward = new ethers.Contract(cDAIReward.address, cDAIReward.abi, currentSigner);
    rewards.setCurrentDAIReward(currentDAIReward);

    const currentWBTCReward = new ethers.Contract(
      cWBTCReward.address,
      cWBTCReward.abi,
      currentSigner
    );
    rewards.setCurrentWBTCReward(currentWBTCReward);

    // Set Liquidity Rewards
    const currentWETHPoolReward = new ethers.Contract(
      cWETHPoolReward.address,
      cWETHPoolReward.abi,
      currentSigner
    );
    rewards.setCurrentWETHPoolReward(currentWETHPoolReward);

    const currentDAIPoolReward = new ethers.Contract(
      cDAIPoolReward.address,
      cDAIPoolReward.abi,
      currentSigner
    );
    rewards.setCurrentDAIPoolReward(currentDAIPoolReward);

    const currentWBTCPoolReward = new ethers.Contract(
      cWBTCPoolReward.address,
      cWBTCPoolReward.abi,
      currentSigner
    );
    rewards.setCurrentWBTCPoolReward(currentWBTCPoolReward);

    const currentCTXPoolReward = new ethers.Contract(
      cCTXPoolReward.address,
      cCTXPoolReward.abi,
      currentSigner
    );
    rewards.setCurrentCTXPoolReward(currentCTXPoolReward);

    // Set Oracles
    const currentWETHOracle = new ethers.Contract(
      cWETHOracle.address,
      cWETHOracle.abi,
      currentSigner
    );
    oracles.setCurrentWETHOracle(currentWETHOracle);
    const currentDAIOracle = new ethers.Contract(DAIOracle.address, DAIOracle.abi, currentSigner);
    oracles.setCurrentDAIOracle(currentDAIOracle);
    const currentWBTCOracle = new ethers.Contract(
      cWBTCOracle.address,
      cWBTCOracle.abi,
      currentSigner
    );
    oracles.setCurrentWBTCOracle(currentWBTCOracle);
    const currentTCAPOracle = new ethers.Contract(
      cTCAPOracle.address,
      cTCAPOracle.abi,
      currentSigner
    );
    oracles.setCurrentTCAPOracle(currentTCAPOracle);

    // Set Governance
    const currentCtx = new ethers.Contract(CTXToken.address, CTXToken.abi, currentSigner);
    governance.setCurrentCtxToken(currentCtx);
    const currentGovernorAlpha = new ethers.Contract(
      cGovernorAlpha.address,
      cGovernorAlpha.abi,
      currentSigner
    );
    governance.setCurrentGovernorAlpha(currentGovernorAlpha);
    const currentTimelock = new ethers.Contract(Timelock.address, Timelock.abi, currentSigner);
    governance.setCurrentTimelock(currentTimelock);
  };

  web3Modal.on("connect", async (networkProvider) => {
    setloading(true);
    const currentProvider = new ethers.providers.Web3Provider(networkProvider);
    const network = await currentProvider.getNetwork();
    if (
      process.env.REACT_APP_NETWORK_ID &&
      !(
        network.chainId === parseInt(process.env.REACT_APP_NETWORK_ID) ||
        parseInt(process.env.REACT_APP_NETWORK_ID) === 0
      )
    ) {
      setInvalidNetwork(true);
    }
    const currentSigner = currentProvider.getSigner();
    signer.setCurrentSigner(currentSigner);
    setContracts(currentSigner);
    setloading(false);
  });

  useEffect(() => {
    const savedAlert = localStorage.getItem("alert");
    if (savedAlert) setShow(false);

    async function loadProvider() {
      if (web3Modal.cachedProvider && !signer.signer) {
        const networkProvider = await web3Modal.connect();
        const currentProvider = new ethers.providers.Web3Provider(networkProvider);
        const network = await currentProvider.getNetwork();

        if (
          process.env.REACT_APP_NETWORK_ID &&
          !(
            network.chainId === parseInt(process.env.REACT_APP_NETWORK_ID) ||
            parseInt(process.env.REACT_APP_NETWORK_ID) === 0
          )
        ) {
          setInvalidNetwork(true);
        }
        const currentSigner = currentProvider.getSigner();
        signer.setCurrentSigner(currentSigner);
        setContracts(currentSigner);
      } else {
        const network = process.env.REACT_APP_NETWORK_NAME;
        const provider = ethers.getDefaultProvider(network, {
          infura: process.env.REACT_APP_INFURA_ID,
          alchemy: process.env.REACT_APP_ALCHEMY_KEY,
        });
        const randomSigner = ethers.Wallet.createRandom().connect(provider);
        setContracts(randomSigner);
      }
      setloading(false);
    }
    // Execute the created function directly
    loadProvider();
    // eslint-disable-next-line
  }, [web3Modal]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setShowSidebar(true),
    onSwipedRight: () => setShowSidebar(false),
    delta: 40,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (isLoading) {
    return (
      <>
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} isMobile={isMobile} />
        <Container fluid className="wrapper">
          <Loading title="Loading" message="Please wait" position="total" />
        </Container>
      </>
    );
  }

  if (invalidNetwork) {
    const networkName = process.env.REACT_APP_NETWORK_NAME;
    return (
      <>
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} isMobile={isMobile} />
        <Container fluid className="wrapper">
          <Loading
            title="Invalid Network"
            message={`Please switch to ${networkName} network`}
            position="total"
          />
        </Container>
      </>
    );
  }

  return (
    <signerContext.Provider value={signer}>
      <tokensContext.Provider value={tokens}>
        <oraclesContext.Provider value={oracles}>
          <vaultsContext.Provider value={vaults}>
            <governanceContext.Provider value={governance}>
              <rewardsContext.Provider value={rewards}>
                <Sidebar
                  showSidebar={showSidebar}
                  setShowSidebar={setShowSidebar}
                  isMobile={isMobile}
                />
                <Topbar
                  showSidebar={showSidebar}
                  setShowSidebar={setShowSidebar}
                  isMobile={isMobile}
                />
                <Container fluid className="wrapper" {...handlers}>
                  {show && (
                    <Alert
                      onClose={() => {
                        setShow(false);
                        localStorage.setItem("alert", "false");
                      }}
                      dismissible
                    >
                      <b>💀 This project is on beta. Use at your own risk.</b>
                    </Alert>
                  )}
                  {vaultWarning && location.pathname === "/vault" && (
                    <Alert
                      onClose={() => {
                        setVaultWarning(false);
                        localStorage.setItem("alert", "false");
                      }}
                      dismissible
                    >
                      <b>
                        ⚠️ Make sure to always have a ratio above the minimun ratio to avoid getting
                        liquidated.
                      </b>
                    </Alert>
                  )}

                  <Header />
                  <ToastContainer />
                  <Switch>
                    <ApolloProvider client={clientOracle}>
                      <Route path={`${match.url}/`}>
                        <Welcome />
                      </Route>
                      <Route path={`${match.url}graph`}>
                        <Graph />
                      </Route>
                      <Route path={`${match.url}vault`}>
                        <Vault />
                      </Route>
                      <Route path={`${match.url}farm`}>
                        <Farm />
                      </Route>
                      <Route path={`${match.url}governance`}>
                        <Governance />
                      </Route>
                      <Route path={`${match.url}pools`}>
                        <Pool />
                      </Route>
                    </ApolloProvider>
                  </Switch>
                </Container>
              </rewardsContext.Provider>
            </governanceContext.Provider>
          </vaultsContext.Provider>
        </oraclesContext.Provider>
      </tokensContext.Provider>
    </signerContext.Provider>
  );
};

export default App;
