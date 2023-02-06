import React, { useContext, useState } from "react";
import { Button, Spinner } from "react-bootstrap/esm/";
import { FaArrowRight } from "react-icons/fa";
import { ethers } from "ethers";
import { useHistory } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { useRatios } from "../../../hooks";
import { OraclePricesType } from "../../../hooks/types";
import { networkContext } from "../../../state";
import { getCollateralPrice, getMinRatio } from "../../Vaults/common";
import { getRatio2, isArbitrum, isUndefined } from "../../../utils/utils";

type props = {
  ownerAddress: string;
  prices: OraclePricesType;
};

export const VaultsWarning = ({ ownerAddress, prices }: props) => {
  const history = useHistory();
  const ratios = useRatios();
  const currentNetwork = useContext(networkContext);
  const [loadingVaults, setLoadingVaults] = useState(false);
  const [liquidableVaults, setLiquidableVaults] = useState(0);

  const VAULTS = gql`
    query ownerVaults($ownerAddress: String!) {
      vaults(where: { owner: $ownerAddress, debt_gt: 0 }) {
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

  const isVaultLiquidable = (
    collateralWei: ethers.BigNumberish,
    debtWei: ethers.BigNumberish,
    symbol: string,
    isHardVault: boolean,
    decimals: number
  ) => {
    const collateralText = ethers.utils.formatUnits(collateralWei, decimals);
    const debtText = ethers.utils.formatEther(debtWei);
    const collateralPrice = getCollateralPrice(prices, symbol);
    const minRatio = getMinRatio(ratios, symbol, isHardVault);
    const indexPrice = !isArbitrum(currentNetwork.chainId)
      ? prices.tcapOraclePrice
      : prices.jpegzOraclePrice;
    const ratio = getRatio2(collateralText, collateralPrice, debtText, indexPrice || "1");

    return ratio < minRatio;
  };

  const loadVaults = async (vaultsData: any) => {
    setLoadingVaults(true);
    let liqVaults = 0;
    // @ts-ignore
    vaultsData.vaults.forEach((v) => {
      const cVaultDecimals = v.underlyingProtocol.underlyingToken.decimals;
      const isLiquidable = isVaultLiquidable(
        v.collateral,
        v.debt,
        v.tokenSymbol,
        v.hardVault,
        cVaultDecimals
      );
      if (isLiquidable) {
        liqVaults += 1;
      }
    });
    setLiquidableVaults(liqVaults);
    setLoadingVaults(false);
  };

  const { loading } = useQuery(VAULTS, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: { ownerAddress },
    // skip: skipQuery,
    onError: (error) => {
      console.log(error);
    },
    onCompleted: (data: any) => {
      if (!isUndefined(data)) {
        loadVaults(data);
      }
    },
  });

  if (loading || loadingVaults) {
    return (
      <div className="spinner-container">
        <Spinner variant="danger" className="spinner" animation="border" />
      </div>
    );
  }

  return (
    <>
      {liquidableVaults > 0 && (
        <Button
          className="warnings-vaults neon-orange"
          onClick={() => {
            history.push("/vaults");
          }}
        >
          <p>
            You have {liquidableVaults}
            {liquidableVaults === 1 ? " vault " : " vaults "}
            in liquidation.
          </p>
          <FaArrowRight size={20} />
        </Button>
      )}
    </>
  );
};
