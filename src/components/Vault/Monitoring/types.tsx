export type PaginationType = {
  previous: number;
  current: number;
  next: number;
  pages: number;
  itemsPerPage: number;
  itemsCount: number;
  lastId: string;
};

export type OraclePricesType = {
  tcapOraclePrice: string;
  wethOraclePrice: string;
  daiOraclePrice: string;
  aaveOraclePrice: string;
  linkOraclePrice: string;
  uniOraclePrice: string;
  snxOraclePrice: string;
  maticOraclePrice: string;
  wbtcOraclePrice: string;
};

export type VaultsRatioType = {
  ethRatio: number;
  wethRatio: number;
  daiRatio: number;
  aaveRatio: number;
  linkRatio: number;
  uniRatio: number;
  snxRatio: number;
  maticRatio: number;
  wbtcRatio: number;
};

export type VaultsType = {
  id: string;
  collateralSymbol: string;
  collateralValue: string;
  collateralUsd: string;
  debt: string;
  debtUsd: string;
  ratio: number;
  minRatio: string;
  netReward: number;
  status: string;
  blockTS: string;
  url: string;
};

export type VaultsTotalsType = {
  vaults: number;
  collateral: string;
  collateralUSD: string;
  debt: string;
  debtUSD: string;
};

export type DropdownItemType = {
  key: string;
  name: string;
};
