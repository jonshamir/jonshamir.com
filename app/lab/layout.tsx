export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ height: "4rem" }} />
      {children}
    </>
  );
}
