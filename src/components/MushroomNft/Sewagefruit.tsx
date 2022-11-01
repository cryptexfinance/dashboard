import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/esm/Card";
import Spinner from "react-bootstrap/Spinner";
import { useTranslation } from "react-i18next";
// import { Widget } from "@typeform/embed-react";
import "../../styles/sewagefruit.scss";
import Loading from "../Loading";
import SignerContext from "../../state/SignerContext";
import MushroomNftContext from "../../state/MushroomNftContext";
import NetworkContext from "../../state/NetworkContext";
import { useMerkleTree } from "../../hooks/useMerkleTree";
import { NETWORKS } from "../../utils/constants";
import { errorNotification, isGoerli, notifyUser } from "../../utils/utils";
import mushroomMan from "../../assets/images/noti-error.png";
import sewageFruit from "../../assets/images/sewage-fruit.png";
import { whitelist, whitelistGoerli } from "./whitelist";

type SewageFruitType = {
  name: string;
  description: string;
  image: string;
  revealed: boolean;
};

type UserStatusType = {
  verified: boolean;
  claimed: boolean;
  tokenURI: string;
};

const SewageFruit = () => {
  const { t } = useTranslation();
  // const { isInitialized, Moralis } = useMoralis();
  const revealedDate = new Date(1667245715000);
  const currentNetwork = useContext(NetworkContext);
  const signer = useContext(SignerContext);
  const mushroom = useContext(MushroomNftContext);
  const merkleTree = useMerkleTree(isGoerli(currentNetwork.chainId) ? whitelistGoerli : whitelist);
  const [signerAddress, setSignerAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [minting, setMinting] = useState(false);
  const [loadingFruit, setLoadingFruit] = useState(false);
  const [merkleProof, setMerkleProof] = useState<any>();
  const [mintPeriodEnd, setMintPeriodEnd] = useState(new Date());
  const [publicMint, setPublicMint] = useState(false);
  const [maxSupplyReached, setMaxSupplyReached] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatusType>({
    verified: false,
    claimed: false,
    tokenURI: "",
  });
  const [fruitInfo, setFruitInfo] = useState<SewageFruitType>();

  const getTokenId = async (currentAddress: string): Promise<number> => {
    const apiUrl = new URL(`https://deep-index.moralis.io/api/v2/${currentAddress}/nft`);

    apiUrl.search = new URLSearchParams({
      chain: isGoerli(currentNetwork.chainId) ? "goerli" : "eth",
      format: "decimal",
      token_addresses: isGoerli(currentNetwork.chainId)
        ? NETWORKS.goerli.mushroomNft
        : NETWORKS.mainnet.mushroomNft,
    }).toString();

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY || "",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const responseJson = await response.json();
    let tokenId = 0;
    if (responseJson && responseJson.result) {
      if (responseJson.result.length > 0) {
        tokenId = parseInt(responseJson.result[0].token_id);
      }
    }

    return tokenId;
  };

  const loadFruitData = async (tokenURI: string) => {
    setLoadingFruit(true);
    fetch(tokenURI, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((resp) => {
        if (resp) {
          let isRevealed = true;
          if (resp.attributes.length > 0) {
            if (resp.attributes[0].trait_type === "Status") {
              isRevealed = resp.attributes[0].value !== "Unrevealed";
            }
          }
          setFruitInfo({
            name: resp.name.replace("#", ""),
            description: resp.description,
            image: resp.image,
            revealed: isRevealed,
          });
        }
        setLoadingFruit(false);
      })
      .catch((error) => {
        console.error(error);
        setLoadingFruit(false);
      });
  };

  const loadUserStatus = async (currentAddress: string, isPublic: boolean) => {
    const currentUserStatus = userStatus;

    if (!isPublic) {
      currentUserStatus.verified = merkleTree.verify(currentAddress);
      if (currentUserStatus.verified) {
        setMerkleProof(merkleTree.getProof(currentAddress));
      }
    } else {
      currentUserStatus.verified = true;
    }

    const userToClaimsCall = await mushroom.mushroomNftRead?.userToClaims(currentAddress);
    // @ts-ignore
    const [userClaims] = await signer.ethcallProvider?.all([userToClaimsCall]);

    currentUserStatus.claimed = userClaims;
    if (currentUserStatus.claimed) {
      let tokenId = 0;
      try {
        tokenId = await getTokenId(currentAddress);
      } catch (error) {
        console.log(error);
      }
      if (tokenId > 0) {
        const tokenURICall = await mushroom.mushroomNftRead?.tokenURI(tokenId);
        // @ts-ignore
        const [tokenURI] = await signer.ethcallProvider?.all([tokenURICall]);
        currentUserStatus.tokenURI = tokenURI;
        await loadFruitData(tokenURI);
      }
    }

    setUserStatus(currentUserStatus);
  };

  const loadData = async () => {
    const currentTokenIdCall = await mushroom.mushroomNftRead?.currentTokenId();
    const maxSupplyCall = await mushroom.mushroomNftRead?.maxSupply();
    const mintPeriodCall = await mushroom.mushroomNftRead?.mintPeriod();

    // @ts-ignore
    const [currentTokenId, maxSupply, mintPeriod] = await signer.ethcallProvider?.all([
      currentTokenIdCall,
      maxSupplyCall,
      mintPeriodCall,
    ]);

    const today = new Date();
    const endDateMS = mintPeriod.toNumber() * 1000;

    setMintPeriodEnd(new Date(endDateMS));
    setPublicMint(today.getTime() > endDateMS);
    setMaxSupplyReached(currentTokenId.toNumber() + 1 > maxSupply.toNumber());

    if (signer.signer) {
      const currentAddress = await signer.signer.getAddress();
      if (currentAddress !== "") {
        setSignerAddress(currentAddress);
        await loadUserStatus(currentAddress, today.getTime() > endDateMS);
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      if (signer && mushroom.mushroomNftRead) {
        setLoading(true);
        await loadData();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line
  }, [signer.signer]);

  if (loading) {
    return <Loading />;
  }

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMint = async () => {
    try {
      setMinting(true);
      const tx = await mushroom.mushroomNft?.mint(signerAddress, merkleProof);
      notifyUser(tx, refresh);
      setMinting(false);
    } catch (error) {
      console.log(error.message);
      errorNotification(t("errors.tran-rejected"));
      setMinting(false);
    }
  };

  const handlePublicMint = async () => {
    setMinting(true);
    try {
      const tx = await mushroom.mushroomNft?.publicMint();
      notifyUser(tx, refresh);
    } catch (error) {
      console.log(error.message);
      errorNotification(t("errors.tran-rejected"));
    }
    setMinting(false);
  };

  const openseaUrl = (): string => {
    let nftUrl = "https://opensea.io/assets/ethereum/".concat(NETWORKS.mainnet.mushroomNft);
    if (isGoerli(currentNetwork.chainId)) {
      nftUrl = "https://testnets.opensea.io/assets/goerli/".concat(NETWORKS.goerli.mushroomNft);
    }
    if (fruitInfo) {
      nftUrl = nftUrl.concat("/").concat(fruitInfo.name);
    }

    return nftUrl;
  };

  const renderImage = () => {
    if (userStatus.verified) {
      if (userStatus.claimed && fruitInfo) {
        return <img src={fruitInfo.image} alt="Sewage Fruit" className="img-minted" />;
      }
      return <img src={sewageFruit} alt="Sewage Fruit" className="img-sewage" />;
    }
    return <img src={mushroomMan} alt="Sewage Fruit" />;
  };

  const renderMintInfo = () => {
    if (userStatus.verified) {
      if (userStatus.claimed && fruitInfo) {
        if (!fruitInfo.revealed) {
          return (
            <p>
              Sewage Fruitz MINTED. It will be revealed on{" "}
              <span className="neon-pink">{revealedDate.toLocaleDateString()}</span>. You can check
              out the collection{" "}
              <a
                href="https://opensea.io/collection/sewage-fruitz"
                target="_blank"
                rel="noreferrer"
              >
                here.
              </a>
            </p>
          );
        }
        return (
          <p>
            Sewage Fruitz MINTED. You can also check it out{" "}
            <a href={openseaUrl()} target="_blank" rel="noreferrer">
              here.
            </a>
          </p>
        );
      }

      if (!maxSupplyReached) {
        return (
          <p>
            <span className="neon-pink">Congrats!</span> You're eligible to mint a Sewage Fruitz.
          </p>
        );
      }
      return (
        <p>
          <span className="neon-pink">Sorry!</span> all Sewage Fruitz have been minted.
        </p>
      );
    }
    return (
      <p>
        <span className="neon-orange">Sorry!</span> You're not eligible to mint.
      </p>
    );
  };

  return (
    <div className="sewage-fruit">
      <h2>Sewage Fruitz</h2>
      <div className="content">
        {signerAddress !== "" && (
          <Card className="diamond mint">
            <Card.Header>{!refreshing && !loadingFruit && renderMintInfo()}</Card.Header>
            <Card.Body>
              {refreshing || loadingFruit ? (
                <Spinner variant="danger" className="spinner" animation="border" />
              ) : (
                renderImage()
              )}
            </Card.Body>
            {userStatus.verified && !userStatus.claimed && !maxSupplyReached && (
              <Card.Footer>
                <Button
                  variant="success"
                  className="neon-green"
                  onClick={publicMint ? handlePublicMint : handleMint}
                  disabled={refreshing || minting}
                >
                  Mint
                </Button>
              </Card.Footer>
            )}
          </Card>
        )}
        <Card className="diamond info">
          <Card.Body>
            <p>
              Sewage Fruitz are a collection of 2,500 upgradable NFTs created from the depths of the
              Ethereum Blockchain and are a reward to all members of the Cryptex Finance community.
              A fungus, grown out of dark substances in the yard of Mushroom Man as he spreads his
              spores worldwide.
            </p>
            <p>
              Holding a Sewage Fruitz PFP unlocks user ability to go on quests within the Cryptex
              Finance ecosystem, completing tasks that will be unlocked inside the DAO. Sewage
              Fruitz holders can earn upgrades, badges and burn them in the future based on their
              achievements to earn CTX, Cryptex Finance protocol governance token available
              worldwide on Coinbase, Gemini, Huobi and many others.
            </p>
            <p>
              Read more in our most recent blog post:{" "}
              <a
                href="https://cryptex.finance/blog/2022-10-22-introducing-sewage-fruitz/"
                target="_blank"
                rel="noreferrer"
              >
                Introducing Sewage Fruitz
              </a>
            </p>
            <br />
            {signerAddress === "" && (
              <p>
                Connect your wallet to see if you are eligible to mint a Sewage Fruit. If you aren’t
                eligible, public mint will be available on {mintPeriodEnd.toLocaleDateString()}.
              </p>
            )}            
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SewageFruit;
