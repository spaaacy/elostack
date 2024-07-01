"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import NavBar from "../navbar/NavBar";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import Loader from "../common/Loader";
import toast, { Toaster } from "react-hot-toast";
import SettingsDropdown from "./SettingsDropdown";
import Feed from "../feed/Feed";
import Image from "next/image";
import ProjectOverview from "./ProjectOverview";
import Requirements from "./Requirements";
import SetupModal from "./modal/SetupModal";
import Meetings from "./Meetings";
import arrangeSprints from "@/utils/arrangeSprints";
import Link from "next/link";
import GithubModal from "./modal/GithubModal";
import TutorialModal from "./modal/TutorialModal";
import AlertModal from "./modal/AlertModal";
import MeetingModal from "./modal/MeetingModal";

const ProjectPrivate = ({ project, members, setMembers, setProject }) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const { session, user, profile } = useContext(UserContext);
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
  const searchParams = useSearchParams();
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState();
  const [showLinks, setShowLinks] = useState(true);

  useEffect(() => {
    const loadSearchParams = () => {
      if (searchParams.get("overview") === "true") setCurrentState("overview");
      if (searchParams.get("meetings") === "true") setCurrentState("meetings");
      if (searchParams.get("sprints") === "true") setCurrentState("sprints");
      if (searchParams.get("updates") === "true") setCurrentState("updates");
    };

    const loadData = async () => {
      setDataLoaded(true);
      await fetchSprints();
      await fetchTasks();
      await fetchResources();
      await fetchMeetings();
      await fetchPosts();
      setLoading(false);
    };

    if (session) {
      if (!dataLoaded) loadData();
      loadSearchParams();
      const member = members.find((m) => m.user_id === session.data.session.user.id);
      if (member && !member.role) setShowSetupModal(true);
      if (member && !member.tutorial_complete && member.role) setShowTutorialModal(true);
    }
  }, [session]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/post/${project.id}`, {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({ pageNumber: 1 }),
      });
      if (response.status === 200) {
        const { posts } = await response.json();
        setPosts(posts);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
        let assigned = false;
        let taskRemaining = false;
        if (!user.admin) {
          if (project.current_sprint) {
            tasks.forEach((t) => {
              if (t.sprint_id === project.current_sprint) {
                if (t.assignee === session.data.session.user.id) assigned = true;
                if (
                  !t.assignee &&
                  members.find((m) => m.user_id === session.data.session.user.id).role.includes(t.role)
                )
                  taskRemaining = true;
              }
            });
          } else assigned = true;
          if (!assigned || taskRemaining) {
            setCurrentState("sprints");
            setShowAlertModal(true);
            if (!assigned) {
              setShowLinks(false);
              setAlertMessage("Please assign tasks to yourself for the current sprint to continue");
            } else if (taskRemaining)
              setAlertMessage(
                "There are some unassigned tasks that fit your role. Please assign yourself to them or alert your team member of the similar role to assign themselves"
              );
          }
        }
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
        if (!user.admin)
          meetings.some((m) => {
            let date1 = new Date(m.datetime);
            let date2 = new Date();
            date1.setHours(0, 0, 0, 0);
            date2.setHours(0, 0, 0, 0);
            if (!m.user_id.includes(session.data.session.user.id) && date1 >= date2) {
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
    <div className="flex flex-col min-h-screen overflow-y-auto">
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
          {showLinks && (
            <div className="flex gap-2 text-sm mb-4 flex-wrap">
              <Link
                href={`/projects/${id}?overview=true`}
                onClick={() => setCurrentState("overview")}
                className={`${
                  currentState === "overview"
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
                } rounded dark:border dark:border-gray-400 px-2 py-1`}
              >
                Overview
              </Link>
              <Link
                href={`/projects/${id}?updates=true`}
                onClick={() => setCurrentState("updates")}
                className={`${
                  currentState === "updates"
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
                } rounded dark:border dark:border-gray-400 px-2 py-1`}
              >
                Updates
              </Link>
              <Link
                href={`/projects/${id}?sprints=true`}
                onClick={() => setCurrentState("sprints")}
                className={`${
                  currentState === "sprints"
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
                } rounded dark:border dark:border-gray-400 px-2 py-1`}
              >
                Schedule
              </Link>
              <Link
                href={`/projects/${id}?meetings=true`}
                onClick={() => setCurrentState("meetings")}
                className={`${
                  currentState === "meetings"
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
                } rounded dark:border dark:border-gray-400 px-2 py-1`}
              >
                Meetings
              </Link>
            </div>
          )}
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
        </main>
      )}

      {!profile?.github_username ? (
        <GithubModal />
      ) : showSetupModal ? (
        <SetupModal
          project={project}
          setShowModal={setShowSetupModal}
          members={members}
          setMembers={setMembers}
          setShowNextModal={setShowTutorialModal}
        />
      ) : showTutorialModal ? (
        <TutorialModal
          onComplete={() => {
            setShowLinks(false);
            setCurrentState("sprints");
            setShowAlertModal(true);
            setAlertMessage("Please assign tasks to yourself for the current sprint to continue");
          }}
          setPosts={setPosts}
          project={project}
          setShowTutorialModal={setShowTutorialModal}
        />
      ) : showAlertModal ? (
        <AlertModal message={alertMessage} setShowModal={setShowAlertModal} />
      ) : !user?.admin && pendingMeetings?.length > 0 ? (
        <MeetingModal pendingMeetings={pendingMeetings} setPendingMeetings={setPendingMeetings} project={project} />
      ) : project.pending_post ? (
        <PendingPostModal project={project} setPosts={setPosts} setProject={setProject} />
      ) : (
        <></>
      )}

      <Toaster />
    </div>
  );
};

export default ProjectPrivate;
