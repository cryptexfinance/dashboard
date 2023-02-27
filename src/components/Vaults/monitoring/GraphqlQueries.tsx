import { gql } from "@apollo/client";

export const VAULTS_ALL = gql`
  query AllVaults($lastBlockTS: String!) {
    vaults(first: 1000, orderBy: blockTS, where: { blockTS_gt: $lastBlockTS }) {
      id
      vaultId
      owner
      collateral
      debt
      currentRatio
      tokenSymbol
      status
      hardVault
      blockTS
      underlyingProtocol {
        underlyingToken {
          decimals
        }
      }
    }
  }
`;

export const VAULTS_BY_USER = gql`
  query MyVaults($ownerAddress: String!) {
    vaults(where: { owner: $ownerAddress }) {
      id
      vaultId
      owner
      collateral
      debt
      currentRatio
      tokenSymbol
      status
      hardVault
      blockTS
      underlyingProtocol {
        underlyingToken {
          decimals
        }
      }
    }
  }
`;

export const VAULTS_BY_COLLATERAL = gql`
  query VAULTS_BY_COLLATERAL($lastBlockTS: String!, $symbol: String!) {
    vaults(
      first: 1000
      orderBy: blockTS
      where: { blockTS_gt: $lastBlockTS, tokenSymbol: $symbol }
    ) {
      id
      vaultId
      owner
      collateral
      debt
      currentRatio
      tokenSymbol
      status
      hardVault
      blockTS
      underlyingProtocol {
        underlyingToken {
          decimals
        }
      }
    }
  }
`;

export const VAULTS_BY_STATUS = gql`
  query VAULTS_BY_STATUS($lastBlockTS: String!, $status: String!) {
    vaults(first: 1000, orderBy: blockTS, where: { blockTS_gt: $lastBlockTS, status: $status }) {
      id
      vaultId
      owner
      collateral
      debt
      currentRatio
      tokenSymbol
      status
      hardVault
      blockTS
      underlyingProtocol {
        underlyingToken {
          decimals
        }
      }
    }
  }
`;

export const VAULTS_BY_TOKEN_STATUS = gql`
  query VAULTS_BY_TS($lastBlockTS: String!, $symbol: String!, $status: String!) {
    vaults(
      first: 1000
      orderBy: blockTS
      where: { blockTS_gt: $lastBlockTS, tokenSymbol: $symbol, status: $status }
    ) {
      id
      vaultId
      owner
      collateral
      debt
      currentRatio
      tokenSymbol
      hardVault
      blockTS
      underlyingProtocol {
        underlyingToken {
          decimals
        }
      }
    }
  }
`;

export const VAULTS_IN_LIQ = gql`
  query VAULTS_IN_LIQ($lastBlockTS: String!) {
    vaults(
      first: 1000
      orderBy: blockTS
      orderDirection: asc
      where: { blockTS_gt: $lastBlockTS, status: "active", debt_gt: 1000000000000000 }
    ) {
      id
      vaultId
      owner
      collateral
      debt
      currentRatio
      tokenSymbol
      status
      hardVault
      blockTS
      underlyingProtocol {
        underlyingToken {
          decimals
        }
      }
    }
  }
`;

export const VAULTS_IN_LIQ_BY_TOKEN = gql`
  query VAULTS_IN_LIQ_BY_TOKEN($lastBlockTS: String!, $symbol: String!) {
    vaults(
      first: 1000
      orderBy: blockTS
      orderDirection: asc
      where: {
        blockTS_gt: $lastBlockTS
        tokenSymbol: $symbol
        status: "active"
        debt_gt: 1000000000000000
      }
    ) {
      id
      vaultId
      owner
      collateral
      debt
      currentRatio
      tokenSymbol
      status
      hardVault
      blockTS
      underlyingProtocol {
        underlyingToken {
          decimals
        }
      }
    }
  }
`;
