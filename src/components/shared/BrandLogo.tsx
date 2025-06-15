
import React from "react";

interface BrandLogoProps {
  size?: number | string;
  className?: string;
}

// Use the new uploaded logo!
export const BrandLogo = ({ size = 40, className = "" }: BrandLogoProps) => (
  <img
    src="/lovable-uploads/f7bffc1f-4676-4442-a61e-315510179e6d.png"
    alt="Allure CV Signatures Logo"
    style={{ width: size, height: size, objectFit: "contain" }}
    className={className}
    loading="eager"
    draggable={false}
  />
);
