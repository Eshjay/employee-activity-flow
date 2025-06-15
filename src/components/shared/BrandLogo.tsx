
import React, { useState } from "react";

interface BrandLogoProps {
  size?: number | string;
  className?: string;
}

// Primary logo path (standardized)
const LOGO_SRC = "/lovable-uploads/allure-cv-signatures-logo.png";

export const BrandLogo = ({ size = 40, className = "" }: BrandLogoProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Fallback: colored circle + initials if the image fails to load
    return (
      <div
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #27378a 60%, #6c7ddc 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          color: "#fff",
          fontSize: typeof size === "number" ? Math.max(14, size as number / 2.5) : 24,
          boxShadow: "0 2px 8px rgba(39,55,138,0.12)",
        }}
        aria-label="Allure CV Signatures"
        className={className}
      >
        ACV
      </div>
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt="Allure CV Signatures Logo"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      loading="eager"
      draggable={false}
      onError={e => {
        console.error("BrandLogo: Failed to load logo image at", LOGO_SRC, e);
        setHasError(true);
      }}
    />
  );
};
