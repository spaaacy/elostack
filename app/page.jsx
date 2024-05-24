import NavBar from "@/components/NavBar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <div className="flex flex-col justify-center items-center mt-8">
          <p className="mx-auto">Site under construction! Join the community now.</p>
          <Link className="mt-4" href={"https://discord.gg/QQwUVD57"}>
            <Image src={"/discord.png"} alt="discord" width={30} height={30} />
          </Link>
        </div>
      </main>
    </>
  );
}
