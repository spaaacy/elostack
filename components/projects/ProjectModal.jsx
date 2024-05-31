import { formatDuration } from "@/utils/formatDuration";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";

const ProjectModal = ({ setShowModal, project, handleJoin, session, removed }) => {
  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  return (
    <div onClick={handleModalClose} className="bg-gray-900 bg-opacity-50 h-screen w-screen fixed">
      <div
        id="scrollableDiv"
        className="dark:border dark:border-gray-400 flex flex-col items-start justify-start fixed h-1/2 max-sm:w-full sm:w-[480px] bg-gray-200 dark:bg-gray-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
      >
        <div className="flex justify-between items-center w-full">
          <h3 className="font-semibold ">{project.title}</h3>
          <button className="ml-auto" onClick={() => setShowModal(false)}>
            <IoMdClose className="text-xl hover:text-gray-300" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs w-full mt-2 text-primary dark:font-normal font-medium">
          <p>{project.status}</p>
          <p className="ml-auto ">{`Leader: ${project.leader_username}`}</p>
        </div>
        <div className="flex justify-between items-baseline w-full flex-1">
          <p className=" font-light text-sm mt-4 line-clamp-14">
            <span className="font-medium">Description</span>
            <br />
            {project.description}
          </p>
          <p className="text-xs text-primary font-medium dark:font-normal flex-shrink-0">
            {formatDuration(project.duration_length, project.duration_type)}
          </p>
        </div>
        <div className="w-full flex justify-between items-end gap-2">
          <div className="flex flex-col justify-center items-start">
            <p className=" text-xs text-primary font-medium dark:font-normal">Technologies</p>
            <p className=" text-xs">{project.technologies}</p>
          </div>

          {session?.data.session ? (
            project.is_open &&
            !removed && (
              <button
                onClick={handleJoin}
                className="bg-primary hover:bg-primarydark hover:text-gray-300 mt-auto self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-gray-800 text-gray-200"
              >
                Join
              </button>
            )
          ) : (
            <Link
              href={"/signin"}
              className={
                "bg-primary hover:bg-primarydark hover:text-gray-300 mt-auto self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-gray-800 text-gray-200"
              }
            >
              Join
            </Link>
          )}
          {removed && (
            <p className="bg-red-700 mt-auto self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-gray-800 flex-shrink-0 text-gray-200">
              You were removed
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
