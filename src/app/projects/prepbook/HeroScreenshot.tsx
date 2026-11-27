import { clsx } from "clsx";
import { getImageProps, type StaticImageData } from "next/image";
import {
  type CSSProperties,
  useRef,
  useState,
  useSyncExternalStore
} from "react";

import { type Device, DeviceSwitcher, type Theme } from "./DeviceSwitcher";
import styles from "./HeroScreenshot.module.css";
import desktopDark from "./screenshots/desktop-dark.png";
import desktopLight from "./screenshots/desktop-light.png";
import mobileDark from "./screenshots/mobile-dark.jpg";
import mobileLight from "./screenshots/mobile-light.jpg";
import tabletDark from "./screenshots/tablet-dark.jpg";
import tabletLight from "./screenshots/tablet-light.jpg";

const ALT = "A recipe in Prepbook";

const MOBILE_QUERY = "(max-width: 30rem)";
const TABLET_QUERY = "(max-width: 48rem)";

type Shots = Record<Device, StaticImageData>;

const SHOTS: Record<Theme, Shots> = {
  dark: { desktop: desktopDark, tablet: tabletDark, mobile: mobileDark },
  light: { desktop: desktopLight, tablet: tabletLight, mobile: mobileLight }
};

function ratio(image: StaticImageData) {
  return `${image.width} / ${image.height}`;
}

function preload(device: Device) {
  return Promise.all(
    [SHOTS.dark[device], SHOTS.light[device]].map((image) => {
      const img = new window.Image();
      img.src = image.src;
      return img.decode().catch(() => undefined);
    })
  );
}

function subscribeViewport(onChange: () => void) {
  const queries = [MOBILE_QUERY, TABLET_QUERY].map((q) => window.matchMedia(q));
  queries.forEach((mql) => mql.addEventListener("change", onChange));
  return () =>
    queries.forEach((mql) => mql.removeEventListener("change", onChange));
}

function getViewportDevice(): Device {
  if (window.matchMedia(MOBILE_QUERY).matches) return "mobile";
  if (window.matchMedia(TABLET_QUERY).matches) return "tablet";
  return "desktop";
}

function subscribeSiteTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"]
  });
  return () => observer.disconnect();
}

function getSiteTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function sourceProps(src: StaticImageData) {
  const { props } = getImageProps({ src, alt: "" });
  return {
    srcSet: props.srcSet ?? props.src,
    width: props.width,
    height: props.height
  };
}

function Screenshot({
  shots,
  device,
  className,
  alt
}: {
  shots: Shots;
  device: Device | null;
  className?: string;
  alt: string;
}) {
  const { props: img } = getImageProps({
    src: shots[device ?? "desktop"],
    alt,
    loading: "lazy"
  });

  return (
    <picture className={clsx(styles.picture, className)}>
      {device === null && (
        <>
          <source media={MOBILE_QUERY} {...sourceProps(shots.mobile)} />
          <source media={TABLET_QUERY} {...sourceProps(shots.tablet)} />
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img} />
    </picture>
  );
}

export function HeroScreenshot() {
  const viewportDevice = useSyncExternalStore(
    subscribeViewport,
    getViewportDevice,
    (): Device => "desktop"
  );
  const siteTheme = useSyncExternalStore(
    subscribeSiteTheme,
    getSiteTheme,
    (): Theme => "light"
  );
  const [deviceOverride, setDeviceOverride] = useState<Device | null>(null);
  const [shownOverride, setShownOverride] = useState<Device | null>(null);
  const [themeOverride, setThemeOverride] = useState<Theme | null>(null);
  const latestRequest = useRef(0);

  const chooseDevice = (next: Device) => {
    setDeviceOverride(next);
    const request = ++latestRequest.current;
    void preload(next).then(() => {
      if (request === latestRequest.current) setShownOverride(next);
    });
  };

  const device = deviceOverride ?? viewportDevice;
  const theme = themeOverride ?? (siteTheme === "dark" ? "light" : "dark");
  const shownDevice = shownOverride ?? viewportDevice;
  const manualDevice = shownDevice === viewportDevice ? null : shownDevice;

  const stackStyle = {
    "--desktop-ratio": ratio(SHOTS.dark.desktop)
  } as CSSProperties;

  return (
    <div className={styles.hero}>
      <div
        className={clsx(styles.stack, manualDevice === null && styles.native)}
        data-device={manualDevice ?? undefined}
        data-theme={themeOverride ?? undefined}
        style={stackStyle}
      >
        <Screenshot alt={ALT} shots={SHOTS.dark} device={manualDevice} />
        <Screenshot
          className={styles.lightShots}
          alt=""
          shots={SHOTS.light}
          device={manualDevice}
        />
      </div>
      <DeviceSwitcher
        device={device}
        theme={theme}
        onDeviceChange={chooseDevice}
        onDevicePreview={(next) => void preload(next)}
        onThemeChange={setThemeOverride}
      />
    </div>
  );
}
