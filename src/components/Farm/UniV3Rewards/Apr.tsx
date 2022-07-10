import React, { useContext, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import NumberFormat from "react-number-format";
import SignerContext from "../../../state/SignerContext";
import OraclesContext from "../../../state/OraclesContext";
import TokensContext from "../../../state/TokensContext";
import { getPriceInUSDFromPair } from "../../../utils/utils";
import { computeIncentiveId } from "../../../utils/univ3";
import { IncentiveType } from "./types";

type props = {
  incentive: IncentiveType;
  stakerContractRead: Contract | undefined;
};

const Apr = ({ incentive, stakerContractRead }: props) => {
  const signer = useContext(SignerContext);
  const oracles = useContext(OraclesContext);
  const tokens = useContext(TokensContext);
  const [apr, setApr] = useState(0);

  const TVL = gql`
    query aprs {
      apr(id: "1") {
        id
        totalAmount0
        totalAmount1
      }
    }
  `;

  const calculateApr = async (aprData: any) => {
    if (
      signer &&
      oracles.wethOracleRead &&
      oracles.tcapOracleRead &&
      tokens.ctxPoolTokenRead &&
      stakerContractRead &&
      aprData &&
      incentive
    ) {
      const incentiveId = computeIncentiveId(incentive);
      const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
      const tcapOraclePriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
      const reservesCtxPoolCall = await tokens.ctxPoolTokenRead?.getReserves();
      const incentivesCall = await stakerContractRead?.incentives(incentiveId);

      // @ts-ignore
      const [wethOraclePrice, tcapOraclePrice, reservesCtxPool, incentivesInfo] =
        await signer.ethcallProvider?.all([
          wethOraclePriceCall,
          tcapOraclePriceCall,
          reservesCtxPoolCall,
          incentivesCall,
        ]);

      const currentPriceETH = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
      const tcapPrice = ethers.utils.formatEther(tcapOraclePrice);
      const currentPriceCTX = await getPriceInUSDFromPair(
        reservesCtxPool[0],
        reservesCtxPool[1],
        parseFloat(currentPriceETH)
      );
      const rewardUnclaimed = ethers.utils.formatEther(incentivesInfo[0]);
      const tvlUsd =
        parseFloat(tcapPrice) * aprData.totalAmount0 +
        parseFloat(currentPriceETH) * aprData.totalAmount1;
      const remainingSeconds = incentive.endTime - Date.now() / 1000;
      const remainingDays = remainingSeconds / (3600 * 24);
      const rewardRate = parseFloat(rewardUnclaimed) / remainingDays;
      const ONE_YEAR = 365;
      const aprNumerator = rewardRate * currentPriceCTX * ONE_YEAR * 100;
      const aprValue = aprNumerator / tvlUsd;
      setApr(aprValue);
    }
  };

  const { loading, data, error } = useQuery(TVL, {
    fetchPolicy: "no-cache",
    pollInterval: 400000,
    notifyOnNetworkStatusChange: true,
    onError: () => {
      console.log(error);
    },
    onCompleted: () => {
      if (signer) {
        calculateApr(data.apr);
      }
    },
  });

  return (
    <NumberFormat
      className="number"
      value={loading ? "0" : apr}
      displayType="text"
      thousandSeparator
      suffix="%"
      decimalScale={0}
    />
  );
};

export default Apr;
