"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { MdCompareArrows, MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { IoAddCircle } from "react-icons/io5";
import toast from "react-hot-toast";
import { UserContext } from "@/context/UserContext";

const Requirements = ({ role, project, setProject }) => {
  const { session, user, profile } = useContext(UserContext);
  const [tasks, setTasks] = useState();
  const [sprints, setSprints] = useState();
  const [currentSprint, setCurrentSprint] = useState(project.current_sprint);
  const [showRoles, setShowRoles] = useState(false);
  const [currentRole, setCurrentRole] = useState(
    role ? role.split(", ")[0] : project.roles ? project.roles.split(", ")[0] : null
  );
  const [sprintTitle, setSprintTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showPending, setShowPending] = useState(true);
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
      let sprintId;
      let response = await fetch("/api/sprint/create", {
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
        const results = await response.json();
        sprintId = results.sprintId;
        setSprints((prevSprint) =>
          prevSprint.map((sprint) => (sprint.id === "0" ? { ...sprint, id: sprintId } : sprint))
        );
        setSprintTitle("");
      } else {
        const { error } = await response.json();
        throw error;
      }
      if (!project.current_sprint) {
        response = await fetch("/api/project/change-sprint", {
          method: "PATCH",
          headers: {
            "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
          },
          body: JSON.stringify({
            sprintId,
            projectId: project.id,
          }),
        });
        if (response.status !== 200) {
          const { error } = await response.json();
          throw error;
        }
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
        role: currentRole.toLowerCase(),
        title: taskTitle,
        sprint_id: currentSprint.id,
        complete: false,
        assignee: null,
      },
    ]);

    try {
      const response = await fetch("/api/task/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          role: currentRole.toLowerCase(),
          title: taskTitle,
          sprint_id: currentSprint,
          complete: false,
          assignee: null,
        }),
      });
      if (response.status === 201) {
        const { taskId } = await response.json();
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === "0" ? { ...task, id: taskId } : task)));
        setTaskTitle("");
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

  const createRole = async () => {
    if (!roleTitle) return;
    const newRoleString = project.roles ? ", " + roleTitle : roleTitle;

    setProject({
      ...project,
      roles: project.roles ? project.roles + newRoleString : newRoleString,
    });

    try {
      const response = await fetch("/api/project/add-role", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          roles: project.roles ? project.roles + newRoleString.toLowerCase() : newRoleString.toLowerCase(),
          projectId: project.id,
        }),
      });
      if (response.status === 201) {
        setCurrentRole(roleTitle.toLowerCase());
        setRoleTitle("");
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
      setProject((p) => {
        return { ...p, roles: p.roles.replace(newRoleString, "") };
      });
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

  const assignYourself = async (taskId, userId) => {
    if (!profile) return;

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignee: userId,
              username: userId ? profile.username : undefined,
            }
          : t
      )
    );

    try {
      const response = await fetch("/api/task/assign", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          taskId,
          userId,
        }),
      });
      if (response.status !== 200) {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                assignee: userId ? undefined : session.data.session.user.id,
                username: userId ? undefined : profile.username,
              }
            : task
        )
      );
    }
  };

  const completeTask = async (task) => {
    const userId = session.data.session.user.id;
    if (!userId) return;

    setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? { ...t, complete: !t.complete } : t)));

    try {
      const response = await fetch("/api/task/change-complete", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          taskId: task.id,
          complete: !task.complete,
        }),
      });
      if (response.status !== 200) {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? { ...t, complete: !t.complete } : t)));
    }
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

  const roleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createRole();
    }
  };

  return (
    <div className="flex relative">
      <div className="flex flex-col gap-2 min-w-44">
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
              placeholder="Create sprint"
              value={sprintTitle}
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

      <div className="flex flex-1 gap-2 flex-col px-8">
        <div className="flex text-sm gap-2 items-center">
          <button
            type="button"
            onClick={() => setShowPending(true)}
            className={`${
              showPending
                ? "bg-primary text-white"
                : "bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700"
            } px-2 py-1 rounded `}
          >
            Pending Tasks
          </button>
          <button
            type="button"
            onClick={() => setShowPending(false)}
            className={`${
              !showPending
                ? "bg-primary text-white"
                : "bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700"
            } px-2 py-1 rounded `}
          >
            Completed Tasks
          </button>
        </div>
        <div className="flex gap-4">
          {showPending ? (
            <div className="flex flex-col w-full">
              <h3 className="font-semibold mb-2 capitalize">{`${currentRole} pending tasks`}</h3>
              <ul className="flex flex-col gap-1">
                {tasks
                  ?.filter((t) => !t.complete && t.role === currentRole && t.sprint_id === currentSprint)
                  .map((t, i) => {
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          disabled={!role?.includes(currentRole) || t.assignee !== session.data.session.user.id}
                          onClick={() => completeTask(t)}
                          type="button"
                          className={`${
                            !role?.includes(currentRole) || t.assignee !== session.data.session.user.id
                              ? ""
                              : "hover:text-neutral-600 dark:hover:text-neutral-300"
                          } flex gap-2 items-center `}
                        >
                          <MdOutlineCheckBoxOutlineBlank className="text-xl flex-shrink-0" />
                          <p className={`text-sm text-left`}>{t.title}</p>
                        </button>
                        {!t.assignee && role?.includes(currentRole) ? (
                          <button
                            type="button"
                            onClick={() => assignYourself(t.id, session.data.session.user.id)}
                            className="text-xs px-2 py-1 rounded-full bg-primary hover:bg-primarydark text-white hover:text-neutral-200 flex-shrink-0 ml-auto"
                          >
                            Assign Yourself
                          </button>
                        ) : t.assignee === session.data.session.user.id ? (
                          <button
                            type="button"
                            onClick={() => assignYourself(t.id, null)}
                            className="text-xs px-2 py-1 rounded-full dark:bg-sky-500 bg-sky-400 text-white ml-auto hover:bg-red-500 dark:hover:hover:bg-red-600 flex-shrink-0"
                          >
                            {t.username}
                          </button>
                        ) : (
                          <p
                            className={`${
                              t.username ? " dark:bg-sky-500 bg-sky-400" : "bg-neutral-600"
                            } text-xs px-2 py-1 rounded-full text-white ml-auto flex-shrink-0`}
                          >
                            {t.username ? t.username : "None assigned"}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <h3 className="font-semibold capitalize">{`${currentRole} completed tasks`}</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {tasks
                  ?.filter((t) => t.complete && t.role === currentRole && t.sprint_id === currentSprint)
                  .map((t, i) => {
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          disabled={!role?.includes(currentRole)}
                          onClick={() => completeTask(t)}
                          type="button"
                          className={`${
                            !role?.includes(currentRole) ? "" : "hover:text-neutral-600 dark:hover:text-neutral-300"
                          } flex gap-2 items-center `}
                        >
                          <MdOutlineCheckBox className="text-xl flex-shrink-0" />
                          <p className={`"line-through text-sm text-left`}>{t.title}</p>
                        </button>
                        <p className="text-xs px-2 py-1 rounded-full dark:bg-sky-500 bg-sky-400 text-white ml-auto  flex-shrink-0">
                          {t.username}
                        </p>
                      </div>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
        {user?.admin && currentRole && currentSprint && (
          <div className="mt-8 flex items-center gap-1 ">
            <input
              placeholder="Create task"
              value={taskTitle}
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
        {project.roles && (
          <button
            ref={buttonRef}
            className="ml-auto capitalize bg-primary hover:bg-primarydark text-sm px-2 py-1 rounded-full flex justify-between items-center gap-1 hover:text-gray-200 text-white w-24"
          >
            {currentRole}
            <IoIosArrowDown />
          </button>
        )}
        {user?.admin && (
          <div className="mt-8 max-w-40 flex items-center gap-1 ">
            <input
              placeholder="Add role"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              onKeyDown={roleKeyDown}
              type="text"
              className="rounded text-sm px-2 py-1 focus:ring-0 focus:outline-none focus:bg-neutral-50 dark:focus:bg-neutral-800 w-full"
            />
            <button type="button" onClick={createRole} className="text-primary text-lg">
              <IoAddCircle />
            </button>
          </div>
        )}
        {showRoles && (
          <div
            ref={roleRef}
            className="absolute top-8 right-0 w-32 dark:bg-backgrounddark bg-gray-100 rounded border border-gray-400 "
          >
            <div className="flex flex-col items-end justify-center gap-1 py-1 ">
              {user?.admin
                ? project.roles.split(", ").map((r, i) => {
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setShowRoles(false);
                          setCurrentRole(r);
                        }}
                        type="button"
                        className="capitalize text-right text-sm hover:bg-gray-300 dark:hover:bg-neutral-800 w-full py-1 px-2"
                      >
                        {r}
                      </button>
                    );
                  })
                : [...new Set(project.roles.split(", "))].map((r, i) => {
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setShowRoles(false);
                          setCurrentRole(r);
                        }}
                        type="button"
                        className="capitalize text-right text-sm hover:bg-gray-300 dark:hover:bg-neutral-800 w-full py-1 px-2"
                      >
                        {r}
                      </button>
                    );
                  })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requirements;
