import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Provider } from "ethers-multicall";
import { arbitrumContext, ethereumContext } from "../state/index";
import { isArbitrum, isInLayer1, validOracles } from "../utils/utils";
import { BalancesType } from "./types";

export const useBalances = (
  chainId: number,
  ethcallProvider: Provider | undefined,
  address: string
): [BalancesType, boolean] => {
  const arbitrumContracts = useContext(arbitrumContext);
  const ethereumContracts = useContext(ethereumContext);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [balances, setBalances] = useState<BalancesType>({
    tcapBalance: "0",
    jpegzBalance: "0",
    ctxBalance: "0",
    tcapSupplly: "0",
    jpegzSupplly: "0",
  });

  const loadBalanceArbitrum = async () => {
    const jpegzBalanceCall = arbitrumContracts.jpegzTokenRead?.balanceOf(address);
    const jpegzSupplyCall = arbitrumContracts.jpegzTokenRead?.totalSupply();
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
    try {
      const tcapBalanceCall = ethereumContracts.tcapTokenRead?.balanceOf(address);
      const tcapSupplyCall = ethereumContracts.tcapTokenRead?.totalSupply();
      const ctxBalanceCall = ethereumContracts.ctxTokenRead?.balanceOf(address);

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
    } catch (error: any) {}
  };

  const loadBalance = async () => {
    try {
      if (arbitrumContracts && ethereumContracts && ethcallProvider) {
        if (isArbitrum(chainId) && validOracles(chainId, arbitrumContracts)) {
          await loadBalanceArbitrum();
        }
        if (isInLayer1(chainId) && validOracles(chainId, ethereumContracts)) {
          await loadBalanceEthereum();
        }
      }      
    } catch (error: any) { }
    setLoadingBalances(false);
  };

  const loadIndexSupply = async () => {
    try {
      if (ethcallProvider) {
        let indexTokenRead = ethereumContracts.tcapTokenRead;
        if (isArbitrum(chainId)) {
          indexTokenRead = arbitrumContracts.jpegzTokenRead;
        }

        if (indexTokenRead) {
          const indexSupplyCall = indexTokenRead?.totalSupply();
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
    } catch (error: any) {}
  };

  useEffect(
    () => {
      if (ethcallProvider && address !== "") {
        loadBalance();
      } else if (ethcallProvider) {
        loadIndexSupply();
        setLoadingBalances(false);
      }
    },
    // eslint-disable-next-line
    [chainId, ethcallProvider, address]
  );

  return [balances, loadingBalances];
};
