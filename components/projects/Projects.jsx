"use client";

import Link from "next/link";
import Footer from "../common/Footer";
import NavBar from "../common/NavBar";
import { formatDuration } from "@/utils/formatDuration";
import { FaCircleInfo } from "react-icons/fa6";
import { useEffect, useState } from "react";

const Projects = () => {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("");

  useEffect(() => {
    console.log({ searchInput, statusInput });
    const filteredProjects = projects.filter(
      (project) =>
        (statusInput === "" ? true : project.status.toLowerCase() === statusInput) &&
        (searchInput === ""
          ? true
          : project.title.toLowerCase().includes(searchInput) ||
            project.description.toLowerCase().includes(searchInput))
    );

    setFilteredProjects(filteredProjects);
  }, [searchInput, statusInput]);

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <main className="mx-auto w-full lg:max-w-[1260px] py-4 px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Find Projects</h1>
          <button className="px-2 py-1 bg-orangeaccent hover:bg-orangedark rounded-full text-sm hover:text-gray-300 shadow shadow-black">
            Create a project
          </button>
        </div>
        <hr className="border-0 h-[1px] bg-gray-400 mt-8" />
        <div className="mt-4 flex items-center justify-between gap-2">
          <input
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={"Search..."}
            type="text"
            className="w-96 text-sm p-1 rounded border bg-gray-900 bg-opacity-50 hover:bg-gray-800 border-gray-400"
          />
          <select
            name="selectedStatus"
            onChange={(e) => setStatusInput(e.target.value)}
            className="text-sm p-1 rounded border bg-gray-900 bg-opacity-50 hover:bg-gray-800 border-gray-400"
          >
            <option value={""}>Show All</option>
            <option value={"in progress"}>In Progress</option>
            <option value={"looking for members"}>Looking for members</option>
          </select>
        </div>
        <ul className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid gap-4 mt-4">
          {filteredProjects.map((p, i) => {
            return (
              <li key={i}>
                <Link
                  href={"/"}
                  className="shadow-md shadow-black h-36 p-2 flex flex-col border bg-gray-900 bg-opacity-50 rounded hover:bg-gray-800 border-gray-400 text-xs font-light"
                >
                  <div className="flex justify-between items-start ">
                    <h3 className="text-sm font-medium">{p.title}</h3>
                    <p className="text-right flex-shrink-0 bg-orangeaccent px-2 py-1 rounded-full ml-2 shadow shadow-black">
                      {p.status}
                    </p>
                  </div>
                  <p className="text-xs mt-2 line-clamp-4">{p.description}</p>
                  <div className="mt-auto flex justify-between items-center ">
                    <p className="text-orangeaccent">{formatDuration(p.duration_length, p.duration_type)}</p>
                    <div className="relative group">
                      <FaCircleInfo className="text-sm text-orangeaccent" />
                      <p className="right-0 shadow shadow-black transition-opacity opacity-0 group-hover:opacity-100 absolute bottom-6 bg-orangeaccent rounded-full truncate px-2 py-1">
                        {p.technology.map((t, i) => (i === p.technology.length - 1 ? t : `${t}, `))}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default Projects;

const projects = [
  {
    title: "Social Media App",
    description: "Develop a user-friendly social media application",
    members: ["John Doe", "Jane Smith", "Michael Johnson"],
    duration_length: 12,
    duration_type: "week",
    team_size: 8,
    status: "In Progress",
    leader: "Sarah Williams",
    technology: ["JavaScript", "React", "Node.js", "MongoDB"],
  },
  {
    title: "E-commerce Platform",
    description: "Build an online shopping platform with secure payment integration",
    members: ["Emily Davis", "David Lee", "Jessica Garcia"],
    duration_length: 10,
    duration_type: "week",
    team_size: 6,
    status: "Looking for members",
    leader: "Robert Brown",
    technology: ["Python", "Django", "PostgreSQL", "HTML", "CSS"],
  },
  {
    title: "AI-powered Chatbot",
    description: "Develop an intelligent chatbot using natural language processing",
    members: ["Daniel Wilson", "Olivia Taylor", "Matthew Anderson"],
    duration_length: 14,
    duration_type: "week",
    team_size: 5,
    status: "In Progress",
    leader: "Amanda Clark",
    technology: ["Python", "TensorFlow", "Natural Language Processing"],
  },
  {
    title: "Mobile Game Development",
    description: "Create an addictive and visually appealing mobile game",
    members: ["Jacob Martinez", "Sophia Rodriguez", "William Gonzalez"],
    duration_length: 16,
    duration_type: "week",
    team_size: 7,
    status: "Looking for members",
    leader: "Christopher Hernandez",
    technology: ["C++", "OpenGL", "Unity"],
  },
  {
    title: "Data Analytics Dashboard",
    description: "Build an interactive dashboard for data visualization and analysis",
    members: ["Ava Perez", "Benjamin Torres", "Isabella Ramirez"],
    duration_length: 10,
    duration_type: "week",
    team_size: 4,
    status: "In Progress",
    leader: "Mia Flores",
    technology: ["JavaScript", "React", "D3.js", "Python"],
  },
  {
    title: "Cloud-based File Storage",
    description: "Develop a secure and scalable cloud-based file storage solution",
    members: ["Liam Rivera", "Emma Gomez", "Noah Castro"],
    duration_length: 12,
    duration_type: "week",
    team_size: 6,
    status: "Looking for members",
    leader: "Isabella Diaz",
    technology: ["Java", "Spring Boot", "AWS S3"],
  },
  {
    title: "Educational Web Platform",
    description: "Create an interactive online learning platform for students",
    members: ["Michael Reyes", "Sophia Gutierrez", "Daniel Salazar"],
    duration_length: 14,
    duration_type: "week",
    team_size: 5,
    status: "In Progress",
    leader: "Olivia Morales",
    technology: ["JavaScript", "React", "Node.js", "MongoDB"],
  },
  {
    title: "Virtual Reality Experience",
    description: "Develop an immersive virtual reality experience for gaming or training",
    members: ["Ethan Garcia", "Mia Jimenez", "Jacob Sanchez"],
    duration_length: 16,
    duration_type: "week",
    team_size: 8,
    status: "Looking for members",
    leader: "Benjamin Fernandez",
    technology: ["C++", "OpenGL", "Unity", "Unreal Engine"],
  },
  {
    title: "AI-powered Personal Assistant",
    description: "Build an intelligent personal assistant using artificial intelligence",
    members: ["Isabella Alvarez", "Liam Castillo", "Emma Dominguez"],
    duration_length: 12,
    duration_type: "week",
    team_size: 6,
    status: "In Progress",
    leader: "Michael Torres",
    technology: ["Python", "TensorFlow", "Natural Language Processing"],
  },
  {
    title: "Healthcare Management System",
    description: "Develop a comprehensive healthcare management system for hospitals and clinics",
    members: ["Sophia Chavez", "Daniel Mendoza", "Ava Ramos"],
    duration_length: 14,
    duration_type: "week",
    team_size: 7,
    status: "Looking for members",
    leader: "Ethan Herrera",
    technology: ["Java", "Spring Boot", "PostgreSQL", "Angular"],
  },
  {
    title: "Blockchain-based Cryptocurrency",
    description: "Create a secure and decentralized cryptocurrency using blockchain technology",
    members: ["Michael Rivera", "Emma Velasquez", "Liam Ortiz"],
    duration_length: 16,
    duration_type: "week",
    team_size: 9,
    status: "In Progress",
    leader: "Sophia Delgado",
    technology: ["Go", "Blockchain", "Cryptography"],
  },
  {
    title: "Smart Home Automation System",
    description: "Develop an intelligent home automation system with voice control and remote access",
    members: ["Daniel Pena", "Ava Robles", "Isabella Soto"],
    duration_length: 10,
    duration_type: "week",
    team_size: 5,
    status: "Looking for members",
    leader: "Ethan Ruiz",
    technology: ["Python", "Raspberry Pi", "Home Automation Protocols"],
  },
  {
    title: "Augmented Reality Navigation App",
    description: "Create an augmented reality navigation app for pedestrians and drivers",
    members: ["Jacob Vazquez", "Mia Rangel", "Benjamin Lozano"],
    duration_length: 12,
    duration_type: "week",
    team_size: 6,
    status: "In Progress",
    leader: "Olivia Melendez",
    technology: ["Swift", "ARKit", "Google Maps API"],
  },
  {
    title: "Online Collaboration Platform",
    description: "Build a collaborative platform for teams to work together remotely",
    members: ["Michael Guerrero", "Emma Aguilar", "Liam Espinoza"],
    duration_length: 14,
    duration_type: "week",
    team_size: 7,
    status: "Looking for members",
    leader: "Sophia Navarro",
    technology: ["JavaScript", "React", "Node.js", "WebRTC"],
  },
  {
    title: "AI-powered Language Translation",
    description: "Develop an intelligent language translation system using artificial intelligence",
    members: ["Daniel Valencia", "Ava Beltran", "Isabella Vega"],
    duration_length: 16,
    duration_type: "week",
    team_size: 8,
    status: "In Progress",
    leader: "Ethan Sandoval",
    technology: ["Python", "TensorFlow", "Natural Language Processing"],
  },
];
