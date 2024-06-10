"use client";

import Footer from "@/components/common/Footer";
import NavBar from "@/components/navbar/NavBar";
import { Cormorant, JetBrains_Mono, Kanit, Montserrat, Pixelify_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: "500" });
const cormorant = Cormorant({ subsets: ["latin"], weight: "500" });
const montserrat = Montserrat({ subsets: ["latin"], weight: "500" });
const kanit = Kanit({ subsets: ["latin"], weight: "600" });

const LandingPage = () => {
  const sectionRef = useRef(null);
  const projectRef = useRef(null);
  const [isCursorInside, setIsCursorInside] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const div = projectRef.current;
      if (div) {
        const rect = div.getBoundingClientRect();
        const section = sectionRef.current.getBoundingClientRect();

        const sectionX = e.clientX - section.left;
        const sectionY = e.clientY - section.top;

        const isInsideDiv = sectionX >= 0 && sectionX <= section.width && sectionY >= 0 && sectionY <= section.height;

        if (isInsideDiv !== isCursorInside) {
          setIsCursorInside(isInsideDiv);
        }

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (isInsideDiv) {
          const xRotation = (5 * (y - rect.height / 2)) / rect.height; // Reduced from 20 to 10
          const yRotation = (5 * (rect.width / 2 - x)) / rect.width; // Reduced from 20 to 10
          div.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
        } else {
          div.style.transform = "none";
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isCursorInside]);

  return (
    <div className="flex flex-col ">
      <section className="h-[calc(100dvh)] z-10 relative">
        <div className="absolute bg-black h-full w-full opacity-30 -z-40 md:hidden"></div>
        <NavBar />
        <Image className="-z-50 object-cover h-full" src={"/astronaut.jpg"} alt="hero_bg" fill={true} unoptimized />
        <div className="absolute bottom-0 left-0 h-1/3 w-full -z-40 bg-gradient-to-b from-transparent to-black"></div>
        <div
          className={`text-white max-2xl:px-8 absolute 2xl:right-72 max-2xl:right-0 max-sm:bottom-[10%] sm:top-1/2 2xl:-translate-y-1/2 transform text-right flex flex-col items-end justify-center  ${jetbrainsMono.className}`}
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
              "p-4 md:text-opacity-90 hover:text-opacity-100 text-black bg-white mt-8 md:bg-opacity-90 hover:bg-opacity-100"
            }
          >
            Discover projects
          </Link>
        </div>
      </section>

      <div className=" bg-gradient-to-t to-slate-600 from-backgroundlight dark:to-slate-700 dark:from-backgrounddark relative">
        <div className="absolute top-0 left-0 h-[200px] w-full z-60 bg-gradient-to-t from-transparent to-black"></div>
        {/* <div className="absolute bottom-0 left-0 h-1/6 w-full z-40 bg-gradient-to-b  from-transparent to-black"></div> */}
        <section ref={sectionRef} className="z-10 py-24 sm:py-32 lg:py-48 mt-32">
          <div className="flex flex-col lg:flex-row gap-20 sm:gap-32 lg:gap-44  items-center justify-center w-3/4 text-left mx-auto ">
            <div
              ref={projectRef}
              className="p-2 flex flex-col rounded text-xs font-light tilting gradient-purple text-[#ececec] select-none max-w-96"
            >
              <div className="flex flex-col justify-start items-start">
                <h3 className="text-base font-medium">Multiplayer Retro Gaming Hub</h3>
                <div className="flex items-baseline gap-2 bg-text-[#ececec] flex-wrap w-full">
                  <p className=" flex-shrink-0 text-right mt-1 py-1 rounded-full">In progress</p>
                  <p className={"mt-1 py-1 rounded-full ml-2 flex-shrink-0"}>Open</p>
                  <p className="ml-auto   flex-shrink-0">{`Leader: Alice`}</p>
                </div>
              </div>
              <p className="text-sm mt-2 line-clamp-4 ">
                A website that provides a platform for playing classic video games online with friends. Users can choose
                from a library of emulated games, create rooms to play in, and chat with other players. The website will
                also include features like leaderboards, achievements, and user profiles.
              </p>
              <p className="  mt-2">{"Team 4/5"}</p>
              <div className="flex justify-between items-center pt-1">
                <p className=" ">{"3 weeks"}</p>
              </div>
            </div>

            <div className="lg:w-1/2 text-white">
              <h4 className={`text-4xl ${montserrat.className}`}>
                What is <span className={`${kanit.className}`}>EloStack</span>?
              </h4>
              <p>
                EloStack is your hub to discover and venture on new projects in your journey to programming mastery.
                Built with learners in mind, our goal is to build a community around personal projects. Whether you're
                looking to dig into long-term projects or simply work on something on the side, EloStack is there to
                accomodate all your needs. We value real-world experience over raw time spent writing code, and want to
                best prepare you for working in teams. Create great projects and build a better portfolio, and escape
                the lonesome world of personal projects.
              </p>
            </div>
          </div>
        </section>

        <section className="h-[540px] z-10 relative">
          <div className="absolute h-full w-full opacity-50 -z-10 "></div>

          {/* <div className="absolute top-0 left-0 h-1/3 w-full -z-40 bg-gradient-to-t  from-transparent to-black"></div> */}
          {/* <div className="absolute bottom-0 left-0 h-1/6 w-full -z-40 bg-gradient-to-b  from-transparent to-black"></div> */}
          <div
            className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center  w-full  ${cormorant.className}`}
          >
            <div className="max-sm:h-72 h-1/3 w-3/4 xl:w-1/2 flex flex-col justify-center items-center py-16  px-8 relative rounded text-white">
              <Image className="-z-50 object-cover rounded-[20px]" src={"/wormhole.jpg"} alt="wormhole" fill={true} />
              <div className="absolute top-0 bottom-0 h-full w-full opacity-50 -z-40 bg-black rounded-[20px]"></div>
              <h3 className="max-sm:text-2xl sm:text-4xl md:text-5xl">No ideas? No problem.</h3>

              <p className={"max-sm:text-xl sm:text-3xl md:text-4xl mt-4 sm:mt-6 md:mt-8"}>
                Generate a{" "}
                <TypeAnimation
                  sequence={[
                    "Full-Stack Website",
                    1000,
                    "Game Development",
                    1000,
                    "Mobile App",
                    1000,
                    "Machine Learning",
                    1000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />{" "}
                Idea.
              </p>
              <Link
                target="_blank"
                href={"/create-project"}
                className="text-center dark:bg-black bg-neutral-100 hover:border-white border-transparent hover:bg-black dark:hover:bg-white border-2 py-2 px-4 text-xl mt-8 hover:text-white dark:hover:text-black  dark:text-white text-black dark:border-white transition duration-200 font-semibold"
              >
                Try now
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 px-14 relative mb-36">
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-16 2xl:gap-24 items-center justify-center xl:w-3/4 mx-auto ">
            <div className={`text-left lg:text-right flex flex-col justify-center ${montserrat.className} lg:order-2`}>
              <h4 className={"text-3xl font-bold"}>Built-in chat for all your communication needs</h4>
              <p className="max-sm:mr-auto lg:ml-auto">Discuss features and make decisions</p>
            </div>
            <div className="flex flex-col justify-center items-start select-none lg:order-1">
              {[
                { username: "Alex", message: "Hey Jamie, let's discuss new features." },
                { username: "Jamie", message: "Sure, what's up?" },
                { username: "Alex", message: "We need user authentication." },
                { username: "Jamie", message: "OAuth or something else?" },
                { username: "Alex", message: "OAuth is best." },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`${
                    m.username === "Alex" ? "" : "text-right self-end"
                  } px-3 py-2 rounded-lg bg-[#f1f1f1] text-black mb-4 text-sm`}
                >
                  <p key={i}>
                    <span className="font-semibold ">{m.username}</span>
                    <br />
                    {m.message}
                    <br />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className={`px-12 text-center py-32 flex flex-col items-center justify-center ${cormorant.className} `}>
        <p className="text-2xl md:text-3xl lg:text-4xl">Have something to say? We'd love to hear it!</p>
        <Link
                className="text-center dark:bg-black bg-neutral-100 hover:bg-black dark:hover:bg-white border-2 py-2 px-4 text-xl mt-8 hover:text-white dark:hover:text-black  dark:text-white text-black dark:border-white border-black transition duration-200 font-semibold"
          target="_blank"
          href={"mailto:aakifmohamed@elostack.com"}
        >
          Contact Us
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
