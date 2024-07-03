"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { MdCompareArrows, MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { IoAddCircle } from "react-icons/io5";
import toast from "react-hot-toast";
import { UserContext } from "@/context/UserContext";
import { extractMarkdownLink } from "@/utils/extractMarkdownLink";
import Link from "next/link";
import { Tooltip } from "react-tooltip";

import { formatTime } from "@/utils/formatTime";

const Requirements = ({ role, project, setProject, sprints, setSprints, tasks, setTasks, resources, setResources }) => {
  const { session, user, profile } = useContext(UserContext);
  const [currentSprint, setCurrentSprint] = useState(sprints.find((s) => s.id === project.current_sprint));
  const [currentSprintIndex, setCurrentSprintIndex] = useState();
  const [projectSprintIndex, setProjectSprintIndex] = useState();
  const [showRoles, setShowRoles] = useState(false);
  const [currentRole, setCurrentRole] = useState(
    role ? role.split(", ")[0] : project.roles ? project.roles.split(", ")[0] : null
  );
  const [sprintTitle, setSprintTitle] = useState("");
  const [taskResourceTitle, setTaskResoruceTitle] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [currentPage, setCurrentPage] = useState("pending");

  const [showSprints, setShowSprints] = useState(false);
  const roleRef = useRef();
  const buttonRef = useRef();
  const [daysInput, setDaysInput] = useState([]);
  const [selectedSprintDaysInput, setSelectedSprintDaysInput] = useState();
  const daysInputRef = useRef();
  const daysDebounceRef = useRef(null);

  useEffect(() => {
    if (sprints) {
      setProjectSprintIndex(sprints.findIndex((sprint) => sprint.id === project.current_sprint));
      if (currentSprint) setCurrentSprintIndex(sprints.findIndex((sprint) => sprint.id === currentSprint));
    }

    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        setShowRoles(true);
      }

      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoles(false);
      }

      if (daysInputRef.current && !daysInputRef.current.contains(event.target)) {
        setSelectedSprintDaysInput(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    if (selectedSprintDaysInput && daysInputRef.current) {
      daysInputRef.current.focus();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roleRef, buttonRef, sprints, currentSprint, selectedSprintDaysInput]);

  const createSprint = async () => {
    const userId = session.data.session.user.id;
    if (!sprintTitle || !userId) return;
    const previousSprintId = sprints.length > 0 ? sprints[sprints.length - 1].id : null;

    setSprints((prevSprint) => [
      ...prevSprint,
      {
        id: "0",
        title: sprintTitle,
        project_id: project.id,
        previous_sprint_id: previousSprintId,
      },
    ]);
    setProject({ ...project, current_sprint: project.current_sprint ? project.current_sprint : "0" });

    try {
      let sprintId;
      let response = await fetch("/api/sprint/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          title: sprintTitle,
          projectId: project.id,
          previousSprintId,
        }),
      });
      if (response.status === 201) {
        const results = await response.json();
        sprintId = results.sprintId;
        setSprints((prevSprint) =>
          prevSprint.map((sprint) =>
            sprint.id === "0"
              ? { ...sprint, id: sprintId }
              : sprint.id === previousSprintId
              ? { ...sprint, next_sprint_id: sprintId }
              : sprint
          )
        );
        setProject((prevProject) => {
          return {
            ...prevProject,
            current_sprint: prevProject.current_sprint === "0" ? sprintId : prevProject.current_sprint,
          };
        });
        setSprintTitle("");
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
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
      setSprints((prevSprints) => prevSprints.filter((sprint) => sprint.id !== "0"));
      setProject((prevProject) => {
        return {
          ...prevProject,
          current_sprint: prevProject.current_sprint === "0" ? null : prevProject.current_sprint,
        };
      });
    }
  };

  const createTask = async () => {
    const userId = session.data.session.user.id;
    if (!taskResourceTitle || !userId) return;

    setTasks((prevTasks) => [
      ...prevTasks,
      {
        id: "0",
        role: currentRole.toLowerCase(),
        title: taskResourceTitle,
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
          title: taskResourceTitle,
          sprint_id: currentSprint.id,
          complete: false,
          assignee: null,
        }),
      });
      if (response.status === 201) {
        const { taskId } = await response.json();
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === "0" ? { ...task, id: taskId } : task)));
        setTaskResoruceTitle("");
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

  const createResource = async () => {
    const userId = session.data.session.user.id;
    if (!taskResourceTitle || !userId) return;

    const linkObject = extractMarkdownLink(taskResourceTitle);
    if (!linkObject) {
      toast.error("Resource format invalid");
      return;
    }

    setResources((prevRes) => [
      ...prevRes,
      {
        id: "0",
        role: currentRole.toLowerCase(),
        title: linkObject.label,
        url: linkObject.url,
        sprint_id: currentSprint.id,
      },
    ]);

    try {
      const response = await fetch("/api/resource/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          role: currentRole.toLowerCase(),
          title: linkObject.label,
          url: linkObject.url,
          sprint_id: currentSprint.id,
        }),
      });
      if (response.status === 201) {
        const { resourceId } = await response.json();
        setResources((prevRes) => prevRes.map((res) => (res.id === "0" ? { ...res, id: resourceId } : res)));
        setTaskResoruceTitle("");
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
      setResources((prevRes) => prevRes.filter((res) => res.id !== "0"));
    }
  };

  const createRole = async () => {
    if (!roleTitle) return;
    const newRoleString = project.roles ? ", " + roleTitle.toLowerCase() : roleTitle.toLowerCase();

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
          roles: project.roles ? project.roles + newRoleString : newRoleString,
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

  const onDaysInputChange = async (e, sprintId) => {
    setDaysInput((prevDays) => ({
      ...prevDays,
      [sprintId]: e.target.value,
    }));
    const oldDays = sprints.find((s) => s.id === sprintId).days;
    setSprints((prevSprints) => prevSprints.map((s) => (s.id === sprintId ? { ...s, days: e.target.value } : s)));

    if (daysDebounceRef.current) clearTimeout(daysDebounceRef.current);

    daysDebounceRef.current = setTimeout(async () => {
      console.log("Updating...");
      try {
        const response = await fetch("/api/sprint/change-days", {
          method: "PATCH",
          headers: {
            "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
          },
          body: JSON.stringify({
            sprintId,
            days: e.target.value,
          }),
        });
        if (response.status !== 200) {
          const { error } = await response.json();
          throw error;
        }
      } catch (error) {
        console.error(error);
        toast.error("Oops, something went wrong...");
        setSprints((prevSprints) => prevSprints.map((s) => (s.id === sprintId ? { ...s, days: oldDays } : s)));
      }
    }, 300);
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
      if (response.status === 200) {
        const sprintNotComplete = tasks.find(
          (t) => t.sprint_id === project.current_sprint && !t.complete && t.id !== task.id
        );
        if (!sprintNotComplete && !task.complete) {
          try {
            const response = await fetch("/api/project/change-pending-post", {
              method: "PATCH",
              headers: {
                "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
              },
              body: JSON.stringify({
                projectId: project.id,
                pendingPost: true,
              }),
            });
            if (response.status === 200) {
              setProject({ ...project, pending_post: true });
            } else {
              const { error } = await response.json();
              throw error;
            }
          } catch (error) {
            console.error(error);
            toast.error("Oops, something went wrong...");
          }
        }
      } else {
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

  const resourceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createResource();
    }
  };

  return (
    <div className="flex gap-4 max-lg:flex-col lg:flex relative">
      <div className="flex flex-col gap-2 min-w-44 max-lg:items-center">
        <h3
          onClick={() => setShowSprints(!showSprints)}
          className="max-lg:cursor-pointer font-semibold max-lg:hover:bg-gray-300 dark:max-lg:hover:bg-neutral-600 max-lg:w-full max-lg:py-2 flex gap-1 max-lg:items-center max-lg:justify-center"
        >
          <IoIosArrowDown className={`max-lg:block lg:hidden`} />
          Schedule
        </h3>
        <div className={`${showSprints ? "max-lg:flex" : "max-lg:hidden"} lg:flex flex-col max-lg:gap-2 items-center`}>
          {sprints?.map((s, i) => {
            return (
              <div key={i} className="w-full flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setCurrentSprint(s);
                    setCurrentPage("pending");
                  }}
                  className={`${
                    s.id === currentSprint.id ? "text-primary  font-semibold dark:font-medium " : ""
                  } max-lg:text-center text-left text-xs hover:underline rounded-full my-1 w-full max-lg:text-sm`}
                >
                  {s.title}
                </button>
                {user?.admin && (
                  <>
                    {selectedSprintDaysInput === s.id ? (
                      <input
                        ref={daysInputRef}
                        placeholder="Days"
                        value={daysInput[i]}
                        onChange={(e) => onDaysInputChange(e, s.id)}
                        onKeyDown={sprintKeyDown}
                        type="text"
                        className="text-xs min-w-0 w-10 rounded px-1 py-1 focus:ring-0 focus:outline-none focus:bg-neutral-50 dark:focus:bg-neutral-800"
                      />
                    ) : (
                      <label
                        onClick={() => setSelectedSprintDaysInput(s.id)}
                        className="text-xs p-1 rounded bg-gray-300 dark:bg-neutral-800"
                      >
                        {s.days}
                      </label>
                    )}
                  </>
                )}
              </div>
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
      </div>
      {project.roles ? (
        <div className="flex flex-1 gap-2 flex-col lg:px-8  ">
          {(currentSprintIndex <= projectSprintIndex || user?.admin) && (
            <>
              <div className="flex flex-col">
                {currentSprint && <h4 className="font-semibold">{currentSprint.title}</h4>}
                {currentSprint && (
                  <p className="text-primary text-sm font-semibold dark:font-medium">
                    {formatTime(currentSprint.deadline)}
                  </p>
                )}
              </div>

              <div className="flex text-sm gap-2 items-center flex-wrap">
                <button
                  type="button"
                  onClick={() => setCurrentPage("pending")}
                  className={`${
                    currentPage === "pending"
                      ? "bg-primary text-white"
                      : "bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700"
                  } px-2 py-1 rounded `}
                >
                  Pending Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage("completed")}
                  className={`${
                    currentPage === "completed"
                      ? "bg-primary text-white"
                      : "bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700"
                  } px-2 py-1 rounded `}
                >
                  Completed Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage("resources")}
                  className={`${
                    currentPage === "resources"
                      ? "bg-primary text-white"
                      : "bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700"
                  } px-2 py-1 rounded `}
                >
                  Resources
                </button>
              </div>
            </>
          )}
          <div className="flex gap-4">
            {currentPage === "pending" ? (
              <div className="flex flex-col w-full">
                <h3 className="font-semibold mb-2 capitalize">{`${currentRole} pending tasks`}</h3>
                <ul className="flex flex-col gap-1">
                  {tasks
                    ?.filter((t) => !t.complete && t.role === currentRole && t.sprint_id === currentSprint.id)
                    .map((t, i) => {
                      return (
                        <div key={i} className="flex items-start gap-2  flex-wrap">
                          <button
                            disabled={
                              user?.admin
                                ? false
                                : !role?.includes(currentRole) ||
                                  t.assignee !== session.data.session.user.id ||
                                  currentSprintIndex > projectSprintIndex
                            }
                            onClick={() => completeTask(t)}
                            type="button"
                            className={`${
                              !role?.includes(currentRole) ||
                              t.assignee !== session.data.session.user.id ||
                              currentSprintIndex > projectSprintIndex
                                ? ""
                                : "hover:text-neutral-600 dark:hover:text-neutral-300"
                            } flex gap-2 items-start `}
                          >
                            {currentSprintIndex <= projectSprintIndex && (
                              <MdOutlineCheckBoxOutlineBlank className="text-xl flex-shrink-0" />
                            )}
                            <p
                              className={`text-sm text-left ${
                                currentSprintIndex > projectSprintIndex ? "text-neutral-500" : ""
                              }`}
                            >
                              {t.title}
                            </p>
                          </button>
                          {(currentSprintIndex <= projectSprintIndex || user?.admin) &&
                            (!t.assignee && role?.includes(currentRole) ? (
                              <button
                                type="button"
                                onClick={() => assignYourself(t.id, session.data.session.user.id)}
                                className="text-xs px-2 py-1 rounded-full bg-primary hover:bg-primarydark text-white hover:text-neutral-200 flex-shrink-0 ml-auto"
                              >
                                Assign Yourself
                              </button>
                            ) : t.assignee === session.data.session.user.id || user?.admin ? (
                              <button
                                type="button"
                                onClick={() => assignYourself(t.id, null)}
                                className="text-xs px-2 py-1 rounded-full dark:bg-sky-500 bg-sky-400 text-white ml-auto hover:bg-red-500 dark:hover:hover:bg-red-600 flex-shrink-0"
                              >
                                {t.username}
                              </button>
                            ) : (
                              <>
                                <p
                                  data-tooltip-id="assign-tooltip"
                                  data-tooltip-content="Your role does not match the task"
                                  className={`${
                                    t.username ? " dark:bg-sky-500 bg-sky-400" : "bg-neutral-600"
                                  } text-xs px-2 py-1 rounded-full text-white ml-auto flex-shrink-0`}
                                >
                                  {t.username ? t.username : "None assigned"}
                                </p>
                                {!t.username && (
                                  <Tooltip
                                    style={{ fontSize: "12px" }}
                                    id="assign-tooltip"
                                    place="bottom"
                                    type="dark"
                                    effect="float"
                                  />
                                )}
                              </>
                            ))}
                        </div>
                      );
                    })}
                </ul>
              </div>
            ) : currentPage === "completed" ? (
              <div className="flex flex-col w-full">
                <h3 className="font-semibold capitalize">{`${currentRole} completed tasks`}</h3>
                <ul className="mt-2 flex flex-col gap-1">
                  {tasks
                    ?.filter((t) => t.complete && t.role === currentRole && t.sprint_id === currentSprint.id)
                    .map((t, i) => {
                      return (
                        <div key={i} className="flex items-start gap-2  flex-wrap">
                          <button
                            disabled={user?.admin ? false : !role?.includes(currentRole)}
                            onClick={() => completeTask(t)}
                            type="button"
                            className={`${
                              !role?.includes(currentRole) ? "" : "hover:text-neutral-600 dark:hover:text-neutral-300"
                            } flex gap-2 items-start `}
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
            ) : (
              <div className="flex flex-col w-full">
                <h3 className="font-semibold capitalize">{`${currentRole} resource`}</h3>
                <ul className="mt-2 flex flex-col gap-1">
                  {resources
                    .filter((r) => r.sprint_id === currentSprint.id && r.role === currentRole)
                    .map((r, i) => {
                      return (
                        <Link
                          key={i}
                          href={r.url}
                          className={
                            "flex gap-2 items-start dark:text-blue-400 dark:hover:text-blue-500 text-blue-600 hover:text-blue-700 hover:underline"
                          }
                        >
                          <p className={` text-sm text-left`}>{r.title}</p>
                        </Link>
                      );
                    })}
                </ul>
              </div>
            )}
          </div>
          {user?.admin && currentRole && currentSprint && (
            <div className="mt-4 flex items-center gap-1 ">
              <input
                placeholder={`Create ${
                  currentPage === "resources" ? "resource. Use format: [Google](https://www.google.com/)" : "task"
                }`}
                value={taskResourceTitle}
                onChange={(e) => setTaskResoruceTitle(e.target.value)}
                onKeyDown={currentPage === "resources" ? resourceKeyDown : taskKeyDown}
                type="text"
                className="rounded text-sm px-2 py-1 focus:ring-0 focus:outline-none focus:bg-neutral-50 dark:focus:bg-neutral-800 w-full"
              />
              <button
                type="button"
                onClick={currentPage === "resources" ? createResource : createTask}
                className="text-primary text-lg"
              >
                <IoAddCircle />
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="flex-1 font-semibold  lg:px-8 ">Create a role and sprint to begin</p>
      )}

      <div className="text-xs relative max-lg:order-first flex flex-col items-end">
        {project.roles && (
          <button
            ref={buttonRef}
            className="flex-shrink-0 ml-auto capitalize bg-primary hover:bg-primarydark text-sm px-2 py-1 rounded-full flex justify-between items-center gap-1 hover:text-gray-200 text-white"
          >
            {currentRole}
            <IoIosArrowDown />
          </button>
        )}
        {user?.admin && (
          <div className="mt-4 max-w-40 flex items-center gap-1 ">
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
            className="absolute top-8 right-0 w-32 dark:bg-backgrounddark bg-gray-100 rounded border border-gray-400"
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
