export const StakeStatus = {
  not_approved: "not_approved",
  empty: "unstaked",
  deposited: "deposited",
  staked: "staked",
  out_range: "out_range",
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
  priceInRange: boolean;
  incetiveId: string;
  reward: number;
  status: string;
};

export const positionDefaultValues = {
  lpTokenId: 0,
  poolId: "",
  liquidity: "0.00",
  tickLower: 0,
  tickLowerPrice0: 1,
  tickLowerPrice1: 1,
  tickUpper: 0,
  tickUpperPrice0: 1,
  tickUpperPrice1: 1,
  priceInRange: true,
  incetiveId: "",
  reward: 0,
  status: StakeStatus.empty,
};
