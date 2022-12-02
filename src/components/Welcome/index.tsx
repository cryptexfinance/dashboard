import React, { useContext, useEffect, useState } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { networkContext } from "../../state";
import { GRAPHQL_ENDPOINT, NETWORKS } from "../../utils/constants";
import Summary from "./Summary";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

type props = {
  signerAddress: string;
  loadingContracts: boolean;
};

const WelcomeWrapper = ({ signerAddress, loadingContracts }: props) => {
  const currentNetwork = useContext(networkContext);
  const [apolloClient, setApolloClient] = useState(
    clientOracle(
      process.env.REACT_APP_NETWORK_ID === "1" ? GRAPHQL_ENDPOINT.mainnet : GRAPHQL_ENDPOINT.goerli
    )
  );

  useEffect(() => {
    switch (currentNetwork.chainId) {
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
  }, [currentNetwork.chainId]);

  return (
    <ApolloProvider client={apolloClient}>
      <Summary signerAddress={signerAddress} loadingContracts={loadingContracts} />
    </ApolloProvider>
  );
};

export default WelcomeWrapper;
