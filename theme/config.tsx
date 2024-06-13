const YEAR = new Date().getFullYear();

export default {
  darkMode: true,
  footer: (
    <footer>
      <small>
        <time>{YEAR}</time>
        <a href="/feed.xml">RSS</a>
      </small>
    </footer>
  ),
};
