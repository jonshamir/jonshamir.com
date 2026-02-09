import Link from "next/link";

import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "opaque" | "primary";
  text?: string;
  children?: React.ReactNode;
  round?: boolean;
}

export const Button = ({
  variant = "default",
  text,
  children,
  className,
  round = false,
  style,
  ...props
}: ButtonProps) => {
  const classes = [
    "clickable",
    styles.button,
    styles[variant],
    round && styles.round,
    className,
    style
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} style={style} {...props}>
      {children ?? text}
    </button>
  );
};

interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "opaque" | "primary";
  text?: string;
  href: string;
  children?: React.ReactNode;
  round?: boolean;
}

export const ButtonLink = ({
  variant = "default",
  text,
  href,
  children,
  className,
  round = false,
  style,
  ...props
}: ButtonLinkProps) => {
  const classes = [
    "clickable",
    styles.button,
    styles[variant],
    round && styles.round,
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={classes} style={style} {...props}>
      {children ?? text}
    </Link>
  );
};
