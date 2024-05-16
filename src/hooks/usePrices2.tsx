import { useContext, useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { Provider } from "ethers-multicall";
import { arbitrumContext, ethereumContext } from "../state/index";
import { isArbitrum, isInLayer1, validOracles } from "../utils/utils";
import { OraclePricesType } from "./types";

export const usePrices2 = (
  chainId: number,
  ethcallProvider: Provider | undefined
): [OraclePricesType, boolean] => {
  const arbitrumContracts = useContext(arbitrumContext);
  const ethereumContracts = useContext(ethereumContext);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [oraclePrices, setOraclePrices] = useState<OraclePricesType>({
    jpegzOraclePrice: "0",
    jpegzMarketCap: "0",
    tcapOraclePrice: "0",
    tcapMarketCap: "0",
    wethOraclePrice: "0",
    daiOraclePrice: "0",
    aaveOraclePrice: "0",
    linkOraclePrice: "0",
    uniOraclePrice: "0",
    snxOraclePrice: "0",
    maticOraclePrice: "0",
    wbtcOraclePrice: "0",
    usdcOraclePrice: "0",
  });

  const loadPricesArbitrum = async () => {
    const jpegzPriceCall = arbitrumContracts.jpegzOracleRead?.getLatestAnswer();
    const wethOraclePriceCall = arbitrumContracts.wethOracleRead?.getLatestAnswer();
    const daiOraclePriceCall = arbitrumContracts.daiOracleRead?.getLatestAnswer();

    let jpegzOraclePrice = BigNumber.from(0);
    let wethOraclePrice = BigNumber.from(0);
    let daiOraclePrice = BigNumber.from(0);

    // @ts-ignore
    [jpegzOraclePrice, wethOraclePrice, daiOraclePrice] = await ethcallProvider?.all([
      jpegzPriceCall,
      wethOraclePriceCall,
      daiOraclePriceCall,
    ]);
    const marketCap = jpegzOraclePrice.mul(10000000000);
    const p = oraclePrices;
    p.jpegzOraclePrice = ethers.utils.formatEther(jpegzOraclePrice.mul(10));
    p.jpegzMarketCap = ethers.utils.formatEther(marketCap);
    p.wethOraclePrice = ethers.utils.formatEther(wethOraclePrice.mul(10000000000));
    p.daiOraclePrice = ethers.utils.formatEther(daiOraclePrice.mul(10000000000));
    setOraclePrices(p);
  };

  const loadPricesEthereum = async () => {
    const tcapPriceCall = ethereumContracts.tcapOracleRead?.getLatestAnswer();
    const wethOraclePriceCall = ethereumContracts.wethOracleRead?.getLatestAnswer();
    const daiOraclePriceCall = ethereumContracts.daiOracleRead?.getLatestAnswer();
    const aaveOraclePriceCall = ethereumContracts.aaveOracleRead?.getLatestAnswer();
    const linkOraclePriceCall = ethereumContracts.linkOracleRead?.getLatestAnswer();
    const wbtcOraclePriceCall = ethereumContracts.wbtcOracleRead?.getLatestAnswer();
    const usdcOraclePriceCall = ethereumContracts.usdcOracleRead?.getLatestAnswer();

    let tcapOraclePrice = BigNumber.from(0);
    let wethOraclePrice = BigNumber.from(0);
    let daiOraclePrice = BigNumber.from(0);
    let aaveOraclePrice = BigNumber.from(0);
    let linkOraclePrice = BigNumber.from(0);
    let wbtcOraclePrice = BigNumber.from(0);
    let usdcOraclePrice = BigNumber.from(0);

    // @ts-ignore
    [
      tcapOraclePrice,
      wethOraclePrice,
      daiOraclePrice,
      aaveOraclePrice,
      linkOraclePrice,
      wbtcOraclePrice,
      usdcOraclePrice,
    ] = await ethcallProvider?.all([
      tcapPriceCall,
      wethOraclePriceCall,
      daiOraclePriceCall,
      aaveOraclePriceCall,
      linkOraclePriceCall,
      wbtcOraclePriceCall,
      usdcOraclePriceCall,
    ]);
    const marketCap = tcapOraclePrice.mul(10000000000);

    setOraclePrices({
      jpegzOraclePrice: "0",
      jpegzMarketCap: "0",
      tcapOraclePrice: ethers.utils.formatEther(tcapOraclePrice),
      tcapMarketCap: ethers.utils.formatEther(marketCap),
      wethOraclePrice: ethers.utils.formatEther(wethOraclePrice.mul(10000000000)),
      daiOraclePrice: ethers.utils.formatEther(daiOraclePrice.mul(10000000000)),
      aaveOraclePrice: ethers.utils.formatEther(aaveOraclePrice.mul(10000000000)),
      linkOraclePrice: ethers.utils.formatEther(linkOraclePrice.mul(10000000000)),
      uniOraclePrice: "0",
      snxOraclePrice: "0",
      maticOraclePrice: "0",
      wbtcOraclePrice: ethers.utils.formatEther(wbtcOraclePrice.mul(10000000000)),
      usdcOraclePrice: ethers.utils.formatEther(usdcOraclePrice.mul(10000000000)),
    });
  };

  const loadPrices = async () => {
    if (arbitrumContracts && ethereumContracts) {
      if (isArbitrum(chainId) && validOracles(chainId, arbitrumContracts)) {
        await loadPricesArbitrum();
      }
      if (isInLayer1(chainId) && validOracles(chainId, ethereumContracts)) {
        await loadPricesEthereum();
      }
      setLoadingPrices(false);
    }
  };

  useEffect(
    () => {
      if (ethcallProvider) {
        loadPrices();
      }
    },
    // eslint-disable-next-line
    [chainId, ethcallProvider]
  );

  return [oraclePrices, loadingPrices];
};
