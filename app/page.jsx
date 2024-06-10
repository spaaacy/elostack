const kanit = Kanit({ subsets: ["latin"], weight: "600" });
import Image from "next/image";
import { Kanit } from "next/font/google";

const Page = () => {
  return (
    <main>
      <div className="flex justify-center items-center flex-col">
        <div className="flex items-center">
          <Image src={"/logo_black.png"} className="inline" alt={"logo"} width={50} height={50} />
          <p className={`${kanit.className} text-2xl inline`}>EloStack</p>
        </div>
        <h1>The site is currently under maintenence. We're sorry for the inconvenience. 😓</h1>
      </div>
    </main>
  );
};

export default Page;
