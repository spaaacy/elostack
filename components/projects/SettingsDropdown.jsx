import { BsThreeDotsVertical } from "react-icons/bs";
import { Tooltip } from "react-tooltip";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

const status = ["In Progress", "Looking for members", "Complete"];
const githubUrlPattern = /^https?:\/\/(?:www\.)?github\.com\/[\w-]+\/[\w-]+\/?$/;

const SettingsDropdown = ({ project, isLeader, members, session, setLoading }) => {
  const dropdownRef = useRef();
  const statusRef = useRef();
  const githubRef = useRef();
  const removeMemberRef = useRef();
  const changeLeaderRef = useRef();
  const deleteProjectRef = useRef();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showGithubDropdown, setShowGithubDropdown] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState();
  const [showChangeLeader, setShowChangeLeader] = useState(false);
  const [confirmChangeLeader, setConfirmChangeLeader] = useState();
  const [showDeleteProject, setShowDeleteProject] = useState();

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

  const changeStatus = async (status) => {
    if (!session.data.session) return;
    try {
      setShowChangeStatus(false);
      setLoading(true);
      const response = await fetch("/api/project/change-status", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          status,
          projectId: project.id,
        }),
      });
      if (response.status === 200) {
        toast.success("Status changed");
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
      setShowChangeStatus(false);
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

  const removeMember = async (userId) => {
    if (!session.data.session) return;
    try {
      setShowRemoveMember(false);
      setLoading(true);
      const response = await fetch("/api/member/remove-member", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId,
          projectId: project.id,
        }),
      });
      if (response.status === 200) {
        toast.success("Member removed");
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
    if (statusRef.current && !statusRef.current.contains(event.target)) {
      setShowChangeStatus(false);
    }
    if (githubRef.current && !githubRef.current.contains(event.target)) {
      setShowGithubDropdown(false);
    }
    if (removeMemberRef.current && !removeMemberRef.current.contains(event.target)) {
      setShowRemoveMember(false);
    }
    if (changeLeaderRef.current && !changeLeaderRef.current.contains(event.target)) {
      setShowChangeLeader(false);
    }
    if (deleteProjectRef.current && !deleteProjectRef.current.contains(event.target)) {
      setShowDeleteProject(false);
    }
  };

  return (
    <div className="ml-auto">
      <button
        type="button"
        disabled={showDropdown || showChangeStatus || showGithubDropdown || showRemoveMember}
        onClick={() => setShowDropdown(true)}
      >
        <BsThreeDotsVertical className="text-xl" />
      </button>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-10 border-gray-400 border right-0 bg-gray-900 rounded p-2 text-sm flex flex-col text-gray-300 justify-center items-end"
        >
          {isLeader && (
            <button
              type="button"
              onClick={() => {
                setShowChangeStatus(true);
                setShowDropdown(false);
              }}
              className="hover:bg-gray-800 px-2 py-1 rounded  hover:text-gray-200  w-full text-right"
            >
              Change status
            </button>
          )}
          {isLeader && members.some((m) => !m.removed && m.user_id !== project.leader) && (
            <button
              type="button"
              onClick={() => {
                setShowChangeLeader(true);
                setShowDropdown(false);
              }}
              className="hover:bg-gray-800 px-2 py-1 rounded  hover:text-gray-200  w-full text-right"
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
              className="hover:bg-gray-800 px-2 py-1 rounded  hover:text-gray-200  w-full text-right"
            >
              Set GitHub URL
            </button>
          )}
          {isLeader && <hr className="border-0 h-[1px] bg-gray-600 w-full my-1 rounded-full" />}
          {isLeader && members.some((m) => !m.removed && m.user_id !== project.leader) && (
            <button
              type="button"
              onClick={() => {
                setShowRemoveMember(true);
                setShowDropdown(false);
              }}
              className="hover:bg-gray-800 text-red-500  hover:text-red-600 px-2 py-1 rounded w-full text-right"
            >
              Remove member
            </button>
          )}
          <button
            type="button"
            disabled={isLeader}
            onClick={leaveProject}
            data-tooltip-id="leader-tooltip"
            data-tooltip-content="Leader cannot leave project"
            className={`${
              isLeader ? "text-gray-500 hover:cursor-not-allowed" : "hover:bg-gray-800 text-red-500  hover:text-red-600"
            }  p-1 w-full text-right`}
          >
            Leave project
          </button>
          {isLeader && (
            <button
              disabled={members.some((m) => !m.removed && m.user_id !== project.leader)}
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Members are in this project"
              type="button"
              onClick={() => {
                setShowDeleteProject(true);
                setShowDropdown(false);
              }}
              className={`${
                members.some((m) => !m.removed && m.user_id !== project.leader)
                  ? "text-gray-500 hover:cursor-not-allowed"
                  : "hover:bg-gray-800 text-red-500  hover:text-red-600"
              }  p-1 w-full text-right`}
            >
              Delete project
            </button>
          )}
          {isLeader && <Tooltip id="leader-tooltip" place="bottom" type="dark" effect="float" />}
          {members.some((m) => !m.removed && m.user_id !== project.leader) && (
            <Tooltip id="delete-tooltip" place="bottom" type="dark" effect="float" />
          )}
        </div>
      )}
      {showGithubDropdown && (
        <div
          ref={githubRef}
          className="absolute top-10 border-gray-400 border right-0 bg-gray-900 rounded p-2 text-sm flex flex-col hover:text-gray-200 text-gray-300 justify-center items-end"
        >
          <form onSubmit={handleSubmit(changeGithub)} className="bg-gray-900 rounded px-2 py-1 w-60 flex">
            <input
              {...register("github", { required: "URL must be provided", pattern: githubUrlPattern })}
              className="bg-transparent text-xs flex-1 p-1"
              type="text"
              placeholder="GitHub URL"
            />
            <button
              type="submit"
              className="text-xs p-1 bg-orangeaccent hover:bg-orangedark hover:text-gray-300 rounded ml-2"
            >
              Enter
            </button>
          </form>
          {errors.github && (
            <p role="alert" className=" text-xs text-red-500 ">
              {errors.github?.type === "required" ? errors.github?.message : "Invalid URL"}
            </p>
          )}
          <hr className="border-0 h-[1px] bg-gray-600 w-full my-1 rounded-full" />
          <button
            type="button"
            onClick={() => {
              setShowGithubDropdown(false);
              setShowDropdown(true);
            }}
            className={"hover:bg-gray-800 py-1 px-2 text-right rounded"}
          >
            Back
          </button>
        </div>
      )}
      {showChangeStatus && (
        <div
          ref={statusRef}
          className="absolute top-10 border-gray-400 border right-0 bg-gray-900 rounded p-2 text-sm flex flex-col text-gray-300 justify-center items-end"
        >
          {status
            .filter((s) => s.toLowerCase() !== project.status.toLowerCase())
            .map((status) => {
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => changeStatus(status)}
                  className={"hover:bg-gray-800 py-1 px-2 w-full text-right rounded  hover:text-gray-200"}
                >
                  {status}
                </button>
              );
            })}
          <hr className="border-0 h-[1px] bg-gray-600 w-full my-1 rounded-full" />
          <button
            type="button"
            onClick={() => {
              setShowChangeStatus(false);
              setShowDropdown(true);
            }}
            className={"hover:bg-gray-800 py-1 px-2 w-full text-right rounded  hover:text-gray-200"}
          >
            Back
          </button>
        </div>
      )}
      {showRemoveMember && (
        <div
          ref={removeMemberRef}
          className="absolute top-10 border-gray-400 border right-0 bg-gray-900 rounded p-2 text-sm flex flex-col text-gray-300 justify-center items-end"
        >
          {confirmRemoveMember ? (
            <>
              <p className="text-red-500">Are you sure?</p>
              <div className="flex justify-center mx-auto gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => removeMember(confirmRemoveMember)}
                  className="hover:bg-gray-800 py-1 px-2 text-right rounded  hover:text-gray-200"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemoveMember(false)}
                  className="hover:bg-gray-800 py-1 px-2 text-right rounded  hover:text-gray-200"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              {members
                .filter((m) => m.user_id !== project.leader && !m.removed)
                .map((m) => {
                  return (
                    <button
                      key={m.user.user_id}
                      type="button"
                      onClick={() => setConfirmRemoveMember(m.user_id)}
                      className={"hover:bg-gray-800 py-1 px-2 w-full text-right rounded  hover:text-gray-200"}
                    >
                      {m.user.username}
                    </button>
                  );
                })}
              <hr className="border-0 h-[1px] bg-gray-600 w-full my-1 rounded-full" />
              <button
                type="button"
                onClick={() => {
                  setShowRemoveMember(false);
                  setShowDropdown(true);
                }}
                className={"hover:bg-gray-800 py-1 px-2 w-full text-right rounded  hover:text-gray-200"}
              >
                Back
              </button>
            </>
          )}
        </div>
      )}
      {showChangeLeader && (
        <div
          ref={changeLeaderRef}
          className="absolute top-10 border-gray-400 border right-0 bg-gray-900 rounded p-2 text-sm flex flex-col text-gray-300 justify-center items-end"
        >
          {confirmChangeLeader ? (
            <>
              <p className="text-red-500">Are you sure?</p>
              <div className="flex justify-center mx-auto gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => changeLeader(confirmChangeLeader)}
                  className="hover:bg-gray-800 py-1 px-2 text-right rounded  hover:text-gray-200"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmChangeLeader(false)}
                  className="hover:bg-gray-800 py-1 px-2 text-right rounded  hover:text-gray-200"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              {members
                .filter((m) => m.user_id !== project.leader && !m.removed)
                .map((m) => {
                  return (
                    <button
                      key={m.user.user_id}
                      type="button"
                      onClick={() => setConfirmChangeLeader(m.user_id)}
                      className={"hover:bg-gray-800 py-1 px-2 w-full text-right rounded  hover:text-gray-200"}
                    >
                      {m.user.username}
                    </button>
                  );
                })}
              <hr className="border-0 h-[1px] bg-gray-600 w-full my-1 rounded-full" />
              <button
                type="button"
                onClick={() => {
                  setShowChangeLeader(false);
                  setShowDropdown(true);
                }}
                className={"hover:bg-gray-800 py-1 px-2 w-full text-right rounded  hover:text-gray-200"}
              >
                Back
              </button>
            </>
          )}
        </div>
      )}
      {showDeleteProject && (
        <div
          ref={deleteProjectRef}
          className="absolute top-10 border-gray-400 border right-0 bg-gray-900 rounded p-2 text-sm flex flex-col text-gray-300 justify-center items-end"
        >
          <p className="text-red-500">Are you sure? Changes cannot be undone.</p>
          <div className="flex justify-center mx-auto gap-4 mt-2">
            <button
              type="button"
              onClick={deleteProject}
              className="hover:bg-gray-800 py-1 px-2 text-right rounded  hover:text-gray-200"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteProject(false);
                setShowDropdown(true);
              }}
              className="hover:bg-gray-800 py-1 px-2 text-right rounded  hover:text-gray-200"
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
