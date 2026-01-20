import { SocialLinks } from "../SocialLinks/SocialLinks";

export function Footer() {
  return (
    <footer className="grid">
      <div
        className="grid-wide"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <p>Jon Shamir</p>
        <SocialLinks />
      </div>
    </footer>
  );
}
