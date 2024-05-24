"use client";

import Image from "next/image";
import Link from "next/link";
import { Kanit } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/utils/supabase";
const kanit = Kanit({ subsets: ["latin"], weight: "600" });

const NavBar = () => {
  const { session } = useContext(UserContext);
  const router = useRouter();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      location.reload(); // Refresh the page to update the session state
      router.push("/"); // Refresh the page to update the session state
    } catch (error) {
      console.error(error);
    }
  };

  const pathname = usePathname();
  const showSignIn = pathname !== "/signin" && pathname !== "/signup";

  return (
    <nav className="px-16 py-2 flex items-center justify-start">
      <Link href={"/"} className={`${kanit.className} flex justify-center items-center text-2xl`}>
        <Image src={"/logo.png"} alt={"logo"} width={50} height={50} />
        EloStack
      </Link>
      {showSignIn &&
        (session?.data.session ? (
          <button
            onClick={signOut}
            className="hover:bg-gray-600 hover:bg-opacity-50 text-gray-200 px-3 py-1 rounded-full ml-auto text-sm"
          >
            Log out
          </button>
        ) : (
          <Link
            href={"/signin"}
            className="hover:bg-gray-600 hover:bg-opacity-50 text-gray-200 px-3 py-1 rounded-full ml-auto text-sm"
          >
            Sign In
          </Link>
        ))}
    </nav>
  );
};

export default NavBar;
