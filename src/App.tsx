import React, { useState, useContext, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ethers } from "ethers";
import Container from "react-bootstrap/esm/Container";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Welcome from "./components/Welcome";
import Graph from "./components/Graph";
import Vault from "./components/Vault";
import Faucet from "./components/Faucet";
import { useSigner } from "./hooks/useSigner";
import { useVaults } from "./hooks/useVaults";
import { useTokens } from "./hooks/useTokens";
import { useOracles } from "./hooks/useOracles";
import signerContext from "./state/SignerContext";
import vaultsContext from "./state/VaultsContext";
import tokensContext from "./state/TokensContext";
import oraclesContext from "./state/OraclesContext";
import { Web3ModalContext } from "./state/Web3ModalContext";
import WETHVault from "./contracts/WETHVaultHandler.json";
import WBTCVault from "./contracts/BTCVaultHandler.json";
import DAIVault from "./contracts/DAIVaultHandler.json";
import WETHOracle from "./contracts/WETHOracle.json";
import WBTCOracle from "./contracts/BTCOracle.json";
import DAIOracle from "./contracts/DAIOracle.json";
import TCAPOracle from "./contracts/TCAPOracle.json";
import WETHToken from "./contracts/WETH.json";
import WBTCToken from "./contracts/WBTC.json";
import DAIToken from "./contracts/DAI.json";
import TCAPToken from "./contracts/TCAP.json";

const App = () => {
  const signer = useSigner();
  const web3Modal = useContext(Web3ModalContext);
  const [isLoading, setloading] = useState(true);
  const [, setInvalidNetwork] = useState(false);
  const vaults = useVaults();
  const tokens = useTokens();
  const oracles = useOracles();

  const setContracts = (currentSigner: ethers.Signer) => {
    // Set Vaults
    const currentWETHVault = new ethers.Contract(WETHVault.address, WETHVault.abi, currentSigner);
    vaults.setCurrentWETHVault(currentWETHVault);
    const currentDAIVault = new ethers.Contract(DAIVault.address, DAIVault.abi, currentSigner);
    vaults.setCurrentDAIVault(currentDAIVault);
    const currentWBTCVault = new ethers.Contract(WBTCVault.address, WBTCVault.abi, currentSigner);
    vaults.setCurrentWBTCVault(currentWBTCVault);
    // Set Tokens
    const currentWETHToken = new ethers.Contract(WETHToken.address, WETHToken.abi, currentSigner);
    tokens.setCurrentWETHToken(currentWETHToken);
    const currentDAIToken = new ethers.Contract(DAIToken.address, DAIToken.abi, currentSigner);
    tokens.setCurrentDAIToken(currentDAIToken);
    const currentWBTCToken = new ethers.Contract(WBTCToken.address, WBTCToken.abi, currentSigner);
    tokens.setCurrentWBTCToken(currentWBTCToken);
    const currentTCAPToken = new ethers.Contract(TCAPToken.address, TCAPToken.abi, currentSigner);
    tokens.setCurrentTCAPToken(currentTCAPToken);
    // // Set Oracles
    const currentWETHOracle = new ethers.Contract(
      WETHOracle.address,
      WETHOracle.abi,
      currentSigner
    );
    oracles.setCurrentWETHOracle(currentWETHOracle);
    const currentDAIOracle = new ethers.Contract(DAIOracle.address, DAIOracle.abi, currentSigner);
    oracles.setCurrentDAIOracle(currentDAIOracle);
    const currentWBTCOracle = new ethers.Contract(
      WBTCOracle.address,
      WBTCOracle.abi,
      currentSigner
    );
    oracles.setCurrentWBTCOracle(currentWBTCOracle);
    const currentTCAPOracle = new ethers.Contract(
      TCAPOracle.address,
      TCAPOracle.abi,
      currentSigner
    );
    oracles.setCurrentTCAPOracle(currentTCAPOracle);
  };

  web3Modal.on("connect", async (networkProvider) => {
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
  });

  useEffect(() => {
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
      }
      setloading(false);
    }
    // Execute the created function directly
    loadProvider();
    // eslint-disable-next-line
  }, [web3Modal]);

  if (isLoading) {
    return <>loading</>;
  }

  return (
    <signerContext.Provider value={signer}>
      <tokensContext.Provider value={tokens}>
        <oraclesContext.Provider value={oracles}>
          <vaultsContext.Provider value={vaults}>
            <Router>
              <Sidebar />
              <Container fluid className="wrapper">
                <Header />
                <Switch>
                  <Route path="/" exact>
                    <Welcome />
                  </Route>
                  <Route path="/graph" exact>
                    <Graph />
                  </Route>
                  <Route path="/vault" exact>
                    <Vault />
                  </Route>
                  <Route path="/faucet" exact>
                    <Faucet />
                  </Route>
                </Switch>
              </Container>
            </Router>
          </vaultsContext.Provider>
        </oraclesContext.Provider>
      </tokensContext.Provider>
    </signerContext.Provider>
  );
};

export default App;
