import { useForm } from "react-hook-form";

const Feed = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const createPost = async (data, e) => {
    e.preventDefault();
  };

  return (
    <div className=" sm:ml-4 max-sm:mt-4 sm:col-span-2 lg:col-span-4">
      <form
        onSubmit={handleSubmit(createPost)}
        className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-gray-900 flex flex-col gap-2"
      >
        <p className="text-base font-semibold ">Post an update</p>
        <textarea
          {...register("content", { required: "Content cannot be empty" })}
          placeholder="Tell everyone what's new..."
          className="p-2 text-sm w-full bg-gray-200 rounded-xl resize-none focus:bg-gray-300 dark:bg-gray-900 dark:focus:bg-gray-800 dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
          rows={3}
        />
        {errors.content && (
          <p role="alert" className="text-xs text-red-500">
            {errors.contet.message}
          </p>
        )}
        <button
          className="ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm text-gray-200 hover:text-gray-300 dark:shadow dark:shadow-gray-800"
          type="submit"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default Feed;
