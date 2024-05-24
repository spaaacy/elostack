"use client";

import Image from "next/image";
import Link from "next/link";
import { Kanit } from "next/font/google";
import { usePathname } from "next/navigation";
const kanit = Kanit({ subsets: ["latin"], weight: "600" });

const NavBar = () => {
  const pathname = usePathname();
  const showSignIn = pathname !== "/signin" && pathname !== "/signup";

  return (
    <nav className="px-16 py-2 flex items-center justify-start">
      <Link href={"/"} className={`${kanit.className} flex justify-center items-center text-2xl`}>
        <Image src={"/logo.png"} alt={"logo"} width={50} height={50} />
        EloStack
      </Link>
      {showSignIn && (
        <Link
          href={"/signin"}
          className="hover:bg-gray-600 hover:bg-opacity-50 text-gray-200 px-3 py-1 rounded-full ml-auto text-sm"
        >
          Sign In
        </Link>
      )}
    </nav>
  );
};

export default NavBar;
