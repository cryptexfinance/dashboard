import React, { useContext, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import NumberFormat from "react-number-format";
import { oraclesContext, signerContext, tokensContext } from "../../../state";
import { getPriceInUSDFromPair } from "../../../utils/utils";
import { computeIncentiveId } from "../../../utils/univ3";
import { IncentiveType } from "./types";

type props = {
  incentive: IncentiveType;
  stakerContractRead: Contract | undefined;
};

const Apr = ({ incentive, stakerContractRead }: props) => {
  const signer = useContext(signerContext);
  const oracles = useContext(oraclesContext);
  const tokens = useContext(tokensContext);
  const [apr, setApr] = useState(0);

  const TVL = gql`
    query aprs {
      apr(id: "2") {
        id
        totalAmount0
        totalAmount1
      }
      positions(where: { staked: true, stakedBlockNumber_gt: 15998870 }) {
        id
      }
    }
  `;

  const calculateClaimableRewards = async (stakedLpTokens: any) => {
    let claimableReward = ethers.BigNumber.from("0");
    const rewardCalls = new Array<any>();

    if (stakedLpTokens.length > 0) {
      for (let i = 0; i < stakedLpTokens.length; i += 1) {
        rewardCalls.push(await stakerContractRead?.getRewardInfo(incentive, stakedLpTokens[i].id));
      }
      const rewards = await signer.ethcallProvider?.all(rewardCalls);

      rewards?.forEach((reward) => {
        claimableReward = claimableReward.add(reward[0]);
      });
    }

    return claimableReward;
  };

  const calculateApr = async (lpData: any) => {
    if (
      signer &&
      oracles.wethOracleRead &&
      oracles.tcapOracleRead &&
      tokens.ctxPoolTokenRead &&
      stakerContractRead &&
      lpData &&
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
      const incentiveReward = ethers.BigNumber.from(incentivesInfo[0]);
      const claimableReward = await calculateClaimableRewards(lpData.positions);
      const unclaimedReward = ethers.utils.formatEther(incentiveReward.sub(claimableReward));

      let tvlUsd = 0;
      if (lpData.apr) {
        tvlUsd =
          parseFloat(tcapPrice) * lpData.apr.totalAmount0 +
          parseFloat(currentPriceETH) * lpData.apr.totalAmount1;
      }
      const remainingSeconds = incentive.endTime - Date.now() / 1000;
      if (remainingSeconds > 0) {
        const remainingDays = remainingSeconds / (3600 * 24);
        const rewardRate = parseFloat(unclaimedReward) / remainingDays;
        const ONE_YEAR = 365;
        const aprNumerator = rewardRate * currentPriceCTX * ONE_YEAR * 100;
        if (tvlUsd === 0) {
          setApr(10);
        } else {
          const aprValue = aprNumerator / tvlUsd;
          setApr(aprValue);
        }
      } else {
        setApr(-1);
      }
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
        calculateApr(data);
      }
    },
  });

  return (
    <>
      {apr >= 0 ? (
        <NumberFormat
          className="number neon-pink"
          value={loading ? "0" : apr}
          displayType="text"
          thousandSeparator
          suffix="%"
          decimalScale={0}
        />
      ) : (
        <span className="number">Expired</span>
      )}
    </>
  );
};

export default Apr;
