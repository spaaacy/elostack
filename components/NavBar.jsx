import Image from "next/image";
import Link from "next/link";
import { Kanit } from "next/font/google";

const kanit = Kanit({ subsets: ["latin"], weight: "600" });

const NavBar = () => {
  return (
    <nav className="px-10 py-2 flex items-center justify-start">
      <Link href={"/"} className={`${kanit.className} flex justify-center items-center text-2xl`}>
        <Image src={"/logo.png"} alt={"logo"} width={50} height={50} />
        EloStack
      </Link>
    </nav>
  );
};

export default NavBar;
