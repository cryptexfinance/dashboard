import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Provider } from "ethers-multicall";
import { arbitrumContext, ethereumContext, optimismContext } from "../state/index";
import { isArbitrum, isInLayer1, isOptimism, validOracles } from "../utils/utils";
import { BalancesType } from "./types";

export const useBalances = (
  chainId: number,
  ethcallProvider: Provider | undefined,
  address: string
): [BalancesType, boolean] => {
  const arbitrumContracts = useContext(arbitrumContext);
  const ethereumContracts = useContext(ethereumContext);
  const optimismContracts = useContext(optimismContext);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [balances, setBalances] = useState<BalancesType>({
    tcapBalance: "0",
    jpegzBalance: "0",
    ctxBalance: "0",
    tcapSupplly: "0",
    jpegzSupplly: "0",
  });

  const loadBalanceArbitrum = async () => {
    const jpegzBalanceCall = await arbitrumContracts.jpegzTokenRead?.balanceOf(address);
    const jpegzSupplyCall = await arbitrumContracts.jpegzTokenRead?.totalSupply();
    // @ts-ignore
    const [jpegzBalance, jpegzSupply] = await ethcallProvider?.all([
      jpegzBalanceCall,
      jpegzSupplyCall,
    ]);
    setBalances({
      tcapBalance: "0",
      jpegzBalance: ethers.utils.formatEther(jpegzBalance),
      ctxBalance: "0",
      tcapSupplly: "0",
      jpegzSupplly: ethers.utils.formatEther(jpegzSupply),
    });
  };

  const loadBalanceEthereum = async () => {
    const tcapBalanceCall = await ethereumContracts.tcapTokenRead?.balanceOf(address);
    const tcapSupplyCall = await ethereumContracts.tcapTokenRead?.totalSupply();
    const ctxBalanceCall = await ethereumContracts.ctxTokenRead?.balanceOf(address);

    // @ts-ignore
    const [tcapBalance, tcapSupply, ctxBalance] = await ethcallProvider?.all([
      tcapBalanceCall,
      tcapSupplyCall,
      ctxBalanceCall,
    ]);

    setBalances({
      tcapBalance: ethers.utils.formatEther(tcapBalance),
      jpegzBalance: "0",
      ctxBalance: ethers.utils.formatEther(ctxBalance),
      tcapSupplly: ethers.utils.formatEther(tcapSupply),
      jpegzSupplly: "0",
    });
  };

  const loadBalanceOptimism = async () => {
    if (optimismContracts.tcapTokenRead) {
      const tcapBalanceCall = await optimismContracts.tcapTokenRead?.balanceOf(address);
      const tcapSupplyBalanceCall = await optimismContracts.tcapTokenRead?.totalSupply();

      // @ts-ignore
      const [tcapBalance, tcapSupply] = await ethcallProvider?.all([
        tcapBalanceCall,
        tcapSupplyBalanceCall,
      ]);
      setBalances({
        tcapBalance: ethers.utils.formatEther(tcapBalance),
        jpegzBalance: "0",
        ctxBalance: "0",
        tcapSupplly: ethers.utils.formatEther(tcapSupply),
        jpegzSupplly: "0",
      });
    }
  };

  const loadBalance = async () => {
    if (arbitrumContracts && ethereumContracts && optimismContracts) {
      if (isArbitrum(chainId) && validOracles(chainId, arbitrumContracts)) {
        await loadBalanceArbitrum();
      }
      if (isInLayer1(chainId) && validOracles(chainId, ethereumContracts)) {
        await loadBalanceEthereum();
      }
      if (isOptimism(chainId) && validOracles(chainId, optimismContracts)) {
        await loadBalanceOptimism();
      }
    }
    setLoadingBalances(false);
  };

  const loadIndexSupply = async () => {
    if (ethcallProvider) {
      let indexTokenRead = ethereumContracts.tcapTokenRead;
      if (isArbitrum(chainId)) {
        indexTokenRead = arbitrumContracts.jpegzTokenRead;
      }
      if (isOptimism(chainId)) {
        indexTokenRead = optimismContracts.tcapTokenRead;
      }

      if (indexTokenRead) {
        const indexSupplyCall = await indexTokenRead?.totalSupply();
        // @ts-ignore
        const [indexSupply] = await ethcallProvider?.all([indexSupplyCall]);
        const indexSupplyVal = ethers.utils.formatEther(indexSupply);

        setBalances({
          tcapBalance: "0",
          jpegzBalance: "0",
          ctxBalance: "0",
          tcapSupplly: !isArbitrum(chainId) ? indexSupplyVal : "0",
          jpegzSupplly: isArbitrum(chainId) ? indexSupplyVal : "0",
        });
      }
    }
  };

  useEffect(
    () => {
      if (ethcallProvider && address !== "") {
        loadBalance();
      } else {
        loadIndexSupply();
        setLoadingBalances(false);
      }
    },
    // eslint-disable-next-line
    [chainId, ethcallProvider, address]
  );

  return [balances, loadingBalances];
};
