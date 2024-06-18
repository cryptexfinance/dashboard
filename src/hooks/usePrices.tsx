import { useContext, useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { oraclesContext, networkContext, signerContext } from "../state/index";
import { isArbitrum, isInLayer1, validOracles } from "../utils/utils";
import { OraclePricesType } from "./types";

export const usePrices = (): [OraclePricesType, boolean] => {
  const currentNetwork = useContext(networkContext);
  const oracles = useContext(oraclesContext);
  const signer = useContext(signerContext);
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

  const loadPrices = async () => {
    if (signer && oracles && validOracles(currentNetwork.chainId || 1, oracles)) {
      const daiOraclePriceCall = oracles.daiOracleRead?.getLatestAnswer();

      const ethcalls = [daiOraclePriceCall];
      if (isInLayer1(currentNetwork.chainId)) {
        const tcapOraclePriceCall = oracles.tcapOracleRead?.getLatestAnswer();
        const wethOraclePriceCall = oracles.wethOracleRead?.getLatestAnswer();
        const aaveOraclePriceCall = oracles.aaveOracleRead?.getLatestAnswer();
        const linkOraclePriceCall = oracles.linkOracleRead?.getLatestAnswer();
        const usdcOraclePriceCall = oracles.usdcOracleRead?.getLatestAnswer();
        const wbtcOraclePriceCall = oracles.wbtcOracleRead?.getLatestAnswer();
        ethcalls.push(tcapOraclePriceCall);
        ethcalls.push(wethOraclePriceCall);
        ethcalls.push(aaveOraclePriceCall);
        ethcalls.push(linkOraclePriceCall);
        ethcalls.push(usdcOraclePriceCall);
        ethcalls.push(wbtcOraclePriceCall);
      }
      if (isArbitrum(currentNetwork.chainId)) {
        const jpegzPriceCall = oracles.jpegzOracleRead?.getLatestAnswer();
        const wethOraclePriceCall = oracles.wethOracleRead?.getLatestAnswer();
        ethcalls.push(jpegzPriceCall);
        ethcalls.push(wethOraclePriceCall);
      }

      let jpegzOraclePrice = BigNumber.from(0);
      let tcapOraclePrice = BigNumber.from(0);
      let wethOraclePrice = BigNumber.from(0);
      let daiOraclePrice = BigNumber.from(0);
      let aaveOraclePrice = BigNumber.from(0);
      let linkOraclePrice = BigNumber.from(0);
      let snxOraclePrice = BigNumber.from(0);
      let uniOraclePrice = BigNumber.from(0);
      let maticOraclePrice = BigNumber.from(0);
      let wbtcOraclePrice = BigNumber.from(0);
      let usdcOraclePrice = BigNumber.from(0);

      if (isInLayer1(currentNetwork.chainId)) {
        // @ts-ignore
        [
          daiOraclePrice,
          tcapOraclePrice,
          wethOraclePrice,
          aaveOraclePrice,
          linkOraclePrice,
          usdcOraclePrice,
          wbtcOraclePrice,
        ] = await signer.ethcallProvider?.all(ethcalls);
      } else {
        // @ts-ignore
        [daiOraclePrice, jpegzOraclePrice, wethOraclePrice] = await signer.ethcallProvider?.all(
          ethcalls
        );
      }

      setOraclePrices({
        jpegzOraclePrice: ethers.utils.formatEther(jpegzOraclePrice.mul(10)),
        jpegzMarketCap: ethers.utils.formatEther(jpegzOraclePrice.mul(10000000000)),
        tcapOraclePrice: ethers.utils.formatEther(tcapOraclePrice),
        tcapMarketCap: ethers.utils.formatEther(tcapOraclePrice.mul(10000000000)),
        wethOraclePrice: ethers.utils.formatEther(wethOraclePrice.mul(10000000000)),
        daiOraclePrice: ethers.utils.formatEther(daiOraclePrice.mul(10000000000)),
        aaveOraclePrice: ethers.utils.formatEther(aaveOraclePrice.mul(10000000000)),
        linkOraclePrice: ethers.utils.formatEther(linkOraclePrice.mul(10000000000)),
        uniOraclePrice: ethers.utils.formatEther(uniOraclePrice.mul(10000000000)),
        snxOraclePrice: ethers.utils.formatEther(snxOraclePrice.mul(10000000000)),
        maticOraclePrice: ethers.utils.formatEther(maticOraclePrice.mul(10000000000)),
        wbtcOraclePrice: ethers.utils.formatEther(wbtcOraclePrice.mul(10000000000)),
        usdcOraclePrice: ethers.utils.formatEther(usdcOraclePrice.mul(10000000000)),
      });
      setLoadingPrices(false);
    }
  };

  useEffect(
    () => {
      if (signer.ethcallProvider) {
        loadPrices();
      }
    },
    // eslint-disable-next-line
    [signer.ethcallProvider]
  );

  return [oraclePrices, loadingPrices];
};
