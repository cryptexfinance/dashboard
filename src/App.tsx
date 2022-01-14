/* eslint-disable prefer-destructuring */
import React, { useState, useContext, useEffect } from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { Provider, Contract, setMulticallAddress } from "ethers-multicall";
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
import Wrapper from "./components/Welcome/index";
import Graph from "./components/Graph";
import Vault from "./components/Vault/Vault";
import Pool from "./components/Pool";
import Delegators from "./components/Governance/Delegators";
import Loading from "./components/Loading";
import Farm from "./components/Farm";
import { useSigner } from "./hooks/useSigner";
import { useNetworks } from "./hooks/useNetworks";
import { useVaults } from "./hooks/useVaults";
import { useTokens } from "./hooks/useTokens";
import { useOracles } from "./hooks/useOracles";
import { useGovernance } from "./hooks/useGovernance";
import { useRewards } from "./hooks/useRewards";
import signerContext from "./state/SignerContext";
import NetworkContext from "./state/NetworkContext";
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
import { isValidNetwork, getDefaultProvider, toFragment } from "./utils/utils";
import { GRAPHQL_ENDPOINT, NETWORKS } from "./utils/constants";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

const App = () => {
  const signer = useSigner();
  const web3Modal = useContext(Web3ModalContext);
  const [isLoading, setLoading] = useState(false);
  const [invalidNetwork, setInvalidNetwork] = useState(false);
  const [show, setShow] = useState(true);
  const [vaultWarning, setVaultWarning] = useState(true);
  const isMobile = useMediaQuery("only screen and (max-width: 600px)");
  const [showSidebar, setShowSidebar] = useState(true);
  const [apolloClient, setApolloClient] = useState(
    clientOracle(
      process.env.REACT_APP_NETWORK_ID === "1" ? GRAPHQL_ENDPOINT.mainnet : GRAPHQL_ENDPOINT.rinkeby
    )
  );
  const networks = useNetworks();
  const [currentSignerAddress, setCurrentSignerAddress] = useState("");
  const vaults = useVaults();
  const tokens = useTokens();
  const oracles = useOracles();
  const governance = useGovernance();
  const rewards = useRewards();
  const match = useRouteMatch();
  const location = useLocation();
  setMulticallAddress(NETWORKS.okovan.chainId, "0x4EFBb8983D5C18A8b6B5084D936B7D12A0BEe2c9");

  const setCurrentNetwork = (networkId: number, walletName: string) => {
    let cNetwork;
    switch (networkId) {
      case 1:
        cNetwork = NETWORKS.mainnet;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
      case 4:
        cNetwork = NETWORKS.rinkeby;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.rinkeby));
        break;
      case 69:
        cNetwork = NETWORKS.okovan;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.okovan));
        break;
      case 137:
        cNetwork = NETWORKS.polygon;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.polygon));
        break;
      default:
        cNetwork = NETWORKS.rinkeby;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.rinkeby));
        break;
    }
    networks.setCurrentChainId(networkId);
    networks.setCurrentName(cNetwork.name);
    networks.setCurrentWETHAddress(cNetwork.weth);
    networks.setCurrentDAIAddress(cNetwork.dai);
    if (walletName !== "") networks.setCurrentWallet(walletName);
  };

  const setEthereumContracts = async (chainId: number, currentSigner: ethers.Signer) => {
    let contracts;
    let ethPoolAddress = NETWORKS.rinkeby.ethPool;
    let daiPoolAddress = NETWORKS.rinkeby.daiPool;
    let ctxPoolAddress = NETWORKS.rinkeby.ctxPool;
    switch (chainId) {
      case 1:
        contracts = cryptexJson[1].mainnet.contracts;
        ethPoolAddress = NETWORKS.mainnet.ethPool;
        daiPoolAddress = NETWORKS.mainnet.daiPool;
        ctxPoolAddress = NETWORKS.mainnet.ctxPool;
        break;
      case 4:
        contracts = cryptexJson[4].rinkeby.contracts;
        break;
      default:
        contracts = cryptexJson[4].rinkeby.contracts;
        break;
    }

    // Vaults
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

    // Tokens
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

    const currentAAVETokenRead = new Contract(contracts.AAVE.address, contracts.AAVE.abi);
    tokens.setCurrentAAVETokenRead(currentAAVETokenRead);
    const currentLINKTokenRead = new Contract(contracts.LINK.address, contracts.LINK.abi);
    tokens.setCurrentLINKTokenRead(currentLINKTokenRead);

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

    // Oracles
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
    const currentDelegatorFactory = new ethers.Contract(
      contracts.DelegatorFactory.address,
      contracts.DelegatorFactory.abi,
      currentSigner
    );
    governance.setCurrentDelegatorFactory(currentDelegatorFactory);
    const currentDelegatorFactoryRead = new Contract(
      contracts.DelegatorFactory.address,
      contracts.DelegatorFactory.abi
    );
    governance.setCurrentDelegatorFactoryRead(currentDelegatorFactoryRead);

    // TODO:remove this once other pools work
    if (ethPoolAddress && ctxPoolAddress) {
      const currentWETHPoolToken = new ethers.Contract(
        ethPoolAddress,
        UniV2Pair.abi,
        currentSigner
      );
      tokens.setCurrentWETHPoolToken(currentWETHPoolToken);

      const currentWETHPoolTokenRead = new Contract(ethPoolAddress, UniV2Pair.abi);
      tokens.setCurrentWETHPoolTokenRead(currentWETHPoolTokenRead);

      const currentCTXPoolToken = new ethers.Contract(ctxPoolAddress, UniV2Pair.abi, currentSigner);
      tokens.setCurrentCTXPoolToken(currentCTXPoolToken);

      const currentCTXPoolTokenRead = new Contract(ctxPoolAddress, UniV2Pair.abi);
      tokens.setCurrentCTXPoolTokenRead(currentCTXPoolTokenRead);
    }

    if (daiPoolAddress) {
      const currentDAIPoolToken = new ethers.Contract(daiPoolAddress, UniV2Pair.abi, currentSigner);
      tokens.setCurrentDAIPoolToken(currentDAIPoolToken);
    }
  };

  const setPolygonContracts = async (currentSigner: ethers.Signer) => {
    const contracts = cryptexJson[137].polygon.contracts;

    // Set Vaults
    const currentMaticVault = new ethers.Contract(
      contracts.MATICVaultHandler.address,
      contracts.MATICVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentMaticVault(currentMaticVault);

    const currentMATICVaultRead = new Contract(
      contracts.MATICVaultHandler.address,
      toFragment(contracts.MATICVaultHandler.abi)
    );
    vaults.setCurrentMaticVaultRead(currentMATICVaultRead);

    // Set Tokens
    const currentMATICToken = new ethers.Contract(NETWORKS.polygon.matic, ERC20.abi, currentSigner);
    tokens.setCurrentMATICToken(currentMATICToken);
    const currentMATICTokenRead = new Contract(NETWORKS.polygon.matic, ERC20.abi);
    tokens.setCurrentMATICTokenRead(currentMATICTokenRead);
    // Set Oracles
    const currentMATICOracle = new ethers.Contract(
      contracts.MATICOracle.address,
      contracts.MATICOracle.abi,
      currentSigner
    );
    oracles.setCurrentMATICOracle(currentMATICOracle);
    const currentMATICOracleRead = new Contract(
      contracts.MATICOracle.address,
      contracts.MATICOracle.abi
    );
    oracles.setCurrentMATICOracleRead(currentMATICOracleRead);
  };

  const setContracts = async (
    currentSigner: ethers.Signer,
    ethcallProvider: Provider,
    chainId: number
  ) => {
    await ethcallProvider.init();
    signer.setCurrentEthcallProvider(ethcallProvider);
    let contracts;
    let wethAddress;
    let daiAddress;
    switch (chainId) {
      case 1:
        contracts = cryptexJson[1].mainnet.contracts;
        wethAddress = NETWORKS.mainnet.weth;
        daiAddress = NETWORKS.mainnet.dai;
        break;
      case 4:
        contracts = cryptexJson[4].rinkeby.contracts;
        wethAddress = NETWORKS.rinkeby.weth;
        daiAddress = NETWORKS.rinkeby.dai;
        break;
      case 69:
        contracts = cryptexJson[69].okovan.contracts;
        wethAddress = NETWORKS.okovan.weth;
        daiAddress = NETWORKS.okovan.dai;
        break;
      case 137:
        contracts = cryptexJson[137].polygon.contracts;
        wethAddress = NETWORKS.polygon.weth;
        daiAddress = NETWORKS.polygon.dai;
        break;
      default:
        contracts = cryptexJson[4].rinkeby.contracts;
        wethAddress = NETWORKS.rinkeby.weth;
        daiAddress = NETWORKS.rinkeby.dai;
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

    const currentWETHVaultRead = new Contract(
      contracts.WETHVaultHandler.address,
      toFragment(contracts.WETHVaultHandler.abi)
    );
    vaults.setCurrentWETHVaultRead(currentWETHVaultRead);
    const currentDAIVaultRead = new Contract(
      contracts.DAIVaultHandler.address,
      contracts.DAIVaultHandler.abi
    );
    vaults.setCurrentDAIVaultRead(currentDAIVaultRead);

    // Set Tokens
    const currentWETHToken = new ethers.Contract(wethAddress, ERC20.abi, currentSigner);
    tokens.setCurrentWETHToken(currentWETHToken);
    const currentDAIToken = new ethers.Contract(daiAddress, WETH.abi, currentSigner);
    tokens.setCurrentDAIToken(currentDAIToken);
    const currentTCAPToken = new ethers.Contract(
      contracts.TCAP.address,
      contracts.TCAP.abi,
      currentSigner
    );
    tokens.setCurrentTCAPToken(currentTCAPToken);

    const currentWETHTokenRead = new Contract(wethAddress, ERC20.abi);
    tokens.setCurrentWETHTokenRead(currentWETHTokenRead);
    const currentDAITokenRead = new Contract(daiAddress, WETH.abi);
    tokens.setCurrentDAITokenRead(currentDAITokenRead);
    const currentTCAPTokenRead = new Contract(contracts.TCAP.address, contracts.TCAP.abi);
    tokens.setCurrentTCAPTokenRead(currentTCAPTokenRead);

    // Set Rewards
    const currentWETHReward = new ethers.Contract(
      // @ts-ignore
      contracts.WETHRewardHandler.address,
      // @ts-ignore
      contracts.WETHRewardHandler.abi,
      currentSigner
    );
    rewards.setCurrentWETHReward(currentWETHReward);
    const currentDAIReward = new ethers.Contract(
      // @ts-ignore
      contracts.DAIRewardHandler.address,
      // @ts-ignore
      contracts.DAIRewardHandler.abi,
      currentSigner
    );
    rewards.setCurrentDAIReward(currentDAIReward);

    const currentWETHRewardRead = new Contract(
      // @ts-ignore
      contracts.WETHRewardHandler.address,
      // @ts-ignore
      contracts.WETHRewardHandler.abi
    );
    rewards.setCurrentWETHRewardRead(currentWETHRewardRead);

    const currentDAIRewardRead = new Contract(
      // @ts-ignore
      contracts.DAIRewardHandler.address,
      // @ts-ignore
      contracts.DAIRewardHandler.abi
    );
    rewards.setCurrentDAIRewardRead(currentDAIRewardRead);

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

    // Set Governance
    // @ts-ignore
    const currentCtx = new ethers.Contract(contracts.Ctx.address, contracts.Ctx.abi, currentSigner);
    tokens.setCurrentCtxToken(currentCtx);
    const currentGovernorAlpha = new ethers.Contract(
      // @ts-ignore
      contracts.GovernorAlpha.address,
      // @ts-ignore
      contracts.GovernorAlpha.abi,
      currentSigner
    );
    governance.setCurrentGovernorAlpha(currentGovernorAlpha);
    const currentTimelock = new ethers.Contract(
      // @ts-ignore
      contracts.Timelock.address,
      // @ts-ignore
      contracts.Timelock.abi,
      currentSigner
    );
    governance.setCurrentTimelock(currentTimelock);
    // @ts-ignore
    const currentCtxRead = new Contract(contracts.Ctx.address, contracts.Ctx.abi);
    tokens.setCurrentCtxTokenRead(currentCtxRead);

    const currentGovernorAlphaRead = new Contract(
      // @ts-ignore
      contracts.GovernorAlpha.address,
      // @ts-ignore
      contracts.GovernorAlpha.abi
    );
    governance.setCurrentGovernorAlphaRead(currentGovernorAlphaRead);
    const currentTimelockRead = new Contract(
      // @ts-ignore
      contracts.Timelock.address,
      // @ts-ignore
      toFragment(contracts.Timelock.abi)
    );
    governance.setCurrentTimelockRead(currentTimelockRead);

    if (chainId === NETWORKS.mainnet.chainId || chainId === NETWORKS.rinkeby.chainId) {
      setEthereumContracts(chainId, currentSigner);
    }
    if (chainId === NETWORKS.polygon.chainId) {
      setPolygonContracts(currentSigner);
    }
  };

  web3Modal.on("connect", async (networkProvider) => {
    setLoading(true);
    const currentProvider = new ethers.providers.Web3Provider(networkProvider);
    const network = await currentProvider.getNetwork();
    if (!isValidNetwork(network.chainId)) {
      setInvalidNetwork(true);
    }
    const walletName = currentProvider.provider.isMetaMask ? "metamask" : "other";
    const currentSigner = currentProvider.getSigner();
    signer.setCurrentSigner(currentSigner);
    const ethcallProvider = new Provider(currentProvider);
    await setContracts(currentSigner, ethcallProvider, network.chainId || 4);
    const cAddress = await currentSigner.getAddress();
    setCurrentSignerAddress(cAddress);
    setCurrentNetwork(network.chainId, walletName);
    // @ts-ignore
    /* networkProvider.on("chainChanged", (chainId: number) => {
      // web3Modal.clearCachedProvider();
      setCurrentNetwork(chainId, "");
      window.location.reload();
    }); */
    setLoading(false);
  });

  useEffect(() => {
    const savedAlert = localStorage.getItem("alert");
    if (savedAlert) setShow(false);
    async function loadProvider() {
      if (web3Modal.cachedProvider && !signer.signer) {
        // const networkProvider =
        if (!isLoading) {
          await web3Modal.connect();
        }
      } else {
        setLoading(true);
        const chainId = process.env.REACT_APP_NETWORK_ID || "4";
        const provider = getDefaultProvider(parseInt(chainId), NETWORKS.rinkeby.name);
        const randomSigner = ethers.Wallet.createRandom().connect(provider);
        const ethcallProvider = new Provider(randomSigner.provider);
        setContracts(randomSigner, ethcallProvider, parseInt(chainId));
        setLoading(false);
      }
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
      <NetworkContext.Provider value={networks}>
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
                          ⚠️ Make sure to always have a ratio above the minimum ratio to avoid
                          getting liquidated.
                        </b>
                      </Alert>
                    )}

                    <Header signerAddress={currentSignerAddress} />
                    <ToastContainer />
                    <Switch>
                      <Route path={`${match.url}/`}>
                        <Wrapper />
                      </Route>
                      <ApolloProvider client={apolloClient}>
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
      </NetworkContext.Provider>
    </signerContext.Provider>
  );
};

export default App;
