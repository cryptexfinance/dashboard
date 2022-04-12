export const StakeStatus = {
  not_approved: "not_approved",
  empty: "empty",
  deposited: "deposited",
  staked: "staked",
};

export type IncentiveType = {
  rewardToken: string;
  pool: string;
  startTime: number;
  endTime: number;
  refundee: string;
};

export type PositionType = {
  lpTokenId: number;
  poolId: string;
  liquidity: string;
  tickLower: number;
  tickLowerPrice0: number;
  tickLowerPrice1: number;
  tickUpper: number;
  tickUpperPrice0: number;
  tickUpperPrice1: number;
  incetiveId: string;
  reward: number;
  status: string;
};
