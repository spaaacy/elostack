"use client";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

export const Providers = (props) => {
  const pathname = usePathname();
  const forcedThemeFromPathname = pathname === "/" ? undefined : undefined;

  return (
    <ThemeProvider attribute="class" forcedTheme={forcedThemeFromPathname}>
      {props.children}
    </ThemeProvider>
  );
};
