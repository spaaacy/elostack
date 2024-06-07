import { BsThreeDotsVertical } from "react-icons/bs";
import { Tooltip } from "react-tooltip";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

const githubUrlPattern = /^https?:\/\/(?:www\.)?github\.com\/[\w-]+\/[\w-]+\/?$/;

const SettingsDropdown = ({ project, isLeader, members, session, setLoading }) => {
  const dropdownRef = useRef();
  const githubRef = useRef();
  const banMemberRef = useRef();
  const removeMemberRef = useRef();
  const changeLeaderRef = useRef();
  const deleteProjectRef = useRef();
  const leaveProjectRef = useRef();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showGithubDropdown, setShowGithubDropdown] = useState(false);
  const [showBanMember, setShowBanMember] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const [showDeleteProject, setShowDeleteProject] = useState();
  const [showLeaveProject, setShowLeaveProject] = useState();

  const [confirmBanMember, setConfirmBanMember] = useState();
  const [confirmRemoveMember, setConfirmRemoveMember] = useState();
  const [showChangeLeader, setShowChangeLeader] = useState(false);
  const [confirmChangeLeader, setConfirmChangeLeader] = useState();

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const leaveProject = async () => {
    if (!session.data.session) return;
    try {
      setLoading(true);
      const response = await fetch("/api/member/delete", {
        method: "DELETE",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId: session.data.session.user.id,
          projectId: project.id,
        }),
      });
      if (response.status === 200) {
        router.push("/projects");
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      setLoading(false);
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const changeOpen = async (isOpen) => {
    if (!session.data.session) return;
    try {
      setLoading(true);
      const response = await fetch("/api/project/change-open", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          isOpen,
          projectId: project.id,
        }),
      });
      if (response.status === 200) {
        toast.success(isOpen ? "New members allowed" : "New members can't join");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const changeLeader = async (id) => {
    if (!session.data.session) return;
    try {
      setShowChangeLeader(false);
      setLoading(true);
      const response = await fetch("/api/project/change-leader", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          leader: id,
          projectId: project.id,
        }),
      });
      if (response.status === 200) {
        toast.success("Leader changed");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const changeGithub = async (data, e) => {
    e?.preventDefault();
    if (!session.data.session) return;
    try {
      setShowGithubDropdown(false);
      setLoading(true);
      const response = await fetch("/api/project/change-github", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          github: data.github,
          projectId: project.id,
        }),
      });
      if (response.status === 200) {
        toast.success("GitHub URL changed");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const banMember = async (userId) => {
    if (!session.data.session) return;
    try {
      setShowBanMember(false);
      setLoading(true);
      const response = await fetch("/api/member/ban-member", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId,
          projectId: project.id,
          projectTitle: project.title,
        }),
      });
      if (response.status === 200) {
        toast.success("Member has been banned");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId) => {
    if (!session.data.session) return;
    try {
      setShowRemoveMember(false);
      setLoading(true);
      const response = await fetch("/api/member/remove-member", {
        method: "DELETE",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId,
          projectId: project.id,
          projectTitle: project.title,
        }),
      });
      if (response.status === 200) {
        toast.success("Member has been removed");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!session.data.session) return;
    try {
      setShowDeleteProject(false);
      setLoading(true);
      const response = await fetch("/api/project/delete", {
        method: "DELETE",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          project: project,
        }),
      });
      if (response.status === 200) {
        router.push("/projects");
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      setLoading(false);
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
    if (githubRef.current && !githubRef.current.contains(event.target)) {
      setShowGithubDropdown(false);
    }
    if (banMemberRef.current && !banMemberRef.current.contains(event.target)) {
      setShowBanMember(false);
    }
    if (changeLeaderRef.current && !changeLeaderRef.current.contains(event.target)) {
      setShowChangeLeader(false);
    }
    if (deleteProjectRef.current && !deleteProjectRef.current.contains(event.target)) {
      setShowDeleteProject(false);
    }
    if (leaveProjectRef.current && !leaveProjectRef.current.contains(event.target)) {
      setShowLeaveProject(false);
    }
    if (removeMemberRef.current && !removeMemberRef.current.contains(event.target)) {
      setShowLeaveProject(false);
    }
  };

  return (
    <div className="ml-auto">
      <button
        type="button"
        disabled={
          showDropdown ||
          showGithubDropdown ||
          showBanMember ||
          showChangeLeader ||
          showRemoveMember ||
          showLeaveProject ||
          showDeleteProject
        }
        onClick={() => setShowDropdown(true)}
      >
        <BsThreeDotsVertical className="text-xl" />
      </button>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-10 bg-gray-100 border-gray-400 border right-0 dark:bg-backgrounddark rounded p-2 text-sm flex flex-col text-black dark:text-gray-300 justify-center items-end"
        >
          {isLeader && (
            <button
              type="button"
              onClick={() => changeOpen(!project.is_open)}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200  w-full text-right"
            >
              {project.is_open ? "Close project to new members" : "Open project to new members"}
            </button>
          )}
          {isLeader && members.some((m) => !m.banned && m.user_id !== project.leader) && (
            <button
              type="button"
              onClick={() => {
                setShowChangeLeader(true);
                setShowDropdown(false);
              }}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200  w-full text-right"
            >
              Change leader
            </button>
          )}
          {isLeader && (
            <button
              type="button"
              onClick={() => {
                setShowGithubDropdown(true);
                setShowDropdown(false);
              }}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200  w-full text-right"
            >
              Set GitHub URL
            </button>
          )}
          {isLeader && <hr className="border-0 h-[1px] bg-neutral-600 w-full my-1 rounded-full" />}
          {isLeader && members.some((m) => !m.banned && m.user_id !== project.leader) && (
            <button
              type="button"
              onClick={() => {
                setShowRemoveMember(true);
                setShowDropdown(false);
              }}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 font-medium text-red-600 dark:font-normal dark:text-red-500  hover:text-red-600 p-1 w-full text-right"
            >
              Remove member
            </button>
          )}
          {isLeader && members.some((m) => !m.banned && m.user_id !== project.leader) && (
            <button
              type="button"
              onClick={() => {
                setShowBanMember(true);
                setShowDropdown(false);
              }}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 font-medium text-red-600 dark:font-normal dark:text-red-500  hover:text-red-600 p-1 w-full text-right"
            >
              Ban member
            </button>
          )}
          <button
            type="button"
            disabled={isLeader}
            onClick={() => {
              setShowLeaveProject(true);
              setShowDropdown(false);
            }}
            data-tooltip-id="leader-tooltip"
            data-tooltip-content="Leader cannot leave project"
            className={`${
              isLeader
                ? "text-gray-500 hover:cursor-not-allowed"
                : "hover:bg-gray-200 dark:hover:bg-neutral-800 font-medium text-red-600 dark:font-normal dark:text-red-500  hover:text-red-600"
            }  p-1 w-full text-right`}
          >
            Leave project
          </button>
          {isLeader && (
            <button
              disabled={members.some((m) => !m.banned && m.user_id !== project.leader)}
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Members are in this project"
              type="button"
              onClick={() => {
                setShowDeleteProject(true);
                setShowDropdown(false);
              }}
              className={`${
                members.some((m) => !m.banned && m.user_id !== project.leader)
                  ? "text-gray-500 hover:cursor-not-allowed"
                  : "hover:bg-gray-200 dark:hover:bg-neutral-800 font-medium text-red-600 dark:font-normal dark:text-red-500  hover:text-red-600"
              }  p-1 w-full text-right`}
            >
              Delete project
            </button>
          )}
          {isLeader && <Tooltip id="leader-tooltip" place="bottom" type="dark" effect="float" />}
          {members.some((m) => !m.banned && m.user_id !== project.leader) && (
            <Tooltip id="delete-tooltip" place="bottom" type="dark" effect="float" />
          )}
        </div>
      )}
      {showChangeLeader && (
        <div
          ref={changeLeaderRef}
          className="absolute top-10 bg-gray-100 border-gray-400 border right-0 dark:bg-backgrounddark rounded p-2 text-sm flex flex-col text-black dark:text-gray-300 justify-center items-end"
        >
          {confirmChangeLeader ? (
            <>
              <p className="font-medium text-red-600 dark:font-normal dark:text-red-500">Are you sure?</p>
              <div className="flex justify-center mx-auto gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => changeLeader(confirmChangeLeader)}
                  className=" hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmChangeLeader(false)}
                  className=" hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              {members
                .filter((m) => m.user_id !== project.leader && !m.banned)
                .map((m) => {
                  return (
                    <button
                      key={m.user.user_id}
                      type="button"
                      onClick={() => setConfirmChangeLeader(m.user_id)}
                      className="w-full hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                    >
                      {m.user.username}
                    </button>
                  );
                })}
              <hr className="border-0 h-[1px] bg-neutral-600 w-full my-1 rounded-full" />
              <button
                type="button"
                onClick={() => {
                  setShowChangeLeader(false);
                  setShowDropdown(true);
                }}
                className="w-full hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
              >
                Back
              </button>
            </>
          )}
        </div>
      )}
      {showGithubDropdown && (
        <div
          ref={githubRef}
          className="absolute top-10 bg-gray-100 border-gray-400 border right-0 dark:bg-backgrounddark rounded p-2 text-sm flex flex-col justify-center items-end"
        >
          <form onSubmit={handleSubmit(changeGithub)} className="rounded py-1 w-60 flex">
            <input
              {...register("github", { required: "URL must be provided", pattern: githubUrlPattern })}
              className="dark:border-gray-400 dark:border rounded bg-gray-200 dark:bg-backgrounddark dark:focus:bg-neutral-800 focus:ring-0 focus:outline-none text-xs flex-1 p-1"
              type="text"
              placeholder={project.github ? project.github : "GitHub URL"}
            />
            <button
              type="submit"
              className="text-xs p-1 text-gray-100 bg-primary hover:bg-primarydark hover:text-gray-200 rounded ml-2"
            >
              Enter
            </button>
          </form>
          {errors.github && (
            <p role="alert" className=" text-xs text-red-500 ">
              {errors.github?.type === "required" ? errors.github?.message : "Invalid URL"}
            </p>
          )}
          <hr className="border-0 h-[1px] bg-neutral-600 w-full my-1 rounded-full" />
          <button
            type="button"
            onClick={() => {
              setShowGithubDropdown(false);
              setShowDropdown(true);
            }}
            className="w-full hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
          >
            Back
          </button>
        </div>
      )}
      {showBanMember && (
        <div
          ref={banMemberRef}
          className="absolute top-10 bg-gray-100 border-gray-400 border right-0 dark:bg-backgrounddark rounded p-2 text-sm flex flex-col text-black dark:text-gray-300 justify-center items-end"
        >
          {confirmBanMember ? (
            <>
              <p className="font-medium text-red-600 dark:font-normal dark:text-red-500">Are you sure?</p>
              <div className="flex justify-center mx-auto gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => banMember(confirmBanMember)}
                  className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmBanMember(false)}
                  className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              {members
                .filter((m) => m.user_id !== project.leader && !m.banned)
                .map((m) => {
                  return (
                    <button
                      key={m.user.user_id}
                      type="button"
                      onClick={() => setConfirmBanMember(m.user_id)}
                      className="w-full hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                    >
                      {m.user.username}
                    </button>
                  );
                })}
              <hr className="border-0 h-[1px] bg-neutral-600 w-full my-1 rounded-full" />
              <button
                type="button"
                onClick={() => {
                  setShowBanMember(false);
                  setShowDropdown(true);
                }}
                className="w-full hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
              >
                Back
              </button>
            </>
          )}
        </div>
      )}
      {showRemoveMember && (
        <div
          ref={removeMemberRef}
          className="absolute top-10 bg-gray-100 border-gray-400 border right-0 dark:bg-backgrounddark rounded p-2 text-sm flex flex-col text-black dark:text-gray-300 justify-center items-end"
        >
          {confirmRemoveMember ? (
            <>
              <p className="font-medium text-red-600 dark:font-normal dark:text-red-500">Are you sure?</p>
              <div className="flex justify-center mx-auto gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => removeMember(confirmRemoveMember)}
                  className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemoveMember(false)}
                  className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              {members
                .filter((m) => m.user_id !== project.leader && !m.banned)
                .map((m) => {
                  return (
                    <button
                      key={m.user.user_id}
                      type="button"
                      onClick={() => setConfirmRemoveMember(m.user_id)}
                      className="w-full hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
                    >
                      {m.user.username}
                    </button>
                  );
                })}
              <hr className="border-0 h-[1px] bg-neutral-600 w-full my-1 rounded-full" />
              <button
                type="button"
                onClick={() => {
                  setShowRemoveMember(false);
                  setShowDropdown(true);
                }}
                className="w-full hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
              >
                Back
              </button>
            </>
          )}
        </div>
      )}
      {showLeaveProject && (
        <div
          ref={leaveProjectRef}
          className="absolute top-10 bg-gray-100 border-gray-400 border right-0 dark:bg-backgrounddark rounded p-2 text-sm flex flex-col text-black dark:text-gray-300 justify-center items-end"
        >
          <p className="font-medium text-red-600 dark:font-normal dark:text-red-500">Confirm leave project?</p>
          <div className="flex justify-center mx-auto gap-4 mt-2">
            <button
              type="button"
              onClick={leaveProject}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLeaveProject(false);
                setShowDropdown(true);
              }}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
            >
              No
            </button>
          </div>
        </div>
      )}
      {showDeleteProject && (
        <div
          ref={deleteProjectRef}
          className="absolute top-10 bg-gray-100 border-gray-400 border right-0 dark:bg-backgrounddark rounded p-2 text-sm flex flex-col text-black dark:text-gray-300 justify-center items-end"
        >
          <p className="font-medium text-red-600 dark:font-normal dark:text-red-500">
            Are you sure? Changes cannot be undone.
          </p>
          <div className="flex justify-center mx-auto gap-4 mt-2">
            <button
              type="button"
              onClick={deleteProject}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteProject(false);
                setShowDropdown(true);
              }}
              className="hover:bg-gray-200 dark:hover:bg-neutral-800 px-2 py-1 rounded  dark:hover:text-gray-200 text-right"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
