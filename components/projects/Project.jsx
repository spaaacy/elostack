"use client";

import { useParams } from "next/navigation";
import NavBar from "../common/NavBar";
import Footer from "../common/Footer";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { FaGithub } from "react-icons/fa";
import { formatDuration } from "@/utils/formatDuration";

const Project = () => {
  const projectId = useParams();
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <main>
        <div className="flex justify-start items-center">
          <Link href={"/projects"}>
            <IoMdArrowBack className="text-3xl" />
          </Link>
          <h1 className="ml-4 font-bold text-2xl">{project.title}</h1>
          <Link href={project.github} target="_blank">
            <FaGithub className="ml-4 text-3xl" />
          </Link>
        </div>
        <p className="ml-12 font-light ">{project.status}</p>
        <hr className="border-0 h-[1px] bg-gray-400 mt-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 mt-8">
          <div>
            <div className="p-2 rounded border bg-gray-900 bg-opacity-50 border-gray-400 flex flex-col font-light text-sm ">
              <p>
                <span className="font-semibold ">Description</span>
                <br />
                {project.description}
              </p>
              <p className="mt-4 font-semibold">Members</p>
              <ul>
                <Link href={"/"} className="hover:underline ">{`${project.leader} (Leader)`}</Link>
                {project.members
                  .filter((member) => member !== project.leader)
                  .map((member, i) => {
                    return (
                      <li key={i}>
                        <Link href={"/"} className="hover:underline ">
                          {member}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
              <p className="mt-4 font-semibold">Technologies</p>
              <p>{project.technology.map((t, i) => (i === project.technology.length - 1 ? t : `${t}, `))}</p>
              <p className="text-orangeaccent mt-4">
                {`Duration: ${formatDuration(project.duration_length, project.duration_type)}`}
              </p>
            </div>
          </div>
          <div className="sm:ml-4 max-sm:mt-4 sm:col-span-2 lg:col-span-4 ">
            <div
              id="scrollableDiv"
              className="h-[600px]  p-4 rounded border bg-gray-900 bg-opacity-50 border-gray-400 flex flex-col items-start justify-start overflow-y-auto"
            >
              {chat.map((message, i) => {
                return (
                  <div
                    className={`px-3 py-2 rounded-lg bg-gray-700 bg-opacity-50 mb-4 ${
                      message.username === "Alice" ? "self-end text-right" : ""
                    }`}
                  >
                    <p key={i} className="text-sm">
                      <Link href={"/"} className="font-semibold hover:underline ">{`${message.username}`}</Link>
                      <br />
                      {message.message}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 justify-center mt-2">
              <input
                type="text"
                placeholder="Send a message..."
                className="w-full text-sm p-2 rounded border bg-gray-900 bg-opacity-50 focus:bg-gray-800 border-gray-400"
              />
              <button className="rounded-full px-3 py-2 bg-orangeaccent text-sm hover:bg-orangedark">Send</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Project;

const project = {
  id: 15,
  title: "AI-powered Language Translation",
  description: "Develop an intelligent language translation system using artificial intelligence",
  members: ["Daniel Valencia", "Ava Beltran", "Isabella Vega", "Ethan Sandoval"],
  duration_length: 16,
  duration_type: "week",
  team_size: 8,
  status: "In Progress",
  leader: "Ethan Sandoval",
  technology: ["Python", "TensorFlow", "Natural Language Processing"],
  github: "https://github.com/spaaacy/elostack",
};

const chat = [
  {
    username: "Alice",
    message: "Hi everyone! Ready to discuss the AI language translation project?",
    created_at: "2024-04-31 09:00",
  },
  {
    username: "Bob",
    message: "Yes, I am here. Let's get started.",
    created_at: "2024-04-31 09:02",
  },
  {
    username: "Charlie",
    message: "Morning! Excited to dive into this.",
    created_at: "2024-04-31 09:03",
  },
  {
    username: "Dave",
    message: "Hey all! Ready when you are.",
    created_at: "2024-04-31 09:04",
  },
  {
    username: "Alice",
    message: "Great! First, we need to finalize the languages we want to support. Any suggestions?",
    created_at: "2024-04-31 09:05",
  },
  {
    username: "Bob",
    message: "We should definitely include Spanish, French, and Mandarin.",
    created_at: "2024-04-31 09:06",
  },
  {
    username: "Charlie",
    message: "Agreed. I'd also add German and Japanese.",
    created_at: "2024-04-31 09:07",
  },
  {
    username: "Dave",
    message: "What about Arabic and Hindi? Those are widely spoken too.",
    created_at: "2024-04-31 09:08",
  },
  {
    username: "Alice",
    message:
      "Sounds like a solid list. Now, let's talk about the translation model. Should we use a pre-trained model or develop our own?",
    created_at: "2024-04-31 09:10",
  },
  {
    username: "Bob",
    message: "Using a pre-trained model could save us a lot of time and resources.",
    created_at: "2024-04-31 09:12",
  },
  {
    username: "Charlie",
    message: "True, but developing our own might give us more control and better accuracy for specific use cases.",
    created_at: "2024-04-31 09:13",
  },
  {
    username: "Dave",
    message: "Why not a hybrid approach? Use a pre-trained model and fine-tune it for our needs.",
    created_at: "2024-04-31 09:14",
  },
  {
    username: "Alice",
    message: "I like the hybrid approach. Let's do some research on the best pre-trained models available.",
    created_at: "2024-04-31 09:15",
  },
  {
    username: "Bob",
    message: "I'll look into models from OpenAI and Google.",
    created_at: "2024-04-31 09:16",
  },
  {
    username: "Charlie",
    message: "I'll check out some academic papers on recent advancements.",
    created_at: "2024-04-31 09:17",
  },
  {
    username: "Dave",
    message: "And I'll review some open-source projects on GitHub.",
    created_at: "2024-04-31 09:18",
  },
  {
    username: "Alice",
    message: "Perfect. Let's reconvene tomorrow at the same time to discuss our findings.",
    created_at: "2024-04-31 09:20",
  },
  {
    username: "Bob",
    message: "Sounds good. See you all tomorrow!",
    created_at: "2024-04-31 09:21",
  },
  {
    username: "Charlie",
    message: "Later everyone!",
    created_at: "2024-04-31 09:22",
  },
  {
    username: "Dave",
    message: "Bye!",
    created_at: "2024-04-31 09:23",
  },
  {
    username: "Alice",
    message: "Morning! Ready to discuss our findings?",
    created_at: "2024-05-01 09:00",
  },
  {
    username: "Bob",
    message: "Morning! I found some interesting models from OpenAI and Google that we could use.",
    created_at: "2024-05-01 09:02",
  },
  {
    username: "Charlie",
    message: "I came across some promising research papers. One in particular focused on low-resource language pairs.",
    created_at: "2024-05-01 09:03",
  },
  {
    username: "Dave",
    message: "I found a few open-source projects that could be useful for our customization needs.",
    created_at: "2024-05-01 09:04",
  },
  {
    username: "Alice",
    message: "Excellent. Let's compile our findings and start drafting a plan for the hybrid model.",
    created_at: "2024-05-01 09:05",
  },
  {
    username: "Bob",
    message: "I'll start a document where we can add our notes and references.",
    created_at: "2024-05-01 09:06",
  },
  {
    username: "Charlie",
    message: "Good idea. I'll add my research papers to the document.",
    created_at: "2024-05-01 09:07",
  },
  {
    username: "Dave",
    message: "And I'll list the open-source projects with brief descriptions.",
    created_at: "2024-05-01 09:08",
  },
  {
    username: "Alice",
    message: "Thanks, everyone. Let's aim to have a draft ready by the end of the week.",
    created_at: "2024-05-01 09:10",
  },
  {
    username: "Bob",
    message: "Got it. Talk to you all soon!",
    created_at: "2024-05-01 09:11",
  },
  {
    username: "Charlie",
    message: "See you later!",
    created_at: "2024-05-01 09:12",
  },
  {
    username: "Dave",
    message: "Bye for now!",
    created_at: "2024-05-01 09:13",
  },
];
