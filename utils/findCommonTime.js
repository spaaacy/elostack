export default function (availabilities) {
  if (availabilities.length === 0) {
    return []; // If no meetings, return empty array
  }

  // Prepare an array to hold all individual user's meeting time slots
  const userMeetingSlots = {};

  // Iterate through each meeting and organize them by user_id
  availabilities.forEach((meeting) => {
    const { user_id, start_time, end_time } = meeting;

    if (!userMeetingSlots[user_id]) {
      userMeetingSlots[user_id] = [];
    }

    userMeetingSlots[user_id].push({
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    });
  });

  // Initialize commonSlots with the time slots of the first user
  const initialUserId = Object.keys(userMeetingSlots)[0];
  let commonSlots = userMeetingSlots[initialUserId].map((slot) => ({
    start_time: slot.start_time,
    end_time: slot.end_time,
  }));

  // Find overlaps with the meetings of other users
  Object.keys(userMeetingSlots).forEach((userId) => {
    if (userId === initialUserId) {
      return; // Skip the initial user
    }

    const userSlots = userMeetingSlots[userId];

    let newCommonSlots = [];
    let j = 0;

    // Merge current commonSlots with userSlots
    while (j < commonSlots.length) {
      const slotA = commonSlots[j];

      userSlots.forEach((slotB) => {
        // Check for overlap
        if (slotA.end_time > slotB.start_time && slotB.end_time > slotA.start_time) {
          newCommonSlots.push({
            start_time: new Date(Math.max(slotA.start_time, slotB.start_time)),
            end_time: new Date(Math.min(slotA.end_time, slotB.end_time)),
          });
        }
      });

      j++;
    }

    commonSlots = newCommonSlots;
  });

  // Find the earliest common slot with at least 1 hour duration
  const earliestSlot = commonSlots.find((slot) => {
    const duration = (slot.end_time - slot.start_time) / (1000 * 60 * 60); // Convert duration to hours
    return duration >= 1;
  });

  if (earliestSlot) {
    return {
      start_time: earliestSlot.start_time.toISOString(),
      end_time: earliestSlot.end_time.toISOString(),
    };
  } else {
    return null; // Return null if no suitable slot is found
  }
}
