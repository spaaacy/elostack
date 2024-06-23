"use client";

import { useParams } from "next/navigation";
import NavBar from "../navbar/NavBar";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import Loader from "../common/Loader";
import toast, { Toaster } from "react-hot-toast";
import SettingsDropdown from "./SettingsDropdown";
import ChatBox from "./ChatBox";
import Feed from "../feed/Feed";
import Image from "next/image";
import ProjectOverview from "./ProjectOverview";
import Requirements from "./Requirements";
import SetupModal from "./SetupModal";
import CreateMeeting from "./CreateMeeting";
import TutorialModal from "./TutorialModal";
import Meetings from "./Meetings";
import MeetingModal from "./MeetingModal";
import arrangeSprints from "@/utils/arrangeSprints";
import PendingPostModal from "./PendingPostModal";

const ProjectPrivate = ({ project, members, setMembers, setProject }) => {
  const { id } = useParams();
  const { session, user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [currentState, setCurrentState] = useState("overview");
  const [posts, setPosts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [meetings, setMeetings] = useState();
  const [sprints, setSprints] = useState();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [pendingMeetings, setPendingMeetings] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setDataLoaded(true);
      fetchSprints();
      fetchTasks();
      fetchResources();
      fetchMeetings();
    };

    if (session) {
      if (!dataLoaded) loadData();
      const member = members.find((m) => m.user_id === session.data.session.user.id);
      if (member && !member.role) setShowSetupModal(true);
      if (member && !member.tutorial_complete && member.role) setShowTutorialModal(true);
    }
  }, [session]);

  const fetchSprints = async () => {
    try {
      const response = await fetch(`/api/sprint/${project.id}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { sprints } = await response.json();
        const sortedSprints = arrangeSprints(sprints);
        setSprints(sortedSprints);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/task/${project.id}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { tasks } = await response.json();
        setTasks(tasks);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch(`/api/resource/${project.id}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { resources } = await response.json();
        setResources(resources);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/meeting/${project.id}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { meetings } = await response.json();
        setMeetings(meetings);
        // if (!user.admin)
        if (true)
          meetings.some((m) => {
            const meetingDatetime = new Date(m.datetime);
            const now = new Date();
            if (!m.user_id.includes(session.data.session.user.id) && now < meetingDatetime) {
              setPendingMeetings((prevMeetings) => [...prevMeetings, m]);
            }
          });
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto mb-10">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex items-center gap-4 relative">
            {project.image_id && (
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_STORAGE_PATH}/project-image/${project.id}/${project.image_id}`}
                alt="project image"
                width={64}
                height={64}
                className="object-cover w-16 h-16 rounded-full"
              />
            )}
            <div className="flex flex-col justify-start items-start">
              <h1 className="font-bold text-2xl">{project.title}</h1>
              <p className="font-light ">{project.status}</p>
            </div>
            <SettingsDropdown project={project} members={members} setLoading={setLoading} />
          </div>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex gap-2 text-sm mb-4 flex-wrap">
            <button
              type="button"
              onClick={() => setCurrentState("overview")}
              className={`${
                currentState === "overview"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border dark:border-gray-400 px-2 py-1`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setCurrentState("updates")}
              className={`${
                currentState === "updates"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border dark:border-gray-400 px-2 py-1`}
            >
              Updates
            </button>
            <button
              type="button"
              onClick={() => setCurrentState("sprints")}
              className={`${
                currentState === "sprints"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border dark:border-gray-400 px-2 py-1`}
            >
              Sprints
            </button>
            <button
              type="button"
              onClick={() => setCurrentState("meetings")}
              className={`${
                currentState === "meetings"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border dark:border-gray-400 px-2 py-1`}
            >
              Meetings
            </button>
          </div>
          {currentState === "overview" ? (
            <ProjectOverview user={user} members={members} project={project} setLoading={setLoading} />
          ) : currentState === "updates" ? (
            <Feed posts={posts} setPosts={setPosts} project={project} isMember={true} />
          ) : currentState === "sprints" ? (
            <Requirements
              role={members.find((m) => m.user_id === session.data.session.user.id)?.role}
              project={project}
              setProject={setProject}
              sprints={sprints}
              setSprints={setSprints}
              tasks={tasks}
              setTasks={setTasks}
              resources={resources}
              setResources={setResources}
            />
          ) : (
            <Meetings project={project} meetings={meetings} setMeetings={setMeetings} />
          )}
          <ChatBox session={session} project={project} id={id} />
        </main>
      )}
      {showSetupModal && (
        <SetupModal
          project={project}
          setShowModal={setShowSetupModal}
          members={members}
          setMembers={setMembers}
          setShowNextModal={setShowTutorialModal}
        />
      )}

      {showTutorialModal && (
        <TutorialModal setPosts={setPosts} project={project} setShowTutorialModal={setShowTutorialModal} />
      )}
      {pendingMeetings?.length > 0 && !showTutorialModal && !showSetupModal && (
        <MeetingModal pendingMeetings={pendingMeetings} setPendingMeetings={setPendingMeetings} project={project} />
      )}
      {project.pending_post && <PendingPostModal project={project} setPosts={setPosts} setProject={setProject} />}

      <Toaster />
    </div>
  );
};

export default ProjectPrivate;
