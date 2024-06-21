"use client";

import { useContext, useEffect, useState } from "react";
import { IoAddCircle } from "react-icons/io5";
import { IoIosRemoveCircle } from "react-icons/io";
import { UserContext } from "@/context/UserContext";
import toast from "react-hot-toast";
import generateTimestamp from "@/utils/generateTimestamp";

const Meetings = ({ project }) => {
  const { session } = useContext(UserContext);
  const [meetingDate, setMeetingDate] = useState("");
  const [slots, setSlots] = useState([{ startTime: "", endTime: "" }]);
  const [minTime, setMinTime] = useState("");

  useEffect(() => {
    updateMinTime();
  }, [meetingDate]);

  const updateMinTime = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (meetingDate === today) {
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setMinTime(`${hours}:${minutes}`);
    } else {
      setMinTime("");
    }
  };

  const createMeeting = async (e) => {
    e.preventDefault();
    const userId = session.data.session.user.id;
    if (!userId || !meetingDate || !slots[0].startTime || !slots[0].endTime) return;

    try {
      let response = await fetch("/api/meeting/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          datetime: meetingDate,
          project_id: project.id,
        }),
      });
      let meetingId;
      if (response.status === 201) {
        const results = await response.json();
        meetingId = results.meetingId;
        if (!meetingId) throw Error("No meeting ID returned!");
      } else {
        const { error } = await response.json();
        throw error;
      }

      const timestamptzSlots = slots.map((slot) => ({
        startTime: generateTimestamp(meetingDate, slot.startTime),
        endTime: generateTimestamp(meetingDate, slot.endTime),
      }));
      response = await fetch("/api/meeting-availability/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          meetingId,
          userId,
          slots: timestamptzSlots,
        }),
      });
      if (response.status !== 201) {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const addSlot = (e) => {
    e.preventDefault();
    setSlots([...slots, { startTime: "", endTime: "" }]);
  };

  const removeSlot = (e, index) => {
    e.preventDefault();
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg">Create a meeting</h3>
      <form
        onSubmit={createMeeting}
        className="mt-4 mx-auto px-8 py-6 rounded-lg bg-white dark:bg-backgrounddark flex flex-col gap-2 dark:border-gray-400 dark:border-[1px] items-start w-full md:w-1/2 text-sm"
      >
        <p className="mt-2 font-semibold">Select a date</p>
        <label className=" font-light">Meeting Date</label>
        <input
          className="px-2 py-1 border border-gray-400 rounded w-full"
          type="date"
          value={meetingDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setMeetingDate(e.target.value)}
        />
        <p className="mt-2 font-semibold">What times are you free?</p>
        {slots.map((slot, i) => (
          <div key={i} className="flex w-full gap-2">
            <div className="flex flex-col items-start w-full">
              <label className=" font-light">Start Time</label>
              <input
                className="px-2 py-1 border border-gray-400 rounded w-full"
                type="time"
                value={slot.startTime}
                onChange={(e) => handleSlotChange(i, "startTime", e.target.value)}
                min={meetingDate === new Date().toISOString().split("T")[0] ? minTime : undefined}
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <label className=" font-light">End Time</label>
              <input
                className="px-2 py-1 border border-gray-400 rounded w-full"
                type="time"
                value={slot.endTime}
                onChange={(e) => handleSlotChange(i, "endTime", e.target.value)}
                min={meetingDate === new Date().toISOString().split("T")[0] ? minTime : undefined}
              />
            </div>
            {i !== 0 && (
              <button className="self-end" type="button" onClick={(e) => removeSlot(e, i)}>
                <IoIosRemoveCircle className="text-primary text-lg" />
              </button>
            )}
          </div>
        ))}

        <button onClick={addSlot} className="font-light gap-2 flex items-center" type="button ">
          {"Add another slot"}
          <IoAddCircle className="text-primary text-lg" />
        </button>

        <button
          type="submit"
          className="ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 text-white"
        >
          Create meeting
        </button>
      </form>
    </div>
  );
};

export default Meetings;
