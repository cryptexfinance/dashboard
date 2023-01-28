import React, { useContext, useEffect, useRef, useState } from "react";
import { Accordion, Button, Card, Col, Dropdown, Form } from "react-bootstrap/esm";
import Spinner from "react-bootstrap/Spinner";
import { FaArrowsAltH } from "react-icons/fa";
import { ethers, BigNumber } from "ethers";
import { useMediaQuery } from "react-responsive";
import { useLazyQuery, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import "../../../styles/vault-monitoring.scss";
import { VaultPagination } from "./Pagination";
import { signerContext, hardVaultsContext, networkContext, vaultsContext } from "../../../state";
import { Vaults } from "./Vaults";
import { VaultsMobile } from "./VaultsMobile";
import { usePrices, useRatios } from "../../../hooks";
import {
  getRatio2,
  isArbitrum,
  isInLayer1,
  isOptimism,
  isUndefined,
  numberFormatStr,
  toUSD,
} from "../../../utils/utils";
import { TOKENS_SYMBOLS } from "../../../utils/constants";
import {
  capitalize,
  TokenIcon,
  getMinRatio,
  getCollateralPrice,
  findNewArbitrumVaultCollateral,
  findNewMainnetVaultCollateral,
  findNewOptimismVaultCollateral,
  VAULT_STATUS,
} from "../common";
import {
  DropdownItemType,
  PaginationType,
  VaultToUpdateType,
  VaultsTotalsType,
  VaultsType,
} from "../types";

const pagDefault = {
  previous: 0,
  current: 0,
  next: 0,
  pages: 0,
  lastDataPage: 0,
  itemsPerPage: 10,
  itemsCount: 0,
  lastId: "0",
};

const totalsDefault = {
  vaults: 0,
  collateral: "0",
  collateralUSD: "0",
  debt: "0",
  debtUSD: "0",
};

type liqVaultsTempType = {
  vaultId: string;
  vaultType: string;
  decimals: number;
  hardVault: boolean;
};

type props = {
  setVaultToUpdate: (initData: VaultToUpdateType) => void;
};

const showAllVaults = true;

const Monitoring = ({ setVaultToUpdate }: props) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: "(max-width: 450px)" });
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);
  const vaults = useContext(vaultsContext);
  const hardVaults = useContext(hardVaultsContext);
  const prices = usePrices();
  const ratios = useRatios();
  const vaultsOwnerFilter = [
    { name: t("all-vaults"), value: "0" },
    { name: t("my-vaults"), value: "1" },
  ];
  const [vaultsUpdated, setVaultsUpdated] = useState(false);
  const [vaultsTotals, setVaultsTotals] = useState<VaultsTotalsType>(totalsDefault);
  const [vaultList, setVaultList] = useState<Array<VaultsType>>([]);
  const [vaultGraphList, setVaultGraphList] = useState<Array<any>>([]);
  const [pagination, setPagination] = useState<PaginationType>(pagDefault);
  const [loadMore, setLoadMore] = useState(false);
  const [filteringRatios, setFilteringRatios] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [currentOwnerFilter, setCurrentOwnerFilter] = useState(vaultsOwnerFilter[1]);
  const [tokenSymbol, setTokenSymbol] = useState("all");
  const [currentStatus, setCurrentStatus] = useState("all");
  const [vaultMode, setVaultMode] = useState("all");
  const [currentMinRatio, setCurrentMinRatio] = useState("0%");
  const [currentMaxRatio, setCurrentMaxRatio] = useState("2500%");
  const [renderTable, setRenderTable] = useState(false);
  const ratioRangeDropdown = useRef(null);
  const minRatioInput = useRef(null);
  const maxRatioInput = useRef(null);
  const viewsList = [
    { key: "5", name: "5" },
    { key: "10", name: "10" },
    { key: "15", name: "15" },
    { key: "20", name: "20" },
    { key: "25", name: "25" },
    { key: "30", name: "30" },
  ];
  const statusList = [
    { key: "all", name: "All" },
    { key: VAULT_STATUS.empty, name: "Empty" },
    { key: VAULT_STATUS.ready, name: "Ready" },
    { key: VAULT_STATUS.active, name: "Active" },
    { key: VAULT_STATUS.liquidation, name: "Liquidation" },
  ];
  const modeList = [
    { key: "all", name: "All" },
    { key: "regular", name: "Regular" },
    { key: "hard", name: "Hard" },
  ];

  const buildFilters = () => {
    const weiLimit = "100000000";
    let filter = "";
    let ownerFilter = "";
    let vaultFilter = "";
    let statusFilter = "";
    let modeFilter = "";

    if (currentOwnerFilter.value === "1" && ownerAddress !== "") {
      ownerFilter = `, owner: "${ownerAddress}"`;
    }
    if (tokenSymbol !== "all") {
      vaultFilter = `tokenSymbol: "${tokenSymbol.toUpperCase()}"`;
    }
    if (currentStatus !== "all") {
      if (currentStatus === "empty") {
        statusFilter = `collateral_lt: "${weiLimit}"`;
      }
      if (currentStatus === "ready") {
        statusFilter = `collateral_gte: "${weiLimit}", debt_lt: "${weiLimit}"`;
      }
      if (currentStatus === VAULT_STATUS.active || currentStatus === VAULT_STATUS.liquidation) {
        statusFilter = `debt_gt: "${weiLimit}"`;
      }
    }
    if (vaultMode !== "all") {
      const isHard = vaultMode === "hard" ? "true" : "false";
      modeFilter = "hardVault: ".concat(isHard);
    }

    filter = ownerFilter;
    if (vaultFilter !== "") {
      filter = filter.concat(`, ${vaultFilter}`);
    }
    if (statusFilter !== "") {
      filter = filter.concat(`, ${statusFilter}`);
    }
    if (modeFilter !== "") {
      filter = filter.concat(`, ${modeFilter}`);
    }
    if (filter !== "") {
      if (loadMore) {
        filter = `, where: { blockTS_gt: "${pagination.lastId}" ${filter} }`;
      } else {
        filter = `, where: { blockTS_gt: "0" ${filter} }`;
      }
    }

    return filter;
  };

  const str =
    "query allVaults {" +
    `vaults(first: 1000, orderBy: blockTS ${buildFilters()}) {` +
    "id " +
    "vaultId " +
    "owner " +
    "collateral " +
    "debt " +
    "currentRatio " +
    "tokenSymbol " +
    "hardVault " +
    "blockTS " +
    "underlyingProtocol { " +
    "underlyingToken { " +
    "decimals " +
    "} " +
    "}" +
    "} " +
    "}";

  const vaultsQuery = gql`
    ${str}
  `;

  const isValidRatio = (value: string) => {
    let valid = false;
    if (!Number.isNaN(value)) {
      valid = Number.parseFloat(value) >= 0;
    }
    return valid;
  };

  const getMinRangeRatio = (): number => {
    if (minRatioInput && minRatioInput.current) {
      // @ts-ignore
      const minRatio = minRatioInput.current.value;
      if (isValidRatio(minRatio)) {
        return parseFloat(minRatio);
      }
    }
    return 0;
  };

  const getMaxRangeRatio = (): number => {
    if (maxRatioInput && maxRatioInput.current) {
      // @ts-ignore
      const maxRatio = maxRatioInput.current.value;
      if (isValidRatio(maxRatio)) {
        return parseFloat(maxRatio);
      }
    }
    return 3000;
  };

  const calculateNetRewardUsd = async (
    vaultId: string,
    vaultType: string,
    isHardVault: boolean,
    decimals: number
  ) => {
    try {
      let cVault = vaults.wethVault;
      let cVaultRead = vaults.wethVaultRead;
      const vaultPrice = getCollateralPrice(prices, vaultType);
      if (isHardVault) {
        cVault = hardVaults.wethVault;
        cVaultRead = hardVaults.wethVaultRead;
      }

      switch (vaultType) {
        case "DAI":
          if (isHardVault) {
            cVault = hardVaults.daiVault;
            cVaultRead = hardVaults.daiVaultRead;
          } else {
            cVault = vaults.daiVault;
            cVaultRead = vaults.daiVaultRead;
          }
          break;
        case "AAVE":
          cVault = vaults.aaveVault;
          cVaultRead = vaults.aaveVaultRead;
          break;
        case "LINK":
          cVault = vaults.linkVault;
          cVaultRead = vaults.linkVaultRead;
          break;
        case "SNX":
          cVault = vaults.snxVault;
          cVaultRead = vaults.snxVaultRead;
          break;
        case "UNI":
          cVault = vaults.uniVault;
          cVaultRead = vaults.uniVaultRead;
          break;
        case "MATIC":
          cVault = vaults.maticVault;
          cVaultRead = vaults.maticVaultRead;
          break;
        case "WBTC":
          cVault = vaults.wbtcVault;
          cVaultRead = vaults.wbtcVaultRead;
          break;
        case "USDC":
          cVault = hardVaults.usdcVault;
          cVaultRead = hardVaults.usdcVaultRead;
          break;
        default:
          if (isHardVault) {
            cVault = hardVaults.wethVault;
            cVaultRead = hardVaults.wethVaultRead;
          } else {
            cVault = vaults.wethVault;
            cVaultRead = vaults.wethVaultRead;
          }
          break;
      }

      const reqTcapCall = await cVaultRead?.requiredLiquidationTCAP(BigNumber.from(vaultId));
      const liqRewardCall = await cVaultRead?.liquidationReward(BigNumber.from(vaultId));
      // @ts-ignore
      const [reqTcap, liqReward] = await signer.ethcallProvider?.all([reqTcapCall, liqRewardCall]);

      const reqTcapText = ethers.utils.formatEther(reqTcap);
      const liqRewardText = ethers.utils.formatUnits(liqReward, decimals);
      const currentLiqFee = await cVault?.getFee(reqTcap);
      const increasedFee = currentLiqFee.add(currentLiqFee.div(100)).toString();
      const ethFee = ethers.utils.formatEther(increasedFee);

      return (
        toUSD(liqRewardText, vaultPrice) -
        toUSD(reqTcapText, prices.tcapOraclePrice) -
        toUSD(ethFee, prices.wethOraclePrice)
      );
    } catch (error) {
      if (error.code !== "UNPREDICTABLE_GAS_LIMIT") {
        console.log(error.code);
      }
      return 0;
    }
  };

  const calculateVaultData = (
    collateralWei: ethers.BigNumberish,
    debtWei: ethers.BigNumberish,
    symbol: string,
    isHardVault: boolean,
    decimals: number
  ) => {
    const collateralText = ethers.utils.formatUnits(collateralWei, decimals);
    const debtText = ethers.utils.formatEther(debtWei);
    const collateralPrice = getCollateralPrice(prices, symbol);
    const collateralUSD = toUSD(collateralText, collateralPrice);
    const debtUSD = toUSD(debtText, prices.tcapOraclePrice || "0");
    const minRatio = getMinRatio(ratios, symbol, isHardVault);

    const ratio = getRatio2(
      collateralText,
      collateralPrice,
      debtText,
      prices.tcapOraclePrice || "1"
    );

    let status = VAULT_STATUS.liquidation;
    if (parseFloat(collateralText) < 0.0000000001) {
      status = VAULT_STATUS.empty;
    } else if (parseFloat(collateralText) >= 0.0000000001 && parseFloat(debtText) < 0.0000000001) {
      status = VAULT_STATUS.ready;
    } else if (ratio >= minRatio) {
      status = VAULT_STATUS.active;
    }
    return { collateralText, collateralUSD, debtText, debtUSD, ratio, minRatio, status };
  };

  const confPagination = (vData: Array<VaultsType>, itemsPerPage: number) => {
    if (vData.length > 0) {
      const lastVaultId = vData[vData.length - 1].blockTS;
      const itemsCount = vData.length;
      const pages = Math.ceil(itemsCount / itemsPerPage);
      const lastDataPage = Math.ceil(itemsCount / itemsPerPage);
      const pag = {
        previous: 0,
        current: 1,
        next: 2,
        pages,
        lastDataPage,
        itemsPerPage,
        itemsCount,
        lastId: lastVaultId,
      };
      setPagination(pag);
    } else {
      setPagination(pagDefault);
    }
  };

  const loadVaults = async (vaultsData: any, cStatus: string) => {
    const vData = new Array<VaultsType>();
    const vLiquidables = new Array<liqVaultsTempType>();
    const totals = { ...totalsDefault };
    const minFilterRatio = getMinRangeRatio();
    const maxFilterRatio = getMaxRangeRatio();

    setLoadMore(false);
    setFilteringRatios(true);
    // setLiqLoaded(currentStatus !== VAULT_STATUS.liquidation);
    // @ts-ignore
    vaultsData.vaults.forEach((v) => {
      const cVaultDecimals = v.underlyingProtocol.underlyingToken.decimals;
      const { collateralText, collateralUSD, debtText, debtUSD, ratio, minRatio, status } =
        calculateVaultData(v.collateral, v.debt, v.tokenSymbol, v.hardVault, cVaultDecimals);

      let addVault = true;
      if (cStatus === VAULT_STATUS.active || cStatus === VAULT_STATUS.liquidation) {
        addVault = cStatus === status;
      }
      // filter ratio
      if (cStatus !== VAULT_STATUS.empty && cStatus !== VAULT_STATUS.ready) {
        addVault = addVault && ratio >= minFilterRatio && ratio <= maxFilterRatio;
      }

      if (!showAllVaults) {
        addVault = v.tokenSymbol === TOKENS_SYMBOLS.WETH || v.tokenSymbol === TOKENS_SYMBOLS.DAI;
      }
      if (addVault && v.tokenSymbol !== TOKENS_SYMBOLS.WBTC) {
        let vaultUrl = "";
        const symbol = v.tokenSymbol === TOKENS_SYMBOLS.WETH ? TOKENS_SYMBOLS.ETH : v.tokenSymbol;
        if (v.owner.toLowerCase() === currentAddress.toLowerCase()) {
          vaultUrl = window.location.origin.concat("/vault/").concat(symbol);
        }
        if (cStatus === VAULT_STATUS.liquidation) {
          vLiquidables.push({
            vaultId: v.vaultId,
            vaultType: v.tokenSymbol,
            decimals: cVaultDecimals,
            hardVault: v.hardVault,
          });
        }

        vData.push({
          id: v.vaultId,
          collateralSymbol: v.tokenSymbol,
          collateralValue: collateralText,
          collateralUsd: collateralUSD.toFixed(2),
          debt: debtText,
          debtUsd: debtUSD.toFixed(2),
          ratio,
          minRatio: minRatio.toString(),
          decimals: cVaultDecimals,
          isHardVault: v.hardVault,
          netReward: 0,
          status,
          blockTS: v.blockTS,
          url: vaultUrl,
        });

        totals.vaults += 1;
        totals.collateral = (parseFloat(totals.collateral) + parseFloat(collateralText)).toFixed(4);
        totals.collateralUSD = (parseFloat(totals.collateralUSD) + collateralUSD).toFixed(2);
        totals.debt = (parseFloat(totals.debt) + parseFloat(debtText)).toFixed(4);
        totals.debtUSD = (parseFloat(totals.debtUSD) + debtUSD).toFixed(2);
      }
    });

    if (currentStatus !== VAULT_STATUS.liquidation) {
      setVaultList(vData);
      setVaultsTotals(totals);
    } else {
      const loadNetReward = async () => {
        vLiquidables.forEach((l, index) => {
          calculateNetRewardUsd(l.vaultId, l.vaultType, l.hardVault, l.decimals).then((result) => {
            const newA = [...vData];
            newA[index].netReward = result;
            setVaultList(newA);
          });
        });
      };
      loadNetReward().then(() => {
        setVaultList(vData);
        setVaultsTotals(totals);
      });
    }

    // Set pagination data
    confPagination(vData, pagination.itemsPerPage);
    setFilteringRatios(false);
  };

  const [loadVaultData, { loading }] = useLazyQuery(vaultsQuery, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    // skip: skipQuery,
    onError: (error) => {
      console.log(error);
    },
    onCompleted: (data: any) => {
      if (!isUndefined(data)) {
        setVaultGraphList(data);
        loadVaults(data, currentStatus);
        setVaultsUpdated(true);
      }
    },
  });

  useEffect(
    () => {
      const load = async () => {
        if (signer && signer.signer) {
          if (!vaultsUpdated) {
            const address = await signer.signer.getAddress();
            setCurrentAddress(address);
            setOwnerAddress(currentOwnerFilter.value === "1" ? address : "");

            loadVaultData();
          }
        } else if (prices.daiOraclePrice !== "0") {
          setCurrentOwnerFilter(vaultsOwnerFilter[0]);
          loadVaultData();
        }
      };
      load();
    },
    // eslint-disable-next-line
    [signer, prices.daiOraclePrice]
  );

  const tokensSymbols = (): Array<DropdownItemType> => {
    const symbols = [{ key: "all", name: "All" }];
    if (isInLayer1(currentNetwork.chainId)) {
      symbols.push({ key: "weth", name: TOKENS_SYMBOLS.ETH });
      symbols.push({ key: "dai", name: TOKENS_SYMBOLS.DAI });
      if (showAllVaults) {
        symbols.push({ key: "aave", name: TOKENS_SYMBOLS.AAVE });
        symbols.push({ key: "link", name: TOKENS_SYMBOLS.LINK });
        symbols.push({ key: "usdc", name: TOKENS_SYMBOLS.USDC });
      }
    } else if (isArbitrum(currentNetwork.chainId)) {
      symbols.push({ key: "weth", name: TOKENS_SYMBOLS.ETH });
      symbols.push({ key: "dai", name: TOKENS_SYMBOLS.DAI });
    } else if (isOptimism(currentNetwork.chainId)) {
      symbols.push({ key: "eth", name: TOKENS_SYMBOLS.ETH });
      symbols.push({ key: "dai", name: TOKENS_SYMBOLS.DAI });
      if (showAllVaults) {
        symbols.push({ key: "link", name: TOKENS_SYMBOLS.LINK });
        symbols.push({ key: "uni", name: TOKENS_SYMBOLS.UNI });
        symbols.push({ key: "snx", name: TOKENS_SYMBOLS.SNX });
      }
    } else {
      symbols.push({ key: "matic", name: TOKENS_SYMBOLS.MATIC });
      symbols.push({ key: "dai", name: TOKENS_SYMBOLS.DAI });
      symbols.push({ key: "wbtc", name: TOKENS_SYMBOLS.WBTC });
    }

    return symbols;
  };

  const handleItemsViewChange = (number: string) => {
    confPagination(vaultList, parseInt(number));
  };

  const handleVaultOwnerFilterChange = (value: string) => {
    setCurrentOwnerFilter(vaultsOwnerFilter[parseInt(value)]);
    if (value === "0") {
      setOwnerAddress("");
    } else {
      setOwnerAddress(currentAddress);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === VAULT_STATUS.liquidation || newStatus === VAULT_STATUS.active) {
      setCurrentStatus(newStatus);
      if (currentStatus === "all") {
        loadVaults(vaultGraphList, newStatus);
      } else {
        loadVaultData();
      }
    } else {
      setCurrentStatus(newStatus);
    }
  };

  const handleTokenChange = (newToken: string) => {
    setTokenSymbol(newToken);
  };

  const handleModeChange = (newMode: string) => {
    setVaultMode(newMode);
  };

  const onFilterRatioClick = () => {
    if (minRatioInput && maxRatioInput) {
      // @ts-ignore
      const minRatio = minRatioInput.current.value;
      // @ts-ignore
      const maxRatio = maxRatioInput.current.value;
      if (isValidRatio(minRatio) && isValidRatio(maxRatio)) {
        setCurrentMinRatio(minRatio.concat("%"));
        setCurrentMaxRatio(maxRatio.concat("%"));
        // @ts-ignore
        loadVaults(vaultGraphList);
        if (ratioRangeDropdown !== null) {
          // @ts-ignore
          ratioRangeDropdown.current.click();
        }
      }
    }
  };

  const onPageSelected = (pageNumber: number) => {
    const nextPage = pageNumber === pagination.pages ? 0 : pageNumber + 1;
    const newPagination = {
      ...pagination,
      previous: pageNumber === 1 ? 0 : pageNumber - 1,
      current: pageNumber,
      next: nextPage,
    };
    setPagination(newPagination);
  };

  const updateLiquidatedVault = async (
    index: number,
    symbol: string,
    vaultId: string,
    collateral: ethers.BigNumberish,
    debt: ethers.BigNumberish
  ) => {
    const { collateralText, collateralUSD, debtText, debtUSD, ratio, minRatio, status } =
      calculateVaultData(
        collateral,
        debt,
        symbol,
        vaultList[index].isHardVault,
        vaultList[index].decimals
      );
    const allVaults = vaultList;
    const v = {
      id: vaultId,
      collateralSymbol: symbol,
      collateralValue: collateralText,
      collateralUsd: collateralUSD.toFixed(2),
      debt: debtText,
      debtUsd: debtUSD.toFixed(2),
      ratio,
      minRatio: minRatio.toString(),
      decimals: vaultList[index].decimals,
      isHardVault: vaultList[index].isHardVault,
      netReward: 0,
      status,
      blockTS: vaultList[index].blockTS,
      url: vaultList[index].url,
    };
    allVaults[index] = Object.create(v);
    setVaultList(Array.from(allVaults));
    setRenderTable(!renderTable);
  };

  const newVault = () => {
    let newAssetSymbol = TOKENS_SYMBOLS.TCAP;
    let newCollateralSymbol = TOKENS_SYMBOLS.ETH;
    let isHardVault = false;
    const createdCollaterals = [];
    for (let i = 0; i < vaultList.length; i += 1) {
      createdCollaterals.push(vaultList[i].collateralSymbol);
    }

    if (createdCollaterals.includes(TOKENS_SYMBOLS.WETH)) {
      createdCollaterals.push(TOKENS_SYMBOLS.ETH);
    }

    if (isInLayer1(currentNetwork.chainId)) {
      [newCollateralSymbol, isHardVault] = findNewMainnetVaultCollateral(createdCollaterals);
    }
    if (isOptimism(currentNetwork.chainId)) {
      newCollateralSymbol = findNewOptimismVaultCollateral(createdCollaterals);
    }
    if (isArbitrum(currentNetwork.chainId)) {
      newAssetSymbol = TOKENS_SYMBOLS.JPEGz;
      newCollateralSymbol = findNewArbitrumVaultCollateral(createdCollaterals);
    }

    setVaultToUpdate({
      vaultId: "0",
      assetSymbol: newAssetSymbol,
      collateralSymbol: newCollateralSymbol,
      isHardVault,
    });
  };

  const IndexIcon = () => {
    if (!isArbitrum(currentNetwork.chainId)) {
      return <TokenIcon name={TOKENS_SYMBOLS.TCAP} />;
    }
    return <TokenIcon name={TOKENS_SYMBOLS.JPEGz} />;
  };

  const RenderFilters = () => (
    <>
      <div className="items-view">
        <div className="dd-container view">
          <h6 className="titles">
            <>{t("view")}:</>
          </h6>
          <Dropdown onSelect={(eventKey) => handleItemsViewChange(eventKey || "15")}>
            <Dropdown.Toggle variant="secondary" id="dropdown-filters" className="text-left">
              <div className="items-view-toggle">
                <span>{pagination.itemsPerPage}</span>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {viewsList.map((item) => (
                <Dropdown.Item key={item.key} eventKey={item.key}>
                  {item.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <div className="filters">
        <div className="dd-container">
          <h6 className="titles">
            <>{t("collateral")}</>
          </h6>
          <Dropdown
            className="dd-collateral"
            onSelect={(eventKey) => handleTokenChange(eventKey || "ALL")}
          >
            <Dropdown.Toggle variant="secondary" id="dropdown-filters" className="text-left">
              <div className="collateral-toggle">
                <TokenIcon name={tokenSymbol} />
                <span>{tokenSymbol.toUpperCase()}</span>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {tokensSymbols().map((item) => (
                <Dropdown.Item key={item.key} eventKey={item.key}>
                  {item.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="dd-container">
          <h6 className="titles">Status</h6>
          <Dropdown onSelect={(eventKey) => handleStatusChange(eventKey || "ALL")}>
            <Dropdown.Toggle id="dropdown-flags" variant="secondary" className="text-left">
              <div className="status-toggle">
                <span>{capitalize(currentStatus)}</span>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {statusList.map((item) => (
                <Dropdown.Item key={item.key} eventKey={item.key}>
                  {item.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        {isInLayer1(currentNetwork.chainId) && (
          <div className="dd-container">
            <h6 className="titles">
              <>{t("mode")}</>
            </h6>
            <Dropdown
              className="dd-mode"
              onSelect={(eventKey) => handleModeChange(eventKey || "ALL")}
            >
              <Dropdown.Toggle id="dropdown-flags" variant="secondary" className="text-left">
                <div className="status-toggle">
                  <span>{capitalize(vaultMode)}</span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {modeList.map((item) => (
                  <Dropdown.Item key={item.key} eventKey={item.key}>
                    {item.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
        <div className="dd-container">
          <h6 className="titles">Ratio Range</h6>
          <Dropdown>
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-flags"
              className="text-left ratio-range-toggle"
              ref={ratioRangeDropdown}
            >
              <div className="status-toggle">
                <span>
                  {currentMinRatio} <FaArrowsAltH /> {currentMaxRatio}
                </span>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="ratio-range-menu">
              <div className="range-container">
                <Form.Control
                  type="number"
                  placeholder=""
                  className="neon-green"
                  defaultValue="0"
                  ref={minRatioInput}
                />
                <FaArrowsAltH />
                <Form.Control
                  type="number"
                  placeholder=""
                  className="neon-green"
                  defaultValue="2500"
                  ref={maxRatioInput}
                />
              </div>
              <Button onClick={() => onFilterRatioClick()}>Apply</Button>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="dd-container">
          <h6 className="titles">Vaults</h6>
          <Dropdown onSelect={(eventKey) => handleVaultOwnerFilterChange(eventKey || "1")}>
            <Dropdown.Toggle id="dropdown-flags" variant="secondary" className="text-left">
              <div className="status-toggle">
                <span>{capitalize(currentOwnerFilter.name)}</span>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item key={vaultsOwnerFilter[0].value} eventKey={vaultsOwnerFilter[0].value}>
                {vaultsOwnerFilter[0].name}
              </Dropdown.Item>
              <Dropdown.Item
                key={vaultsOwnerFilter[1].value}
                eventKey={vaultsOwnerFilter[1].value}
                disabled={currentAddress === ""}
              >
                {vaultsOwnerFilter[1].name}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="dd-container">
          <Button
            className="btn-create-vault"
            onClick={() => newVault()}
            disabled={currentAddress === ""}
          >
            New Vault
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="vault-monitoring">
      <Accordion defaultActiveKey={isMobile ? "1" : "0"} className="diamond mb-2 totals">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <h5>
              <>{t("totals")}</>
            </h5>
          </Accordion.Header>
          <Accordion.Body>
            <Col md={12} className="totals-container">
              <Col md={3} className="total-box">
                <h6>
                  <>{t("vaults")}</>
                </h6>
                <span className="number">{vaultsTotals.vaults}</span>
              </Col>
              <Col md={3} className="total-box">
                <h6>
                  <>{t("collateral")} (USD)</>
                </h6>
                <span className="number">${numberFormatStr(vaultsTotals.collateralUSD, 2, 2)}</span>
              </Col>
              <Col md={3} className="total-box">
                <div className="debt">
                  <h6>
                    <>{t("debt")}</>
                  </h6>
                  <IndexIcon />
                </div>
                <span className="number">{numberFormatStr(vaultsTotals.debt, 4, 4)}</span>
              </Col>
              <Col md={3} className="total-box">
                <h6>
                  <>{t("debt")} (USD)</>
                </h6>
                <span className="number">${numberFormatStr(vaultsTotals.debtUSD, 2, 2)}</span>
              </Col>
            </Col>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      {!isMobile ? (
        <Card className="diamond mb-2">
          <Col md={12} className="actions">
            <RenderFilters />
          </Col>
          <Card.Body>
            {loading || filteringRatios ? (
              <Spinner variant="danger" className="spinner" animation="border" />
            ) : (
              <Vaults
                currentAddress={currentAddress}
                vaults={vaultList}
                setVaults={(v: Array<VaultsType>) => setVaultList(v)}
                currentStatus={currentStatus}
                pagination={pagination}
                refresh={updateLiquidatedVault}
                setVaultToUpdate={setVaultToUpdate}
                myVaults={currentOwnerFilter.value === "1"}
              />
            )}
            <Col md={12} className="pag-container">
              {pagination.pages > 0 && !loading && (
                <VaultPagination pagination={pagination} onPageSelected={onPageSelected} />
              )}
            </Col>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Accordion defaultActiveKey="1" className="actions">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <h5>Filters</h5>
              </Accordion.Header>
              <Accordion.Body>
                <RenderFilters />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <Button
            className="btn-create-vault"
            onClick={() => newVault()}
            disabled={currentAddress === ""}
            variant="secondary"
          >
            New Vault
          </Button>
          {loading || filteringRatios ? (
            <Spinner variant="danger" className="spinner" animation="border" />
          ) : (
            <>
              <VaultsMobile
                currentAddress={currentAddress}
                vaults={vaultList}
                setVaults={(v: Array<VaultsType>) => setVaultList(v)}
                currentStatus={currentStatus}
                pagination={pagination}
                refresh={updateLiquidatedVault}
                setVaultToUpdate={setVaultToUpdate}
                myVaults={currentOwnerFilter.value === "1"}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Monitoring;
