import type { ReactNode } from "react";
import { BasicLayout } from "./basic-layout";
import { MDXTheme } from "../mdx-theme";
import Nav from "../nav";
import { MainLogo } from "../../components/Logo/MainLogo";

export const PageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <BasicLayout>
      <MDXTheme>{children}</MDXTheme>
    </BasicLayout>
  );
};
