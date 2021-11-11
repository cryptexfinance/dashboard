import React, { useState, useContext, useEffect } from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { Provider, Contract } from "ethers-multicall";
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
import Delegators from "./components/Governance/Delegators";
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
import cryptexJson from "./contracts/cryptex.json";
import ERC20 from "./contracts/ERC20.json";
import WETH from "./contracts/WETH.json";
import UniV2Pair from "./contracts/UniswapV2Pair.json";
import { GRAPHQL_ENDPOINT, NETWORKS } from "./utils/constants";

const clientOracle = new ApolloClient({
  uri:
    process.env.REACT_APP_NETWORK_ID === "1" ? GRAPHQL_ENDPOINT.mainnet : GRAPHQL_ENDPOINT.rinkeby,
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
  const [currentSignerAddress, setCurrentSignerAddress] = useState("");
  const vaults = useVaults();
  const tokens = useTokens();
  const oracles = useOracles();
  const governance = useGovernance();
  const rewards = useRewards();
  const match = useRouteMatch();
  const location = useLocation();

  const setContracts = async (currentSigner: ethers.Signer, ethcallProvider: Provider) => {
    await ethcallProvider.init();
    signer.setCurrentEthcallProvider(ethcallProvider);
    let isMainnet = false;
    const networkId = parseInt(process.env.REACT_APP_NETWORK_ID || "4");
    let contracts;
    switch (networkId) {
      case 1:
        contracts = cryptexJson[1].mainnet.contracts;
        isMainnet = true;
        break;
      case 4:
        contracts = cryptexJson[4].rinkeby.contracts;
        break;
      default:
        contracts = cryptexJson[4].rinkeby.contracts;
        break;
    }

    // Set Vaults
    const currentWETHVault = new ethers.Contract(
      contracts.WETHVaultHandler.address,
      contracts.WETHVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentWETHVault(currentWETHVault);
    const currentDAIVault = new ethers.Contract(
      contracts.DAIVaultHandler.address,
      contracts.DAIVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentDAIVault(currentDAIVault);
    const currentAAVEVault = new ethers.Contract(
      contracts.AaveVaultHandler.address,
      contracts.AaveVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentAAVEVault(currentAAVEVault);
    const currentLINKVault = new ethers.Contract(
      contracts.LinkVaultHandler.address,
      contracts.LinkVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentLINKVault(currentLINKVault);

    const currentWETHVaultRead = new Contract(
      contracts.WETHVaultHandler.address,
      contracts.WETHVaultHandler.abi
    );
    vaults.setCurrentWETHVaultRead(currentWETHVaultRead);
    const currentDAIVaultRead = new Contract(
      contracts.DAIVaultHandler.address,
      contracts.DAIVaultHandler.abi
    );
    vaults.setCurrentDAIVaultRead(currentDAIVaultRead);
    const currentAVEEVaultRead = new Contract(
      contracts.AaveVaultHandler.address,
      contracts.AaveVaultHandler.abi
    );
    vaults.setCurrentAAVEVaultRead(currentAVEEVaultRead);
    const currentLINKVaultRead = new Contract(
      contracts.LinkVaultHandler.address,
      contracts.LinkVaultHandler.abi
    );
    vaults.setCurrentLINKVaultRead(currentLINKVaultRead);

    // Set Tokens
    const currentWETHToken = new ethers.Contract(
      isMainnet ? NETWORKS.mainnet.weth : NETWORKS.rinkeby.weth,
      ERC20.abi,
      currentSigner
    );
    tokens.setCurrentWETHToken(currentWETHToken);
    const currentDAIToken = new ethers.Contract(
      isMainnet ? NETWORKS.mainnet.dai : NETWORKS.rinkeby.dai,
      WETH.abi,
      currentSigner
    );
    tokens.setCurrentDAIToken(currentDAIToken);
    const currentTCAPToken = new ethers.Contract(
      contracts.TCAP.address,
      contracts.TCAP.abi,
      currentSigner
    );
    tokens.setCurrentTCAPToken(currentTCAPToken);
    const currentAAVEToken = new ethers.Contract(
      contracts.AAVE.address,
      contracts.AAVE.abi,
      currentSigner
    );
    tokens.setCurrentAAVEToken(currentAAVEToken);
    const currentLINKToken = new ethers.Contract(
      contracts.LINK.address,
      contracts.LINK.abi,
      currentSigner
    );
    tokens.setCurrentLINKToken(currentLINKToken);

    const currentWETHTokenRead = new Contract(
      isMainnet ? NETWORKS.mainnet.weth : NETWORKS.rinkeby.weth,
      ERC20.abi
    );
    tokens.setCurrentWETHTokenRead(currentWETHTokenRead);
    const currentDAITokenRead = new Contract(
      isMainnet ? NETWORKS.mainnet.dai : NETWORKS.rinkeby.dai,
      WETH.abi
    );
    tokens.setCurrentDAITokenRead(currentDAITokenRead);
    const currentTCAPTokenRead = new Contract(contracts.TCAP.address, contracts.TCAP.abi);
    tokens.setCurrentTCAPTokenRead(currentTCAPTokenRead);
    const currentAAVETokenRead = new Contract(contracts.AAVE.address, contracts.AAVE.abi);
    tokens.setCurrentAAVETokenRead(currentAAVETokenRead);
    const currentLINKTokenRead = new Contract(contracts.LINK.address, contracts.LINK.abi);
    tokens.setCurrentLINKTokenRead(currentLINKTokenRead);

    // Set Pool Tokens
    const currentWETHPoolToken = new ethers.Contract(
      isMainnet ? NETWORKS.mainnet.ethPool : NETWORKS.rinkeby.ethPool,
      UniV2Pair.abi,
      currentSigner
    );
    tokens.setCurrentWETHPoolToken(currentWETHPoolToken);

    const currentWETHPoolTokenRead = new Contract(
      isMainnet ? NETWORKS.mainnet.ethPool : NETWORKS.rinkeby.ethPool,
      UniV2Pair.abi
    );
    tokens.setCurrentWETHPoolTokenRead(currentWETHPoolTokenRead);

    const currentCTXPoolToken = new ethers.Contract(
      isMainnet ? NETWORKS.mainnet.ctxPool : NETWORKS.rinkeby.ctxPool,
      UniV2Pair.abi,
      currentSigner
    );
    tokens.setCurrentCTXPoolToken(currentCTXPoolToken);

    const currentCTXPoolTokenRead = new Contract(
      isMainnet ? NETWORKS.mainnet.ctxPool : NETWORKS.rinkeby.ctxPool,
      UniV2Pair.abi
    );
    tokens.setCurrentCTXPoolTokenRead(currentCTXPoolTokenRead);

    if (
      (isMainnet && NETWORKS.mainnet.daiPool !== "") ||
      (!isMainnet && NETWORKS.rinkeby.daiPool !== "")
    ) {
      // Set DAI Pool Tokens
      const currentDAIPoolToken = new ethers.Contract(
        isMainnet ? NETWORKS.mainnet.daiPool : NETWORKS.rinkeby.daiPool,
        UniV2Pair.abi,
        currentSigner
      );
      tokens.setCurrentDAIPoolToken(currentDAIPoolToken);
    }

    // Set Rewards
    const currentWETHReward = new ethers.Contract(
      contracts.WETHRewardHandler.address,
      contracts.WETHRewardHandler.abi,
      currentSigner
    );
    rewards.setCurrentWETHReward(currentWETHReward);

    const currentDAIReward = new ethers.Contract(
      contracts.DAIRewardHandler.address,
      contracts.DAIRewardHandler.abi,
      currentSigner
    );
    rewards.setCurrentDAIReward(currentDAIReward);

    const currentWETHRewardRead = new Contract(
      contracts.WETHRewardHandler.address,
      contracts.WETHRewardHandler.abi
    );
    rewards.setCurrentWETHRewardRead(currentWETHRewardRead);

    const currentDAIRewardRead = new Contract(
      contracts.DAIRewardHandler.address,
      contracts.DAIRewardHandler.abi
    );
    rewards.setCurrentDAIRewardRead(currentDAIRewardRead);

    // Set Liquidity Rewards
    const currentWETHPoolReward = new ethers.Contract(
      contracts.ETHLiquidityReward.address,
      contracts.ETHLiquidityReward.abi,
      currentSigner
    );
    rewards.setCurrentWETHPoolReward(currentWETHPoolReward);

    const currentWETHPoolRewardRead = new Contract(
      contracts.ETHLiquidityReward.address,
      contracts.ETHLiquidityReward.abi
    );
    rewards.setCurrentWETHPoolRewardRead(currentWETHPoolRewardRead);

    const currentCTXPoolReward = new ethers.Contract(
      // @ts-ignore
      contracts.CTXLiquidityReward.address, // @ts-ignore
      contracts.CTXLiquidityReward.abi,
      currentSigner
    );
    rewards.setCurrentCTXPoolReward(currentCTXPoolReward);

    const currentCTXPoolRewardRead = new Contract( // @ts-ignore
      contracts.CTXLiquidityReward.address, // @ts-ignore
      contracts.CTXLiquidityReward.abi
    );
    rewards.setCurrentCTXPoolRewardRead(currentCTXPoolRewardRead);

    // Set Oracles
    const currentWETHOracle = new ethers.Contract(
      contracts.WETHOracle.address,
      contracts.WETHOracle.abi,
      currentSigner
    );
    oracles.setCurrentWETHOracle(currentWETHOracle);
    const currentDAIOracle = new ethers.Contract(
      contracts.DAIOracle.address,
      contracts.DAIOracle.abi,
      currentSigner
    );
    oracles.setCurrentDAIOracle(currentDAIOracle);
    const currentTCAPOracle = new ethers.Contract(
      contracts.TCAPOracle.address,
      contracts.TCAPOracle.abi,
      currentSigner
    );
    oracles.setCurrentTCAPOracle(currentTCAPOracle);

    const currentAAVEOracle = new ethers.Contract(
      contracts.AaveOracle.address,
      contracts.AaveOracle.abi,
      currentSigner
    );
    oracles.setCurrentAAVEOracle(currentAAVEOracle);
    const currentLINKOracle = new ethers.Contract(
      contracts.LinkOracle.address,
      contracts.LinkOracle.abi,
      currentSigner
    );
    oracles.setCurrentLINKOracle(currentLINKOracle);

    const currentWETHOracleRead = new Contract(
      contracts.WETHOracle.address,
      contracts.WETHOracle.abi
    );
    oracles.setCurrentWETHOracleRead(currentWETHOracleRead);
    const currentDAIOracleRead = new Contract(contracts.DAIOracle.address, contracts.DAIOracle.abi);
    oracles.setCurrentDAIOracleRead(currentDAIOracleRead);
    const currentTCAPOracleRead = new Contract(
      contracts.TCAPOracle.address,
      contracts.TCAPOracle.abi
    );
    oracles.setCurrentTCAPOracleRead(currentTCAPOracleRead);
    const currentAAVEOracleRead = new Contract(
      contracts.AaveOracle.address,
      contracts.AaveOracle.abi
    );
    oracles.setCurrentAAVEOracleRead(currentAAVEOracleRead);
    const currentLINKOracleRead = new Contract(
      contracts.LinkOracle.address,
      contracts.LinkOracle.abi
    );
    oracles.setCurrentLINKOracleRead(currentLINKOracleRead);

    // Set Governance
    const currentCtx = new ethers.Contract(contracts.Ctx.address, contracts.Ctx.abi, currentSigner);
    tokens.setCurrentCtxToken(currentCtx);
    const currentDelegatorFactory = new ethers.Contract(
      contracts.DelegatorFactory.address,
      contracts.DelegatorFactory.abi,
      currentSigner
    );
    governance.setCurrentDelegatorFactory(currentDelegatorFactory);
    const currentGovernorAlpha = new ethers.Contract(
      contracts.GovernorAlpha.address,
      contracts.GovernorAlpha.abi,
      currentSigner
    );
    governance.setCurrentGovernorAlpha(currentGovernorAlpha);
    const currentTimelock = new ethers.Contract(
      contracts.Timelock.address,
      contracts.Timelock.abi,
      currentSigner
    );
    governance.setCurrentTimelock(currentTimelock);

    const currentCtxRead = new Contract(contracts.Ctx.address, contracts.Ctx.abi);
    tokens.setCurrentCtxTokenRead(currentCtxRead);
    const currentDelegatorFactoryRead = new Contract(
      contracts.DelegatorFactory.address,
      contracts.DelegatorFactory.abi
    );
    governance.setCurrentDelegatorFactoryRead(currentDelegatorFactoryRead);

    const currentGovernorAlphaRead = new Contract(
      contracts.GovernorAlpha.address,
      contracts.GovernorAlpha.abi
    );
    governance.setCurrentGovernorAlphaRead(currentGovernorAlphaRead);
    const currentTimelockRead = new Contract(contracts.Timelock.address, contracts.Timelock.abi);
    governance.setCurrentTimelockRead(currentTimelockRead);
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
    const ethcallProvider = new Provider(currentProvider);
    setContracts(currentSigner, ethcallProvider);
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
        const cAddress = await currentSigner.getAddress();
        setCurrentSignerAddress(cAddress);

        const ethcallProvider = new Provider(currentProvider);
        setContracts(currentSigner, ethcallProvider);
      } else {
        const network = process.env.REACT_APP_NETWORK_NAME;
        const provider = ethers.getDefaultProvider(network, {
          infura: process.env.REACT_APP_INFURA_ID,
          alchemy: process.env.REACT_APP_ALCHEMY_KEY,
        });
        const randomSigner = ethers.Wallet.createRandom().connect(provider);
        const ethcallProvider = new Provider(randomSigner.provider);
        setContracts(randomSigner, ethcallProvider);
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
                      <b>💀 This project is in beta. Use at your own risk.</b>
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
                        ⚠️ Make sure to always have a ratio above the minimum ratio to avoid getting
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
                        <Delegators currentSignerAddress={currentSignerAddress} />
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
