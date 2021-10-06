import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ethers } from "ethers";
import Modal from "react-bootstrap/esm/Modal";
import "../../styles/modal.scss";
import { errorNotification, notifyUser } from "../../utils/utils";

type props = {
  show: boolean;
  delegatorAddress: string;
  delegatorFactory?: ethers.Contract;
  stakedAmount: string;
  currentWithdrawTime: number;
  onHide: () => void;
  refresh: () => void;
};

const Withdraw = ({
  show,
  delegatorAddress,
  delegatorFactory,
  stakedAmount,
  currentWithdrawTime,
  onHide,
  refresh,
}: props) => {
  const [withdrawText, setWithdrawText] = useState("");

  const onChangeWithdraw = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawText(event.target.value);
  };

  const maxWithdraw = async (e: React.MouseEvent) => {
    e.preventDefault();
    setWithdrawText(stakedAmount);
  };

  const withdraw = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (delegatorFactory && delegatorAddress) {
      if (withdrawText) {
        if (parseFloat(withdrawText) <= parseFloat(stakedAmount)) {
          try {
            const tx = await delegatorFactory.withdraw(
              delegatorAddress,
              ethers.utils.parseEther(withdrawText)
            );
            notifyUser(tx, refresh);
            setWithdrawText("");
            onHide();
          } catch (error) {
            console.log(error);
            errorNotification("Need to wait the minimum staking period");
          }
        } else {
          errorNotification("Invalid amount to withdraw");
        }
      } else {
        errorNotification("Field can't be empty");
      }
    }
  };

  const withdrawDate = (): string => {
    const d = new Date(currentWithdrawTime * 1000);
    return d.toLocaleString();
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => {
        setWithdrawText("");
        onHide();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Withdraw</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="diamond" />
        <Form>
          <Form.Group className="" controlId="">
            <p>
              Remove delegated votes from this Crypt Keeper. CTX must be staked and delegated for a
              minimum of 7 days before you are eligible to withdraw.
            </p>
            <Form.Label>Amount to remove</Form.Label>
            <Form.Label className="max">
              <a href="/" className="number orange" onClick={maxWithdraw}>
                MAX
              </a>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="0"
              className="neon-orange"
              value={withdrawText}
              onChange={onChangeWithdraw}
            />
            {currentWithdrawTime !== 0 && (
              <span className="warning-label">* Eligible to withdraw on {withdrawDate()}</span>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="pink" className="mt-3 mb-4 w-100" onClick={withdraw}>
          Withdraw
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Withdraw;
