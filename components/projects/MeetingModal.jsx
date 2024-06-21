"use client";

import { formatTime } from "@/utils/formatTime";
import { IoAddCircle } from "react-icons/io5";
import { IoIosRemoveCircle } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import toast from "react-hot-toast";
import generateTimestamp from "@/utils/generateTimestamp";
import Loader from "../common/Loader";

const MeetingModal = ({ pendingMeetings, setPendingMeetings }) => {
  const { session } = useContext(UserContext);
  const [currentMeeting, setCurrentMeeting] = useState(pendingMeetings[0]);
  const [slots, setSlots] = useState([{ startTime: "", endTime: "" }]);
  const [minTime, setMinTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateMinTime();
    setCurrentMeeting(pendingMeetings[0]);
  }, [currentMeeting, pendingMeetings]);

  const updateMinTime = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const dateOnly = currentMeeting.datetime.split("T")[0];

    if (dateOnly === today) {
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setMinTime(`${hours}:${minutes}`);
    } else {
      setMinTime("");
    }
  };

  const createAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userId = session.data.session.user.id;
    if (!userId || !slots[0].startTime || !slots[0].endTime) return;

    try {
      const meetingDate = currentMeeting.datetime.split("T")[0];
      const timestamptzSlots = slots.map((slot) => ({
        startTime: generateTimestamp(meetingDate, slot.startTime),
        endTime: generateTimestamp(meetingDate, slot.endTime),
      }));
      const response = await fetch("/api/meeting-availability/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          meetingId: currentMeeting.id,
          userId,
          slots: timestamptzSlots,
        }),
      });
      if (response.status === 201) {
        setSlots([{ startTime: "", endTime: "" }]);
        setPendingMeetings((prevMeetings) => prevMeetings.filter((m) => m.id !== currentMeeting.id));
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
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
    <div className="bg-backgrounddark backdrop-blur bg-opacity-50 h-screen w-screen fixed z-50">
      <form
        onSubmit={createAvailability}
        className=" max-sm:w-full sm:w-[26rem] text-sm flex flex-col gap-4 items-center dark:border dark:border-gray-400 fixed  bg-gray-200 dark:bg-neutral-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {loading ? (
          <Loader />
        ) : (
          <>
            <h3 className="text-base font-semibold">Meeting availability</h3>
            <p>
              A meeting has been scheduled by your team. In order to find a common time that works for everyone, we need
              you to enter your availability for{" "}
              <span className="font-semibold text-primary">{formatTime(currentMeeting.datetime, "date")}</span>
            </p>
            {slots.map((slot, i) => (
              <div key={i} className="flex w-full gap-2 max-sm:flex-wrap">
                <div className="flex flex-col items-start w-full">
                  <label className=" font-light">Start Time</label>
                  <input
                    className="px-2 py-1 border border-gray-400 rounded w-full"
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleSlotChange(i, "startTime", e.target.value)}
                    min={currentMeeting.datetime === new Date().toISOString().split("T")[0] ? minTime : undefined}
                    max={slot.endTime}
                  />
                </div>
                <div className="flex flex-col items-start w-full">
                  <label className=" font-light">End Time</label>
                  <input
                    className="px-2 py-1 border border-gray-400 rounded w-full"
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleSlotChange(i, "endTime", e.target.value)}
                    min={currentMeeting.datetime === new Date().toISOString().split("T")[0] ? minTime : undefined}
                  />
                </div>
                {i !== 0 && (
                  <button className="self-end" type="button" onClick={(e) => removeSlot(e, i)}>
                    <IoIosRemoveCircle className="text-primary text-lg" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addSlot} className="font-light gap-2 flex items-center mr-auto" type="button ">
              {"Add another slot"}
              <IoAddCircle className="text-primary text-lg" />
            </button>
            <button
              type="submit"
              className="ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full hover:text-gray-300 text-white mt-auto"
            >
              Create meeting
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default MeetingModal;
