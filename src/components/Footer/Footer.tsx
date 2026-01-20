import { SocialLinks } from "../SocialLinks/SocialLinks";

export function Footer() {
  return (
    <footer className="main-grid">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <p>Jon Shamir</p>
        <SocialLinks />
      </div>
    </footer>
  );
}
