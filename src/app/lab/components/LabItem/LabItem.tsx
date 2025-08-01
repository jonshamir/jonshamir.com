import Link from "next/link";

import styles from "./LabItem.module.scss";

type Props = { image: string; title: string; link: string };

export default function LabItem({ image, title, link, ...rest }: Props) {
  return (
    <div className={styles.LabItem} {...rest}>
      <Link href={link}>
        <span>{title}</span>
        {image && <img src={image} alt={title} />}
      </Link>
    </div>
  );
}
