"use client";

import { UserContext } from "@/context/UserContext";
import { formatTime } from "@/utils/formatTime";
import { useContext, useEffect, useState } from "react";
import CreateMeeting from "./CreateMeeting";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import findCommonTime from "@/utils/findCommonTime";
import toast from "react-hot-toast";
import Loader from "../common/Loader";

const Meetings = ({ meetings, setMeetings, project }) => {
  const { session } = useContext(UserContext);
  const [selectedMeeting, setSelectedMeeting] = useState();
  const [createMeeting, setCreateMeeting] = useState(false);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [commonTime, setCommonTime] = useState();
  const [loading, setLoading] = useState(false);

  const createMeetingLink = async () => {
    if (!session.data.session) return;
    setLoading(true);
    setShowConfirmCreate(false);
    try {
      let date = new Date(selectedMeeting.start_time[0]);
      date.setHours(date.getHours() + 1);
      const endTime = date.toISOString();
      const attendees = selectedMeeting.email.map((item) => ({ email: item }));
      console.log(attendees);

      const response = await fetch("/api/meeting/create-link", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          startTime: commonTime ? commonTime.start_time : selectedMeeting.start_time[0],
          endTime: commonTime ? commonTime.end_time : endTime,
          attendees,
          projectId: project.id,
          meetingId: selectedMeeting.id,
          projectTitle: project.title,
        }),
      });
      if (response.status === 201) {
        toast.success("Meeting link created");
        const { url } = await response.json();
        console.log(url);
        setMeetings((prevMeetings) =>
          prevMeetings.map((m) => (m.id === selectedMeeting.id ? { ...m, url, time_found: true } : m))
        );
        setSelectedMeeting({ ...selectedMeeting, url, time_found: true });
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (createMeeting) {
    return <CreateMeeting setCreateMeeting={setCreateMeeting} setMeetings={setMeetings} project={project} />;
  } else {
    return (
      <div className="flex max-sm:flex-col gap-4 flex-1 items-start">
        <div className="flex flex-col gap-2 max-sm:w-full flex-shrink-0">
          <h3 className="font-semibold">Upcoming meetings</h3>
          {meetings?.filter((m) => {
            let date1 = new Date(m.datetime);
            let date2 = new Date();
            date1.setHours(0, 0, 0, 0);
            date2.setHours(0, 0, 0, 0);
            return date1 >= date2;
          }).length > 0 ? (
            <>
              {meetings
                ?.filter((m) => {
                  let date1 = new Date(m.datetime);
                  let date2 = new Date();
                  date1.setHours(0, 0, 0, 0);
                  date2.setHours(0, 0, 0, 0);
                  return date1 >= date2;
                })
                .map((m, i) => {
                  return (
                    <button
                      onClick={() => {
                        setSelectedMeeting(m);
                        setCommonTime(
                          findCommonTime(
                            m.user_id.map((user_id, i) => {
                              return {
                                user_id,
                                start_time: m.start_time[i],
                                end_time: m.end_time[i],
                              };
                            })
                          )
                        );
                      }}
                      className={`${
                        selectedMeeting?.id === m.id
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 dark:border dark:border-gray-400 dark:bg-backgrounddark dark:hover:bg-neutral-800"
                      } px-4 py-2 rounded text-sm`}
                      type="button"
                      key={i}
                    >
                      {formatTime(m.datetime, "date")}
                    </button>
                  );
                })}
            </>
          ) : (
            <p className="font-light text-sm">No upcoming meetings</p>
          )}
          {meetings?.filter((m) => {
            let date1 = new Date(m.datetime);
            let date2 = new Date();
            date1.setHours(0, 0, 0, 0);
            date2.setHours(0, 0, 0, 0);
            return date1 < date2;
          }).length > 0 && (
            <>
              <h3 className="font-semibold">Previous meetings</h3>
              {meetings
                ?.filter((m) => {
                  let date1 = new Date(m.datetime);
                  let date2 = new Date();
                  date1.setHours(0, 0, 0, 0);
                  date2.setHours(0, 0, 0, 0);
                  return date1 < date2;
                })
                .map((m, i) => {
                  return (
                    <button
                      onClick={() => {
                        setSelectedMeeting(m);
                        setCommonTime(
                          findCommonTime(
                            m.user_id.map((user_id, i) => {
                              return {
                                user_id,
                                start_time: m.start_time[i],
                                end_time: m.end_time[i],
                              };
                            })
                          )
                        );
                      }}
                      className={`${
                        selectedMeeting?.id === m.id
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 dark:border dark:border-gray-400 dark:bg-backgrounddark dark:hover:bg-neutral-800"
                      } px-4 py-2 rounded text-sm`}
                      type="button"
                      key={i}
                    >
                      {formatTime(m.datetime, "date")}
                    </button>
                  );
                })}
            </>
          )}
        </div>
        {selectedMeeting && !loading && (
          <div className=" rounded px-4 py-2 bg-gray-200 dark:bg-backgrounddark dark:border dark:border-gray-400 flex gap-8 max-sm:w-full text-sm  w-full">
            <div className="flex flex-col gap-2 w-1/2">
              <h4 className="font-semibold text-normal">Meeting Details</h4>
              <p>
                <span className="font-semibold">Date: </span>
                {formatTime(selectedMeeting.datetime, "date")}
                <br />
                <span className="font-semibold">Time: </span>
                {selectedMeeting.time_found === false
                  ? "No common time found"
                  : selectedMeeting.time_found === true
                  ? formatTime(selectedMeeting.datetime, "time")
                  : "TBD—Waiting on Member Availability"}
              </p>
              {selectedMeeting.url && (
                <Link
                  target="_blank"
                  className="dark:text-blue-400 dark:hover:text-blue-500 text-blue-600 hover:text-blue-700 hover:underline"
                  href={selectedMeeting.url}
                >
                  Meeting Link
                </Link>
              )}
              {selectedMeeting.start_time.length > 0 && !selectedMeeting.url && (
                <>
                  {!showConfirmCreate ? (
                    <button
                      type="button"
                      onClick={() => setShowConfirmCreate(true)}
                      className="mt-auto mr-auto bg-primary hover:bg-primarydark rounded-full px-2 py-1 text-sm hover:text-gray-300 text-white"
                    >
                      Create Link
                    </button>
                  ) : (
                    <div className="flex flex-col items-start justify-center gap-2 mt-auto">
                      <p>
                        A meeting will be created for{` `}
                        <span className="text-primary font-semibold">
                          {`${
                            commonTime ? formatTime(commonTime.start_time) : formatTime(selectedMeeting.start_time[0])
                          }`}
                        </span>
                        {". "}
                        Continue?
                      </p>
                      <div className="flex gap-2 items-center ml-auto">
                        <button
                          onClick={() => {
                            setShowConfirmCreate(false);
                          }}
                          type="button"
                          className="mt-auto mr-auto rounded-full px-2 py-1 text-sm"
                        >
                          No
                        </button>
                        <button
                          onClick={() => createMeetingLink()}
                          type="button"
                          className="mt-auto mr-auto bg-primary hover:bg-primarydark rounded-full px-2 py-1 text-sm hover:text-gray-300 text-white"
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              {selectedMeeting?.username?.length > 0 && (
                <>
                  <p className="font-semibold text-normal">Availability</p>
                  <div>
                    {selectedMeeting.username.map((u, i) => (
                      <div key={i}>
                        <p>
                          {(i === 0 || selectedMeeting.username[i - 1] !== u) && (
                            <span className="font-medium">
                              {`${u}: `}
                              <br />
                            </span>
                          )}
                        </p>
                        <li>
                          {`${formatTime(selectedMeeting.start_time[i])} - ${formatTime(selectedMeeting.end_time[i])}`}
                        </li>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {selectedMeeting && loading && <Loader />}
        <button
          type="button"
          onClick={() => setCreateMeeting(true)}
          className="ml-auto bg-primary hover:bg-primarydark rounded-full px-2 py-1 text-sm hover:text-gray-300 text-white flex-shrink-0"
        >
          Create meeting
        </button>
      </div>
    );
  }
};

export default Meetings;
