import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EloStack",
  description: "Find programming projects and collaborate",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
      </head>
      <body className={`${inter.className} bg-white`}>{children}</body>
    </html>
  );
}
