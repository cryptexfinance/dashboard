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
  t: any;
};

const Withdraw = ({
  show,
  delegatorAddress,
  delegatorFactory,
  stakedAmount,
  currentWithdrawTime,
  onHide,
  refresh,
  t,
}: props) => {
  const [withdrawText, setWithdrawText] = useState("");
  const [canWithdraw, setCanWithdraw] = useState(true);

  const onChangeWithdraw = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawText(event.target.value);
  };

  const maxWithdraw = async (e: React.MouseEvent) => {
    e.preventDefault();
    setWithdrawText(stakedAmount);
  };

  const withdraw = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (delegatorFactory && delegatorAddress && canWithdraw) {
      setCanWithdraw(false);
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
            errorNotification(t("governance.errors.need-to-wait"));
          }
        } else {
          errorNotification(t("governance.errors.invalid-amount"));
        }
      } else {
        errorNotification(t("empty"));
      }
      setCanWithdraw(true);
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
        <Modal.Title id="contained-modal-title-vcenter">{t("governance.withdraw")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="diamond" />
        <Form>
          <Form.Group className="" controlId="">
            <p className="delegate-description">{t("governance.withdraw-info")}</p>
            <Form.Label>{t("governance.amount-remove")}</Form.Label>
            <Form.Label className="max">
              <a href="/" className="number orange" onClick={maxWithdraw}>
                {t("max")}
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
              <span className="warning-span">
                {t("governance.withdraw-info2", { date: withdrawDate() })}
              </span>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="pink"
          className="mt-3 mb-4 w-100"
          onClick={withdraw}
          disabled={!canWithdraw}
        >
          {canWithdraw ? t("governance.withdraw") : t("governance.withdrawing")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Withdraw;
