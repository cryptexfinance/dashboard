import { useContext, useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { Provider } from "ethers-multicall";
import { arbitrumContext, ethereumContext, optimismContext } from "../state/index";
import { isArbitrum, isInLayer1, isOptimism, validOracles } from "../utils/utils";
import { OraclePricesType } from "./types";

export const usePrices2 = (
  chainId: number,
  ethcallProvider: Provider | undefined
): [OraclePricesType, boolean] => {
  const arbitrumContracts = useContext(arbitrumContext);
  const ethereumContracts = useContext(ethereumContext);
  const optimismContracts = useContext(optimismContext);
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
    const jpegzPriceCall = await arbitrumContracts.jpegzOracleRead?.getLatestAnswer();
    const wethOraclePriceCall = await arbitrumContracts.wethOracleRead?.getLatestAnswer();
    const daiOraclePriceCall = await arbitrumContracts.daiOracleRead?.getLatestAnswer();

    let jpegzOraclePrice = BigNumber.from(0);
    let wethOraclePrice = BigNumber.from(0);
    let daiOraclePrice = BigNumber.from(0);

    // @ts-ignore
    [jpegzOraclePrice, daiOraclePrice, wethOraclePrice] = await ethcallProvider?.all([
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
    const tcapPriceCall = await ethereumContracts.tcapOracleRead?.getLatestAnswer();
    const wethOraclePriceCall = await ethereumContracts.wethOracleRead?.getLatestAnswer();
    const daiOraclePriceCall = await ethereumContracts.daiOracleRead?.getLatestAnswer();
    const aaveOraclePriceCall = await ethereumContracts.aaveOracleRead?.getLatestAnswer();
    const linkOraclePriceCall = await ethereumContracts.linkOracleRead?.getLatestAnswer();
    const wbtcOraclePriceCall = await ethereumContracts.wbtcOracleRead?.getLatestAnswer();
    const usdcOraclePriceCall = await ethereumContracts.usdcOracleRead?.getLatestAnswer();

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

  const loadPricesOptimism = async () => {
    const tcapPriceCall = await optimismContracts.tcapOracleRead?.getLatestAnswer();
    const wethOraclePriceCall = await optimismContracts.wethOracleRead?.getLatestAnswer();
    const daiOraclePriceCall = await optimismContracts.daiOracleRead?.getLatestAnswer();
    const linkOraclePriceCall = await optimismContracts.linkOracleRead?.getLatestAnswer();
    const snxOraclePriceCall = await optimismContracts.snxOracleRead?.getLatestAnswer();
    const uniOraclePriceCall = await optimismContracts.uniOracleRead?.getLatestAnswer();

    let tcapOraclePrice = BigNumber.from(0);
    let wethOraclePrice = BigNumber.from(0);
    let daiOraclePrice = BigNumber.from(0);
    let linkOraclePrice = BigNumber.from(0);
    let snxOraclePrice = BigNumber.from(0);
    let uniOraclePrice = BigNumber.from(0);

    // @ts-ignore
    [
      tcapOraclePrice,
      wethOraclePrice,
      daiOraclePrice,
      linkOraclePrice,
      snxOraclePrice,
      uniOraclePrice,
    ] = await ethcallProvider?.all([
      tcapPriceCall,
      wethOraclePriceCall,
      daiOraclePriceCall,
      linkOraclePriceCall,
      snxOraclePriceCall,
      uniOraclePriceCall,
    ]);

    const marketCap = tcapOraclePrice.mul(10000000000);
    setOraclePrices({
      jpegzOraclePrice: "0",
      jpegzMarketCap: "0",
      tcapOraclePrice: ethers.utils.formatEther(tcapOraclePrice),
      tcapMarketCap: ethers.utils.formatEther(marketCap),
      wethOraclePrice: ethers.utils.formatEther(wethOraclePrice.mul(10000000000)),
      daiOraclePrice: ethers.utils.formatEther(daiOraclePrice.mul(10000000000)),
      aaveOraclePrice: "0",
      linkOraclePrice: ethers.utils.formatEther(linkOraclePrice.mul(10000000000)),
      uniOraclePrice: ethers.utils.formatEther(uniOraclePrice.mul(10000000000)),
      snxOraclePrice: ethers.utils.formatEther(snxOraclePrice.mul(10000000000)),
      maticOraclePrice: "0",
      wbtcOraclePrice: "0",
      usdcOraclePrice: "0",
    });
  };

  const loadPrices = async () => {
    if (arbitrumContracts && ethereumContracts && optimismContracts) {
      if (isArbitrum(chainId) && validOracles(chainId, arbitrumContracts)) {
        await loadPricesArbitrum();
      }
      if (isInLayer1(chainId) && validOracles(chainId, ethereumContracts)) {
        await loadPricesEthereum();
      }
      if (isOptimism(chainId) && validOracles(chainId, optimismContracts)) {
        await loadPricesOptimism();
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
