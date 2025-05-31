type OutlinkProps = {
  href: string;
  children: React.ReactNode;
};

export const Outlink = ({ href, children }: OutlinkProps) => (
  <a href={href} target="_blank" className="outlink" rel="noreferrer">
    {children}
  </a>
);
