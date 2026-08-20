import { clsx } from "clsx";

import { PostList } from "../../components/PostList/PostList";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={clsx("canvas", "flow")}>
      <h1>Writing</h1>
      <p className={styles.intro}>
        I try post every once in a while about stuff that I find interesting -
        design, web, 3D graphics, interaction and more.
      </p>
      <PostList wide />
    </div>
  );
}
