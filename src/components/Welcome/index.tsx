import React, { useContext, useEffect, useState } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import NetworkContext from "../../state/NetworkContext";
import { GRAPHQL_ENDPOINT, NETWORKS } from "../../utils/constants";
import Welcome from "./Welcome";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

type props = {
  signerAddress: string;
};

const WelcomeWrapper = ({ signerAddress }: props) => {
  const currentNetwork = useContext(NetworkContext);
  const [apolloClient, setApolloClient] = useState(
    clientOracle(
      process.env.REACT_APP_NETWORK_ID === "1" ? GRAPHQL_ENDPOINT.mainnet : GRAPHQL_ENDPOINT.rinkeby
    )
  );

  useEffect(() => {
    switch (currentNetwork.chainId) {
      case NETWORKS.mainnet.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
      case NETWORKS.rinkeby.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.rinkeby));
        break;
      case NETWORKS.okovan.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
      case NETWORKS.polygon.chainId:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.polygon));
        break;
      default:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
    }
  }, [currentNetwork.chainId]);

  return (
    <ApolloProvider client={apolloClient}>
      <Welcome signerAddress={signerAddress} />
    </ApolloProvider>
  );
};

export default WelcomeWrapper;
