import React, { useContext, useEffect, useRef, useState } from "react";
import { Accordion, Button, Card, Col, Dropdown, Form } from "react-bootstrap/esm";
import Spinner from "react-bootstrap/Spinner";
import { FaArrowsAltH } from "react-icons/fa";
import { ethers, BigNumber } from "ethers";
import { useMediaQuery } from "react-responsive";
import { useLazyQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import "../../../styles/vault-monitoring.scss";
import { VaultPagination } from "./Pagination";
import VaultsSummary from "./VaultsSummary";
import { signerContext, hardVaultsContext, networkContext, vaultsContext } from "../../../state";
import { Vaults } from "./Vaults";
import { VaultsMobile } from "./VaultsMobile";
import {
  VAULTS_ALL,
  VAULTS_BY_COLLATERAL,
  VAULTS_BY_STATUS,
  VAULTS_BY_TOKEN_STATUS,
  VAULTS_IN_LIQ,
  VAULTS_IN_LIQ_BY_TOKEN,
  VAULTS_BY_USER,
} from "./GraphqlQueries";
import { usePrices, useRatios, useVaultsSummary } from "../../../hooks";
import {
  getRatio2,
  isArbitrum,
  isInLayer1,
  isOptimism,
  isUndefined,
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
  KEYWORD_ALL,
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
  totalItems: 0,
  totalPages: 0,
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
  currentAddress: string;
  setVaultToUpdate: (initData: VaultToUpdateType) => void;
};

const showAllVaults = true;
const MAX_RANGE_LIMIT = Number.MAX_VALUE;

const Monitoring = ({ currentAddress, setVaultToUpdate }: props) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: "(max-width: 850px)" });
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);
  const vaults = useContext(vaultsContext);
  const hardVaults = useContext(hardVaultsContext);
  const [prices, loadingPrices] = usePrices();
  const ratios = useRatios();
  // eslint-disable-next-line
  const [refetchSummary, vaultsSummary] = useVaultsSummary(prices, loadingPrices);
  const vaultsOwnerFilter = [
    { name: t("all-vaults"), value: "0" },
    { name: t("my-vaults"), value: "1" },
  ];
  const [vaultsUpdated, setVaultsUpdated] = useState(false);
  const [vaultsTotals, setVaultsTotals] = useState<VaultsTotalsType>(totalsDefault);
  const [vaultList, setVaultList] = useState<Array<VaultsType>>([]);
  const [pagination, setPagination] = useState<PaginationType>(pagDefault);
  const [loadingMore, setLoadingMore] = useState(false);
  const [byCollateralFirstLoad, setByCollateralFirstLoad] = useState(true);
  const [byStatusFirstLoad, setByStatusFirstLoad] = useState(true);
  const [byTSFirstLoad, setByTSFirstLoad] = useState(true);
  const [byInLiqFirstLoad, setByInLiqFirstLoad] = useState(true);
  const [byTokenInLiqFirstLoad, setByTokenInLiqFirstLoad] = useState(true);
  const [filteringRatios, setFilteringRatios] = useState(false);
  const [currentOwnerFilter, setCurrentOwnerFilter] = useState(vaultsOwnerFilter[1]);
  const [tokenSymbol, setTokenSymbol] = useState("all");
  const [currentStatus, setCurrentStatus] = useState("all");
  const [vaultMode, setVaultMode] = useState("all");
  const [currentMinRatio, setCurrentMinRatio] = useState("0%");
  const [currentMaxRatio, setCurrentMaxRatio] = useState("MAX");
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
    { key: KEYWORD_ALL, name: "All" },
    { key: VAULT_STATUS.empty, name: "Empty" },
    { key: VAULT_STATUS.ready, name: "Ready" },
    { key: VAULT_STATUS.active, name: "Active" },
    { key: VAULT_STATUS.liquidation, name: "Liquidation" },
  ];
  const modeList = [
    { key: KEYWORD_ALL, name: "All" },
    { key: "regular", name: "Regular" },
    { key: "hard", name: "Hard" },
  ];

  const isMyVaults = (): boolean => currentOwnerFilter.value === "1" && currentAddress !== "";

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
      return MAX_RANGE_LIMIT;
    }
    return MAX_RANGE_LIMIT;
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
        case TOKENS_SYMBOLS.DAI:
          if (isHardVault) {
            cVault = hardVaults.daiVault;
            cVaultRead = hardVaults.daiVaultRead;
          } else {
            cVault = vaults.daiVault;
            cVaultRead = vaults.daiVaultRead;
          }
          break;
        case TOKENS_SYMBOLS.AAVE:
          cVault = vaults.aaveVault;
          cVaultRead = vaults.aaveVaultRead;
          break;
        case TOKENS_SYMBOLS.LINK:
          cVault = vaults.linkVault;
          cVaultRead = vaults.linkVaultRead;
          break;
        case TOKENS_SYMBOLS.SNX:
          cVault = vaults.snxVault;
          cVaultRead = vaults.snxVaultRead;
          break;
        case TOKENS_SYMBOLS.UNI:
          cVault = vaults.uniVault;
          cVaultRead = vaults.uniVaultRead;
          break;
        case TOKENS_SYMBOLS.MATIC:
          cVault = vaults.maticVault;
          cVaultRead = vaults.maticVaultRead;
          break;
        case TOKENS_SYMBOLS.WBTC:
          cVault = vaults.wbtcVault;
          cVaultRead = vaults.wbtcVaultRead;
          break;
        case TOKENS_SYMBOLS.USDC:
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
    const indexPrice = !isArbitrum(currentNetwork.chainId)
      ? prices.tcapOraclePrice
      : prices.jpegzOraclePrice;
    const collateralText = ethers.utils.formatUnits(collateralWei, decimals);
    const debtText = ethers.utils.formatEther(debtWei);
    const collateralPrice = getCollateralPrice(prices, symbol);
    const collateralUSD = toUSD(collateralText, collateralPrice);
    const debtUSD = toUSD(debtText, indexPrice || "0");
    const minRatio = getMinRatio(ratios, symbol, isHardVault);
    const ratio = getRatio2(collateralText, collateralPrice, debtText, indexPrice || "1");

    let status = VAULT_STATUS.liquidation;
    if (parseFloat(collateralText) === 0) {
      status = VAULT_STATUS.empty;
    } else if (parseFloat(collateralText) > 0 && parseFloat(debtText) <= 0) {
      status = VAULT_STATUS.ready;
    } else if (ratio >= minRatio) {
      status = VAULT_STATUS.active;
    }
    return { collateralText, collateralUSD, debtText, debtUSD, ratio, minRatio, status };
  };

  const confPagination = (vData: Array<VaultsType>, itemsPerPage: number, vaultsAmount: number) => {
    if (vData.length > 0) {
      const lastVaultId = vData[vData.length - 1].blockTS;
      const itemsCount = vData.length;
      const pages = Math.ceil(itemsCount / itemsPerPage);
      const lastDataPage = Math.ceil(itemsCount / itemsPerPage);
      const pag = {
        previous: 0,
        current: loadingMore ? pagination.pages + 1 : 1,
        next: loadingMore ? pagination.pages + 2 : 2,
        pages,
        lastDataPage,
        itemsPerPage,
        itemsCount,
        totalItems: vaultsAmount - 1,
        totalPages: Math.ceil((vaultsAmount - 1) / itemsPerPage),
        lastId: lastVaultId,
      };
      setPagination(pag);
    } else {
      setPagination(pagDefault);
    }
  };

  const loadTotals = () => {
    let totalId = "";
    let vaultsAmount = 0;
    if (tokenSymbol !== "all" || currentStatus !== "all") {
      if (tokenSymbol !== "all") {
        totalId = tokenSymbol.toUpperCase();
      }
      if (currentStatus !== "all") {
        if (totalId === "") {
          totalId = currentStatus;
        } else {
          totalId = totalId.concat("_").concat(currentStatus);
        }
      }
    } else {
      totalId = "all";
    }

    const vs = vaultsSummary.find((item) => item.id === totalId);
    if (vs) {
      const indexPrice = !isArbitrum(currentNetwork.chainId)
        ? prices.tcapOraclePrice
        : prices.jpegzOraclePrice;

      const tDebtUsd = parseFloat(vs.debt) * parseFloat(indexPrice);
      setVaultsTotals({
        vaults: vs.vaultsAmount,
        collateral: vs.collateral,
        collateralUSD: vs.collateralUsd,
        debt: vs.debt,
        debtUSD: tDebtUsd.toFixed(2),
      });
      vaultsAmount = vs.vaultsAmount;
    }
    return vaultsAmount;
  };

  const isValidCollateral = (symbol: string): boolean => {
    if (tokenSymbol !== KEYWORD_ALL) {
      return symbol === tokenSymbol;
    }
    return true;
  };

  const isValidStatus = (vStatus: string): boolean => {
    if (currentStatus !== KEYWORD_ALL) {
      return vStatus === currentStatus;
    }
    return true;
  };

  const loadVaults = async (vaultsData: any, cStatus: string) => {
    let vData = new Array<VaultsType>();
    let vaultsAmount = 0;
    console.log("vaultsData: ", vaultsData.vaults.length);
    if (loadingMore) {
      vData = vaultList;
    }

    const vLiquidables = new Array<liqVaultsTempType>();
    const totals = { ...totalsDefault };
    const minFilterRatio = getMinRangeRatio();
    const maxFilterRatio = getMaxRangeRatio();

    setFilteringRatios(true);
    // setLiqLoaded(currentStatus !== VAULT_STATUS.liquidation);
    // @ts-ignore
    vaultsData.vaults.forEach((v) => {
      let validVault = true;
      if (isMyVaults()) {
        validVault = isValidCollateral(v.tokenSymbol) && isValidStatus(v.status);
      }

      if (validVault) {
        const cVaultDecimals = v.underlyingProtocol.underlyingToken.decimals;
        const { collateralText, collateralUSD, debtText, debtUSD, ratio, minRatio, status } =
          calculateVaultData(v.collateral, v.debt, v.tokenSymbol, v.hardVault, cVaultDecimals);

        let addVault = true;
        if (cStatus === VAULT_STATUS.liquidation) {
          addVault = cStatus === status;
        }
        // filter ratio
        if (cStatus !== VAULT_STATUS.empty && cStatus !== VAULT_STATUS.ready) {
          addVault = addVault && ratio >= minFilterRatio && ratio <= maxFilterRatio;
        }

        // show only wbtc hard vaults
        if (v.tokenSymbol === TOKENS_SYMBOLS.WBTC) {
          addVault = addVault && v.hardVault;
        }

        if (addVault) {
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

          if (isMyVaults() || cStatus === VAULT_STATUS.liquidation) {
            totals.vaults += 1;
            totals.collateral = (
              parseFloat(totals.collateral) + parseFloat(collateralText)
            ).toFixed(4);
            totals.collateralUSD = (parseFloat(totals.collateralUSD) + collateralUSD).toFixed(2);
            totals.debt = (parseFloat(totals.debt) + parseFloat(debtText)).toFixed(4);
            totals.debtUSD = (parseFloat(totals.debtUSD) + debtUSD).toFixed(2);
          }
        }
      }
    });

    if (currentStatus !== VAULT_STATUS.liquidation) {
      setVaultList(vData);
      if (isMyVaults()) {
        setVaultsTotals(totals);
        vaultsAmount = totals.vaults;
      } else {
        vaultsAmount = loadTotals();
      }
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
      vaultsAmount = totals.vaults;
    }

    // Set pagination data
    confPagination(vData, pagination.itemsPerPage, vaultsAmount);
    setFilteringRatios(false);
    setLoadingMore(false);
  };

  // Graphql queries
  const [loadVaultData, { loading, refetch: refetchVaults }] = useLazyQuery(VAULTS_ALL, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: { lastBlockTS: "0" },
    onError: (error) => {
      console.log(error);
    },
    onCompleted: (data: any) => {
      if (!isUndefined(data)) {
        loadVaults(data, currentStatus);
        setVaultsUpdated(true);
      }
    },
  });

  const [loadVaultByCollateral, { loading: loadingByCollateral, refetch: refetchByCollateral }] =
    useLazyQuery(VAULTS_BY_COLLATERAL, {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      variables: { lastBlockTS: "0", symbol: tokenSymbol },
      onError: (error) => {
        console.log(error);
      },
      onCompleted: (data: any) => {
        if (!isUndefined(data)) {
          loadVaults(data, currentStatus);
          setVaultsUpdated(true);
        }
      },
    });

  const [loadVaultByStatus, { loading: loadingByStatus, refetch: refetchByStatus }] = useLazyQuery(
    VAULTS_BY_STATUS,
    {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      variables: { lastBlockTS: "0", status: currentStatus },
      onError: (error) => {
        console.log(error);
      },
      onCompleted: (data: any) => {
        if (!isUndefined(data)) {
          loadVaults(data, currentStatus);
          setVaultsUpdated(true);
        }
      },
    }
  );

  const [loadVaultByTS, { loading: loadingByTS, refetch: refetchByTS }] = useLazyQuery(
    VAULTS_BY_TOKEN_STATUS,
    {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      variables: { lastBlockTS: "0", symbol: tokenSymbol, status: currentStatus },
      onError: (error) => {
        console.log(error);
      },
      onCompleted: (data: any) => {
        if (!isUndefined(data)) {
          loadVaults(data, currentStatus);
          setVaultsUpdated(true);
        }
      },
    }
  );

  const [loadVaultInLiq, { loading: loadingInLiq, refetch: refetchInLiq }] = useLazyQuery(
    VAULTS_IN_LIQ,
    {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      variables: { lastBlockTS: "0" },
      onError: (error) => {
        console.log(error);
      },
      onCompleted: (data: any) => {
        if (!isUndefined(data)) {
          loadVaults(data, currentStatus);
          setVaultsUpdated(true);
        }
      },
    }
  );

  const [loadVaultTokenInLiq, { loading: loadingTokenInLiq, refetch: refetchTokenInLiq }] =
    useLazyQuery(VAULTS_IN_LIQ_BY_TOKEN, {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      variables: { lastBlockTS: "0", symbol: tokenSymbol },
      onError: (error) => {
        console.log(error);
      },
      onCompleted: (data: any) => {
        if (!isUndefined(data)) {
          loadVaults(data, currentStatus);
          setVaultsUpdated(true);
        }
      },
    });

  const [loadVaulsByUser, { loading: loadingByUser }] = useLazyQuery(VAULTS_BY_USER, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: { ownerAddress: currentAddress },
    onError: (error) => {
      console.log(error);
    },
    onCompleted: (data: any) => {
      if (!isUndefined(data)) {
        loadVaults(data, currentStatus);
        setVaultsUpdated(true);
      }
    },
  });

  useEffect(
    () => {
      const load = async () => {
        if (signer && currentAddress !== "") {
          if (!vaultsUpdated && !loadingPrices) {
            if (currentOwnerFilter.value === "1") {
              loadVaulsByUser();
            } else {
              loadVaultData();
            }
          }
        } else if (prices.daiOraclePrice !== "0") {
          setCurrentOwnerFilter(vaultsOwnerFilter[0]);
          loadVaultData();
        }
      };
      load();
    },
    // eslint-disable-next-line
    [signer, loadingPrices, prices.daiOraclePrice]
  );

  const tokensSymbols = (): Array<DropdownItemType> => {
    const symbols = [{ key: KEYWORD_ALL, name: "All" }];
    if (isInLayer1(currentNetwork.chainId)) {
      symbols.push({ key: TOKENS_SYMBOLS.WETH, name: TOKENS_SYMBOLS.ETH });
      symbols.push({ key: TOKENS_SYMBOLS.DAI, name: TOKENS_SYMBOLS.DAI });
      if (showAllVaults) {
        symbols.push({ key: TOKENS_SYMBOLS.AAVE, name: TOKENS_SYMBOLS.AAVE });
        symbols.push({ key: TOKENS_SYMBOLS.LINK, name: TOKENS_SYMBOLS.LINK });
        symbols.push({ key: TOKENS_SYMBOLS.USDC, name: TOKENS_SYMBOLS.USDC });
      }
      symbols.push({ key: TOKENS_SYMBOLS.WBTC, name: TOKENS_SYMBOLS.WBTC });
    } else if (isArbitrum(currentNetwork.chainId)) {
      symbols.push({ key: TOKENS_SYMBOLS.WETH, name: TOKENS_SYMBOLS.ETH });
      symbols.push({ key: TOKENS_SYMBOLS.DAI, name: TOKENS_SYMBOLS.DAI });
    } else if (isOptimism(currentNetwork.chainId)) {
      symbols.push({ key: TOKENS_SYMBOLS.WETH, name: TOKENS_SYMBOLS.ETH });
      symbols.push({ key: TOKENS_SYMBOLS.DAI, name: TOKENS_SYMBOLS.DAI });
      if (showAllVaults) {
        symbols.push({ key: TOKENS_SYMBOLS.LINK, name: TOKENS_SYMBOLS.LINK });
        symbols.push({ key: TOKENS_SYMBOLS.UNI, name: TOKENS_SYMBOLS.UNI });
        symbols.push({ key: TOKENS_SYMBOLS.SNX, name: TOKENS_SYMBOLS.SNX });
      }
    } else {
      symbols.push({ key: TOKENS_SYMBOLS.MATIC, name: TOKENS_SYMBOLS.MATIC });
      symbols.push({ key: TOKENS_SYMBOLS.DAI, name: TOKENS_SYMBOLS.DAI });
      symbols.push({ key: TOKENS_SYMBOLS.WBTC, name: TOKENS_SYMBOLS.WBTC });
    }

    return symbols;
  };

  const handleItemsViewChange = (number: string) => {
    confPagination(vaultList, parseInt(number), vaultsTotals.vaults);
  };

  const handleVaultOwnerFilterChange = (value: string) => {
    setCurrentOwnerFilter(vaultsOwnerFilter[parseInt(value)]);
    if (value === "0") {
      setPagination(pagDefault);
      loadVaultData();
    } else {
      loadVaulsByUser();
    }
  };

  const handleFiltersChange = (newStatus: string, newToken: string) => {
    if (newStatus === KEYWORD_ALL && newToken === KEYWORD_ALL) {
      refetchVaults({ lastBlockTS: "0" });
    } else if (newStatus === VAULT_STATUS.liquidation) {
      if (newToken !== KEYWORD_ALL) {
        if (byTokenInLiqFirstLoad) {
          setByTokenInLiqFirstLoad(false);
          loadVaultTokenInLiq();
        } else {
          refetchTokenInLiq({ lastBlockTS: "0", symbol: newToken });
        }
      } else if (byInLiqFirstLoad) {
        setByInLiqFirstLoad(false);
        loadVaultInLiq();
      } else {
        refetchInLiq({ lastBlockTS: "0" });
      }
    } else if (newStatus !== KEYWORD_ALL && newToken !== KEYWORD_ALL) {
      if (byTSFirstLoad) {
        setByTSFirstLoad(false);
        loadVaultByTS();
      } else {
        refetchByTS({ lastBlockTS: "0", symbol: newToken, status: newStatus });
      }
    } else if (newStatus !== KEYWORD_ALL) {
      if (byStatusFirstLoad) {
        setByStatusFirstLoad(false);
        loadVaultByStatus();
      } else {
        refetchByStatus({ lastBlockTS: "0", status: newStatus });
      }
    } else if (newToken !== KEYWORD_ALL) {
      if (byCollateralFirstLoad) {
        setByCollateralFirstLoad(false);
        loadVaultByCollateral();
      } else {
        refetchByCollateral({ lastBlockTS: "0", symbol: newToken });
      }
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    if (isMyVaults()) {
      loadVaulsByUser();
    } else {
      handleFiltersChange(newStatus, tokenSymbol);
    }
  };

  const handleTokenChange = (newToken: string) => {
    setTokenSymbol(newToken);
    if (isMyVaults()) {
      console.log("Entra aqui myyvaults ");
      loadVaulsByUser();
    } else {
      console.log("Entra aqui: ", newToken);
      handleFiltersChange(currentStatus, newToken);
    }
  };

  const handleModeChange = (newMode: string) => {
    setVaultMode(newMode);
    if (isMyVaults()) {
      loadVaulsByUser();
    } else {
      refetchVaults({ lastBlockTS: "0" });
    }
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
        handleFiltersChange(currentStatus, tokenSymbol);
        if (ratioRangeDropdown !== null) {
          // @ts-ignore
          ratioRangeDropdown.current.click();
        }
      }
    }
  };

  const onPageSelected = (pageNumber: number) => {
    let nextPage = pageNumber + 1;
    if (pageNumber === pagination.pages && pagination.pages === pagination.totalPages) {
      nextPage = 0;
    }

    if (pageNumber > pagination.lastDataPage) {
      setLoadingMore(true);
      if (tokenSymbol === KEYWORD_ALL && currentStatus === KEYWORD_ALL) {
        refetchVaults({ lastBlockTS: pagination.lastId });
      } else if (currentStatus === VAULT_STATUS.liquidation) {
        if (tokenSymbol !== KEYWORD_ALL) {
          refetchTokenInLiq({ lastBlockTS: pagination.lastId, symbol: tokenSymbol });
        } else {
          refetchInLiq({ lastBlockTS: pagination.lastId });
        }
      } else if (tokenSymbol !== KEYWORD_ALL) {
        refetchByCollateral({ lastBlockTS: pagination.lastId, symbol: tokenSymbol });
      } else if (currentStatus !== KEYWORD_ALL) {
        refetchByStatus({ lastBlockTS: pagination.lastId, status: currentStatus });
      }
    } else {
      const newPagination = {
        ...pagination,
        previous: pageNumber === 1 ? 0 : pageNumber - 1,
        current: pageNumber,
        next: nextPage,
      };
      setPagination(newPagination);
    }
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
            onSelect={(eventKey) => handleTokenChange(eventKey || KEYWORD_ALL)}
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
          <Dropdown onSelect={(eventKey) => handleStatusChange(eventKey || KEYWORD_ALL)}>
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
            <Dropdown.Menu className="ratio-range-menu" rootCloseEvent="click">
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
                  defaultValue=""
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

  const isLoadingVaults = () =>
    loading ||
    loadingByUser ||
    loadingByCollateral ||
    loadingByStatus ||
    loadingByTS ||
    loadingInLiq ||
    loadingTokenInLiq ||
    filteringRatios;

  return (
    <div className="vault-monitoring">
      <VaultsSummary vaultsTotals={vaultsTotals} />
      {!isMobile ? (
        <Card className="diamond mb-2">
          <Col md={12} className="actions">
            <RenderFilters />
          </Col>
          <Card.Body>
            {isLoadingVaults() ? (
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
