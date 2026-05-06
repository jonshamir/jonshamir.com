declare module "torph/react" {
  import type * as React from "react";

  export type SpringParams = {
    stiffness?: number;
    damping?: number;
    mass?: number;
    precision?: number;
  };

  export type TextMorphProps = {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    as?: React.ElementType;
    debug?: boolean;
    locale?: Intl.LocalesArgument;
    scale?: boolean;
    duration?: number;
    ease?: string | SpringParams;
    disabled?: boolean;
    respectReducedMotion?: boolean;
    onAnimationStart?: () => void;
    onAnimationComplete?: () => void;
  };

  export const TextMorph: React.FC<TextMorphProps>;

  export function useTextMorph(opts?: {
    duration?: number;
    ease?: string | SpringParams;
  }): {
    ref: React.RefObject<HTMLElement>;
    update: (text: string) => void;
  };
}
