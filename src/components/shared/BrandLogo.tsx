
import React from "react";

interface BrandLogoProps {
  size?: number | string;
  className?: string;
}

export const BrandLogo = ({ size = 40, className = "" }: BrandLogoProps) => (
  <img
    src="/lovable-uploads/allure-cv-signatures-logo.png"
    alt="Allure CV Signatures Logo"
    style={{ width: size, height: size, objectFit: "contain" }}
    className={className}
    loading="eager"
    draggable={false}
  />
);
