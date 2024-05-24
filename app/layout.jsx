import { Roboto } from "next/font/google";
import "@/styles/globals.css";

const inter = Roboto({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "EloStack",
  description: "Find programming projects and collaborate",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
