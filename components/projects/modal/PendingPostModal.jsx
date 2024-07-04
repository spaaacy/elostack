"use client";

import { useContext, useState } from "react";
import { UserContext } from "@/context/UserContext";
import Loader from "@/components/common/Loader";
import CreatePost from "@/components/feed/CreatePost";

const PendingPostModal = ({ setPosts, project, setProject }) => {
  const { session } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const onCreatePost = async () => {
    if (!session.data.session) return;
    setLoading(true);
    try {
      let response = await fetch("/api/project/change-pending-post", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          projectId: project.id,
          pendingPost: false,
        }),
      });
      response = await fetch("/api/project/change-sprint", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          projectId: project.id,
          sprintId: project.next_sprint,
        }),
      });
      if (response.status === 200) {
        setProject({ ...project, pending_post: false, current_sprint: project.next_sprint });
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
    }
    setLoading(false);
  };

  return (
    <div className="bg-backgrounddark backdrop-blur bg-opacity-50 h-screen w-screen fixed z-50">
      <div className="max-sm:w-full sm:w-[42rem] flex flex-col gap-4 items-center dark:border dark:border-gray-400 fixed  bg-gray-200 dark:bg-neutral-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {loading ? (
          <Loader />
        ) : (
          <>
            <h3 className="font-semibold text-center">
              Congrats on finishing your sprint! Post an update to continue.
            </h3>
            <div className="w-full">
              <CreatePost
                project={project}
                setPosts={setPosts}
                showBorder={false}
                onSuccess={onCreatePost}
                isPublic={true}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PendingPostModal;
