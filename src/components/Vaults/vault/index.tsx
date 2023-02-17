import React, { useContext, useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import {
  Alert,
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
  OverlayTrigger,
  Spinner,
  ToggleButton,
  Tooltip,
} from "react-bootstrap/esm";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";
import "../../../styles/vault.scss";
import { useVault } from "../../../hooks";
import { networkContext, signerContext } from "../../../state";
import { capitalize, TokenIcon } from "../common";
import { NETWORKS, TOKENS_SYMBOLS, BIG_NUMBER_ZERO } from "../../../utils/constants";
import {
  errorNotification,
  getDefaultProvider,
  getRatio,
  getSafeRemoveCollateral,
  getSafeMint,
  isArbitrum,
  isPolygon,
  isOptimism,
  notifyUser,
  toUSD,
  isInLayer1,
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

const Vault = ({ currentAddress, vaultInitData, goBack }: props) => {
  const { t } = useTranslation();
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);
  const [vaultMode, setVaultMode] = useState(vaultInitData.isHardVault ? "hard" : "normal");
  const [vaultData, setVaultData] = useState(vaultInitData);
  const radios = [
    { name: "R Mode", value: "normal" },
    { name: "H Mode", value: "hard" },
  ];

  const [
    {
      currentCollateral,
      currentVault,
      currentAssetRead,
      currentCollateralRead,
      currentVaultRead,
      currentCollateralOracleRead,
      currentAssetOracleRead,
    },
    loadingVault,
  ] = useVault(vaultData.assetSymbol, vaultData.collateralSymbol, vaultData.isHardVault);
  const actions = ["add", "remove", "mint", "burn"];

  // Actions
  const [title, setTitle] = useState(t("vault.create"));
  const [text, setText] = useState(t("vault.create-text", { asset: "Index" }));
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMax, setLoadingMax] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [activeAction, setActiveAction] = useState("add");
  const [refreshVault, setRefreshVault] = useState(false);

  // Vault Data
  const [assetOptions, setAssetOptions] = useState<Array<string>>([]);
  const [collateralOptions, setCollateralOptions] = useState<Array<string>>([]);

  const [currentVaultId, setCurrentVaultId] = useState("0");
  const [isApproved, setIsApproved] = useState(false);
  const [vaultDebt, setVaultDebt] = useState("0");
  const [vaultDebtRaw, setVaultDebtRaw] = useState(BIG_NUMBER_ZERO);
  const [vaultDebtUSD, setVaultDebtUSD] = useState("0");
  const [vaultCollateral, setVaultCollateral] = useState("0");
  const [vaultCollateralRaw, setVaultCollateralRaw] = useState(BIG_NUMBER_ZERO);
  const [vaultCollateralUSD, setVaultCollateralUSD] = useState("0");
  const [vaultRatio, setVaultRatio] = useState("0");
  const [tempRatio, setTempRatio] = useState("");
  const [minRatio, setMinRatio] = useState("0");
  const [selectedVaultDecimals, setSelectedVaultDecimals] = useState(18);

  // General Data
  const isHardMode = () => vaultMode === "hard";
  const [indexBalance, setIndexBalance] = useState("0");
  const [indexBalanceRaw, setIndexBalanceRaw] = useState(BIG_NUMBER_ZERO);
  const [indexBalanceUSD, setIndexBalanceUSD] = useState("0");
  const [collateralBalance, setCollateralBalance] = useState("0");
  const [collateralBalanceUSD, setCollateralBalanceUSD] = useState("0");
  const [tokenBalanceDecimals, setTokenBalanceDecimals] = useState(2);

  // Inputs
  const [addCollateralTxt, setAddCollateralTxt] = useState("0");
  const [addCollateralUSD, setAddCollateralUSD] = useState("0");
  const [removeCollateralTxt, setRemoveCollateralTxt] = useState("0");
  const [removeCollateralUSD, setRemoveCollateralUSD] = useState("0");
  const [mintTxt, setMintTxt] = useState("0");
  const [mintUSD, setMintUSD] = useState("0");
  const [mintFee, setMintFee] = useState("0");
  const [burnTxt, setBurnTxt] = useState("0");
  const [burnUSD, setBurnUSD] = useState("0");
  const [burnFee, setBurnFee] = useState("0");
  const [vaultStatus, setVaultStatus] = useState("");
  // Infinite Approval
  const approveValue = BigNumber.from("1157920892373161954235709850086879078532699");

  const setCollaterals = (newMode: string) => {
    if (currentAddress !== "") {
      let aOptions = [TOKENS_SYMBOLS.TCAP];
      if (isArbitrum(currentNetwork.chainId)) {
        aOptions = [TOKENS_SYMBOLS.JPEGz];
      }

      let cOptions = [
        TOKENS_SYMBOLS.ETH,
        TOKENS_SYMBOLS.WETH,
        TOKENS_SYMBOLS.DAI,
        TOKENS_SYMBOLS.AAVE,
        TOKENS_SYMBOLS.LINK,
      ];
      if (newMode === "hard") {
        cOptions = [
          TOKENS_SYMBOLS.ETH,
          TOKENS_SYMBOLS.WETH,
          TOKENS_SYMBOLS.DAI,
          TOKENS_SYMBOLS.USDC,
          TOKENS_SYMBOLS.WBTC,
        ];
      }
      if (isArbitrum(currentNetwork.chainId)) {
        cOptions = [TOKENS_SYMBOLS.ETH, TOKENS_SYMBOLS.WETH, TOKENS_SYMBOLS.DAI];
      }
      if (isOptimism(currentNetwork.chainId) && !isHardMode()) {
        cOptions = [
          TOKENS_SYMBOLS.ETH,
          TOKENS_SYMBOLS.DAI,
          TOKENS_SYMBOLS.LINK,
          TOKENS_SYMBOLS.UNI,
          TOKENS_SYMBOLS.SNX,
        ];
      }
      if (isPolygon(currentNetwork.chainId) && !isHardMode()) {
        cOptions = [TOKENS_SYMBOLS.MATIC, TOKENS_SYMBOLS.DAI, TOKENS_SYMBOLS.WBTC];
      }

      setAssetOptions(aOptions);
      setCollateralOptions(cOptions);
    }
  };

  async function loadVault() {
    setIsLoading(true);
    let cBalance;
    let iBalance;
    let currentIndexPrice = "0";
    let currentCollateralPrice = "0";
    const provider = getDefaultProvider(currentNetwork.chainId || NETWORKS.mainnet.chainId);
    let currentVaultData: any;
    // @ts-ignore
    const vaultID = await currentVault.userToVault(currentAddress);
    setCurrentVaultId(vaultID.toString());
    if (vaultID.toString() !== "0") {
      // @ts-ignore
      const cVault = await currentVault.vaults(vaultID);
      currentVaultData = {
        vaultId: vaultID,
        collateral: cVault.Collateral,
        debt: cVault.Debt,
      };
    }

    if (vaultData.collateralSymbol !== TOKENS_SYMBOLS.ETH) {
      // @ts-ignore
      cBalance = await currentCollateral.balanceOf(currentAddress);
    } else {
      cBalance = await provider.getBalance(currentAddress);
    }

    let decimals = 18;
    if (vaultData.collateralSymbol === TOKENS_SYMBOLS.WBTC) {
      decimals = 8;
    }
    if (vaultData.collateralSymbol === TOKENS_SYMBOLS.USDC) {
      decimals = 6;
    }

    setVaultDebtRaw(BIG_NUMBER_ZERO);
    setIndexBalanceRaw(BIG_NUMBER_ZERO);
    if (currentVaultData) {
      const { collateral, debt } = currentVaultData;
      // @ts-ignore
      const allowanceCall = await currentCollateralRead.allowance(
        currentAddress,
        // @ts-ignore
        currentVault.address
      );
      // @ts-ignore
      const currentRatioCall = await currentVaultRead.getVaultRatio(currentVaultData.vaultId);

      // @ts-ignore
      const currentIndexPriceCall = await currentAssetOracleRead?.getLatestAnswer();
      // @ts-ignore
      //  const decimalsCall = await currentCollateralRead.decimals();
      // @ts-ignore
      const currentCollateralPriceCall = await currentCollateralOracleRead.getLatestAnswer();
      // @ts-ignore
      const currentMinRatioCall = await currentVaultRead.ratio();
      // @ts-ignore
      const currentIndexBalanceCall = await currentAssetRead?.balanceOf(currentAddress);

      // @ts-ignore
      const [
        allowance,
        currentRatio,
        currentMinRatio,
        currentIndexBalance,
        currentIndexPriceVal,
        currentCollateralPriceVal,
      ] = await signer.ethcallProvider?.all([
        allowanceCall,
        currentRatioCall,
        currentMinRatioCall,
        currentIndexBalanceCall,
        currentIndexPriceCall,
        currentCollateralPriceCall,
      ]);

      if (!isArbitrum(currentNetwork.chainId)) {
        currentIndexPrice = ethers.utils.formatEther(currentIndexPriceVal);
      } else {
        currentIndexPrice = ethers.utils.formatEther(currentIndexPriceVal.mul(10));
      }

      currentCollateralPrice = ethers.utils.formatEther(currentCollateralPriceVal.mul(10000000000));

      iBalance = ethers.utils.formatUnits(currentIndexBalance, 18);
      setIndexBalance(iBalance);
      setIndexBalanceRaw(currentIndexBalance);

      if (!allowance.isZero() || vaultData.collateralSymbol === TOKENS_SYMBOLS.ETH) {
        const safeValue = isHardMode() ? 20 : 50;
        const warnValue = isHardMode() ? 10 : 30;

        setMinRatio(currentMinRatio.toString());
        setIsApproved(true);
        setVaultRatio(currentRatio.toString());
        if (currentRatio.toString() === "0") {
          setVaultStatus("N/A");
        } else if (currentRatio.toString() >= parseFloat(currentMinRatio.toString()) + safeValue) {
          setVaultStatus("safe");
        } else if (currentRatio.toString() >= parseFloat(currentMinRatio.toString()) + warnValue) {
          setVaultStatus("warning");
        } else {
          setVaultStatus("danger");
        }

        setVaultCollateralRaw(collateral);
        const parsedCollateral = ethers.utils.formatUnits(collateral, decimals);
        setVaultCollateral(parsedCollateral);
        const usdCollateral = toUSD(currentCollateralPrice, parsedCollateral);
        setVaultCollateralUSD(usdCollateral.toString());

        setVaultDebtRaw(debt);
        const parsedDebt = ethers.utils.formatEther(debt);
        setVaultDebt(parsedDebt);
        const usdIndex = toUSD(currentIndexPrice, parsedDebt);
        setVaultDebtUSD(usdIndex.toString());
      } else {
        setText(t("vault.approve-text", { asset: "Index" }));
        setTitle(t("vault.approve"));
        setIsApproved(false);
      }
    } else {
      // @ts-ignore
      //  const decimalsCall = await currentCollateralRead.decimals();
      // @ts-ignore
      const currentPriceCall = await currentCollateralOracleRead.getLatestAnswer();
      // @ts-ignore
      const currentIndexBalanceCall = await currentAssetRead?.balanceOf(currentAddress);
      // @ts-ignore
      const currentIndexPriceCall = await currentAssetOracleRead?.getLatestAnswer();

      // @ts-ignore
      const [currentCollateralPriceVal, currentIndexBalance, currentIndexPriceVal] =
        await signer.ethcallProvider?.all([
          currentPriceCall,
          currentIndexBalanceCall,
          currentIndexPriceCall,
        ]);
      currentCollateralPrice = ethers.utils.formatEther(currentCollateralPriceVal.mul(10000000000));

      if (!isArbitrum(currentNetwork.chainId)) {
        currentIndexPrice = ethers.utils.formatEther(currentIndexPriceVal);
      } else {
        currentIndexPrice = ethers.utils.formatEther(currentIndexPriceVal.mul(10));
      }

      iBalance = ethers.utils.formatUnits(currentIndexBalance, 18);
      setIndexBalance(iBalance);
      setIndexBalanceRaw(currentIndexBalance);

      setText(t("vault.create-text", { asset: "Index" }));
      setTitle(t("vault.create"));
      setIsApproved(false);
    }

    setSelectedVaultDecimals(decimals);
    const currentBalance = ethers.utils.formatUnits(cBalance, decimals);
    if (parseFloat(currentBalance) < 0.09) {
      setTokenBalanceDecimals(4);
    } else {
      setTokenBalanceDecimals(2);
    }
    setCollateralBalance(currentBalance);

    const iUsdBalance = toUSD(currentIndexPrice, iBalance);
    const cUsdBalance = toUSD(currentCollateralPrice, currentBalance);
    setIndexBalanceUSD(iUsdBalance.toString());
    setCollateralBalanceUSD(cUsdBalance.toString());
    setIsLoading(false);
  }

  useEffect(
    () => {
      const load = async () => {
        setCollaterals(vaultData.isHardVault ? "hard" : "normal");
        if (
          currentAddress !== "" &&
          currentCollateral !== null &&
          currentAssetRead !== null &&
          !loadingVault
        ) {
          await loadVault();
        }
      };
      load();
    },
    // eslint-disable-next-line
    [currentAddress, currentVault?.address, refreshVault]
  );

  const assetPrice = async () => {
    const currentAssetPriceCall = await currentAssetOracleRead?.getLatestAnswer();

    // @ts-ignore
    const [currentAssetPrice] = await signer.ethcallProvider?.all([currentAssetPriceCall]);
    let cAssetPrice = currentAssetPrice;
    if (isArbitrum(currentNetwork.chainId)) {
      cAssetPrice = currentAssetPrice.mul(10);
    }

    return cAssetPrice;
  };

  const collateralPrice = async () => {
    const collateralPriceCall = await currentCollateralOracleRead?.getLatestAnswer();

    // @ts-ignore
    const [currentCollateralPrice] = await signer.ethcallProvider?.all([collateralPriceCall]);
    return currentCollateralPrice;
  };

  const isGasAsset = () =>
    (!isPolygon(currentNetwork.chainId) && vaultData.collateralSymbol === TOKENS_SYMBOLS.ETH) ||
    (isPolygon(currentNetwork.chainId) && vaultData.collateralSymbol === TOKENS_SYMBOLS.MATIC);

  const refresh = async () => {
    try {
      const updateAction = isApproved;
      await loadVault();
      if (updateAction) {
        if (activeAction === "add") {
          setActiveAction("mint");
        }
        if (activeAction === "burn") {
          setActiveAction("remove");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resetFields = () => {
    setBurnFee("0");
    setAddCollateralUSD("0");
    setAddCollateralTxt("0");
    setRemoveCollateralTxt("0");
    setRemoveCollateralUSD("0");
    setMintTxt("0");
    setMintUSD("0");
    setBurnUSD("0");
    setBurnTxt("0");
  };

  const changeVault = async (newRatio: number, reset = false) => {
    const safeValue = isHardMode() ? 20 : 50;
    const warnValue = isHardMode() ? 10 : 30;
    let r = newRatio;
    if (reset) {
      r = parseFloat(tempRatio);
      setVaultRatio(tempRatio);
      setTempRatio("");
      resetFields();
    } else {
      if (tempRatio === "") {
        setTempRatio(vaultRatio);
      }
      r = newRatio;
      setVaultRatio(r.toString());
    }

    if (r === 0) {
      setVaultStatus(t("vault.status.na"));
    } else if (r >= parseFloat(minRatio) + safeValue) {
      setVaultStatus(t("vault.status.safe"));
    } else if (r >= parseFloat(minRatio) + warnValue) {
      setVaultStatus(t("vault.status.warning"));
    } else if (r >= parseFloat(minRatio)) {
      setVaultStatus(t("vault.status.danger"));
    } else {
      setVaultRatio("0");
      setVaultStatus(t("vault.status.error"));
    }
  };

  const isValidTokenValue = (value: string): boolean => {
    try {
      ethers.utils.parseEther(value);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Mint, Burn fees
  const calculateMintFee = async (amount: string) => {
    const currentMintFee = await currentVault?.getMintFee(ethers.utils.parseEther(amount));
    const increasedFee = currentMintFee.add(currentMintFee.div(100)).toString();

    return increasedFee;
  };

  const calculateBurnFee = async (amount: string) => {
    let increasedFee = BigNumber.from("0");
    if (!isArbitrum(currentNetwork.chainId)) {
      const currentBurnFee = await currentVault?.getFee(ethers.utils.parseEther(amount));
      increasedFee = currentBurnFee.add(currentBurnFee.div(100)).toString();
    } else {
      const currentBurnFee = await currentVault?.getBurnFee(ethers.utils.parseEther(amount));
      increasedFee = currentBurnFee.add(currentBurnFee.div(100)).toString();
    }

    return increasedFee;
  };

  // forms
  const isMinRequiredTcap = (amount: number, isMint: boolean): boolean => {
    if (isHardMode()) {
      const d = parseFloat(vaultDebt);
      let newDebt = 0;
      if (isMint) {
        newDebt = amount + d;
      } else {
        newDebt = d - amount;
      }
      return newDebt >= 20 || newDebt === 0;
    }
    return true;
  };

  const onChangeAddCollateral = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidTokenValue(event.target.value) || event.target.value === "") {
      setAddCollateralTxt(event.target.value);
      if (event.target.value !== "") {
        const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
        const currentAssetPrice = ethers.utils.formatEther(await assetPrice());
        let usd = toUSD(currentPrice, event.target.value);
        if (!usd) {
          usd = 0;
        }
        const newCollateral = parseFloat(event.target.value) + parseFloat(vaultCollateral);
        const r = await getRatio(
          newCollateral.toString(),
          currentPrice,
          vaultDebt,
          currentAssetPrice
        );
        changeVault(r);
        setAddCollateralUSD(usd.toString());
      } else {
        changeVault(0, false);
        setAddCollateralUSD("0");
      }
    }
  };

  const onFocusAddCollateral = () => {
    if (addCollateralTxt && parseFloat(addCollateralTxt) === 0) {
      setAddCollateralTxt("");
    }
  };

  const onBlurAddCollateral = () => {
    if (!addCollateralTxt) {
      setAddCollateralTxt("0");
    }
  };

  const onChangeRemoveCollateral = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidTokenValue(event.target.value) || event.target.value === "") {
      setRemoveCollateralTxt(event.target.value);
      if (event.target.value !== "") {
        const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
        const currentAssetPrice = ethers.utils.formatEther(await assetPrice());
        let usd = toUSD(currentPrice, event.target.value);
        if (!usd) {
          usd = 0;
        }
        const newCollateral = parseFloat(vaultCollateral) - parseFloat(event.target.value);
        const r = await getRatio(
          newCollateral.toString(),
          currentPrice,
          vaultDebt,
          currentAssetPrice
        );
        changeVault(r);
        setRemoveCollateralUSD(usd.toString());
      } else {
        changeVault(0, false);
        setRemoveCollateralUSD("0");
      }
    }
  };

  const onFocusRemoveCollateral = () => {
    if (removeCollateralTxt && parseFloat(removeCollateralTxt) === 0) {
      setRemoveCollateralTxt("");
    }
  };

  const onBlurRemoveCollateral = () => {
    if (!removeCollateralTxt) {
      setRemoveCollateralTxt("0");
    }
  };

  const onChangeMint = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidTokenValue(event.target.value) || event.target.value === "") {
      setMintTxt(event.target.value);
      if (event.target.value !== "") {
        const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
        const currentAssetPrice = ethers.utils.formatEther(await assetPrice());
        let usd = toUSD(currentAssetPrice, event.target.value);
        if (!usd) {
          usd = 0;
        }
        const newDebt = parseFloat(event.target.value) + parseFloat(vaultDebt);
        const r = await getRatio(
          vaultCollateral,
          currentPrice,
          newDebt.toString(),
          currentAssetPrice
        );
        changeVault(r);
        setMintUSD(usd.toFixed(14));

        if (isArbitrum(currentNetwork.chainId)) {
          const increasedFee = await calculateMintFee(event.target.value);
          const ethFee = ethers.utils.formatEther(increasedFee);
          setMintFee(ethFee.toString());
        }
      } else {
        changeVault(0, false);
        setMintUSD("0");
      }
    }
  };

  const onFocusMint = () => {
    if (mintTxt && parseFloat(mintTxt) === 0) {
      setMintTxt("");
    }
  };

  const onBlurMint = () => {
    if (!mintTxt) {
      setMintTxt("0");
    }
  };

  const onChangeBurn = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidTokenValue(event.target.value) || event.target.value === "") {
      try {
        setBurnTxt(event.target.value);
        if (event.target.value !== "") {
          const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
          const currentAssetPrice = ethers.utils.formatEther(await assetPrice());
          let usd = toUSD(currentAssetPrice, event.target.value);
          if (!usd) {
            usd = 0;
          }
          const newDebt = parseFloat(vaultDebt) - parseFloat(event.target.value);
          const r = await getRatio(
            vaultCollateral,
            currentPrice,
            newDebt.toString(),
            currentAssetPrice
          );
          changeVault(r);
          setBurnUSD(usd.toString());

          const increasedFee = await calculateBurnFee(event.target.value);
          const ethFee = ethers.utils.formatEther(increasedFee);
          setBurnFee(ethFee.toString());
        } else {
          changeVault(0, false);
          setBurnUSD("0");
          setBurnFee("0");
        }
      } catch (error) {
        changeVault(0, true);
        setBurnUSD("0");
        setBurnFee("0");
      }
    }
  };

  const onFocusBurn = () => {
    if (burnTxt && parseFloat(burnTxt) === 0) {
      setBurnTxt("");
    }
  };

  const onBlurBurn = () => {
    if (!burnTxt) {
      setBurnTxt("0");
    }
  };

  const addCollateral = async () => {
    if (addCollateralTxt && parseFloat(addCollateralTxt) > 0) {
      setBtnDisabled(true);
      // fix decimals
      const amount = ethers.utils.parseUnits(addCollateralTxt, selectedVaultDecimals);
      try {
        if (isGasAsset()) {
          let tx;
          if (vaultData.collateralSymbol === TOKENS_SYMBOLS.ETH) {
            tx = await currentVault?.addCollateralETH({
              value: amount,
            });
          } else {
            tx = await currentVault?.addCollateralMATIC({
              value: amount,
            });
          }
          notifyUser(tx, refresh);
        } else {
          const tx = await currentVault?.addCollateral(amount);
          notifyUser(tx, refresh);
        }
      } catch (error) {
        console.error(error);
        if (error.code === 4001) {
          errorNotification(t("errors.tran-rejected"));
        } else {
          errorNotification(t("errors.no-funds"));
        }
      }
      setBtnDisabled(false);
      setAddCollateralTxt("0");
      setAddCollateralUSD("0");
    } else {
      errorNotification(t("errors.empty"));
    }
  };

  const maxAddCollateral = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingMax(true);
    let balance = "0";
    if (vaultData.collateralSymbol === TOKENS_SYMBOLS.ETH) {
      const provider = getDefaultProvider(currentNetwork.chainId);
      balance = ethers.utils.formatEther(await provider.getBalance(currentAddress));
    } else if (currentCollateral) {
      const value = BigNumber.from(await currentCollateral.balanceOf(currentAddress));
      balance = ethers.utils.formatUnits(value, selectedVaultDecimals);
    }
    const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
    const currentAssetPrice = ethers.utils.formatEther(await assetPrice());
    setAddCollateralTxt(balance);
    let usd = toUSD(currentPrice, balance);
    if (!usd) {
      usd = 0;
    }
    const newCollateral = parseFloat(balance) + parseFloat(vaultCollateral);
    const r = await getRatio(newCollateral.toString(), currentPrice, vaultDebt, currentAssetPrice);
    changeVault(r);
    setAddCollateralUSD(usd.toString());
    setLoadingMax(false);
  };

  const removeCollateral = async () => {
    if (removeCollateralTxt && parseFloat(removeCollateralTxt) > 0) {
      const amount = ethers.utils.parseUnits(removeCollateralTxt, selectedVaultDecimals);
      setBtnDisabled(true);
      try {
        if (isGasAsset()) {
          let tx;
          if (vaultData.collateralSymbol === TOKENS_SYMBOLS.ETH) {
            tx = await currentVault?.removeCollateralETH(amount);
          } else {
            tx = await currentVault?.removeCollateralMATIC(amount);
          }
          notifyUser(tx, refresh);
        } else {
          const tx = await currentVault?.removeCollateral(amount);
          notifyUser(tx, refresh);
        }
      } catch (error) {
        console.error(error);
        if (error.code === 4001) {
          errorNotification(t("errors.tran-rejected"));
        } else {
          errorNotification(t("vault.errors.tran-rejected"));
        }
      }
      setBtnDisabled(false);
      setRemoveCollateralTxt("0");
      setRemoveCollateralUSD("0");
    } else {
      errorNotification(t("errors.empty"));
    }
  };

  const safeRemoveCollateral = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingMax(true);
    const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
    const currentAssetPrice = ethers.utils.formatEther(await assetPrice());
    let collateralToRemove = await getSafeRemoveCollateral(
      minRatio,
      vaultCollateral,
      currentPrice,
      currentAssetPrice,
      vaultDebt,
      vaultData.isHardVault
    );
    if (selectedVaultDecimals === 8) {
      collateralToRemove = parseFloat(collateralToRemove.toFixed(8)) - 0.00000001;
      collateralToRemove = parseFloat(collateralToRemove.toFixed(8));
    }
    setRemoveCollateralTxt(collateralToRemove.toString());
    let usd = toUSD(currentPrice, collateralToRemove.toString());
    if (!usd) {
      usd = 0;
    }
    const newCollateral = parseFloat(vaultCollateral) - collateralToRemove;
    const r = await getRatio(newCollateral.toString(), currentPrice, vaultDebt, currentAssetPrice);
    changeVault(r);
    setRemoveCollateralUSD(usd.toString());
    setLoadingMax(false);
  };

  const mintIndex = async () => {
    if (mintTxt && parseFloat(mintTxt) > 0) {
      if (isMinRequiredTcap(parseFloat(mintTxt), true)) {
        setBtnDisabled(true);
        try {
          const amount = ethers.utils.parseEther(mintTxt);
          if (!isArbitrum(currentNetwork.chainId)) {
            const tx = await currentVault?.mint(amount);
            notifyUser(tx, refresh);
          } else {
            const increasedFee = await calculateMintFee(mintTxt);
            const ethFee = ethers.utils.formatEther(increasedFee);
            setMintFee(ethFee.toString());
            const tx = await currentVault?.mint(amount, { value: BigNumber.from(increasedFee) });
            notifyUser(tx, refresh);
          }
        } catch (error) {
          console.error(error);
          if (error.code === 4001) {
            errorNotification(t("errors.tran-rejected"));
          } else {
            errorNotification(t("vault.errors.no-collateral"));
          }
        }
        setBtnDisabled(false);
        setMintTxt("0");
        setMintUSD("0");
      } else {
        errorNotification(t("vault.errors.min-tcap"));
      }
    } else {
      errorNotification(t("errors.empty"));
    }
  };

  const safeMintIndex = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingMax(true);
    const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
    const currentAssetPrice = ethers.utils.formatEther(await assetPrice());
    const safeMint = await getSafeMint(
      minRatio,
      vaultCollateral,
      currentPrice,
      currentAssetPrice,
      vaultDebt,
      vaultData.isHardVault
    );
    setMintTxt(safeMint.toString());
    let usd = toUSD(currentAssetPrice, safeMint.toString());
    if (!usd) {
      usd = 0;
    }

    if (isArbitrum(currentNetwork.chainId)) {
      const increasedFee = await calculateMintFee(safeMint.toString());
      const ethFee = ethers.utils.formatEther(increasedFee);
      setMintFee(ethFee.toString());
    }

    const newDebt = safeMint + parseFloat(vaultDebt);
    const r = await getRatio(vaultCollateral, currentPrice, newDebt.toString(), currentAssetPrice);
    changeVault(r);
    setMintUSD(usd.toString());
    setLoadingMax(false);
  };

  const burnIndex = async () => {
    if (burnTxt && parseFloat(burnTxt) > 0) {
      const amount = ethers.utils.parseEther(burnTxt);
      setBtnDisabled(true);
      try {
        const increasedFee = await calculateBurnFee(burnTxt);
        const ethFee = ethers.utils.formatEther(increasedFee);

        setBurnFee(ethFee.toString());
        const tx = await currentVault?.burn(amount, { value: BigNumber.from(increasedFee) });
        notifyUser(tx, refresh);
      } catch (error) {
        console.error(error);
        if (error.code === 4001) {
          errorNotification(t("errors.tran-rejected"));
        } else {
          errorNotification(t("vault.errors.burn-too-high"));
        }
      }
      setBtnDisabled(false);
      setBurnTxt("0");
      setBurnUSD("0");
      setBurnFee("0");
    } else {
      errorNotification(t("errors.empty"));
    }
  };

  const maxBurnIndex = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingMax(true);
    const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
    const currentAssetPrice = ethers.utils.formatEther(await assetPrice());
    const currentBalanceCall = await currentAssetRead?.balanceOf(currentAddress);
    const currentVaultDebtCall = await currentVaultRead?.vaults(vaultData.vaultId);

    // @ts-ignore
    const [currentBalance, cVault] = await signer.ethcallProvider?.all([
      currentBalanceCall,
      currentVaultDebtCall,
    ]);

    let balanceFormat = "0";
    if (currentBalance.lt(cVault.Debt)) {
      balanceFormat = ethers.utils.formatEther(currentBalance);
    } else {
      balanceFormat = vaultDebt;
    }
    setBurnTxt(balanceFormat);
    let usd = toUSD(currentAssetPrice, balanceFormat);
    if (!usd) {
      usd = 0;
    }
    const newDebt = parseFloat(balanceFormat) - parseFloat(balanceFormat);
    const r = await getRatio(vaultCollateral, currentPrice, newDebt.toString(), currentAssetPrice);
    changeVault(r);
    setBurnUSD(usd.toString());

    if (balanceFormat !== "0") {
      const increasedFee = await calculateBurnFee(balanceFormat);
      const ethFee = ethers.utils.formatEther(increasedFee);
      setBurnFee(ethFee.toString());
    } else {
      setBurnFee("0");
    }
    setLoadingMax(false);
  };

  const ActionsDropdown = () => (
    <Dropdown onSelect={(eventKey) => setActiveAction(eventKey || "add")}>
      <Dropdown.Toggle variant="secondary" id="dropdown-actions" className="text-left">
        <div className="collateral-toggle">
          <span>
            {capitalize(activeAction)}{" "}
            {actions.slice(0, 2).includes(activeAction)
              ? vaultData.collateralSymbol
              : vaultData.assetSymbol.toUpperCase()}
          </span>
        </div>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {actions.map((action, index) => (
          <Dropdown.Item key={action} eventKey={action}>
            {capitalize(action)}{" "}
            {index < 2 ? vaultData.collateralSymbol : vaultData.assetSymbol.toUpperCase()}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );

  const RenderUsdValue = (amount: string, maxDecimals = 6, symbol = false) => {
    const numberAmount = parseFloat(amount);
    let newAmount = amount;
    let decimals = 2;
    let prefix = "$";
    if (numberAmount < 0.0001) {
      decimals = maxDecimals;
      newAmount = numberAmount.toFixed(decimals);
      if (symbol) {
        prefix = "~$";
      }
    } else if (numberAmount < 0.01) {
      decimals = 4;
    }
    if (numberAmount === 0) {
      decimals = 2;
      newAmount = numberAmount.toFixed(decimals);
    }

    return (
      <OverlayTrigger
        key="top-usd"
        placement="right"
        trigger={["hover", "click"]}
        overlay={
          <Tooltip id="ttip-status" className="ttip-hard-vault">
            ${numberAmount.toFixed(20)}
          </Tooltip>
        }
      >
        <NumberFormat
          className="number"
          value={newAmount}
          displayType="text"
          thousandSeparator
          prefix={prefix}
          decimalScale={decimals}
        />
      </OverlayTrigger>
    );
  };

  const RenderAddCollateral = () => (
    <Form.Group className="form-group add">
      <InputGroup>
        <Form.Text className="text-muted">{RenderUsdValue(addCollateralUSD, 10)}</Form.Text>
        <Form.Control
          type="number"
          placeholder=""
          className="neon-green"
          value={addCollateralTxt}
          onChange={onChangeAddCollateral}
          onFocus={onFocusAddCollateral}
          onBlur={onBlurAddCollateral}
        />
        <Button className="neon-green" onClick={addCollateral} disabled={btnDisabled}>
          <>{t("add")}</>
        </Button>
      </InputGroup>
    </Form.Group>
  );

  const RenderRemoveCollateral = () => (
    <Form.Group className="form-group remove">
      <InputGroup>
        <Form.Text className="text-muted">{RenderUsdValue(removeCollateralUSD, 12)}</Form.Text>
        <Form.Control
          type="number"
          placeholder=""
          className="neon-orange"
          value={removeCollateralTxt}
          onChange={onChangeRemoveCollateral}
          onFocus={onFocusRemoveCollateral}
          onBlur={onBlurRemoveCollateral}
        />
        <Button className="neon-orange" onClick={removeCollateral} disabled={btnDisabled}>
          <>{t("remove")}</>
        </Button>
      </InputGroup>
    </Form.Group>
  );

  const BurnFeeLabel = (className: string, isBurning: boolean) => (
    <OverlayTrigger
      key="ttop-burn-fee"
      placement="top"
      trigger={["hover", "click"]}
      overlay={
        <Tooltip id="ttip-status" className="ttip-hard-vault">
          {isBurning ? (
            <>
              {t("vault.debt.fee")}: {burnFee}
            </>
          ) : (
            <>Mint Fee: {mintFee}</>
          )}
          {isPolygon(currentNetwork.chainId) ? "MATIC" : "ETH"}
        </Tooltip>
      }
    >
      <div className={className}>
        <span>{isBurning ? <>{t("vault.debt.fee")}:</> : "Mint Fee: "}</span>
        <NumberFormat
          className="number neon-pink"
          value={isBurning ? burnFee : mintFee}
          displayType="text"
          thousandSeparator
          decimalScale={4}
        />{" "}
        <span>{isPolygon(currentNetwork.chainId) ? "MATIC" : "ETH"}</span>
      </div>
    </OverlayTrigger>
  );

  const RenderMintIndex = () => (
    <Form.Group className="form-group mint">
      <InputGroup>
        <Form.Text className="text-muted">{RenderUsdValue(mintUSD, 18)}</Form.Text>
        <Form.Control
          type="number"
          placeholder=""
          className="neon-green"
          value={mintTxt}
          onChange={onChangeMint}
          onFocus={onFocusMint}
          onBlur={onBlurMint}
        />
        <Button
          id="btn-mint-tcap"
          className="neon-green"
          onClick={mintIndex}
          disabled={btnDisabled}
        >
          <>{t("mint")}</>
        </Button>
      </InputGroup>
      {BurnFeeLabel("burn-fee2", false)}
    </Form.Group>
  );

  const RenderBurnIndex = () => (
    <Form.Group className="form-group remove">
      <InputGroup>
        <Form.Text className="text-muted">{RenderUsdValue(burnUSD, 18)}</Form.Text>
        <Form.Control
          type="number"
          placeholder=""
          className="neon-orange"
          value={burnTxt}
          onChange={onChangeBurn}
          onFocus={onFocusBurn}
          onBlur={onBlurBurn}
        />
        <Button className="neon-orange" onClick={burnIndex} disabled={btnDisabled}>
          <>{t("burn")}</>
        </Button>
      </InputGroup>
      {BurnFeeLabel("burn-fee2", true)}
    </Form.Group>
  );

  const ActionControls = () => {
    if (activeAction === "add") {
      return RenderAddCollateral();
    }
    if (activeAction === "remove") {
      return RenderRemoveCollateral();
    }
    if (activeAction === "mint") {
      return RenderMintIndex();
    }
    return RenderBurnIndex();
  };

  const MaxButton = () => {
    if (loadingMax) {
      let colorClass = "spinner-green";
      if (activeAction === "remove" || activeAction === "burn") {
        colorClass = "spinner-orange";
      }
      return <Spinner className={"spinner small ".concat(colorClass)} animation="border" />;
    }
    if (activeAction === "add") {
      return (
        <Button className="btn-max number" onClick={maxAddCollateral}>
          <>{t("max")}</>
        </Button>
      );
    }
    if (activeAction === "remove") {
      return (
        <Button className="btn-max number orange" onClick={safeRemoveCollateral}>
          <>{t("max-safe")}</>
        </Button>
      );
    }
    if (activeAction === "mint") {
      return (
        <Button className="btn-max number" onClick={safeMintIndex}>
          <>{t("max-safe")}</>
        </Button>
      );
    }
    return (
      <Button className="btn-max number orange" onClick={maxBurnIndex}>
        <>{t("max")}</>
      </Button>
    );
  };

  const RenderIndexBalance = (isCollateral: boolean) => {
    const aBalance = isCollateral ? collateralBalance : indexBalance;
    const aBalanceUSD = isCollateral ? collateralBalanceUSD : indexBalanceUSD;
    const iconSymbol = isCollateral ? vaultData.collateralSymbol : vaultData.assetSymbol;
    return (
      <div className="asset-box-balance">
        <span className="asset-box-balance-title">Wallet Balance:</span>
        <span className="number asset-box-balance-value">
          {isLoading ? (
            <Spinner className="spinner xsmall spinner-gray" animation="border" />
          ) : (
            <>
              <OverlayTrigger
                key="ttip-index-balance"
                placement="auto"
                trigger={["hover", "click"]}
                overlay={
                  <Tooltip id="ttip-status" className="ttip-hard-vault">
                    {parseFloat(aBalance).toFixed(18)}
                  </Tooltip>
                }
              >
                <div className="token-value">
                  <TokenIcon name={iconSymbol} />
                  <NumberFormat
                    className="number neon-green"
                    value={aBalance}
                    displayType="text"
                    thousandSeparator
                    decimalScale={4}
                  />
                </div>
              </OverlayTrigger>
              {RenderUsdValue(aBalanceUSD, 4, true)}
            </>
          )}
        </span>
      </div>
    );
  };

  const CollateralAmount = () => (
    <div className="asset-box-balance">
      <span className="asset-box-balance-title">Collateral:</span>
      <span className="number asset-box-balance-value">
        {isLoading ? (
          <Spinner className="spinner xsmall spinner-gray" animation="border" />
        ) : (
          <>
            <OverlayTrigger
              key="ttip-col-amount"
              placement="auto"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="ttip-status" className="ttip-hard-vault">
                  {ethers.utils.formatUnits(vaultCollateralRaw, selectedVaultDecimals)}
                </Tooltip>
              }
            >
              <div className="token-value">
                <TokenIcon name={vaultData.collateralSymbol} />
                <NumberFormat
                  className="number neon-green"
                  value={vaultCollateral}
                  displayType="text"
                  thousandSeparator
                  decimalScale={tokenBalanceDecimals}
                  prefix={parseFloat(vaultCollateral) < 0.0001 ? "~" : ""}
                />
              </div>
            </OverlayTrigger>
            {RenderUsdValue(vaultCollateralUSD, 4, true)}
          </>
        )}
      </span>
    </div>
  );

  const MintedAmount = () => (
    <div className="asset-box-balance">
      <span className="asset-box-balance-title">Debt:</span>
      <span className="number asset-box-balance-value">
        {isLoading ? (
          <Spinner className="spinner xsmall spinner-gray" animation="border" />
        ) : (
          <>
            <OverlayTrigger
              key="top"
              placement="auto"
              trigger={["hover", "click"]}
              overlay={
                <Tooltip id="ttip-status" className="ttip-hard-vault">
                  {ethers.utils.formatEther(vaultDebtRaw)}
                </Tooltip>
              }
            >
              <div className="token-value">
                <TokenIcon name={vaultData.assetSymbol} />
                <NumberFormat
                  className="number neon-green"
                  value={vaultDebt}
                  displayType="text"
                  thousandSeparator
                  decimalScale={tokenBalanceDecimals}
                  prefix={parseFloat(vaultDebt) < 0.0001 ? "~" : ""}
                />
              </div>
            </OverlayTrigger>
            {RenderUsdValue(vaultDebtUSD, 4, true)}
          </>
        )}
      </span>
    </div>
  );

  const creatOrApprovee = async () => {
    if (currentVaultId === "0") {
      setBtnDisabled(true);
      try {
        const tx = await currentVault?.createVault();
        notifyUser(tx, refresh);
      } catch (error) {
        if (error.code === 4001 || error.code === -32603) {
          errorNotification(t("errors.tran-rejected"));
        }
      }
      setBtnDisabled(false);
    } else {
      setBtnDisabled(true);
      try {
        const tx = await currentCollateral?.approve(currentVault?.address, approveValue);
        notifyUser(tx, refresh);
      } catch (error) {
        if (error.code === 4001 || error.code === -32603) {
          errorNotification(t("errors.tran-rejected"));
        }
      }
      setBtnDisabled(false);
    }
  };

  const RenderCreateVault = () => (
    <div className="create-vault">
      {isLoading ? (
        <Spinner variant="danger" className="spinner" animation="border" />
      ) : (
        <>
          <p>
            <>{text}</>{" "}
            <a
              href="https://cryptex.finance/#solutions"
              target="_blank"
              rel="noreferrer"
              className="learn-more"
            >
              Learn More
            </a>
          </p>
          <Button variant="pink neon-pink" onClick={creatOrApprovee} disabled={btnDisabled}>
            <>{title}</>
          </Button>
        </>
      )}
    </div>
  );

  const handleRadioBtnChange = async (value: string) => {
    setVaultMode(value);
    // setCollaterals(value);
    setActiveAction("add");
    resetFields();
    setVaultData({
      vaultId: "0",
      assetSymbol: vaultData.assetSymbol,
      collateralSymbol: TOKENS_SYMBOLS.ETH,
      isHardVault: value === "hard",
    });
  };

  const handleTokenChange = async (value: string) => {
    let keepVaultId = false;
    if (
      vaultData.collateralSymbol === TOKENS_SYMBOLS.ETH ||
      vaultData.collateralSymbol === TOKENS_SYMBOLS.WETH
    ) {
      keepVaultId = value === TOKENS_SYMBOLS.ETH || value === TOKENS_SYMBOLS.WETH;
    }
    resetFields();
    setVaultData({
      vaultId: !keepVaultId ? "0" : vaultData.vaultId,
      assetSymbol: vaultData.assetSymbol,
      collateralSymbol: value,
      isHardVault: vaultData.isHardVault,
    });
    setRefreshVault(!refreshVault);
  };

  const AssetDropdown = () => (
    <div className="dd-collateral">
      <h6 className="titles">Index</h6>
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

  const DebtWarning = () => (
    <Alert key="debt-alert" variant="warning" className="alert-inside">
      <p>
        Vault still has a
        <OverlayTrigger
          key="ttip-debt-alert"
          placement="auto"
          trigger={["hover", "click"]}
          overlay={
            <Tooltip id="ttip-status" className="ttip-hard-vault">
              Debt: {ethers.utils.formatEther(vaultDebtRaw)} {vaultInitData.assetSymbol}
            </Tooltip>
          }
        >
          <span>
            Small Debt
            <Button variant="dark" className="question-small">
              ?
            </Button>
          </span>
        </OverlayTrigger>
        but your
        <OverlayTrigger
          key="ttip-debt-alert"
          placement="auto"
          trigger={["hover", "click"]}
          overlay={
            <Tooltip id="ttip-status" className="ttip-hard-vault">
              Wallet Balance: {ethers.utils.formatEther(indexBalanceRaw)}{" "}
              {vaultInitData.assetSymbol}
            </Tooltip>
          }
        >
          <span>
            Wallet Balance
            <Button variant="dark" className="question-small">
              ?
            </Button>
          </span>
        </OverlayTrigger>
        is less than the debt.
      </p>
    </Alert>
  );

  const DebtWarning2 = () => (
    <Alert key="debt-alert" variant="warning" className="alert-inside">
      <p>
        Vault still has a
        <OverlayTrigger
          key="ttip-debt-alert"
          placement="auto"
          trigger={["hover", "click"]}
          overlay={
            <Tooltip id="ttip-status" className="ttip-hard-vault">
              Debt: {ethers.utils.formatEther(vaultDebtRaw)} {vaultInitData.assetSymbol}
            </Tooltip>
          }
        >
          <span>
            Small Debt.
            <Button variant="dark" className="question-small">
              ?
            </Button>
          </span>
        </OverlayTrigger>
      </p>
    </Alert>
  );

  return (
    <div className="vault">
      <div className="vault-container">
        <div className="vault-header">
          <div className="header-col1">
            <div className="icon-container">
              {isInLayer1(currentNetwork.chainId) ? (
                <>
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
                  {vaultMode === "hard" && (
                    <OverlayTrigger
                      key="top"
                      placement="right"
                      trigger={["hover", "click"]}
                      overlay={
                        <Tooltip id="ttip-status" className="ttip-hard-vault">
                          <>
                            {t("vault.hard-mode-info")} <br />
                            {t("vault.hard-mode-info2")}
                          </>
                        </Tooltip>
                      }
                    >
                      <Button variant="dark">?</Button>
                    </OverlayTrigger>
                  )}
                </>
              ) : (
                <h5>Vault</h5>
              )}
            </div>
          </div>
          <Button className="go-back" onClick={() => goBack()}>
            <FaPlus size={22} />
          </Button>
        </div>
        <div className="vault-assets">
          <div className="vault-assets-box">
            <div className="assets-box-options">
              <div className="asset-box">
                <AssetDropdown />
                {!isLoading && (
                  <>
                    {RenderIndexBalance(false)}
                    {isApproved && <MintedAmount />}
                  </>
                )}
              </div>
              <div className="asset-box right">
                <CollateralDropdown />
                {!isLoading && (
                  <>
                    {RenderIndexBalance(true)}
                    {isApproved && <CollateralAmount />}
                  </>
                )}
              </div>
            </div>
            {isLoading || loadingVault ? (
              <Spinner className="spinner" animation="border" />
            ) : (
              <div className="vault-form">
                {!isApproved ? (
                  <RenderCreateVault />
                ) : (
                  <>
                    {vaultDebtRaw.lte(BigNumber.from("1000")) &&
                      indexBalanceRaw.lt(vaultDebtRaw) && <DebtWarning />}
                    {vaultDebtRaw.lte(BigNumber.from("1000")) &&
                      !indexBalanceRaw.lt(vaultDebtRaw) && <DebtWarning2 />}
                    <div className="vault-actions">
                      <div className="actions-options">
                        <div className="options-container">
                          <p>Choose Action</p>
                          <div className="options-buttons">
                            <ActionsDropdown />
                            <MaxButton />
                          </div>
                        </div>
                        {activeAction === actions[2] &&
                          isArbitrum(currentNetwork.chainId) &&
                          BurnFeeLabel("burn-fee", false)}
                        {activeAction === actions[3] && BurnFeeLabel("burn-fee", true)}
                      </div>
                      <Form className="vault-controls">{ActionControls()}</Form>
                    </div>
                    <div className="vault-ratio">
                      <div className="title">
                        <h6>Ratio:</h6>
                      </div>
                      <div className="values">
                        <div className="amount">
                          <h4 className=" ml-2 number neon-highlight">
                            {parseFloat(vaultRatio) <= 1000000 ? (
                              <NumberFormat
                                className={`number ratio ${vaultStatus}`}
                                value={vaultRatio}
                                displayType="text"
                                thousandSeparator
                                decimalScale={tokenBalanceDecimals}
                                suffix="%"
                              />
                            ) : (
                              <span className={`number ratio ${vaultStatus}`}>
                                {parseFloat(vaultRatio).toExponential(2)}%
                              </span>
                            )}
                          </h4>
                        </div>
                        <span className="separator">-</span>
                        <p className="number">
                          <span className={`number ratio-status ${vaultStatus}`}>
                            {vaultStatus.toLocaleUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
