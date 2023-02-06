import React, { useContext, useState } from "react";
import { Button, Card } from "react-bootstrap/esm";
import { ethers } from "ethers";
import NumberFormat from "react-number-format";
import { networkContext } from "../../../state";
import Liquidate from "./Liquidate";
import { capitalize, TokenIcon, VAULT_STATUS } from "../common";
import { VaultsPropsType, VaultsType } from "../types";
import { TOKENS_SYMBOLS } from "../../../utils/constants";
import { isArbitrum } from "../../../utils/utils";

export const VaultsMobile = ({
  currentAddress,
  vaults,
  setVaults,
  currentStatus,
  pagination,
  refresh,
  setVaultToUpdate,
  myVaults,
}: VaultsPropsType) => {
  const currentNetwork = useContext(networkContext);
  const [showLiquidate, setShowLiquidate] = useState(false);
  const [vaultIndex, setVaultIndex] = useState(-1);
  const [liqVault, setLiqVault] = useState<VaultsType | null>(null);
  const [vaultsShown, setVaultsShown] = useState(pagination.itemsPerPage);

  const updateLiqVault = (collateral: ethers.BigNumberish, debt: ethers.BigNumberish) => {
    if (liqVault !== null) {
      refresh(vaultIndex, liqVault.collateralSymbol, liqVault.id, collateral, debt);
    }
  };

  const vaultButtonLink = (v: VaultsType) => {
    const vtu = {
      vaultId: v.id,
      assetSymbol: isArbitrum(currentNetwork.chainId) ? TOKENS_SYMBOLS.JPEGz : TOKENS_SYMBOLS.TCAP,
      collateralSymbol:
        v.collateralSymbol !== TOKENS_SYMBOLS.WETH ? v.collateralSymbol : TOKENS_SYMBOLS.ETH,
      isHardVault: v.isHardVault,
    };
    const vStatus = v.status === VAULT_STATUS.liquidation ? "active" : v.status;
    console.log(setVaults);
    return (
      <Button className={vStatus} onClick={() => setVaultToUpdate(vtu)}>
        <span className={vStatus}>Go to Vault</span>
      </Button>
    );
  };

  const loadMore = () => {
    const n = vaultsShown + pagination.itemsPerPage;
    setVaultsShown(n);
  };

  const IndexIcon = () => {
    if (!isArbitrum(currentNetwork.chainId)) {
      return <TokenIcon name={TOKENS_SYMBOLS.TCAP} />;
    }
    return <TokenIcon name={TOKENS_SYMBOLS.JPEGz} />;
  };

  return (
    <div className="vaults-mobile">
      {vaults.map((v, index) => {
        const classN = index < vaultsShown ? "vault" : "vault hide";
        return (
          <Card key={index} className={classN}>
            <Card.Body>
              {v.isHardVault && (
                <div className="vault-type">
                  <h6 className={v.status}>H Mode</h6>
                </div>
              )}
              <div className="vault-assets">
                <div className="asset-box">
                  <h6>Index</h6>
                  <div className="asset index">
                    <IndexIcon />
                    <h5>
                      {isArbitrum(currentNetwork.chainId)
                        ? TOKENS_SYMBOLS.JPEGz
                        : TOKENS_SYMBOLS.TCAP}
                    </h5>
                  </div>
                </div>
                <div className="asset-box collateral">
                  <h6>Collateral</h6>
                  <div className="asset">
                    <TokenIcon name={v.collateralSymbol} />
                    <h5>{v.collateralSymbol}</h5>
                  </div>
                </div>
              </div>
              <div className="vault-values collateral">
                <div className="title">
                  <h6>Collateral:</h6>
                </div>
                <div className="values">
                  <h5 className="number neon-green">
                    <NumberFormat
                      value={v.collateralValue}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                    />
                  </h5>
                  <h5 className="number neon-blue">
                    <NumberFormat
                      value={v.collateralUsd}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                      prefix="$"
                    />
                  </h5>
                </div>
              </div>
              <div className="vault-values debt">
                <div className="title">
                  <h6>Debt:</h6>
                </div>
                <div className="values">
                  <h5 className="number neon-green">
                    <NumberFormat
                      value={v.debt}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                    />
                  </h5>
                  <h5 className="number neon-blue">
                    <NumberFormat
                      value={v.debtUsd}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                      prefix="$"
                    />
                  </h5>
                </div>
              </div>
              <div className="vault-values ratio">
                <div className="title">
                  <h6>Ratio:</h6>
                </div>
                <div className="values status">
                  <h5 className="number empty">
                    <NumberFormat
                      value={v.ratio}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                      suffix="%"
                    />
                  </h5>
                  <span className={v.status}>{capitalize(v.status)}</span>
                </div>
              </div>
            </Card.Body>
            {(v.status === VAULT_STATUS.liquidation || v.url !== "") && (
              <Card.Footer
                className={"vault-actions".concat(
                  v.status === VAULT_STATUS.liquidation ? " two" : ""
                )}
              >
                {v.status === VAULT_STATUS.liquidation && (
                  <Button className="liquidation">Liquidate</Button>
                )}
                {v.url !== "" && vaultButtonLink(v)}
              </Card.Footer>
            )}
          </Card>
        );
      })}
      {vaultsShown < pagination.itemsCount && (
        <Button className="btn-load-more" onClick={() => loadMore()}>
          Load More
        </Button>
      )}
      {vaults.length === 0 && currentAddress !== "" && myVaults && currentStatus === "all" && (
        <div className="no-vaults-box">
          <p>
            No Vaults yet. Please
            <span className="neon-pink">{" CREATE "}</span>
            your first vault.
          </p>
        </div>
      )}
      {vaults.length === 0 && !myVaults && (
        <div className="no-vaults-box">
          <p>No vaults found.</p>
        </div>
      )}
      <Liquidate
        show={showLiquidate}
        currentAddress={currentAddress}
        liqVault={liqVault}
        onHide={() => {
          setLiqVault(null);
          setVaultIndex(-1);
          setShowLiquidate(false);
        }}
        refresh={updateLiqVault}
      />
    </div>
  );
};
