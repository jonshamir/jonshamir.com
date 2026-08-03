import { PostList } from "../../components/PostList/PostList";

export default function Page() {
  return (
    <>
      <h1>Writing</h1>
      <p>
        I try post every once in a while about stuff that I find interesting -
        design, web, 3D graphics, interaction and more.
      </p>
      <PostList />
    </>
  );
}
