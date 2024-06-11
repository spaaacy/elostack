import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import Post from "./Post";
import { UserContext } from "@/context/UserContext";
import { MdOutlinePublic } from "react-icons/md";
import { MdOutlinePublicOff } from "react-icons/md";

const Feed = ({ id, project }) => {
  const { profile, session } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [publicPost, setPublicPost] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!dataLoaded) {
        fetchPosts();
        setDataLoaded(true);
      }
    };

    loadData();
  }, [session]);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const createPost = async (data, e) => {
    e?.preventDefault();
    const userId = session?.data.session.user.id;
    if (!userId) return;
    try {
      const postId = uuidv4();
      const response = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          content: data.content,
          userId,
          projectId: id ? id : null,
          postId: postId,
          isPublic: project ? publicPost : true,
          projectTitle: project.title,
        }),
      });
      if (response.status === 201) {
        setValue("content", "");
        setPosts((prevPosts) => [
          {
            created_at: new Date().toISOString(),
            username: profile.username,
            content: data.content,
            user_id: userId,
            projectId: id ? id : null,
            id: postId,
            likes: [],
            comment: [],
          },
          ...prevPosts,
        ]);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const fetchPosts = async () => {
    try {
      let response;
      if (project) {
        response = await fetch(`/api/post/${id}`, {
          method: "POST",
          headers: {
            "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
          },
          body: JSON.stringify({ pageNumber: 1, pageSize: 10 }),
        });
      } else {
        response = await fetch("/api/post", {
          method: "POST",
          body: JSON.stringify({
            pageNumber: 1,
            pageSize: 10,
          }),
        });
      }
      if (response.status === 200) {
        const { posts } = await response.json();
        setPosts(posts);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className=" sm:ml-4 max-sm:mt-4 sm:col-span-2 lg:col-span-4">
      {session?.data.session && (
        <>
          <form
            onSubmit={handleSubmit(createPost)}
            className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-backgrounddark dark:border dark:border-gray-400 flex flex-col gap-2"
          >
            <div className="flex items-center">
              <p className="text-base font-semibold ">Post an update</p>
              {project && (
                <button
                  className="ml-auto flex items-center gap-2 rounded-full px-2 py-1 bg-sky-600 text-white text-sm"
                  onClick={() => setPublicPost(!publicPost)}
                >
                  {publicPost ? "Public" : "Private"}
                  {publicPost ? <MdOutlinePublic /> : <MdOutlinePublicOff />}
                </button>
              )}
            </div>
            <textarea
              {...register("content", { required: "Content cannot be empty" })}
              id="scrollableDiv"
              placeholder="Tell everyone what's new..."
              className="p-2 text-sm w-full bg-gray-200 rounded-xl resize-none focus:bg-gray-300 dark:bg-backgrounddark dark:focus:bg-neutral-800 dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
              rows={3}
            />
            <button
              className="ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-xs text-gray-200 hover:text-gray-300 dark:shadow dark:shadow-neutral-800"
              type="submit"
            >
              Create
            </button>
          </form>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
        </>
      )}
      <ul className="flex flex-col gap-6 mt-4">
        {posts.map((p, i) => (
          <Post key={p.id} post={p} setPosts={setPosts} project={project} />
        ))}
      </ul>
    </div>
  );
};

export default Feed;
