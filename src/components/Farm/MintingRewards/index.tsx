import React, { useContext, useEffect, useState } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { networkContext } from "../../../state";
import { GRAPHQL_ENDPOINT, NETWORKS } from "../../../utils/constants";
import Rewards from "./Rewards";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

type props = {
  address: string;
  ethRewards: string;
  daiRewards: string;
  claimRewards: (vaultType: string) => {};
};

const MintingRerwards = ({ address, ethRewards, daiRewards, claimRewards }: props) => {
  const currentNetwork = useContext(networkContext);
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
      default:
        setApolloClient(clientOracle(GRAPHQL_ENDPOINT.mainnet));
        break;
    }
  }, [currentNetwork.chainId]);

  return (
    <ApolloProvider client={apolloClient}>
      <Rewards
        address={address}
        ethRewards={ethRewards}
        daiRewards={daiRewards}
        claimRewards={claimRewards}
      />
    </ApolloProvider>
  );
};

export default MintingRerwards;
