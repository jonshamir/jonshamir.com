import clsx from "clsx";

import { SocialLinks } from "../SocialLinks/SocialLinks";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={clsx(styles.Footer, "grid")}>
      <div
        className="grid-wide"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <p>Jon Shamir</p>
        <SocialLinks iconsOnly style={{ flexDirection: "row" }} />
      </div>
    </footer>
  );
}
