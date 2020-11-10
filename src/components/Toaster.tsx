import React, { useState } from "react";
import { Toast } from "react-bootstrap";
import "../styles/toast.scss";

const Toaster = () => {
  const [show, setShow] = useState(true);
  return (
    <div className="toast-wrapper">
      <Toast onClose={() => setShow(false)} show={show} delay={3000}>
        <Toast.Header />
        <Toast.Body>
          <h5>⏰ Transaction Sent</h5>
          <p>Lorem ipsum dolor sit amet, consec tetur adip scing elit</p>
        </Toast.Body>
      </Toast>
    </div>
  );
};

export default Toaster;
