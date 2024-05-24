import Footer from "@/components/common/Footer";
import NavBar from "@/components/common/NavBar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <main>
        <div className="flex flex-col justify-center items-center mt-8 flex-1">
          <p className="mx-auto">Site under construction! Join the community now.</p>
          <Link className="mt-4" href={"https://discord.gg/Re8W4Kp5ae"} target="_blank">
            <Image src={"/discord.png"} alt="discord" width={30} height={30} />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
