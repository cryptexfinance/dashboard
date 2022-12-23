import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Provider } from "ethers-multicall";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { Card, Col, Dropdown } from "react-bootstrap/esm";
import "../../styles/summary.scss";
import Balance from "./Balance";
import Indexes from "./Indexes";
import Protocol from "./Protocol";
import { GRAPHQL_ENDPOINT, NETWORKS } from "../../utils/constants";
import { getDefaultProvider } from "../../utils/utils";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

type props = {
  signerAddress: string;
  signerChainId: number;
};

const Summary = ({ signerAddress, signerChainId }: props) => {
  const options = [
    { id: "0", name: "My Balance" },
    { id: "1", name: "TCAP Summary" },
    { id: "2", name: "Vaults Summary" },
  ];
  let chains = [
    { id: NETWORKS.mainnet.chainId, name: "Mainnet" },
    { id: NETWORKS.arbitrum.chainId, name: "Arbitrum" },
    { id: NETWORKS.optimism.chainId, name: "Optimism" },
  ];
  if (process.env.REACT_APP_NETWORK_ID !== "1") {
    chains = [
      { id: NETWORKS.goerli.chainId, name: "Goerli" },
      { id: NETWORKS.arbitrum_goerli.chainId, name: "Arbitrum Goerli" },
      { id: NETWORKS.okovan.chainId, name: "OKovan" },
    ];
  }
  const [currentOption, setCurrentOption] = useState(
    signerAddress !== "" ? options[0] : options[1]
  );

  const getDefaultChain = () => {
    if (process.env.REACT_APP_NETWORK_ID === "1") {
      if (signerChainId === NETWORKS.mainnet.chainId) {
        return chains[0];
      }
      if (signerChainId === NETWORKS.arbitrum.chainId) {
        return chains[1];
      }
      return chains[2];
    }
    if (signerChainId === NETWORKS.goerli.chainId) {
      return chains[0];
    }
    if (signerChainId === NETWORKS.arbitrum_goerli.chainId) {
      return chains[1];
    }
    return chains[2];
  };

  const [currentChain, setCurrentChain] = useState(getDefaultChain());
  const [currentEthProvider, setCurrentEthProvider] = useState<Provider | undefined>();
  const [apolloClient, setApolloClient] = useState(
    clientOracle(
      process.env.REACT_APP_NETWORK_ID === "1" ? GRAPHQL_ENDPOINT.mainnet : GRAPHQL_ENDPOINT.goerli
    )
  );

  useEffect(() => {
    switch (currentChain.id) {
      case NETWORKS.mainnet.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
      case NETWORKS.goerli.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.goerli));
        break;
      case NETWORKS.arbitrum.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.arbitrum));
        break;
      case NETWORKS.arbitrum_goerli.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.arbitrum_goerli));
        break;
      case NETWORKS.optimism.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.optimism));
        break;
      case NETWORKS.okovan.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.okovan));
        break;
      case NETWORKS.polygon.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.polygon));
        break;
      case NETWORKS.mumbai.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mumbai));
        break;
      default:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
    }
    const provider = getDefaultProvider(currentChain.id);
    const randomSigner = ethers.Wallet.createRandom().connect(provider);
    const ethcallProvider = new Provider(randomSigner.provider);
    ethcallProvider.init();
    setCurrentEthProvider(ethcallProvider);
  }, [currentChain.id]);

  const handleOptionChange = (eventKey: string) => {
    const o = options.find((option) => option.id === eventKey);
    setCurrentOption(o || options[0]);
  };

  const handleChainChange = (eventKey: string) => {
    const c = chains.find((chain) => chain.id.toString() === eventKey);
    setCurrentChain(c || chains[0]);
  };

  return (
    <Col xs={12} sm={12} md={6} lg={6} className="col-wrapper">
      <Card className="summary">
        <Card.Header>
          <Dropdown onSelect={(eventKey) => handleOptionChange(eventKey || "0")}>
            <Dropdown.Toggle variant="secondary" id="dropdown-summary" className="text-left">
              <h6>{currentOption.name}</h6>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {signerAddress !== "" && (
                <Dropdown.Item key={options[0].id} eventKey={options[0].id}>
                  {options[0].name}
                </Dropdown.Item>
              )}
              <Dropdown.Item key={options[1].id} eventKey={options[1].id}>
                {options[1].name}
              </Dropdown.Item>
              <Dropdown.Item key={options[2].id} eventKey={options[2].id}>
                {options[2].name}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown onSelect={(eventKey) => handleChainChange(eventKey || "1")}>
            <Dropdown.Toggle variant="secondary" id="dropdown-summary" className="text-left">
              <h6>{currentChain.name}</h6>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {chains.map((item) => (
                <Dropdown.Item key={item.id} eventKey={item.id}>
                  {item.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>
        <Card.Body>
          <ApolloProvider client={apolloClient}>
            {currentOption.id === options[0].id && signerAddress !== "" && (
              <Balance
                currentChainId={currentChain.id}
                ethCallProvider={currentEthProvider}
                signerAddress={signerAddress}
              />
            )}
            {currentOption.id === options[1].id && (
              <Indexes currentChainId={currentChain.id} ethCallProvider={currentEthProvider} />
            )}
            {currentOption.id === options[2].id && (
              <Protocol currentChainId={currentChain.id} ethCallProvider={currentEthProvider} />
            )}
          </ApolloProvider>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default Summary;
