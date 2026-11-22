import { clsx } from "clsx";
import { getImageProps, type StaticImageData } from "next/image";

import styles from "./HeroScreenshot.module.css";
import desktopDark from "./screenshots/desktop-dark.png";
import desktopLight from "./screenshots/desktop-light.png";
import mobileDark from "./screenshots/mobile-dark.jpg";
import mobileLight from "./screenshots/mobile-light.jpg";
import tabletDark from "./screenshots/tablet-dark.jpg";
import tabletLight from "./screenshots/tablet-light.jpg";

const ALT = "A recipe in Prepbook";

type Shots = {
  desktop: StaticImageData;
  tablet: StaticImageData;
  mobile: StaticImageData;
};

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
  className,
  alt
}: {
  shots: Shots;
  className: string;
  alt: string;
}) {
  const { props: img } = getImageProps({
    src: shots.desktop,
    alt,
    loading: "lazy"
  });

  return (
    <picture className={clsx(styles.picture, className)}>
      <source media="(max-width: 40rem)" {...sourceProps(shots.mobile)} />
      <source media="(max-width: 54rem)" {...sourceProps(shots.tablet)} />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img} />
    </picture>
  );
}

export function HeroScreenshot() {
  return (
    <div className={styles.stack}>
      <Screenshot
        className={styles.forLightSite}
        alt={ALT}
        shots={{ desktop: desktopDark, tablet: tabletDark, mobile: mobileDark }}
      />
      <Screenshot
        className={styles.forDarkSite}
        alt=""
        shots={{
          desktop: desktopLight,
          tablet: tabletLight,
          mobile: mobileLight
        }}
      />
    </div>
  );
}
