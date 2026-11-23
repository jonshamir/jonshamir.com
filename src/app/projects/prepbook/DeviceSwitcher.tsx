import { FeatherIcon } from "../../../components/FeatherIcon/FeatherIcon";
import styles from "./DeviceSwitcher.module.css";

export type Device = "desktop" | "tablet" | "mobile";
export type Theme = "light" | "dark";

type Option<T> = { value: T; label: string; icon: string };

const DEVICES: Option<Device>[] = [
  { value: "desktop", label: "Desktop", icon: "monitor" },
  { value: "tablet", label: "Tablet", icon: "tablet" },
  { value: "mobile", label: "Mobile", icon: "smartphone" }
];

const THEMES: Option<Theme>[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" }
];

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  onPreview
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  onPreview?: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className={styles.group}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.segment}
          aria-pressed={option.value === value}
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.value)}
          onPointerEnter={() => onPreview?.(option.value)}
          onFocus={() => onPreview?.(option.value)}
        >
          <FeatherIcon iconName={option.icon} />
        </button>
      ))}
    </div>
  );
}

export function DeviceSwitcher({
  device,
  theme,
  onDeviceChange,
  onDevicePreview,
  onThemeChange
}: {
  device: Device;
  theme: Theme;
  onDeviceChange: (device: Device) => void;
  onDevicePreview: (device: Device) => void;
  onThemeChange: (theme: Theme) => void;
}) {
  return (
    <div className={styles.switcher}>
      <Segmented
        label="Device"
        options={DEVICES}
        value={device}
        onChange={onDeviceChange}
        onPreview={onDevicePreview}
      />
      <Segmented
        label="Theme"
        options={THEMES}
        value={theme}
        onChange={onThemeChange}
      />
    </div>
  );
}
