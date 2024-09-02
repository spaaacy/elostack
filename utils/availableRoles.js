export default function (members, projectRoles) {
  let availableRoles = [];

  let roleCounts = {};
  let roleTaken = {};

  // Initialize role counts and taken counts
  projectRoles
    .toLowerCase()
    .split(", ")
    .forEach((role) => {
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

  members.forEach((member) => {
    if (member.role in roleCounts) {
      roleTaken[member.role] = (roleTaken[member.role] || 0) + 1;
    }
  });

  for (let role in roleCounts) {
    if ((roleTaken[role] || 0) < roleCounts[role]) {
      availableRoles.push(role);
    }
  }

  return availableRoles;
}
