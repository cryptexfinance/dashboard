import React from "react";
import { Provider } from "ethers-multicall";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { Spinner } from "react-bootstrap/esm/";
import { useBalances, usePrices2 } from "../../hooks";
import Balance from "./Balance";
import Indexes from "./Indexes";
import Protocol from "./Protocol";
import { getGraphqlEndPoint } from "../../utils/utils";

const clientOracle = (graphqlEndpoint: string) =>
  new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache(),
  });

type props = {
  signerAddress: string;
  currentOption: string;
  currentChainId: number;
  ethCallProvider: Provider | undefined;
};

const SummaryOptions = ({
  signerAddress,
  currentOption,
  currentChainId,
  ethCallProvider,
}: props) => {
  const apolloClient = clientOracle(getGraphqlEndPoint(currentChainId));
  const [balances, loadingBalances] = useBalances(currentChainId, ethCallProvider, signerAddress);
  const [prices, loadingPrices] = usePrices2(currentChainId, ethCallProvider);

  return (
    <ApolloProvider client={apolloClient}>
      {loadingBalances || loadingPrices ? (
        <div className="spinner-container">
          <Spinner variant="danger" className="spinner" animation="border" />
        </div>
      ) : (
        <>
          {currentOption === "0" && signerAddress !== "" && (
            <Balance
              currentChainId={currentChainId}
              ethCallProvider={ethCallProvider}
              signerAddress={signerAddress}
              balances={balances}
              prices={prices}
            />
          )}
          {currentOption === "1" && (
            <Indexes
              currentChainId={currentChainId}
              ethCallProvider={ethCallProvider}
              balances={balances}
              prices={prices}
            />
          )}
          {currentOption === "2" && (
            <Protocol
              currentChainId={currentChainId}
              ethCallProvider={ethCallProvider}
              prices={prices}
            />
          )}
        </>
      )}
    </ApolloProvider>
  );
};

export default SummaryOptions;
