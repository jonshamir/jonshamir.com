"use client";

import { useState } from "react";

import { FeatherIcon } from "../../../components/FeatherIcon/FeatherIcon";

interface CopyButtonProps {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <button
      className="copy-button"
      disabled={isCopied}
      onClick={copy}
      aria-label={isCopied ? "Copied!" : "Copy code to clipboard"}
    >
      {isCopied ? (
        <FeatherIcon iconName="check" size={16} />
      ) : (
        <FeatherIcon iconName="copy" size={16} />
      )}
    </button>
  );
};
