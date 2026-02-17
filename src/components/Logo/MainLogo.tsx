import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import styles from "./MainLogo.module.css";

export function MainLogo({
  parentRef
}: {
  parentRef: React.RefObject<HTMLElement | null>;
}) {
  const logoRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const [isAtTop, setIsAtTop] = useState(false);

  // Scroll listeners
  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Transform calculations
  useEffect(() => {
    if (!logoRef.current) return;

    const placeholder = document.getElementById("InlineLogoPlaceholder");

    if (placeholder && parentRef.current) {
      const updatePosition = () => {
        if (logoRef.current === null) return;

        if (pathname === "/" && isAtTop && parentRef.current) {
          const parentRect = parentRef.current.getBoundingClientRect();
          const placeholderRect = placeholder.getBoundingClientRect();

          const transformX = placeholderRect.left - parentRect.left;
          const transformY = placeholderRect.top - parentRect.top;

          logoRef.current.style.transform = `translate(${transformX}px, ${transformY}px) scale(2)`;
        } else {
          logoRef.current.style.transform = "none";
        }
      };

      window.addEventListener("resize", updatePosition);
      updatePosition();

      return () => {
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      logoRef.current.style.transform = "none";
    }
  }, [isAtTop, parentRef, pathname]);

  return (
    <div ref={logoRef} className={clsx(styles.MainLogo)}>
      <svg viewBox="0 0 104.07 163.39">
        <path d="M81.89,61.95c8.86-8.86,8.86-23.21,0-32.07l-11.24-11.24c-8.86-8.86-23.21-8.86-32.07,0l-.12.12,43.31,43.31.12-.12ZM85.43,96.38L22.77,33.72l-.24.24c-8.86,8.86-8.86,23.21,0,32.07l59.77,59.77,2.89,2.89.24-.24c8.86-8.86,8.86-23.21,0-32.07ZM18.65,94.27c-8.86,8.86-8.86,23.21,0,32.07l18.41,18.41c8.86,8.86,23.21,8.86,32.07,0l.43-.43-50.48-50.48-.43.43Z" />
      </svg>
    </div>
  );
}
