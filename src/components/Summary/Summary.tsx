import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Provider } from "ethers-multicall";
import { Card, Dropdown } from "react-bootstrap/esm";
import "../../styles/summary.scss";
import SummaryOptions from "./SummaryOptions";
import { NETWORKS, TOKENS_SYMBOLS } from "../../utils/constants";
import { getDefaultProvider, isArbitrum } from "../../utils/utils";

type props = {
  signerAddress: string;
  signerChainId: number;
};

const Summary = ({ signerAddress, signerChainId }: props) => {
  const indexName = isArbitrum(signerChainId) ? TOKENS_SYMBOLS.JPEGz : TOKENS_SYMBOLS.TCAP;
  const [options, setOptions] = useState([
    { id: "0", name: "My Balance" },
    { id: "1", name: indexName.concat(" Summary") },
    { id: "2", name: "Vaults Summary" },
  ]);
  let chains = [
    { id: NETWORKS.mainnet.chainId, name: "Mainnet" },
    { id: NETWORKS.arbitrum.chainId, name: "Arbitrum" },
  ];
  if (process.env.REACT_APP_NETWORK_ID !== "1") {
    chains = [
      { id: NETWORKS.goerli.chainId, name: "Goerli" },
      { id: NETWORKS.arbitrum_goerli.chainId, name: "Arbitrum Goerli" },
    ];
  }
  const [updatingChain, setUpdatingChain] = useState(false);
  const [currentOption, setCurrentOption] = useState(
    signerAddress !== "" ? options[0] : options[1]
  );

  const getDefaultChain = () => {
    if (process.env.REACT_APP_NETWORK_ID === "1") {
      if (signerChainId === NETWORKS.mainnet.chainId) {
        return chains[0];
      }
      if (signerChainId === NETWORKS.arbitrum.chainId) {
        return chains[1];
      }
      return chains[2];
    }
    if (signerChainId === NETWORKS.goerli.chainId) {
      return chains[0];
    }
    if (signerChainId === NETWORKS.arbitrum_goerli.chainId) {
      return chains[1];
    }
    return chains[2];
  };

  const [currentChain, setCurrentChain] = useState(getDefaultChain());
  const [currentEthProvider, setCurrentEthProvider] = useState<Provider | undefined>();

  useEffect(() => {
    const loadProvider = async () => {
      setUpdatingChain(true);
      const provider = getDefaultProvider(currentChain.id);
      const randomSigner = ethers.Wallet.createRandom().connect(provider);
      const ethcallProvider = new Provider(randomSigner.provider);
      await ethcallProvider.init();
      setCurrentEthProvider(ethcallProvider);
      setUpdatingChain(false);
    };
    loadProvider();
  }, [currentChain.id]);

  const handleOptionChange = (eventKey: string) => {
    const o = options.find((option) => option.id === eventKey);
    setCurrentOption(o || options[0]);
  };

  const handleChainChange = (eventKey: string) => {
    const c = chains.find((chain) => chain.id.toString() === eventKey);
    setUpdatingChain(true);
    setCurrentChain(c || chains[0]);

    const ops = [...options];
    if (c) {
      const indName = isArbitrum(c.id) ? TOKENS_SYMBOLS.JPEGz : TOKENS_SYMBOLS.TCAP;
      ops[1].name = indName.concat(" Summary");
    }
    if (currentOption.id === "1") {
      const cOpt = currentOption;
      cOpt.name = ops[1].name;
      setCurrentOption(cOpt);
    }
    setOptions(ops);
  };

  return (
    <Card className="summary">
      <Card.Header>
        <Dropdown onSelect={(eventKey) => handleOptionChange(eventKey || "0")}>
          <Dropdown.Toggle variant="secondary" id="dropdown-summary" className="text-left">
            <h6>{currentOption.name}</h6>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {signerAddress !== "" && (
              <Dropdown.Item key={options[0].id} eventKey={options[0].id}>
                {options[0].name}
              </Dropdown.Item>
            )}
            <Dropdown.Item key={options[1].id} eventKey={options[1].id}>
              {options[1].name}
            </Dropdown.Item>
            <Dropdown.Item key={options[2].id} eventKey={options[2].id}>
              {options[2].name}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown onSelect={(eventKey) => handleChainChange(eventKey || "1")}>
          <Dropdown.Toggle variant="secondary" id="dropdown-summary" className="text-left">
            <h6>{currentChain.name}</h6>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {chains.map((item) => (
              <Dropdown.Item key={item.id} eventKey={item.id}>
                {item.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Card.Header>
      <Card.Body>
        {!updatingChain && (
          <SummaryOptions
            signerAddress={signerAddress}
            currentOption={currentOption.id}
            currentChainId={currentChain.id}
            ethCallProvider={currentEthProvider}
          />
        )}
      </Card.Body>
    </Card>
  );
};

export default Summary;
