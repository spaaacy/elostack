import { IoMdClose } from "react-icons/io";

const AlertModal = ({ message, setShowModal }) => {
  return (
    <div
      onClick={() => setShowModal(false)}
      className="bg-backgrounddark backdrop-blur bg-opacity-50 h-screen w-screen fixed z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-sm:w-full sm:w-80 flex flex-col gap-2 items-center dark:border dark:border-gray-400 fixed bg-gray-200 dark:bg-neutral-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <button type="button" onClick={() => setShowModal()} className="absolute top-4 left-4">
          <IoMdClose className="hover:text-neutral-700 dark:hover:text-neutral-400" />
        </button>
        <h3 className="font-semibold text-center">Alert</h3>
        <p className="text-sm text-center ">{message}</p>
      </div>
    </div>
  );
};

export default AlertModal;
