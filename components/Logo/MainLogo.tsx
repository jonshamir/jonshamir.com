import styles from "./MainLogo.module.scss";
import { JonLogo } from "./JonLogo";
import { useEffect, useRef, useState } from "react";

export function MainLogo() {
  const logoRef = useRef(null);

  const [isAtTop, setIsAtTop] = useState(false);

  // Scroll listeners
  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Transform calculations
  useEffect(() => {
    const placeholder = document.getElementById("InlineLogoPlaceholder");

    if (placeholder && logoRef.current) {
      const updatePosition = () => {
        if (isAtTop) {
          const placeholderRect = placeholder.getBoundingClientRect();

          const transformX = placeholderRect.left;
          const transformY = placeholderRect.top;

          console.log(transformX, transformY);

          logoRef.current.style.transform = `translate(${transformX}px, ${transformY}px) scale(1)`;
        } else {
          logoRef.current.style.transform = "translate(0, 0) scale(0.5)";
        }
      };

      updatePosition();
    }
  }, [isAtTop]);

  return (
    <div ref={logoRef} className={styles.container}>
      <JonLogo />
    </div>
  );
}
