"use client";

import { useState } from "react";

import { Button } from "../../../components/Button";
import { FeatherIcon } from "../../../components/FeatherIcon/FeatherIcon";
import { copyToClipboard } from "../../../utils/copyToClipboard";

interface CopyButtonProps {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const copy = () => {
    copyToClipboard(text);
    setIsCopied(true);
    setShowCheckmark(true);
    setTimeout(() => setIsCopied(false), 3000);
    setTimeout(() => setShowCheckmark(false), 3500);
  };

  return (
    <Button
      className="copy-button"
      disabled={isCopied}
      onClick={copy}
      aria-label={isCopied ? "Copied!" : "Copy code"}
    >
      {showCheckmark ? (
        <FeatherIcon iconName="check" size={16} />
      ) : (
        <FeatherIcon iconName="copy" size={16} />
      )}
    </Button>
  );
};
