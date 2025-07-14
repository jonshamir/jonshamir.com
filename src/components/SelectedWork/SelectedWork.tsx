export function SelectedWork() {
  return (
    <figure className="full-bleed">
      <video
        src="homepage/earth.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          maxWidth: "1000px",
          maxHeight: "500px",
          width: "100%"
        }}
      />
    </figure>
  );
}
