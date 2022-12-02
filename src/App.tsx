/* eslint-disable prefer-destructuring */
import React, { Suspense, useState, useContext, useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { ethers } from "ethers";
import { Provider, Contract, setMulticallAddress } from "ethers-multicall";
import { ToastContainer } from "react-toastify";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { getProviderInfo } from "web3modal";
import "./i18n";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.scss";
import { useSwipeable } from "react-swipeable";
import { useMediaQuery } from "@react-hook/media-query";
import Container from "react-bootstrap/esm/Container";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import WelcomeWrapper from "./components/Welcome/index";
import { Vault, Monitoring } from "./components/Vault";
import Vaults from "./components/Vaults";
import Delegators from "./components/Governance/Delegators";
import MushroomNft from "./components/MushroomNft";
import Loading from "./components/Loading";
import Farm from "./components/Farm";
import Warnings from "./components/Warnings";
import * as hooks from "./hooks";
import {
  governanceContext,
  hardVaultsContext,
  mushroomNftContext,
  networkContext,
  oraclesContext,
  rewardsContext,
  signerContext,
  tokensContext,
  vaultsContext,
  Web3ModalContext,
} from "./state";
import cryptexJson from "./contracts/cryptex.json";
import ERC20 from "./contracts/ERC20.json";
import WETH from "./contracts/WETH.json";
import UniV2Pair from "./contracts/UniswapV2Pair.json";
import Mushroom from "./contracts/Mushroom.json";
import {
  isInLayer1,
  isPolygon,
  isValidNetwork,
  getDefaultProvider,
  toFragment,
  isArbitrum,
  isOptimism,
  isGoerli,
} from "./utils/utils";
import { GRAPHQL_ENDPOINT, NETWORKS } from "./utils/constants";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

const App = () => {
  const signer = hooks.useSigner();
  const web3Modal = useContext(Web3ModalContext);
  const [isLoadingContracts, setLoadingContracts] = useState(false);
  const [invalidNetwork, setInvalidNetwork] = useState(false);
  const isMobile = useMediaQuery("only screen and (max-width: 600px)");
  const [showSidebar, setShowSidebar] = useState(true);
  const [apolloClient, setApolloClient] = useState(
    clientOracle(
      process.env.REACT_APP_NETWORK_ID === "1" ? GRAPHQL_ENDPOINT.mainnet : GRAPHQL_ENDPOINT.goerli
    )
  );
  const networks = hooks.useNetworks();
  const [currentSignerAddress, setCurrentSignerAddress] = useState("");
  const vaults = hooks.useVaults();
  const hardVaults = hooks.useHardVaults();
  const tokens = hooks.useTokens();
  const oracles = hooks.useOracles();
  const governance = hooks.useGovernance();
  const rewards = hooks.useRewards();
  const mushroomNft = hooks.useMushroomNft();
  const match = useRouteMatch();
  setMulticallAddress(NETWORKS.optimism.chainId, "0xD0E99f15B24F265074747B2A1444eB02b9E30422");
  setMulticallAddress(NETWORKS.okovan.chainId, "0x4EFBb8983D5C18A8b6B5084D936B7D12A0BEe2c9");
  setMulticallAddress(
    NETWORKS.arbitrum_goerli.chainId,
    "0x108B25170319f38DbED14cA9716C54E5D1FF4623"
  );

  const setCurrentNetwork = (networkId: number, walletName: string, isBrowserWallet: boolean) => {
    let cNetwork;
    switch (networkId) {
      case NETWORKS.mainnet.chainId:
        cNetwork = NETWORKS.mainnet;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
      case NETWORKS.goerli.chainId:
        cNetwork = NETWORKS.goerli;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.goerli));
        break;
      case NETWORKS.arbitrum.chainId:
        cNetwork = NETWORKS.arbitrum;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.arbitrum));
        break;
      case NETWORKS.arbitrum_goerli.chainId:
        cNetwork = NETWORKS.arbitrum_goerli;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.arbitrum_goerli));
        break;
      case NETWORKS.optimism.chainId:
        cNetwork = NETWORKS.optimism;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.optimism));
        break;
      case NETWORKS.okovan.chainId:
        cNetwork = NETWORKS.okovan;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.okovan));
        break;
      case NETWORKS.polygon.chainId:
        cNetwork = NETWORKS.polygon;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.polygon));
        break;
      case NETWORKS.mumbai.chainId:
        cNetwork = NETWORKS.mumbai;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mumbai));
        break;
      default:
        cNetwork = NETWORKS.mainnet;
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
    }
    networks.setCurrentChainId(networkId);
    networks.setCurrentName(cNetwork.name);
    networks.setCurrentDAIAddress(cNetwork.dai);
    networks.setCurrentIsBrowserWallet(isBrowserWallet);
    if (walletName !== "") networks.setCurrentWallet(walletName);
  };

  const setMushroomContracts = async (chainId: number, currentSigner: ethers.Signer) => {
    let mushroomNftAddress = NETWORKS.mainnet.mushroomNft;
    if (isGoerli(chainId)) {
      mushroomNftAddress = NETWORKS.goerli.mushroomNft;
    }

    // Set Mushroom contracts
    const currentMushroomNft = new ethers.Contract(mushroomNftAddress, Mushroom.abi, currentSigner);
    mushroomNft.setCurrentMushroomNft(currentMushroomNft);

    const currentMushroomNftRead = new Contract(mushroomNftAddress, Mushroom.abi);
    mushroomNft.setCurrentMushroomNftRead(currentMushroomNftRead);
  };

  const setEthereumContracts = async (chainId: number, currentSigner: ethers.Signer) => {
    let contracts;
    let ethPoolAddress;
    let daiPoolAddress;
    let ctxPoolAddress;
    switch (chainId) {
      case 1:
        contracts = cryptexJson[1].mainnet.contracts;
        ethPoolAddress = NETWORKS.mainnet.ethPool;
        daiPoolAddress = NETWORKS.mainnet.daiPool;
        ctxPoolAddress = NETWORKS.mainnet.ctxPool;
        break;
      case 5:
        contracts = cryptexJson[5].goerli.contracts;
        break;
      default:
        contracts = cryptexJson[5].goerli.contracts;
        break;
    }

    // Vaults
    const currentAAVEVault = new ethers.Contract(
      contracts.AaveVaultHandler.address,
      contracts.AaveVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentAAVEVault(currentAAVEVault);
    const currentHardWETHVault = new ethers.Contract(
      contracts.HardWETHVaultHandler.address,
      contracts.HardWETHVaultHandler.abi,
      currentSigner
    );
    hardVaults.setCurrentWETHVault(currentHardWETHVault);
    const currentWBTCVault = new ethers.Contract(
      contracts.WBTCVaultHandler.address,
      contracts.WBTCVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentWBTCVault(currentWBTCVault);
    const currentHardDAIVault = new ethers.Contract(
      contracts.HardDaiVaultHandler.address,
      contracts.HardDaiVaultHandler.abi,
      currentSigner
    );
    hardVaults.setCurrentDAIVault(currentHardDAIVault);
    const currentHardUSDCVault = new ethers.Contract(
      contracts.HardUSDCVaultHandler.address,
      contracts.HardUSDCVaultHandler.abi,
      currentSigner
    );
    hardVaults.setCurrentUSDCVault(currentHardUSDCVault);
    const currentHardWBTCVault = new ethers.Contract(
      contracts.HardWBTCVaultHandler.address,
      contracts.HardWBTCVaultHandler.abi,
      currentSigner
    );
    hardVaults.setCurrentWBTCVault(currentHardWBTCVault);

    const currentAVEEVaultRead = new Contract(
      contracts.AaveVaultHandler.address,
      contracts.AaveVaultHandler.abi
    );
    vaults.setCurrentAAVEVaultRead(currentAVEEVaultRead);
    const currentHardWETHVaultRead = new Contract(
      contracts.HardWETHVaultHandler.address,
      toFragment(contracts.HardWETHVaultHandler.abi)
    );
    hardVaults.setCurrentWETHVaultRead(currentHardWETHVaultRead);
    const currentWBTCVaultRead = new Contract(
      contracts.WBTCVaultHandler.address,
      contracts.WBTCVaultHandler.abi
    );
    vaults.setCurrentWBTCVaultRead(currentWBTCVaultRead);
    const currentHardDAIVaultRead = new Contract(
      contracts.HardDaiVaultHandler.address,
      toFragment(contracts.HardDaiVaultHandler.abi)
    );
    hardVaults.setCurrentDAIVaultRead(currentHardDAIVaultRead);
    const currentHardUSDCVaultRead = new Contract(
      contracts.HardUSDCVaultHandler.address,
      toFragment(contracts.HardUSDCVaultHandler.abi)
    );
    hardVaults.setCurrentUSDCVaultRead(currentHardUSDCVaultRead);
    const currentHardWBTCVaultRead = new Contract(
      contracts.HardWBTCVaultHandler.address,
      toFragment(contracts.HardWBTCVaultHandler.abi)
    );
    hardVaults.setCurrentWBTCVaultRead(currentHardWBTCVaultRead);

    // Tokens
    const currentAAVEToken = new ethers.Contract(
      contracts.AAVE.address,
      contracts.AAVE.abi,
      currentSigner
    );
    tokens.setCurrentAAVEToken(currentAAVEToken);
    const currentWBTCToken = new ethers.Contract(
      contracts.WBTC.address,
      contracts.WBTC.abi,
      currentSigner
    );
    tokens.setCurrentWBTCToken(currentWBTCToken);
    const currentUSDCToken = new ethers.Contract(
      contracts.USDC.address,
      contracts.USDC.abi,
      currentSigner
    );
    tokens.setCurrentUSDCToken(currentUSDCToken);

    const currentAAVETokenRead = new Contract(contracts.AAVE.address, contracts.AAVE.abi);
    tokens.setCurrentAAVETokenRead(currentAAVETokenRead);
    const currentWBTCTokenRead = new Contract(contracts.WBTC.address, ERC20.abi);
    tokens.setCurrentWBTCTokenRead(currentWBTCTokenRead);
    const currentUSDCTokenRead = new Contract(contracts.USDC.address, contracts.USDC.abi);
    tokens.setCurrentUSDCTokenRead(currentUSDCTokenRead);

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
    const currentWBTCOracle = new ethers.Contract(
      contracts.WBTCOracle.address,
      contracts.WBTCOracle.abi,
      currentSigner
    );
    oracles.setCurrentWBTCOracle(currentWBTCOracle);
    const currentUSDCOracle = new ethers.Contract(
      contracts.USDCOracle.address,
      contracts.USDCOracle.abi,
      currentSigner
    );
    oracles.setCurrentUSDCOracle(currentUSDCOracle);
    const currentAAVEOracleRead = new Contract(
      contracts.AaveOracle.address,
      contracts.AaveOracle.abi
    );
    oracles.setCurrentAAVEOracleRead(currentAAVEOracleRead);
    const currentWBTCOracleRead = new Contract(
      contracts.WBTCOracle.address,
      contracts.WBTCOracle.abi
    );
    oracles.setCurrentWBTCOracleRead(currentWBTCOracleRead);
    const currentUSDCOracleRead = new Contract(
      contracts.USDCOracle.address,
      contracts.USDCOracle.abi
    );
    oracles.setCurrentUSDCOracleRead(currentUSDCOracleRead);

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
    await setMushroomContracts(chainId, currentSigner);
  };

  const setArbitrumContracts = async (
    chainId: number,
    currentSigner: ethers.Signer,
    ethcallProvider: Provider
  ) => {
    await ethcallProvider.init();
    signer.setCurrentEthcallProvider(ethcallProvider);
    let contracts;
    let wethAddress;
    let daiAddress;

    switch (chainId) {
      case NETWORKS.arbitrum.chainId:
        contracts = cryptexJson[42161].mainnet.contracts;
        wethAddress = NETWORKS.arbitrum.weth;
        daiAddress = NETWORKS.arbitrum.dai;
        break;
      case NETWORKS.arbitrum_goerli.chainId:
        contracts = cryptexJson[421613].arbitrum_goerli.contracts;
        wethAddress = NETWORKS.arbitrum_goerli.weth;
        daiAddress = NETWORKS.arbitrum_goerli.dai;
        break;
      default:
        contracts = cryptexJson[42161].arbitrum.contracts;
        wethAddress = NETWORKS.arbitrum.weth;
        daiAddress = NETWORKS.arbitrum.dai;
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
  };

  const setOptimismContracts = async (currentSigner: ethers.Signer) => {
    const contracts = cryptexJson[10].optimism.contracts;

    // Set Vaults
    const currentSNXVault = new ethers.Contract(
      contracts.SNXVaultHandler.address,
      contracts.SNXVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentSNXVault(currentSNXVault);
    const currentUNIVault = new ethers.Contract(
      contracts.UNIVaultHandler.address,
      contracts.UNIVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentUNIVault(currentUNIVault);

    const currentSNXVaultRead = new Contract(
      contracts.SNXVaultHandler.address,
      contracts.SNXVaultHandler.abi
    );
    vaults.setCurrentSNXVaultRead(currentSNXVaultRead);
    const currentUNIVaultRead = new Contract(
      contracts.UNIVaultHandler.address,
      contracts.UNIVaultHandler.abi
    );
    vaults.setCurrentUNIVaultRead(currentUNIVaultRead);

    // Set Tokens
    const currentSNXToken = new ethers.Contract(NETWORKS.optimism.snx, ERC20.abi, currentSigner);
    tokens.setCurrentSNXToken(currentSNXToken);
    const currentUNIToken = new ethers.Contract(NETWORKS.optimism.uni, ERC20.abi, currentSigner);
    tokens.setCurrentUNIToken(currentUNIToken);

    const currentSNXTokenRead = new Contract(NETWORKS.optimism.snx, ERC20.abi);
    tokens.setCurrentSNXTokenRead(currentSNXTokenRead);
    const currentUNITokenRead = new Contract(NETWORKS.optimism.uni, ERC20.abi);
    tokens.setCurrentUNITokenRead(currentUNITokenRead);

    // Set Oracles
    const currentSNXOracle = new ethers.Contract(
      contracts.SNXOracle.address,
      contracts.SNXOracle.abi,
      currentSigner
    );
    oracles.setCurrentSNXOracle(currentSNXOracle);
    const currentUNIOracle = new ethers.Contract(
      contracts.UNIOracle.address,
      contracts.UNIOracle.abi,
      currentSigner
    );
    oracles.setCurrentUNIOracle(currentUNIOracle);

    const currentSNXOracleRead = new Contract(contracts.SNXOracle.address, contracts.SNXOracle.abi);
    oracles.setCurrentSNXOracleRead(currentSNXOracleRead);
    const currentUNIOracleRead = new Contract(contracts.UNIOracle.address, contracts.UNIOracle.abi);
    oracles.setCurrentUNIOracleRead(currentUNIOracleRead);
  };

  const setPolygonContracts = async (
    chainId: number,
    currentSigner: ethers.Signer,
    ethcallProvider: Provider
  ) => {
    await ethcallProvider.init();
    signer.setCurrentEthcallProvider(ethcallProvider);
    let contracts;
    let daiAddress = NETWORKS.polygon.dai;
    let maticAddress = NETWORKS.polygon.matic;

    if (chainId === NETWORKS.polygon.chainId) {
      contracts = cryptexJson[137].polygon.contracts;
    } else {
      contracts = cryptexJson[80001].mumbai.contracts;
      daiAddress = NETWORKS.mumbai.dai;
      maticAddress = NETWORKS.mumbai.matic;
    }

    // Set Vaults
    const currentDAIVault = new ethers.Contract(
      contracts.DAIVaultHandler.address,
      contracts.DAIVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentDAIVault(currentDAIVault);
    const currentMaticVault = new ethers.Contract(
      contracts.MATICVaultHandler.address,
      contracts.MATICVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentMaticVault(currentMaticVault);
    const currentWBTCVault = new ethers.Contract(
      contracts.WBTCVaultHandler.address,
      contracts.WBTCVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentWBTCVault(currentWBTCVault);

    const currentDAIVaultRead = new Contract(
      contracts.DAIVaultHandler.address,
      contracts.DAIVaultHandler.abi
    );
    vaults.setCurrentDAIVaultRead(currentDAIVaultRead);
    const currentMATICVaultRead = new Contract(
      contracts.MATICVaultHandler.address,
      toFragment(contracts.MATICVaultHandler.abi)
    );
    vaults.setCurrentMaticVaultRead(currentMATICVaultRead);
    const currentWBTCVaultRead = new Contract(
      contracts.WBTCVaultHandler.address,
      contracts.WBTCVaultHandler.abi
    );
    vaults.setCurrentWBTCVaultRead(currentWBTCVaultRead);

    // Set Tokens
    const currentDAIToken = new ethers.Contract(daiAddress, WETH.abi, currentSigner);
    tokens.setCurrentDAIToken(currentDAIToken);
    const currentMATICToken = new ethers.Contract(maticAddress, ERC20.abi, currentSigner);
    tokens.setCurrentMATICToken(currentMATICToken);
    const currentWBTCToken = new ethers.Contract(
      contracts.WBTC.address,
      contracts.WBTC.abi,
      currentSigner
    );
    tokens.setCurrentWBTCToken(currentWBTCToken);
    const currentTCAPToken = new ethers.Contract(
      contracts.TCAP.address,
      contracts.TCAP.abi,
      currentSigner
    );
    tokens.setCurrentTCAPToken(currentTCAPToken);

    const currentDAITokenRead = new Contract(daiAddress, WETH.abi);
    tokens.setCurrentDAITokenRead(currentDAITokenRead);
    const currentMATICTokenRead = new Contract(maticAddress, ERC20.abi);
    tokens.setCurrentMATICTokenRead(currentMATICTokenRead);
    const currentWBTCTokenRead = new Contract(contracts.WBTC.address, ERC20.abi);
    tokens.setCurrentWBTCTokenRead(currentWBTCTokenRead);
    const currentTCAPTokenRead = new Contract(contracts.TCAP.address, contracts.TCAP.abi);
    tokens.setCurrentTCAPTokenRead(currentTCAPTokenRead);

    // Set Oracles
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
    const currentMATICOracle = new ethers.Contract(
      contracts.MATICOracle.address,
      contracts.MATICOracle.abi,
      currentSigner
    );
    oracles.setCurrentMATICOracle(currentMATICOracle);
    const currentWBTCOracle = new ethers.Contract(
      contracts.WBTCOracle.address,
      contracts.WBTCOracle.abi,
      currentSigner
    );
    oracles.setCurrentWBTCOracle(currentWBTCOracle);
    const currentDAIOracleRead = new Contract(contracts.DAIOracle.address, contracts.DAIOracle.abi);
    oracles.setCurrentDAIOracleRead(currentDAIOracleRead);
    const currentTCAPOracleRead = new Contract(
      contracts.TCAPOracle.address,
      contracts.TCAPOracle.abi
    );
    oracles.setCurrentTCAPOracleRead(currentTCAPOracleRead);
    const currentMATICOracleRead = new Contract(
      contracts.MATICOracle.address,
      contracts.MATICOracle.abi
    );
    oracles.setCurrentMATICOracleRead(currentMATICOracleRead);
    const currentWBTCOracleRead = new Contract(
      contracts.WBTCOracle.address,
      contracts.WBTCOracle.abi
    );
    oracles.setCurrentWBTCOracleRead(currentWBTCOracleRead);
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
    let linkAddress;
    switch (chainId) {
      case NETWORKS.mainnet.chainId:
        contracts = cryptexJson[1].mainnet.contracts;
        wethAddress = NETWORKS.mainnet.weth;
        daiAddress = NETWORKS.mainnet.dai;
        linkAddress = contracts.LINK.address;
        break;
      case NETWORKS.goerli.chainId:
        contracts = cryptexJson[5].goerli.contracts;
        wethAddress = NETWORKS.goerli.weth;
        daiAddress = NETWORKS.goerli.dai;
        linkAddress = contracts.LINK.address;
        break;
      case NETWORKS.optimism.chainId:
        contracts = cryptexJson[10].optimism.contracts;
        wethAddress = NETWORKS.optimism.weth;
        daiAddress = NETWORKS.optimism.dai;
        linkAddress = NETWORKS.optimism.link;
        break;
      case NETWORKS.okovan.chainId:
        contracts = cryptexJson[69].okovan.contracts;
        wethAddress = NETWORKS.okovan.weth;
        daiAddress = NETWORKS.okovan.dai;
        linkAddress = "";
        break;
      default:
        contracts = cryptexJson[5].goerli.contracts;
        wethAddress = NETWORKS.goerli.weth;
        daiAddress = NETWORKS.goerli.dai;
        linkAddress = contracts.LINK.address;
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
    const currentLINKVault = new ethers.Contract(
      contracts.LinkVaultHandler.address,
      contracts.LinkVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentLINKVault(currentLINKVault);

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
    const currentLINKVaultRead = new Contract(
      contracts.LinkVaultHandler.address,
      contracts.LinkVaultHandler.abi
    );
    vaults.setCurrentLINKVaultRead(currentLINKVaultRead);

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
    const currentLINKToken = new ethers.Contract(linkAddress, ERC20.abi, currentSigner);
    tokens.setCurrentLINKToken(currentLINKToken);

    const currentWETHTokenRead = new Contract(wethAddress, ERC20.abi);
    tokens.setCurrentWETHTokenRead(currentWETHTokenRead);
    const currentDAITokenRead = new Contract(daiAddress, WETH.abi);
    tokens.setCurrentDAITokenRead(currentDAITokenRead);
    const currentTCAPTokenRead = new Contract(contracts.TCAP.address, contracts.TCAP.abi);
    tokens.setCurrentTCAPTokenRead(currentTCAPTokenRead);
    const currentLINKTokenRead = new Contract(linkAddress, ERC20.abi);
    tokens.setCurrentLINKTokenRead(currentLINKTokenRead);

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
    const currentLINKOracle = new ethers.Contract(
      contracts.LinkOracle.address,
      contracts.LinkOracle.abi,
      currentSigner
    );
    oracles.setCurrentLINKOracle(currentLINKOracle);
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
    const currentLINKOracleRead = new Contract(
      contracts.LinkOracle.address,
      contracts.LinkOracle.abi
    );
    oracles.setCurrentLINKOracleRead(currentLINKOracleRead);
    const currentTCAPOracleRead = new Contract(
      contracts.TCAPOracle.address,
      contracts.TCAPOracle.abi
    );
    oracles.setCurrentTCAPOracleRead(currentTCAPOracleRead);

    if (isInLayer1(chainId)) {
      setEthereumContracts(chainId, currentSigner);
    }
    if (isOptimism(chainId)) {
      setOptimismContracts(currentSigner);
    }
  };

  web3Modal.on("connect", async (networkProvider) => {
    setLoadingContracts(true);
    const currentProvider = new ethers.providers.Web3Provider(networkProvider);
    const network = await currentProvider.getNetwork();
    const isNftFruit =
      window.location.toString().includes("sewagefruit") && isGoerli(network.chainId);

    if (!isValidNetwork(network.chainId) && !isNftFruit) {
      setInvalidNetwork(true);
    }
    const walletName = currentProvider.provider.isMetaMask ? "metamask" : "other";
    const currentSigner = currentProvider.getSigner();
    signer.setCurrentSigner(currentSigner);
    const ethcallProvider = new Provider(currentProvider);
    if (isArbitrum(network.chainId)) {
      await setArbitrumContracts(network.chainId, currentSigner, ethcallProvider);
    } else if (isPolygon(network.chainId)) {
      await setPolygonContracts(network.chainId, currentSigner, ethcallProvider);
    } else {
      await setContracts(currentSigner, ethcallProvider, network.chainId || 5);
    }

    const isBrowserWallet =
      networkProvider.isMetaMask || getProviderInfo(networkProvider.id === "walletlink");
    const cAddress = await currentSigner.getAddress();
    setCurrentSignerAddress(cAddress);
    setCurrentNetwork(network.chainId, walletName, isBrowserWallet);

    // @ts-ignore
    networkProvider.on("chainChanged", (chainId: number) => {
      if (chainId !== network.chainId) {
        setCurrentNetwork(chainId, "", isBrowserWallet);
        window.location.reload();
      }
    });
    if (networkProvider.isFortmatic) {
      // @ts-ignore
      networkProvider.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          web3Modal.clearCachedProvider();
        }
        window.location.reload();
      });
    }

    setLoadingContracts(false);
  });

  useEffect(() => {
    async function loadProvider() {
      if (web3Modal.cachedProvider && !signer.signer) {
        if (!isLoadingContracts) {
          await web3Modal.connect();
        }
      } else {
        setLoadingContracts(true);
        const chainId = process.env.REACT_APP_NETWORK_ID || "5";
        let networkName = NETWORKS.mainnet.name;
        if (isGoerli(parseInt(chainId))) {
          networkName = NETWORKS.goerli.name;
        }
        const provider = getDefaultProvider(parseInt(chainId), networkName);
        const randomSigner = ethers.Wallet.createRandom().connect(provider);
        const ethcallProvider = new Provider(randomSigner.provider);
        if (isArbitrum(parseInt(chainId))) {
          setArbitrumContracts(parseInt(chainId), randomSigner, ethcallProvider);
        } else if (isPolygon(parseInt(chainId))) {
          setPolygonContracts(parseInt(chainId), randomSigner, ethcallProvider);
        } else {
          setContracts(randomSigner, ethcallProvider, parseInt(chainId));
        }
        setCurrentNetwork(parseInt(chainId), "", false);
        setLoadingContracts(false);
      }
    }
    // Execute the created function directly
    loadProvider();
    // eslint-disable-next-line
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => setShowSidebar(true),
    onSwipedRight: () => setShowSidebar(false),
    delta: 40,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (isLoadingContracts) {
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
      <networkContext.Provider value={networks}>
        <tokensContext.Provider value={tokens}>
          <oraclesContext.Provider value={oracles}>
            <vaultsContext.Provider value={vaults}>
              <hardVaultsContext.Provider value={hardVaults}>
                <governanceContext.Provider value={governance}>
                  <rewardsContext.Provider value={rewards}>
                    <mushroomNftContext.Provider value={mushroomNft}>
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
                      <Suspense fallback={<Loading position="total" />}>
                        <Container fluid className="wrapper" {...handlers}>
                          <Warnings />
                          <Header signerAddress={currentSignerAddress} isMobile={isMobile} />
                          <ToastContainer />
                          <Switch>
                            <Route path={`${match.url}/`}>
                              <WelcomeWrapper
                                signerAddress={currentSignerAddress}
                                loadingContracts={isLoadingContracts}
                              />
                            </Route>
                            <Route path={`${match.url}farm`}>
                              <Farm />
                            </Route>
                            <ApolloProvider client={apolloClient}>
                              <Route path={`${match.url}vault`}>
                                <Vault />
                              </Route>
                              <Route path={`${match.url}vaults`}>
                                <Vaults />
                              </Route>
                              <Route path={`${match.url}vault-monitoring`}>
                                <Monitoring />
                              </Route>
                              <Route path={`${match.url}governance`}>
                                <Delegators currentSignerAddress={currentSignerAddress} />
                              </Route>
                              <Route path={`${match.url}sewagefruitz`}>
                                <MushroomNft />
                              </Route>
                            </ApolloProvider>
                          </Switch>
                        </Container>
                      </Suspense>
                    </mushroomNftContext.Provider>
                  </rewardsContext.Provider>
                </governanceContext.Provider>
              </hardVaultsContext.Provider>
            </vaultsContext.Provider>
          </oraclesContext.Provider>
        </tokensContext.Provider>
      </networkContext.Provider>
    </signerContext.Provider>
  );
};

export default App;
