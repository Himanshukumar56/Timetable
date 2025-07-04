export const addIdsToTasks = (schedule) => {
  let taskIdCounter = 0;
  const newSchedule = {};
  for (const day in schedule) {
    newSchedule[day] = {
      ...schedule[day],
      tasks: schedule[day].tasks.map((task) => ({
        ...task,
        id: task.id || `task-${taskIdCounter++}`, // Ensure unique IDs
      })),
    };
  }
  return newSchedule;
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
};
