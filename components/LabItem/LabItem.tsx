import Link from "next/link";

import styles from "./LabItem.module.scss";

type Props = { image: string; title: string; link: string };

export default function LabItem({ image, title, link, ...rest }: Props) {
  return (
    <div className={styles.LabItem} {...rest}>
      <h3>
        <Link href={link} passHref legacyBehavior>
          <a>
            {image && <img src={image} />}
            <span>{title}</span>
          </a>
        </Link>
      </h3>
    </div>
  );
}
