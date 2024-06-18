import React, { useContext, useEffect, useState } from "react";
import { Contract } from "ethers-multicall";
import "../../styles/summary.scss";
import cryptexJson from "../../contracts/cryptex.json";
import UniV2Pair from "../../contracts/UniswapV2Pair.json";
import { arbitrumContext, ethereumContext, signerContext } from "../../state";
import { useArbitrum, useEthereum } from "../../hooks";
import Features from "./Features";
import Summary from "./Summary";
import { NETWORKS } from "../../utils/constants";

const SummaryPage = () => {
  const signer = useContext(signerContext);
  const arbitrum = useArbitrum();
  const ethereum = useEthereum();
  const [loading, setLoading] = useState(true);
  const [signerAddress, setSignerAddress] = useState("");
  const [signerChainId, setSignerChainId] = useState(
    process.env.REACT_APP_NETWORK_ID === "1" ? NETWORKS.mainnet.chainId : NETWORKS.goerli.chainId
  );

  const setArbitrumContracts = () => {
    let contracts;
    if (process.env.REACT_APP_NETWORK_ID === "1") {
      contracts = cryptexJson[42161].arbitrum.contracts;
    } else {
      contracts = cryptexJson[421613].arbitrum_goerli.contracts;
    }

    const currentJpegzTokenRead = new Contract(contracts.JPEGZ.address, contracts.JPEGZ.abi);
    arbitrum.setCurrentJpegzTokenRead(currentJpegzTokenRead);
    const currentJpegzOracleRead = new Contract(
      contracts.JPEGZOracle.address,
      contracts.JPEGZOracle.abi
    );
    arbitrum.setCurrentJpegzOracleRead(currentJpegzOracleRead);
    const currentWethOracleRead = new Contract(
      contracts.WETHOracle.address,
      contracts.WETHOracle.abi
    );
    arbitrum.setCurrentWethOracleRead(currentWethOracleRead);
    const currentDaiOracleRead = new Contract(contracts.DAIOracle.address, contracts.DAIOracle.abi);
    arbitrum.setCurrentDaiOracleRead(currentDaiOracleRead);
  };

  const setEthereumContracts = () => {
    let contracts;
    let ctxPoolAddress;
    if (process.env.REACT_APP_NETWORK_ID === "1") {
      contracts = cryptexJson[1].mainnet.contracts;
      ctxPoolAddress = NETWORKS.mainnet.ctxPool;
    } else {
      contracts = cryptexJson[5].goerli.contracts;
    }

    const currentTcapTokenRead = new Contract(contracts.TCAP.address, contracts.TCAP.abi);
    ethereum.setCurrentTcapTokenRead(currentTcapTokenRead);
    const currentCtxTokenRead = new Contract(contracts.Ctx.address, contracts.Ctx.abi);
    ethereum.setCurrentCtxTokenRead(currentCtxTokenRead);
    const currentTcapOracleRead = new Contract(
      contracts.TCAPOracle.address,
      contracts.TCAPOracle.abi
    );
    ethereum.setCurrentTcapOracleRead(currentTcapOracleRead);
    const currentWethOracleRead = new Contract(
      contracts.WETHOracle.address,
      contracts.WETHOracle.abi
    );
    ethereum.setCurrentWethOracleRead(currentWethOracleRead);
    const currentDaiOracleRead = new Contract(contracts.DAIOracle.address, contracts.DAIOracle.abi);
    ethereum.setCurrentDaiOracleRead(currentDaiOracleRead);
    const currentAaveOracleRead = new Contract(
      contracts.AaveOracle.address,
      contracts.AaveOracle.abi
    );
    ethereum.setCurrentAaveOracleRead(currentAaveOracleRead);
    const currentLinkOracleRead = new Contract(
      contracts.LinkOracle.address,
      contracts.LinkOracle.abi
    );
    ethereum.setCurrentLinkOracleRead(currentLinkOracleRead);
    const currentWbtcOracleRead = new Contract(
      contracts.WBTCOracle.address,
      contracts.WBTCOracle.abi
    );
    ethereum.setCurrentWbtcOracleRead(currentWbtcOracleRead);
    const currentUsdcOracleRead = new Contract(
      contracts.USDCOracle.address,
      contracts.USDCOracle.abi
    );
    ethereum.setCurrentUsdcOracleRead(currentUsdcOracleRead);

    if (ctxPoolAddress) {
      const currentCTXPoolTokenRead = new Contract(ctxPoolAddress, UniV2Pair.abi);
      ethereum.setCurrentCtxPoolTokenRead(currentCTXPoolTokenRead);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (signer.signer) {
        setSignerAddress(await signer.signer.getAddress());
        setSignerChainId(await signer.signer.getChainId());
      }
      setArbitrumContracts();
      setEthereumContracts();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [signer.signer]);

  return (
    <div className="dashboard">
      <Features />
      {!loading && (
        <arbitrumContext.Provider value={arbitrum}>
          <ethereumContext.Provider value={ethereum}>
            <Summary signerAddress={signerAddress} signerChainId={signerChainId} />
          </ethereumContext.Provider>
        </arbitrumContext.Provider>
      )}
    </div>
  );
};

export default SummaryPage;
