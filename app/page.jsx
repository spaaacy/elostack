import NavBar from "@/components/NavBar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <NavBar />
      <div className="flex flex-col justify-center items-center">
        <p className="mx-auto text-lg">Site under construction! Join the community now.</p>
        <Link className="mt-4" href={"https://discord.gg/Re8W4Kp5ae"} target="_blank">
          <Image src={"/discord.png"} alt="discord" width={40} height={40} />
        </Link>
      </div>
    </main>
  );
}
