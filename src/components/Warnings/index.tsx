import React from "react";
import FarmWarning from "./FarmWarning";
import KeepersWarning from "./KeepersWarning";
import SewageFruitzWarning from "./SewageFruitzWarning";
import VaultsWarning from "./VaultsWarning";

export const Warnings = () => (
  <>
    <FarmWarning />
    <KeepersWarning />
    <SewageFruitzWarning />
    <VaultsWarning />
  </>
);
