import React, { useContext, useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import {
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
  OverlayTrigger,
  ToggleButton,
  Tooltip,
} from "react-bootstrap/esm";
import { FaArrowLeft } from "react-icons/fa";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import "../../../styles/mint2.scss";
import VaultForm from "./VaultForm";
import { useVault } from "../../../hooks";
import { networkContext, signerContext } from "../../../state";
import { TokenIcon } from "../common";
import { NETWORKS } from "../../../utils/constants";
import {
  errorNotification,
  getDefaultProvider,
  getRatio,
  getSafeRemoveCollateral,
  getSafeMint,
  isInLayer1,
  isOptimism,
  isPolygon,
  notifyUser,
  toUSD,
  isArbitrum,
} from "../../../utils/utils";

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

const Vault2 = ({ currentAddress, vaultInitData, goBack }: props) => {
  const { t } = useTranslation();
  const currentNetwork = useContext(networkContext);
  const [vaultMode, setVaultMode] = useState(
    isInLayer1(currentNetwork.chainId) ? "hard" : "normal"
  );
  const [vaultData, setVaultData] = useState(vaultInitData);
  const [loadingMode, setLoadingMode] = useState(false);
  const radios = [
    { name: "Regular", value: "normal" },
    { name: "Hard", value: "hard" },
  ];

  // Vault Data
  const [assetOptions, setAssetOptions] = useState<Array<string>>([]);
  const [collateralOptions, setCollateralOptions] = useState<Array<string>>([]);

  // Inputss
  const isHardMode = () => vaultMode === "hard";

  useEffect(
    () => {
      const load = async () => {
        if (currentAddress !== "") {
          let aOptions = ["TCAP"];
          if (isArbitrum(currentNetwork.chainId)) {
            aOptions = ["JPEGz"];
          }

          let cOptions = ["ETH", "WETH", "DAI", "AAVE", "LINK"];
          if (isHardMode()) {
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
      };
      load();
    },
    // eslint-disable-next-line
    [currentAddress, vaultInitData]
  );

  const handleRadioBtnChange = async (value: string) => {
    setLoadingMode(true);
    setVaultMode(value);
  };

  const handleTokenChange = async (value: string) => {
    console.log(" bb ", value);
    setVaultData({
      vaultId: "0",
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
            <span>TCAP</span>
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
            <Button className="go-back" onClick={() => goBack()}>
              <FaArrowLeft size={20} />
            </Button>
            <h6>Vault</h6>
          </div>
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
        <div className="vault-assets">
          <div className="vault-assets-box">
            <div className="assets-box-options">
              <AssetDropdown />
              <CollateralDropdown />
            </div>
            <VaultForm currentAddress={currentAddress} vaultData={vaultData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault2;
