export default function (sprints) {
  const sprintMap = new Map();
  sprints.forEach((sprint) => sprintMap.set(sprint.id, sprint));

  // Find the first sprint (the one with previous_sprint_id === null)
  let firstSprint = sprints.find((sprint) => sprint.previous_sprint_id === null);
  const sortedSprints = [];

  // Traverse the list using next_sprint_id
  while (firstSprint) {
    sortedSprints.push(firstSprint);
    firstSprint = sprintMap.get(firstSprint.next_sprint_id);
  }

  return sortedSprints;
}
