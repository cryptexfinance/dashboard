import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap/esm/";
import { FaArrowRight } from "react-icons/fa";
import { ethers } from "ethers";
import { Provider } from "ethers-multicall";
import { useHistory } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { usePrices2, useRatios } from "../../../hooks";
import { getCollateralPrice, getMinRatio } from "../../Vaults/common";
import { getRatio2, isUndefined } from "../../../utils/utils";

type props = {
  chainId: number;
  ethCallProvider: Provider | undefined;
  ownerAddress: string;
};

export const VaultsWarning = ({ chainId, ethCallProvider, ownerAddress }: props) => {
  const history = useHistory();
  const prices = usePrices2(chainId, ethCallProvider);
  const ratios = useRatios();
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

    const ratio = getRatio2(
      collateralText,
      collateralPrice,
      debtText,
      prices.tcapOraclePrice || "1"
    );

    return ratio < minRatio;
  };

  const loadVaults = async (vaultsData: any) => {
    setLoadingVaults(true);
    let liqVaults = 0;
    console.log("vaultsData: ", vaultsData);
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
      console.log("isLiquidable: ", isLiquidable);
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
