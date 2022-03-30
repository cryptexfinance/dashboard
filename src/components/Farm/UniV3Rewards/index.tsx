import React, { useContext, useEffect, useState } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import UniswapV3Staker from "../../../contracts/UniswapV3Staker.json";
import NonfungiblePositionManager from "../../../contracts/NonfungiblePositionManager.json";
import NetworkContext from "../../../state/NetworkContext";
import { SignerContext } from "../../../state/SignerContext";
import { NETWORKS } from "../../../utils/constants";
import { GRAPHQL_UNIV3_ENDPOINT, UNIV3 } from "../../../utils/univ3";
import { toFragment } from "../../../utils/utils";

import Rewards from "./Rewards";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

type props = {
  signer: SignerContext;
};

const UniV3Rewards = ({ signer }: props) => {
  const currentNetwork = useContext(NetworkContext);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [stakerContract, setStakerContract] = useState<ethers.Contract | undefined>();
  const [stakerContractRead, setStakerContractRead] = useState<Contract | undefined>();
  const [nfpmContract, setNfpmContract] = useState<ethers.Contract | undefined>();
  const [nfpmContractRead, setNfpmContractRead] = useState<Contract | undefined>();
  const [apolloClient, setApolloClient] = useState(
    clientOracle(
      process.env.REACT_APP_NETWORK_ID === "1"
        ? GRAPHQL_UNIV3_ENDPOINT.mainnet
        : GRAPHQL_UNIV3_ENDPOINT.rinkeby
    )
  );

  useEffect(() => {
    const load = async () => {
      switch (currentNetwork.chainId) {
        case NETWORKS.mainnet.chainId:
          setApolloClient(clientOracle(GRAPHQL_UNIV3_ENDPOINT.mainnet));
          break;
        case NETWORKS.rinkeby.chainId:
          setApolloClient(clientOracle(GRAPHQL_UNIV3_ENDPOINT.rinkeby));
          break;
        default:
          setApolloClient(clientOracle(GRAPHQL_UNIV3_ENDPOINT.mainnet));
          break;
      }
      if (signer.signer) {
        const stakerRead = new Contract(UNIV3.stakerAddress, UniswapV3Staker);
        const staker = new ethers.Contract(UNIV3.stakerAddress, UniswapV3Staker, signer.signer);
        const nfpmRead = new Contract(
          UNIV3.NFPositionManagerAddress,
          toFragment(NonfungiblePositionManager)
        );
        const nfpm = new ethers.Contract(
          UNIV3.NFPositionManagerAddress,
          NonfungiblePositionManager,
          signer.signer
        );

        setStakerContractRead(stakerRead);
        setStakerContract(staker);
        setNfpmContract(nfpm);
        setNfpmContractRead(nfpmRead);
        const oAddress = await signer.signer.getAddress();
        setOwnerAddress(oAddress);
      }
    };
    load();
    // eslint-disable-next-line
  }, [currentNetwork.chainId]);

  return (
    <ApolloProvider client={apolloClient}>
      <Rewards
        ownerAddress={ownerAddress}
        signer={signer}
        stakerContract={stakerContract}
        stakerContractRead={stakerContractRead}
        nfpmContract={nfpmContract}
        nfpmContractRead={nfpmContractRead}
      />
    </ApolloProvider>
  );
};

export default UniV3Rewards;
