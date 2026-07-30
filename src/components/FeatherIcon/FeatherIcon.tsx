import styles from "./FeatherIcon.module.css";

interface FeatherIconProps {
  iconName: string;
  size?: number;
  className?: string;
}

export const FeatherIcon = ({
  iconName,
  size = 16,
  className = ""
}: FeatherIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      className={`${styles.featherIcon} ${className}`.trim()}
    >
      <use href={`#${iconName}`} />
    </svg>
  );
};
