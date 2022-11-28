import { useContext, useEffect, useState } from "react";
import { hardVaultsContext, networkContext, signerContext, vaultsContext } from "../state/index";
import { isInLayer1, isOptimism, isPolygon, validVaults, validHardVaults } from "../utils/utils";
import { VaultsRatioType } from "../components/Vaults/types";

export const useRatios = (): VaultsRatioType => {
  const currentNetwork = useContext(networkContext);
  const vaults = useContext(vaultsContext);
  const hardVaults = useContext(hardVaultsContext);
  const signer = useContext(signerContext);
  const [vaultsRatio, setVaultsRatio] = useState<VaultsRatioType>({
    ethRatio: 150,
    wethRatio: 200,
    daiRatio: 200,
    aaveRatio: 200,
    linkRatio: 200,
    uniRatio: 200,
    snxRatio: 200,
    maticRatio: 200,
    wbtcRatio: 200,
    hardEthRatio: 125,
    hardWethRatio: 125,
    hardDaiRatio: 125,
    hardUsdcRatio: 125,
  });

  const loadRatios = async () => {
    if (
      signer &&
      vaults &&
      hardVaults &&
      validVaults(currentNetwork.chainId || 1, vaults) &&
      validHardVaults(currentNetwork.chainId || 1, hardVaults)
    ) {
      const daiRatioCall = await vaults.daiVaultRead?.ratio();
      const ethcalls = [daiRatioCall];

      if (isInLayer1(currentNetwork.chainId)) {
        const wethRatioCall = await vaults.wethVaultRead?.ratio();
        const aaveRatioCall = await vaults.aaveVaultRead?.ratio();
        const linkRatioCall = await vaults.linkVaultRead?.ratio();
        const hardWethRatioCall = await hardVaults.wethVaultRead?.ratio();
        const hardDaiRatioCall = await hardVaults.daiVaultRead?.ratio();
        const hardUsdcRatioCall = await hardVaults.usdcVaultRead?.ratio();
        ethcalls.push(wethRatioCall);
        ethcalls.push(aaveRatioCall);
        ethcalls.push(linkRatioCall);
        ethcalls.push(hardWethRatioCall);
        ethcalls.push(hardDaiRatioCall);
        ethcalls.push(hardUsdcRatioCall);
      }
      if (isOptimism(currentNetwork.chainId)) {
        const wethRatioCall = await vaults.wethVaultRead?.ratio();
        const linkRatioCall = await vaults.linkVaultRead?.ratio();
        const snxRatioCall = await vaults.snxVaultRead?.ratio();
        const uniRatioCall = await vaults.uniVaultRead?.ratio();
        ethcalls.push(wethRatioCall);
        ethcalls.push(linkRatioCall);
        ethcalls.push(snxRatioCall);
        ethcalls.push(uniRatioCall);
      }
      if (isPolygon(currentNetwork.chainId)) {
        const maticRatioCall = await vaults.maticVaultRead?.ratio();
        const wbtcRatioCall = await vaults.wbtcVaultRead?.ratio();
        ethcalls.push(maticRatioCall);
        ethcalls.push(wbtcRatioCall);
      }
      let ethRatio = 0;
      let daiRatio = 0;
      let aaveRatio = 0;
      let linkRatio = 0;
      let snxRatio = 0;
      let uniRatio = 0;
      let maticRatio = 0;
      let wbtcRatio = 0;
      let hardEthRatio = 0;
      let hardDaiRatio = 0;
      let hardUsdcRatio = 0;
      if (isInLayer1(currentNetwork.chainId)) {
        // @ts-ignore
        [daiRatio, ethRatio, aaveRatio, linkRatio, hardEthRatio, hardDaiRatio, hardUsdcRatio] =
          await signer.ethcallProvider?.all(ethcalls);
      } else if (isOptimism(currentNetwork.chainId)) {
        // @ts-ignore
        [daiRatio, ethRatio, linkRatio, snxRatio, uniRatio] = await signer.ethcallProvider?.all(
          ethcalls
        );
      } else if (isPolygon(currentNetwork.chainId)) {
        // @ts-ignore
        [daiRatio, maticRatio, wbtcRatio] = await signer.ethcallProvider?.all(ethcalls);
      }
      setVaultsRatio({
        ethRatio,
        wethRatio: ethRatio,
        daiRatio,
        aaveRatio,
        linkRatio,
        uniRatio,
        snxRatio,
        maticRatio,
        wbtcRatio,
        hardEthRatio,
        hardWethRatio: hardEthRatio,
        hardDaiRatio,
        hardUsdcRatio,
      });
    }
  };

  useEffect(
    () => {
      loadRatios();
    },
    // eslint-disable-next-line
    []
  );

  return vaultsRatio;
};
