import styles from "./MainLogo.module.scss";
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
      <svg viewBox="0 0 104.07 163.39">
        <path
          className={styles.logoBackground}
          d="M54.61,0c-9.26,0-17.97,3.61-24.52,10.16l-16.06,15.32c-13.52,13.52-13.52,35.52,0,49.04h0c2.04,2.04,2.04,5.35,0,7.39l-3.88,3.88c-13.54,13.54-13.54,35.5,0,49.04l17.94,17.94c6.5,6.5,15.22,10.47,24.41,10.62s18.42-3.46,25.1-10.15l15.83-15.83c6.5-6.5,10.47-15.22,10.62-24.41s-3.47-18.42-10.15-25.1l-6.49-6.49c-2.21-2.21-2.21-5.8,0-8.02l2.95-2.95c13.54-13.54,13.54-35.5,0-49.04l-11.24-11.24C72.58,3.61,63.87,0,54.61,0h0Z"
        />
        <path d="M81.89,61.95c8.86-8.86,8.86-23.21,0-32.07l-11.24-11.24c-8.86-8.86-23.21-8.86-32.07,0l-.12.12,43.31,43.31.12-.12ZM85.43,96.38L22.77,33.72l-.24.24c-8.86,8.86-8.86,23.21,0,32.07l59.77,59.77,2.89,2.89.24-.24c8.86-8.86,8.86-23.21,0-32.07ZM18.65,94.27c-8.86,8.86-8.86,23.21,0,32.07l18.41,18.41c8.86,8.86,23.21,8.86,32.07,0l.43-.43-50.48-50.48-.43.43Z" />
      </svg>
    </div>
  );
}
