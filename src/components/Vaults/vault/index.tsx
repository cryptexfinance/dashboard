import React, { useContext, useState, useEffect } from "react";
import { Button, ButtonGroup, Dropdown, Spinner, ToggleButton } from "react-bootstrap/esm";
import { FaPlus } from "react-icons/fa";
import "../../../styles/mint2.scss";
import VaultForm from "./VaultForm";
import { networkContext } from "../../../state";
import { TokenIcon } from "../common";
import { isInLayer1, isOptimism, isPolygon, isArbitrum } from "../../../utils/utils";

type VaultInitType = {
  vaultId: string;
  assetSymbol: string;
  collateralSymbol: string;
  isHardVault: boolean;
};

type props = {
  currentAddress: string;
  vaultInitData: VaultInitType;
  goBack: () => void;
};

const Vault = ({ currentAddress, vaultInitData, goBack }: props) => {
  const currentNetwork = useContext(networkContext);
  const [vaultMode, setVaultMode] = useState(
    isInLayer1(currentNetwork.chainId) ? "hard" : "normal"
  );
  const [loading, setLoading] = useState(true);
  const [vaultData, setVaultData] = useState(vaultInitData);
  const radios = [
    { name: "Regular", value: "normal" },
    { name: "Hard", value: "hard" },
  ];

  // Vault Data
  const [assetOptions, setAssetOptions] = useState<Array<string>>([]);
  const [collateralOptions, setCollateralOptions] = useState<Array<string>>([]);

  // Inputss
  const isHardMode = () => vaultMode === "hard";

  const setCollaterals = (newMode: string) => {
    if (currentAddress !== "") {
      let aOptions = ["TCAP"];
      if (isArbitrum(currentNetwork.chainId)) {
        aOptions = ["JPEGz"];
      }

      let cOptions = ["ETH", "WETH", "DAI", "AAVE", "LINK"];
      if (newMode === "hard") {
        cOptions = ["ETH", "WETH", "DAI", "USDC", "WBTC"];
      }
      if (isOptimism(currentNetwork.chainId) && !isHardMode()) {
        cOptions = ["ETH", "DAI", "LINK", "UNI", "SNX"];
      }
      if (isPolygon(currentNetwork.chainId) && !isHardMode()) {
        cOptions = ["MATIC", "DAI", "WBTC"];
      }

      setAssetOptions(aOptions);
      setCollateralOptions(cOptions);
    }
    setLoading(false);
  };

  useEffect(
    () => {
      setCollaterals("hard");
    },
    // eslint-disable-next-line
    [currentAddress, vaultInitData]
  );

  const handleRadioBtnChange = async (value: string) => {
    setLoading(true);
    setVaultMode(value);
    setCollaterals(value);
    setVaultData({
      vaultId: "0",
      assetSymbol: vaultData.assetSymbol,
      collateralSymbol: "ETH",
      isHardVault: value === "hard",
    });
  };

  const handleTokenChange = async (value: string) => {
    let keepVaultId = false;
    if (vaultData.collateralSymbol === "ETH" || vaultData.collateralSymbol === "WETH") {
      keepVaultId = value === "ETH" || value === "WETH";
    }

    setVaultData({
      vaultId: !keepVaultId ? "0" : vaultData.vaultId,
      assetSymbol: vaultData.assetSymbol,
      collateralSymbol: value,
      isHardVault: vaultData.isHardVault,
    });
  };

  const AssetDropdown = () => (
    <div className="dd-collateral">
      <h6 className="titles">Asset</h6>
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="dropdown-filters" className="text-left">
          <div className="collateral-toggle">
            <TokenIcon name={vaultData.assetSymbol} />
            <span>{vaultData.assetSymbol}</span>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {assetOptions.map((item) => (
            <Dropdown.Item key={item} eventKey={item}>
              <TokenIcon name={vaultData.assetSymbol} />
              {item}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );

  const CollateralDropdown = () => (
    <div className="dd-collateral">
      <h6 className="titles">Collateral</h6>
      <Dropdown onSelect={(eventKey) => handleTokenChange(eventKey || "ETH")}>
        <Dropdown.Toggle variant="secondary" id="dropdown-filters" className="text-left">
          <div className="collateral-toggle">
            <TokenIcon name={vaultData.collateralSymbol} />
            <span>{vaultData.collateralSymbol.toUpperCase()}</span>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {collateralOptions.map((item) => (
            <Dropdown.Item key={item} eventKey={item}>
              <TokenIcon name={item} />
              {item}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );

  return (
    <div className="vault2">
      <div className="vault-container">
        <div className="vault-header">
          <div className="header-col1">
            <div className="icon-container">
              <ButtonGroup className="mb-2">
                {radios.map((radio, idx) => (
                  <ToggleButton
                    key={idx}
                    id={`radio-${idx}`}
                    type="radio"
                    variant="secondary"
                    name="radio"
                    className={`radio-${idx}`}
                    value={radio.value}
                    checked={vaultMode === radio.value}
                    onChange={(e) => handleRadioBtnChange(e.currentTarget.value)}
                  >
                    {radio.name}
                  </ToggleButton>
                ))}
              </ButtonGroup>
            </div>
          </div>
          <Button className="go-back" onClick={() => goBack()}>
            <FaPlus size={22} />
          </Button>
        </div>
        <div className="vault-assets">
          <div className="vault-assets-box">
            <div className="assets-box-options">
              <AssetDropdown />
              <CollateralDropdown />
            </div>
            {loading ? (
              <div className="vault-form">
                <Spinner variant="danger" className="spinner" animation="border" />
              </div>
            ) : (
              <VaultForm currentAddress={currentAddress} vaultData={vaultData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
