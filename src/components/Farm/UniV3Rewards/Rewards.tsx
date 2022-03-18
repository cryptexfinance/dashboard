import React from "react";
import Card from "react-bootstrap/esm/Card";
import { useQuery, gql } from "@apollo/client";

const Rewards = () => {
  const OWNER_POOLS = gql`
    query ownerPools($owner: string) {
      positions (where: {owner: $owner}) {
        id
        pool {
          id
        }
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
        liquidity
      } 
    }
  `;
  
    

  const { loading, data, error } = useQuery(OWNER_POOLS, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: { "0x" },
    onError: () => {
      console.log(error);
    },
    onCompleted: () => {

    },
  });

  return (
    <Card className="diamond mt-4">
      <h4>Entra</h4>
    </Card>
  );
};

export default Rewards;
