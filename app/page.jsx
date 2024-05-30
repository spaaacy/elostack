import Footer from "@/components/common/Footer";
import NavBar from "@/components/common/NavBar";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <main>
        <div className="flex flex-col justify-center items-center mt-8 flex-1">
          <p className="mx-auto">Coming soon. Checkout our Discord community.</p>
          <Link className="mt-4" href={"https://discord.gg/Re8W4Kp5ae"} target="_blank">
            <FaDiscord className="text-3xl " />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
