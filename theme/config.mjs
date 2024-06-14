const YEAR = new Date().getFullYear();

export default {
  darkMode: true,
  footer: (
    <footer>
      <time>{YEAR}</time>
      {/* <a href="/feed.xml">RSS</a> */}
    </footer>
  ),
};
