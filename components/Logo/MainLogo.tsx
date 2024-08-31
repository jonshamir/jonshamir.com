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

          logoRef.current.style.transform = `translate(${transformX}px, ${transformY}px) scale(1)`;
        } else {
          logoRef.current.style.transform = "translate(1rem, 0) scale(0.5)";
        }
      };

      window.addEventListener("resize", updatePosition);
      updatePosition();

      return () => {
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isAtTop]);

  return (
    <div ref={logoRef} className={styles.container}>
      <svg viewBox="0 0 87.84 147.1">
        <path d="M69.52,50.07c.07.07.18.07.24,0l.12-.12c8.86-8.86,8.86-23.21,0-32.07l-11.24-11.24c-8.86-8.86-23.21-8.86-32.07,0l-.12.12c-.07.07-.07.18,0,.24l43.07,43.07ZM73.42,84.38L10.76,21.72l-.24.24c-8.86,8.86-8.86,23.21,0,32.07l59.77,59.77,2.89,2.89.24-.24c8.86-8.86,8.86-23.21,0-32.07ZM7.07,81.84l-.43.43c-8.86,8.86-8.86,23.21,0,32.07l18.41,18.41c8.86,8.86,23.21,8.86,32.07,0l.43-.43-2.89-2.89L7.07,81.84Z" />
      </svg>
    </div>
  );
}
