import Footer from "@/components/common/Footer";
import NavBar from "@/components/common/NavBar";
import { JetBrains_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: "500" });

const Page = () => {
  return (
    <div className="flex flex-col dark text-white bg-black min-h-screen">
      <section className="h-screen z-10 mb-auto">
        <div className="absolute bg-black h-screen w-full opacity-50 -z-10 md:hidden"></div>
        <NavBar />
        <Image className="-z-50 object-cover" src={"/astronaut.jpg"} alt="hero_bg" fill={true} />
        <div
          className={`max-2xl:px-8 absolute 2xl:right-72 max-2xl:right-0 max-sm:bottom-[10%] sm:top-1/2 2xl:-translate-y-1/2 transform text-right flex flex-col items-end justify-center  ${jetbrainsMono.className}`}
        >
          <h1 className="max-sm:text-3xl sm:text-4xl md:text-5xl ">
            Don't go alone...
            <br />
            Collaborate.
          </h1>
          <h2 className="max-sm:text-xl sm:text-2xl md:text-3xl mt-8 md:mt-20 sm:mt-12">
            Find software projects, <br /> build real experience.
          </h2>
          <Link
            href={"/projects"}
            className={
              "p-4 md:text-opacity-80 hover:text-opacity-100 text-white bg-black mt-8 md:bg-opacity-60 hover:bg-opacity-100"
            }
          >
            Discover projects
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Page;
