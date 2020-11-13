import { ethers } from "ethers";
import React from "react";
import { toast } from "react-toastify";

export const makeShortAddress = (address: string) => {
  const shortAddress = `${address.substr(0, 6).toString()}...${address
    .substr(address.length - 4, address.length)
    .toString()}`;
  return shortAddress;
};

export const isValidAddress = async (address: string) => {
  try {
    const currentAddress = ethers.utils.getAddress(address);
    return currentAddress;
  } catch (error) {
    try {
      const tempProvider = ethers.getDefaultProvider("mainnet");
      const currentAddress = await tempProvider.resolveName(address);
      return currentAddress;
    } catch (e) {
      return null;
    }
  }
};

export const parseUint = (value: string) => {
  if (parseInt(value) < 0) {
    return "0";
  }
  return value;
};

export const notifyUser = async (
  tx: ethers.ContractTransaction,
  fn: any = window.location.reload()
) => {
  const as = (
    <div className="body">
      <h5>⏰ Transaction Submitted! Please wait for confirmation</h5>
      <p>Lorem ipsum dolor sit amet, consec tetur adip scing elit</p>
    </div>
  );
  toast(as, {
    // @ts-ignore
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 10002000,
  });
  await tx.wait(1);

  toast("✔️ Transaction Confirmed!", {
    // @ts-ignore
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 10002000,
    onClose: () => {
      fn();
    },
  });
};
