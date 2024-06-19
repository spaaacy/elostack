"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { IoAddCircle } from "react-icons/io5";
import toast from "react-hot-toast";
import { UserContext } from "@/context/UserContext";

const Requirements = ({ role, project }) => {
  const { session, user } = useContext(UserContext);
  const [tasks, setTasks] = useState();
  const [sprints, setSprints] = useState();
  const [currentSprint, setCurrentSprint] = useState(project.current_sprint);
  const [showRoles, setShowRoles] = useState(false);
  const [currentRole, setCurrentRole] = useState("backend");
  const [sprintTitle, setSprintTitle] = useState();
  const [taskTitle, setTaskTitle] = useState();
  const [dataLoaded, setDataLoaded] = useState(false);
  const roleRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      setDataLoaded(true);
      fetchSprints();
      fetchTasks();
    };

    if (session) {
      if (!dataLoaded) loadData();
    }

    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        setShowRoles(true);
      }

      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoles(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roleRef, buttonRef]);

  const createSprint = async () => {
    const userId = session.data.session.user.id;
    if (!sprintTitle || !userId) return;

    setSprints((prevSprint) => [
      ...prevSprint,
      {
        id: "0",
        title: sprintTitle,
        project_id: project.id,
      },
    ]);

    try {
      const response = await fetch("/api/sprint/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          title: sprintTitle,
          project_id: project.id,
        }),
      });
      if (response.status === 201) {
        const { sprintId } = await response.json();
        setSprints((prevSprint) =>
          prevSprint.map((sprint) => (sprint.id === "0" ? { ...sprint, id: sprintId } : sprint))
        );
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
      setSprints((prevSprints) => prevSprints.filter((sprint) => sprint.id !== "0"));
    }
  };

  const createTask = async () => {
    const userId = session.data.session.user.id;
    if (!taskTitle || !userId) return;

    setTasks((prevTasks) => [
      ...prevTasks,
      {
        id: "0",
        role: currentRole,
        title: taskTitle,
        sprint_id: currentSprint.id,
        complete: false,
      },
    ]);

    try {
      const response = await fetch("/api/task/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          role: currentRole,
          title: taskTitle,
          sprint_id: "6776de89-33ce-452b-9296-5676870e0e37",
          complete: false,
        }),
      });
      if (response.status === 201) {
        const { taskId } = await response.json();
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === "0" ? { ...task, id: taskId } : task)));
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== "0"));
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
        setSprints(sprints);
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

  const changeComplete = (requirement) => {
    setTasks((prevRequirements) =>
      prevRequirements.map((r) => (r === requirement ? { ...requirement, complete: !requirement.complete } : r))
    );
  };

  const sprintKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createSprint();
    }
  };

  const taskKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createTask();
    }
  };

  return (
    <div className="flex relative">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold  ">Sprints</h3>
        {sprints?.map((s, i) => {
          return (
            <button
              onClick={() => setCurrentSprint(s.id)}
              key={i}
              className={`${
                s.id === currentSprint ? "text-primary  font-semibold dark:font-medium " : ""
              } text-left text-xs hover:underline rounded-full my-1`}
            >
              {s.title}
            </button>
          );
        })}
        {user?.admin && (
          <div className="flex items-center gap-1">
            <input
              onChange={(e) => setSprintTitle(e.target.value)}
              onKeyDown={sprintKeyDown}
              type="text"
              className="rounded text-sm px-2 py-1 focus:ring-0 focus:outline-none focus:bg-neutral-50 dark:focus:bg-neutral-800"
            />
            <button type="button" onClick={createSprint} className="text-primary text-lg">
              <IoAddCircle />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 gap-2 ml-12 flex-col">
        <div className="flex">
          <div className="flex flex-col">
            <h3 className="font-semibold mb-2 capitalize">{`${
              role === currentRole ? "Your" : currentRole
            } pending tasks`}</h3>
            <ul className="flex flex-col gap-1">
              {tasks
                ?.filter((r) => !r.complete && r.role === currentRole)
                .map((r, i) => {
                  return (
                    <button
                      disabled={role === currentRole}
                      onClick={() => changeComplete(r)}
                      type="button"
                      className={`${
                        role === currentRole ? "" : "hover:text-neutral-600 dark:hover:text-neutral-300"
                      } flex gap-2 items-center `}
                      key={i}
                    >
                      <MdOutlineCheckBoxOutlineBlank className="text-xl" />
                      <p className={`${r.complete ? "line-through" : ""} text-sm`}>{r.title}</p>
                    </button>
                  );
                })}
            </ul>
          </div>
          <div className="flex flex-col ml-20">
            <h3 className="font-semibold capitalize">{`${
              role === currentRole ? "Your" : currentRole
            } completed tasks`}</h3>
            <ul className="mt-2 flex flex-col gap-1">
              {tasks
                ?.filter((r) => r.complete && r.role === currentRole)
                .map((r, i) => {
                  return (
                    <button
                      disabled={role === currentRole}
                      onClick={() => changeComplete(r)}
                      type="button"
                      className={`${
                        true ? "" : "hover:text-neutral-600 dark:hover:text-neutral-300"
                      } flex gap-2 items-center `}
                      key={i}
                    >
                      <MdOutlineCheckBox className="text-xl " />
                      <p className={`${r.complete ? "line-through" : ""} text-sm`}>{r.title}</p>
                    </button>
                  );
                })}
            </ul>
          </div>
        </div>

        {user?.admin && (
          <div className="mt-8 flex items-center gap-1 ">
            <input
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={taskKeyDown}
              type="text"
              className="rounded text-sm px-2 py-1 focus:ring-0 focus:outline-none focus:bg-neutral-50 dark:focus:bg-neutral-800 w-full"
            />
            <button type="button" onClick={createTask} className="text-primary text-lg">
              <IoAddCircle />
            </button>
          </div>
        )}
      </div>

      <div className="text-xs relative">
        <button
          ref={buttonRef}
          className="ml-auto capitalize bg-primary hover:bg-primarydark text-sm px-2 py-1 rounded-full flex justify-between items-center gap-1 hover:text-gray-200 text-white w-24"
        >
          {currentRole}
          <IoIosArrowDown />
        </button>
        {showRoles && (
          <div
            ref={roleRef}
            className="absolute top-8 right-1/2 translate-x-1/2 dark:bg-backgrounddark bg-gray-100 rounded border border-gray-400 "
          >
            <div className="flex flex-col items-end justify-center gap-1 py-1 ">
              {["backend", "frontend"].map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowRoles(false);
                    setCurrentRole(r);
                  }}
                  type="button"
                  className="capitalize text-left text-sm hover:bg-gray-300 dark:hover:bg-neutral-800 w-full py-1 px-2"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requirements;
