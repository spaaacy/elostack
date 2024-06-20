"use client";

import { useState } from "react";
import { IoAddCircle } from "react-icons/io5";
import { IoIosRemoveCircle } from "react-icons/io";

const Meetings = () => {
  const [meetingDate, setMeetingDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [slots, setSlots] = useState([{ startTime: "", endTime: "" }]);

  // Function to handle adding a new slot
  const addSlot = (e) => {
    e.preventDefault();
    setSlots([...slots, { startTime: "", endTime: "" }]);
  };

  const removeSlot = (e, index) => {
    e.preventDefault();
    setSlots(slots.filter((_, i) => i !== index));
  };

  // Function to handle changes in the input fields
  const handleSlotChange = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg">Create a meeting</h3>
      <form className="mt-4 mx-auto px-8 py-6 rounded-lg bg-white dark:bg-backgrounddark flex flex-col gap-2 dark:border-gray-400 dark:border-[1px] items-start w-full md:w-1/2">
        <p className="mt-2 font-semibold">Select a date</p>
        <label className="text-sm font-light">Meeting Date</label>
        <input
          className="px-2 py-1 border border-gray-400 rounded w-full"
          type="date"
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
        />
        <p className="mt-2 font-semibold">What times are you free?</p>
        {slots.map((slot, i) => (
          <div key={i} className="flex w-full gap-2">
            <div className="flex flex-col items-start w-full">
              <label className="text-sm font-light">Start Time</label>
              <input
                className="px-2 py-1 border border-gray-400 rounded w-full"
                type="time"
                value={slot.startTime}
                onChange={(e) =>
                  handleSlotChange(i, "startTime", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <label className="text-sm font-light">End Time</label>
              <input
                className="px-2 py-1 border border-gray-400 rounded w-full"
                type="time"
                value={slot.endTime}
                onChange={(e) => handleSlotChange(i, "endTime", e.target.value)}
              />
            </div>
            {i !== 0 && (
              <button
                className="self-end"
                type="button"
                onClick={(e) => removeSlot(e, i)}
              >
                <IoIosRemoveCircle className="text-primary text-lg" />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addSlot}
          className="font-light gap-2 flex items-center"
          type="button "
        >
          {"Add another slot"}
          <IoAddCircle className="text-primary text-lg" />
        </button>
      </form>
    </div>
  );
};

export default Meetings;
