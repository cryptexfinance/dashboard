import React, { useContext, useEffect, useState } from "react";

import { signerContext } from "../../state/index";
import Monitoring from "./monitoring";

const Vaults = () => {
  const signer = useContext(signerContext);
  const [ownerAddress, setOwnerAddress] = useState("");

  useEffect(() => {
    const load = async () => {
      if (signer && signer.signer) {
        const address = await signer.signer.getAddress();
        setOwnerAddress(address);
      }
    };
    load();
  }, [signer]);

  return <Monitoring ownerAddress={ownerAddress} />;
};

export default Vaults;
