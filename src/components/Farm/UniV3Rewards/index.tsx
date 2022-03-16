import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import NetworkContext from "../../../state/NetworkContext";
import SignerContext from "../../../state/SignerContext";
import { GRAPHQL_ENDPOINT, NETWORKS, UNIV3 } from "../../../utils/constants";
import { toFragment } from "../../../utils/utils";
import NonfungiblePositionManager from "../../../contracts/NonfungiblePositionManager.json";
import Rewards from "./Rewards";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

type props = {
  address: string;
};

const UniV3Rewards = ({ address }: props) => {
  const currentNetwork = useContext(NetworkContext);
  const signer = useContext(SignerContext);
  const [apolloClient, setApolloClient] = useState(
    clientOracle(
      process.env.REACT_APP_NETWORK_ID === "1" ? GRAPHQL_ENDPOINT.mainnet : GRAPHQL_ENDPOINT.rinkeby
    )
  );
  const [lpTokens, setLpTokens] = useState([]);

  const loadLPTokens = async () => {
    if (signer.signer) {
      const positionManager = new ethers.Contract(
        UNIV3.NFPositionManager,
        NonfungiblePositionManager,
        signer.signer
      );
      const positionManagerRead = new Contract(
        UNIV3.NFPositionManager,
        toFragment(NonfungiblePositionManager)
      );

      const noOfTokensOwnedByUser = await positionManager.balanceOf(
        "0x11e4857bb9993a50c685a79afad4e6f65d518dda"
      );
      console.log("Tokens by user");
      console.log(noOfTokensOwnedByUser.toNumber());
      if (!noOfTokensOwnedByUser.isZero()) {
        const ethcalls = [];
        for (let i = 0; i < noOfTokensOwnedByUser.toNumber(); i += 1) {
          const currentTokenOfOwner = await positionManagerRead.tokenOfOwnerByIndex(
            "0x11e4857bb9993a50c685a79afad4e6f65d518dda",
            i
          );
          ethcalls.push(currentTokenOfOwner);
        }
        const tokensId = await signer.ethcallProvider?.all(ethcalls);
        console.log(tokensId);
      }
    }
  };

  useEffect(() => {
    const load = () => {
      loadLPTokens();
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
    };
    load();
    // eslint-disable-next-line
  }, [currentNetwork.chainId, address]);

  return (
    <ApolloProvider client={apolloClient}>
      <Rewards />
    </ApolloProvider>
  );
};

export default UniV3Rewards;
