import "./FeatherIcon.css";

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
    <svg width={size} height={size} className={`feather-icon ${className}`}>
      <use href={`#${iconName}`} />
    </svg>
  );
};
