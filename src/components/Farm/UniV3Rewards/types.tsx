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
  tickUpper: number;
  incetiveId: string;
  reward: number;
  status: string;
};
