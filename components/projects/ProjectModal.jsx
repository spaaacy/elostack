import { formatDuration } from "@/utils/formatDuration";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";

const ProjectModal = ({ setShowModal, project, handleJoin, joined, session }) => {
  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  return (
    <div onClick={handleModalClose} className="bg-gray-900 bg-opacity-50 h-screen w-screen fixed">
      <div className="flex flex-col items-start justify-start fixed h-1/2 w-[480px] bg-gray-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex justify-between items-center w-full">
          <h3 className="font-semibold ">{project.title}</h3>
          <button className="ml-auto" onClick={() => setShowModal(false)}>
            <IoMdClose className="text-xl hover:text-gray-300" />
          </button>
        </div>

        <p className="font-extralight text-xs text-orangeaccent">{project.status}</p>
        <div className="flex justify-between items-baseline w-full flex-1">
          <p className=" font-light text-sm mt-4 line-clamp-14">
            <span className="font-medium">Description</span>
            <br />
            {project.description}
          </p>
          <p className="font-extralight text-xs text-orangeaccent flex-shrink-0">
            {formatDuration(project.duration_length, project.duration_type)}
          </p>
        </div>
        <div className="w-full flex justify-between items-end">
          <div className="flex flex-col justify-center items-start">
            <p className=" text-xs text-orangeaccent">Technologies</p>
            <p className=" text-xs">{project.technologies}</p>
          </div>

          {session?.data.session ? (
            joined ? (
              <Link
                href={`/projects/${project.id}`}
                className={
                  "bg-orangeaccent hover:bg-orangedark hover:text-gray-300 mt-auto self-end px-3 py-1  rounded-full text-sm  shadow shadow-black"
                }
              >
                Open Project
              </Link>
            ) : (
              <button
                onClick={handleJoin}
                disabled={project.status.toLowerCase() !== "looking for members"}
                className={`${
                  project.status.toLowerCase() !== "looking for members"
                    ? "bg-gray-600 text-gray-400"
                    : "bg-orangeaccent hover:bg-orangedark hover:text-gray-300"
                } mt-auto self-end px-3 py-1  rounded-full text-sm  shadow shadow-black`}
              >
                Join
              </button>
            )
          ) : (
            <Link
              href={"/signin"}
              className={
                "bg-orangeaccent hover:bg-orangedark hover:text-gray-300 mt-auto self-end px-3 py-1  rounded-full text-sm  shadow shadow-black"
              }
            >
              Join
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
