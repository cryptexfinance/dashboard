import React, { useContext, useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { Button, Dropdown, Form, InputGroup } from "react-bootstrap/esm";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import "../../../styles/mint2.scss";
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
  vaultData: VaultInitType;
};

const VaultForm = ({ currentAddress, vaultData }: props) => {
  const { t } = useTranslation();
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);
  const [vaultMode, setVaultMode] = useState(
    isInLayer1(currentNetwork.chainId) ? "hard" : "normal"
  );

  const {
    currentCollateral,
    currentVault,
    currentAssetRead,
    currentCollateralRead,
    currentVaultRead,
    currentCollateralOracleRead,
    currentAssetOracleRead,
  } = useVault(vaultData.assetSymbol, vaultData.collateralSymbol, vaultData.isHardVault);
  const [loadingMode, setLoadingMode] = useState(false);
  const actions = ["add", "remove", "mint", "burn"];
  const radios = [
    { name: "Regular", value: "normal" },
    { name: "Hard", value: "hard" },
  ];

  // Actions
  const [title, setTitle] = useState(t("vault.create"));
  const [text, setText] = useState(t("vault.create-text", { asset: vaultData.assetSymbol }));
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [activeAction, setActiveAction] = useState("");

  // Vault Data
  const [assetOptions, setAssetOptions] = useState<Array<string>>([]);
  const [collateralOptions, setCollateralOptions] = useState<Array<string>>([]);
  const [vaultDebt, setVaultDebt] = useState("0");
  const [vaultDebtUSD, setVaultDebtUSD] = useState("0");
  const [vaultCollateral, setVaultCollateral] = useState("0");
  const [vaultCollateralUSD, setVaultCollateralUSD] = useState("0");
  const [vaultRatio, setVaultRatio] = useState("0");
  const [tempRatio, setTempRatio] = useState("");
  const [minRatio, setMinRatio] = useState("0");
  const [selectedVaultDecimals, setSelectedVaultDecimals] = useState(18);

  // General Data
  const [assetBalance, setAssetBalance] = useState("0");
  const [tokenBalanceUSD, setTokenBalanceUSD] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenBalanceDecimals, setTokenBalanceDecimals] = useState(2);

  // Inputs
  const [addCollateralTxt, setAddCollateralTxt] = useState("0");
  const [addCollateralUSD, setAddCollateralUSD] = useState("0");
  const [removeCollateralTxt, setRemoveCollateralTxt] = useState("0");
  const [removeCollateralUSD, setRemoveCollateralUSD] = useState("0");
  const [mintTxt, setMintTxt] = useState("0");
  const [mintUSD, setMintUSD] = useState("0");
  const [burnTxt, setBurnTxt] = useState("0");
  const [burnUSD, setBurnUSD] = useState("0");
  const [burnFee, setBurnFee] = useState("0");
  const [vaultStatus, setVaultStatus] = useState("");
  const isHardMode = () => vaultMode === "hard";
  // Infinite Approval
  const approveValue = BigNumber.from("1157920892373161954235709850086879078532699");

  async function loadVault() {
    let balance;
    const provider = getDefaultProvider(
      currentNetwork.chainId || NETWORKS.mainnet.chainId,
      currentNetwork.chainId === 1 ? NETWORKS.mainnet.name : NETWORKS.rinkeby.name
    );

    let currentVaultData: any;
    if (vaultData.vaultId !== "0") {
      // @ts-ignore
      const vault = await currentVault.vaults(BigNumber.from(vaultData.vaultId));
      currentVaultData = {
        vaultId: vaultData.vaultId,
        collateral: vault.Collateral,
        debt: vault.Debt,
      };
    } else {
      // @ts-ignore
      const vaultID = await currentVault.userToVault(currentAddress);
      // @ts-ignore
      const cVault = await currentVault.vaults(vaultID);
      currentVaultData = {
        vaultId: vaultID,
        collateral: cVault.Collateral,
        debt: cVault.Debt,
      };
      console.log("-- aa --", vaultID.toString());
    }

    if (vaultData.collateralSymbol !== "ETH") {
      // @ts-ignore
      balance = await currentCollateral.balanceOf(currentAddress);
    } else {
      balance = await provider.getBalance(currentAddress);
    }

    let decimals = 18;
    let currentCollateralPrice;

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
      const currentAssetPriceCall = await currentAssetOracleRead?.getLatestAnswer();
      // @ts-ignore
      const decimalsCall = await currentCollateralRead.decimals();
      // @ts-ignore
      const currentCollateralPriceCall = await currentCollateralOracleRead.getLatestAnswer();
      // @ts-ignore
      const currentMinRatioCall = await currentVaultRead.ratio();
      // @ts-ignore
      const currentAssetBalanceCall = await currentAssetRead?.balanceOf(currentAddress);

      // @ts-ignore
      const [
        allowance,
        currentRatio,
        currentAssetPrice,
        decimalsVal,
        currentCollateralPriceVal,
        currentMinRatio,
        currentAssetBalance,
      ] = await signer.ethcallProvider?.all([
        allowanceCall,
        currentRatioCall,
        currentAssetPriceCall,
        decimalsCall,
        currentCollateralPriceCall,
        currentMinRatioCall,
        currentAssetBalanceCall,
      ]);

      decimals = decimalsVal;
      currentCollateralPrice = ethers.utils.formatEther(currentCollateralPriceVal.mul(10000000000));

      const cBalance = ethers.utils.formatUnits(currentAssetBalance, 18);
      setAssetBalance(cBalance);

      if (!allowance.isZero() || currentVaultData.collateralSymbol === "ETH") {
        const safeValue = currentVaultData.isHardVault ? 20 : 50;
        const warnValue = currentVaultData.isHardVault ? 10 : 30;

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

        const parsedCollateral = ethers.utils.formatUnits(collateral, decimals);
        setVaultCollateral(parsedCollateral);
        const usdCollateral = toUSD(currentCollateralPrice, parsedCollateral);
        setVaultCollateralUSD(usdCollateral.toString());

        const currentAssetPriceFormat = ethers.utils.formatEther(currentAssetPrice);
        const parsedDebt = ethers.utils.formatEther(debt);
        setVaultDebt(parsedDebt);
        const usdAsset = toUSD(currentAssetPriceFormat, parsedDebt);
        setVaultDebtUSD(usdAsset.toString());
      } else {
        setText(t("vault.approve-text", { asset: currentVaultData.assetSymbol }));
        setTitle(t("vault.approve"));
        setIsApproved(false);
      }
    } else {
      // @ts-ignore
      const decimalsCall = await currentCollateralRead.decimals();
      // @ts-ignore
      const currentPriceCall = await currentCollateralOracleRead.getLatestAnswer();
      // @ts-ignore
      const currentAssetBalanceCall = await currentAssetRead?.balanceOf(currentAddress);
      // @ts-ignore
      const [decimalsVal, currentCollateralPriceVal, currentAssetBalance] =
        await signer.ethcallProvider?.all([
          decimalsCall,
          currentPriceCall,
          currentAssetBalanceCall,
        ]);
      decimals = decimalsVal;
      currentCollateralPrice = ethers.utils.formatEther(currentCollateralPriceVal.mul(10000000000));

      const cBalance = ethers.utils.formatUnits(currentAssetBalance, 18);
      setAssetBalance(cBalance);

      setText(t("vault.create-text"));
      setTitle(t("vault.create"));
      setIsApproved(false);
    }

    setSelectedVaultDecimals(decimals);
    const currentBalance = ethers.utils.formatUnits(balance, decimals);
    if (parseFloat(currentBalance) < 0.09) {
      setTokenBalanceDecimals(4);
    } else {
      setTokenBalanceDecimals(2);
    }
    setTokenBalance(currentBalance);
    const usdBalance = toUSD(currentCollateralPrice, currentBalance);
    setTokenBalanceUSD(usdBalance.toString());
    setLoadingMode(false);
  }

  useEffect(
    () => {
      const load = async () => {
        if (currentAddress !== "" && currentCollateral !== null && currentAssetRead !== null) {
          await loadVault();

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
    [currentAddress, currentCollateral, vaultData]
  );

  const assetPrice = async () => {
    const currentAssetPriceCall = await currentAssetOracleRead?.getLatestAnswer();

    // @ts-ignore
    const [currentAssetPrice] = await signer.ethcallProvider?.all([currentAssetPriceCall]);
    return currentAssetPrice;
  };

  const collateralPrice = async () => {
    const collateralPriceCall = await currentCollateralOracleRead?.getLatestAnswer();

    // @ts-ignore
    const [currentCollateralPrice] = await signer.ethcallProvider?.all([collateralPriceCall]);
    return currentCollateralPrice;
  };

  const isGasAsset = () =>
    (!isPolygon(currentNetwork.chainId) && vaultData.collateralSymbol === "ETH") ||
    (isPolygon(currentNetwork.chainId) && vaultData.collateralSymbol === "MATIC");

  const refresh = async () => {
    try {
      await loadVault();
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

  const handleRadioBtnChange = async (value: string) => {
    setLoadingMode(true);
    setVaultMode(value);
    setIsApproved(false);
    setTokenBalance("0");
    setTokenBalanceUSD("0");

    resetFields();
    await loadVault();
  };

  const changeVault = async (newRatio: number, reset = false) => {
    const safeValue = vaultData.isHardVault ? 20 : 50;
    const warnValue = vaultData.isHardVault ? 10 : 30;
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

  // forms
  const isMinRequiredTcap = (amount: number, isMint: boolean): boolean => {
    if (vaultData.isHardVault) {
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
      setMintUSD(usd.toString());
    } else {
      changeVault(0, false);
      setMintUSD("0");
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
        const currentBurnFee = await currentVaultRead?.getFee(
          ethers.utils.parseEther(event.target.value)
        );
        const increasedFee = currentBurnFee.add(currentBurnFee.div(100)).toString();
        const ethFee = ethers.utils.formatEther(increasedFee);
        setBurnFee(ethFee.toString());
      } else {
        changeVault(0, false);
        setBurnUSD("0");
        setBurnFee("0");
      }
    } catch (error) {
      console.error(error);
      changeVault(0, true);
      setBurnUSD("0");
      setBurnFee("0");
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
          if (vaultData.collateralSymbol === "ETH") {
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
    let balance = "0";
    if (vaultData.collateralSymbol === "ETH") {
      const provider = getDefaultProvider(currentNetwork.chainId, currentNetwork.name);
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
  };

  const removeCollateral = async () => {
    if (removeCollateralTxt && parseFloat(removeCollateralTxt) > 0) {
      const amount = ethers.utils.parseUnits(removeCollateralTxt, selectedVaultDecimals);
      setBtnDisabled(true);
      try {
        if (isGasAsset()) {
          let tx;
          if (vaultData.collateralSymbol === "ETH") {
            tx = await currentCollateral?.removeCollateralETH(amount);
          } else {
            tx = await currentCollateral?.removeCollateralMATIC(amount);
          }
          notifyUser(tx, refresh);
        } else {
          const tx = await currentCollateral?.removeCollateral(amount);
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
  };

  const mintTCAP = async () => {
    if (mintTxt && parseFloat(mintTxt) > 0) {
      if (isMinRequiredTcap(parseFloat(mintTxt), true)) {
        setBtnDisabled(true);
        try {
          const amount = ethers.utils.parseEther(mintTxt);
          const tx = await currentVault?.mint(amount);
          notifyUser(tx, refresh);
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

  const safeMintTCAP = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    const newDebt = safeMint + parseFloat(vaultDebt);
    const r = await getRatio(vaultCollateral, currentPrice, newDebt.toString(), currentAssetPrice);
    changeVault(r);
    setMintUSD(usd.toString());
  };

  const burnTCAP = async () => {
    if (burnTxt && parseFloat(burnTxt) > 0) {
      const amount = ethers.utils.parseEther(burnTxt);
      setBtnDisabled(true);
      try {
        const currentBurnFee = await currentVault?.getFee(amount);
        const increasedFee = currentBurnFee.add(currentBurnFee.div(100)).toString();
        const ethFee = ethers.utils.formatEther(increasedFee);
        setBurnFee(ethFee.toString());
        const tx = await currentVault?.burn(amount, { value: increasedFee });
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

  const maxBurnTCAP = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    let balance;
    if (currentBalance.lt(cVault.Debt)) {
      balanceFormat = ethers.utils.formatEther(currentBalance);
      balance = currentBalance;
    } else {
      balanceFormat = vaultDebt;
      balance = cVault.Debt;
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
      const currentBurnFee = await currentVault?.getFee(balance);
      const increasedFee = currentBurnFee.add(currentBurnFee.div(100)).toString();
      const ethFee = ethers.utils.formatEther(increasedFee);
      setBurnFee(ethFee.toString());
    } else {
      setBurnFee("0");
    }
  };

  const handleTokenChange = async (value: string) => {
    setIsApproved(false);
    setTokenBalance("0");
    setTokenBalanceUSD("0");

    // Clean form
    setAddCollateralTxt("");
    setAddCollateralUSD("0");
    setRemoveCollateralTxt("");
    setRemoveCollateralUSD("0");
    setMintTxt("");
    setMintUSD("0");
    setBurnTxt("");
    setBurnUSD("0");
    setBurnFee("0");

    // Load values
    // await loadVault();
  };

  const ActionsDropdown = () => (
    <Dropdown onSelect={(eventKey) => setActiveAction(eventKey || "add")}>
      <Dropdown.Toggle variant="secondary" id="dropdown-actions" className="text-left">
        <div className="collateral-toggle">
          <span>{activeAction !== "" ? activeAction.toUpperCase() : "Actions"} </span>
        </div>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {actions.map((action) => (
          <Dropdown.Item key={action} eventKey={action}>
            {action.toUpperCase()}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );

  const AddCollateral = () => (
    <Form.Group>
      <InputGroup>
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
      <Form.Text className="text-muted">
        <NumberFormat
          className="number"
          value={addCollateralUSD}
          displayType="text"
          thousandSeparator
          prefix="$"
          decimalScale={2}
        />
      </Form.Text>
    </Form.Group>
  );

  const RemoveCollateral = () => (
    <Form.Group>
      <InputGroup>
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
      <Form.Text className="text-muted">
        <NumberFormat
          className="number"
          value={removeCollateralUSD}
          displayType="text"
          thousandSeparator
          prefix="$"
          decimalScale={2}
        />
      </Form.Text>
    </Form.Group>
  );

  const MintAsset = () => (
    <Form.Group>
      <InputGroup>
        <Form.Control
          type="number"
          placeholder=""
          className="neon-green"
          value={mintTxt}
          onChange={onChangeMint}
          onFocus={onFocusMint}
          onBlur={onBlurMint}
        />
        <Button id="btn-mint-tcap" className="neon-green" onClick={mintTCAP} disabled={btnDisabled}>
          <>{t("mint")}</>
        </Button>
      </InputGroup>
      <Form.Text className="text-muted">
        <NumberFormat
          className="number"
          value={mintUSD}
          displayType="text"
          thousandSeparator
          prefix="$"
          decimalScale={2}
        />
      </Form.Text>
    </Form.Group>
  );

  const BurnAsset = () => (
    <Form.Group className="remove">
      <InputGroup>
        <Form.Control
          type="number"
          placeholder=""
          className="neon-orange"
          value={burnTxt}
          onChange={onChangeBurn}
          onFocus={onFocusBurn}
          onBlur={onBlurBurn}
        />
        <Button className="neon-orange" onClick={burnTCAP} disabled={btnDisabled}>
          <>{t("burn")}</>
        </Button>
      </InputGroup>
      <Form.Text className="text-muted">
        <NumberFormat
          className="number"
          value={burnUSD}
          displayType="text"
          thousandSeparator
          prefix="$"
          decimalScale={2}
        />
      </Form.Text>
    </Form.Group>
  );

  const ActionControls = () => {
    if (activeAction === "add") {
      return <AddCollateral />;
    }
    if (activeAction === "remove") {
      return <RemoveCollateral />;
    }
    if (activeAction === "mint") {
      return <MintAsset />;
    }
    return <BurnAsset />;
  };

  const MaxButton = () => {
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
        <Button className="btn-max number" onClick={safeMintTCAP}>
          <>{t("max-safe")}</>
        </Button>
      );
    }
    return (
      <Button className="btn-max number orange" onClick={maxBurnTCAP}>
        <>{t("max")}</>
      </Button>
    );
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

  const AssetBalance = (isCollateral: boolean) => {
    const aBalance = isCollateral ? tokenBalance : assetBalance;

    return (
      <div className="asset-box-balance">
        <span className="asset-box-balance-title">Balance:</span>
        <span className="number asset-box-balance-value">
          <NumberFormat
            className="number"
            value={aBalance}
            displayType="text"
            thousandSeparator
            decimalScale={2}
          />
        </span>
      </div>
    );
  };

  const CollateralAmount = () => (
    <div className="asset-box-balance">
      <span className="asset-box-balance-title">Collateral:</span>
      <span className="number asset-box-balance-value">
        <NumberFormat
          className="number"
          value={vaultCollateral}
          displayType="text"
          thousandSeparator
          decimalScale={tokenBalanceDecimals}
        />
      </span>
    </div>
  );

  const MintedAmount = () => (
    <div className="asset-box-balance">
      <span className="asset-box-balance-title">Debt:</span>
      <span className="number asset-box-balance-value">
        <NumberFormat
          className="number"
          value={vaultDebt}
          displayType="text"
          thousandSeparator
          decimalScale={tokenBalanceDecimals}
        />
      </span>
    </div>
  );

  const RenderCreateVault = () => (
    <div className="create-vault">
      <p>
        <>{text}</>
      </p>
      <Button variant="pink neon-pink" disabled={btnDisabled}>
        <>{title}</>
      </Button>
    </div>
  );

  return (
    <div className="vault-form">
      <div className="asset-box-container">
        <div className="asset-box">
          {AssetBalance(false)}
          {isApproved && <MintedAmount />}
        </div>
        <div className="asset-box">
          {AssetBalance(true)}
          {isApproved && <CollateralAmount />}
        </div>
      </div>
      {!isApproved ? (
        <RenderCreateVault />
      ) : (
        <>
          <div className="vault-actions">
            <div className="actions-options">
              <div className="choices">
                <ActionsDropdown />
                {activeAction !== "" && <MaxButton />}
              </div>
              {activeAction === actions[3] && (
                <div className="burn-fee">
                  <span>
                    <>{t("vault.debt.fee")}:</>
                  </span>
                  <NumberFormat
                    className="number neon-pink"
                    value={burnFee}
                    displayType="text"
                    thousandSeparator
                    decimalScale={4}
                  />{" "}
                  <span>{isPolygon(currentNetwork.chainId) ? "MATIC" : "ETH"}</span>
                </div>
              )}
            </div>
            {activeAction !== "" && (
              <Form className="vault-controls">
                <ActionControls />
              </Form>
            )}
          </div>
          <div className="vault-ratio">
            <div className="title">
              <h6>Ratio:</h6>
            </div>
            <div className="values">
              <div className="amount">
                <h4 className=" ml-2 number neon-highlight">
                  <NumberFormat
                    className="number ratio"
                    value={vaultRatio}
                    displayType="text"
                    thousandSeparator
                    decimalScale={tokenBalanceDecimals}
                    prefix="%"
                  />
                </h4>
              </div>
              <span>-</span>
              <p className="number">
                <span className="number ratio-status">{vaultStatus}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VaultForm;
