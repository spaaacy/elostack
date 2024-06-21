"use client";

import { UserContext } from "@/context/UserContext";
import { formatTime } from "@/utils/formatTime";
import { useContext, useEffect, useState } from "react";

const Meetings = ({ meetings, setMeetings }) => {
  const [selectedMeeting, setSelectedMeeting] = useState();

  return (
    <div className="flex gap-4 flex-1">
      <div className="flex flex-col gap-2">
        {meetings.filter((m) => new Date(m.datetime) > new Date()).length > 0 && (
          <>
            <h3 className="font-semibold">Upcoming meetings</h3>
            {meetings
              ?.filter((m) => new Date(m.datetime) > new Date())
              .map((m, i) => {
                return (
                  <button
                    onClick={() => setSelectedMeeting(m)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:border dark:border-gray-400 dark:bg-backgrounddark dark:hover:bg-neutral-800"
                    type="button"
                    key={i}
                  >
                    {m.datetime}
                  </button>
                );
              })}
          </>
        )}
        {meetings.filter((m) => new Date(m.datetime) < new Date()).length > 0 && (
          <>
            <h3 className="font-semibold">Previous meetings</h3>
            {meetings
              ?.filter((m) => new Date(m.datetime) < new Date())
              .map((m, i) => {
                return (
                  <button
                    onClick={() => setSelectedMeeting(m)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:border dark:border-gray-400 dark:bg-backgrounddark dark:hover:bg-neutral-800"
                    type="button"
                    key={i}
                  >
                    {formatTime(m.datetime)}
                  </button>
                );
              })}
          </>
        )}
      </div>
      {selectedMeeting && (
        <div className="ml-12 rounded px-4 py-2 bg-gray-200 dark:bg-backgrounddark dark:border dark:border-gray-400 flex-1 flex flex-col gap-2">
          <h4 className="font-semibold text-lg">Meeting Details</h4>
          <p>
            <span className="font-semibold">Date: </span>
            {formatTime(selectedMeeting.datetime, "date")}
            <br />
            <span className="font-semibold">Time: </span>
            {formatTime(selectedMeeting.datetime, "time")}
          </p>
          {selectedMeeting?.username.length > 0 && (
            <>
              <p className="font-semibold text-lg">Availability</p>
              <div>
                {selectedMeeting.username.map((u, i) => (
                  <p key={i}>
                    <span className="font-medium">{`${u}: `}</span>
                    {`${formatTime(selectedMeeting.start_time[i], "time")} - ${formatTime(
                      selectedMeeting.end_time[i],
                      "time"
                    )}`}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Meetings;
