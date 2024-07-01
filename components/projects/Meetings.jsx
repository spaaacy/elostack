"use client";

import { UserContext } from "@/context/UserContext";
import { formatTime } from "@/utils/formatTime";
import { useContext, useEffect, useState } from "react";
import CreateMeeting from "./CreateMeeting";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import findCommonTime from "@/utils/findCommonTime";

const Meetings = ({ meetings, setMeetings, project }) => {
  const [selectedMeeting, setSelectedMeeting] = useState();
  const [createMeeting, setCreateMeeting] = useState(false);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [commonTime, setCommonTime] = useState();

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
                        console.log(m);
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
                          ).start_time
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
                        console.log(m);
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
                          ).start_time
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
        {selectedMeeting && (
          <div className=" rounded px-4 py-2 bg-gray-200 dark:bg-backgrounddark dark:border dark:border-gray-400 flex gap-8 max-sm:w-full text-sm  w-full">
            <div className="flex flex-col gap-2 w-1/2">
              <h4 className="font-semibold text-normal">Meeting Details</h4>
              <p>
                <span className="font-semibold">Date: </span>
                {formatTime(selectedMeeting.datetime, "date")}
                <br />
                <span className="font-semibold">Time: </span>
                {selectedMeeting.time_found
                  ? selectedMeeting.time_found === true
                    ? formatTime(selectedMeeting.datetime, "time")
                    : "No common time found"
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
              {selectedMeeting.start_time.length > 0 && (
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
                          {`${commonTime ? formatTime(commonTime) : formatTime(selectedMeeting.start_time[0])}`}
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
                          onClick={() => {}}
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
