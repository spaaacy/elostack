import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import Post from "./Post";

const Feed = ({ id, session, members, project }) => {
  const [posts, setPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

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
          projectId: id,
          postId: postId,
        }),
      });
      if (response.status === 201) {
        setValue("content", "");
        setPosts((prevPosts) => [
          {
            content: data.content,
            user_id: userId,
            project_id: id,
            id: postId,
            like: [],
            comment: []
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
      const response = await fetch(`/api/post/${id}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { posts } = await response.json();
        setPosts(posts);
        console.log(posts)
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className=" sm:ml-4 max-sm:mt-4 sm:col-span-2 lg:col-span-4">
      <form
        onSubmit={handleSubmit(createPost)}
        className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-backgrounddark dark:border dark:border-gray-400 flex flex-col gap-2"
      >
        <p className="text-base font-semibold ">Post an update</p>
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
      {members && (
        <ul className="flex flex-col gap-2 mt-4">
          {posts.map((p, i) => (
            <Post key={i} post={p} session={session} setPosts={setPosts} project={project} members={members} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feed;
