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

export const sendNotification = async (title: string, body: string, fn: any = () => {}) => {
  const toastConstant = (
    <div className="body">
      <h5>{title}</h5>
      <p>{body}</p>
    </div>
  );
  toast(toastConstant, {
    // @ts-ignore
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000,
    hideProgressBar: true,
    onClose: () => {
      fn();
    },
  });
};

export const notifyUser = async (tx: ethers.ContractTransaction, fn: any = () => {}) => {
  let notificationTitle = "⏰ Transaction Sent!";
  let notificationBody = "Lorem ipsum dolor sit amet, consec tetur adip scing elit";

  sendNotification(notificationTitle, notificationBody);
  await tx.wait(1);

  notificationTitle = "✔️ Transaction Confirmed!";
  notificationBody = "Lorem ipsum dolor sit amet, consec tetur adip scing elit";
  sendNotification(notificationTitle, notificationBody, fn);
};
