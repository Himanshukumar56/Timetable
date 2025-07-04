// Helper function (moved here for completeness, can be in helpers.js)
const addIdsToTasks = (schedule) => {
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

export const initialWeeklyScheduleData = addIdsToTasks({
  Monday: {
    title: "Daily Study Plan",
    tasks: [
      { time: "07:00 - 08:00", activity: "Wake up + Newspaper" },
      { time: "08:00 - 11:00", activity: "Geography + Mapping" },
      { time: "11:15 - 14:15", activity: "PSIR Paper I - Political Theories" },
      { time: "15:30 - 18:30", activity: "Post-Independence India" },
      { time: "18:30 - 20:00", activity: "Evening Walk / Break" },
      { time: "20:00 - 23:00", activity: "Current Affairs" },
      { time: "23:00 - 00:00", activity: "MCQ Practice" },
    ],
  },
  Tuesday: {
    title: "CSAT Focus Day",
    tasks: [
      { time: "07:00 - 08:00", activity: "Wake up + Newspaper" },
      { time: "08:00 - 11:00", activity: "Geography + Mapping" },
      { time: "11:15 - 14:15", activity: "PSIR Paper I - Political Theories" },
      { time: "15:30 - 18:30", activity: "Post-Independence India" },
      { time: "18:30 - 20:00", activity: "Evening Walk / Break" },
      { time: "20:00 - 23:00", activity: "CSAT Practice" },
      { time: "23:00 - 00:00", activity: "MCQ Practice" },
    ],
  },
  Wednesday: {
    title: "Daily Study Plan",
    tasks: [
      { time: "07:00 - 08:00", activity: "Wake up + Newspaper" },
      { time: "08:00 - 11:00", activity: "Geography + Mapping" },
      { time: "11:15 - 14:15", activity: "PSIR Paper I - Political Theories" },
      { time: "15:30 - 18:30", activity: "Post-Independence India" },
      { time: "18:30 - 20:00", activity: "Evening Walk / Break" },
      { time: "20:00 - 23:00", activity: "Current Affairs" },
      { time: "23:00 - 00:00", activity: "MCQ Practice" },
    ],
  },
  Thursday: {
    title: "Daily Study Plan",
    tasks: [
      { time: "07:00 - 08:00", activity: "Wake up + Newspaper" },
      { time: "08:00 - 11:00", activity: "Geography + Mapping" },
      { time: "11:15 - 14:15", activity: "PSIR Paper I - Political Theories" },
      { time: "15:30 - 18:30", activity: "Post-Independence India" },
      { time: "18:30 - 20:00", activity: "Evening Walk / Break" },
      { time: "20:00 - 23:00", activity: "Current Affairs" },
      { time: "23:00 - 00:00", activity: "MCQ Practice" },
    ],
  },
  Friday: {
    title: "CSAT Focus Day",
    tasks: [
      { time: "07:00 - 08:00", activity: "Wake up + Newspaper" },
      { time: "08:00 - 11:00", activity: "Geography + Mapping" },
      { time: "11:15 - 14:15", activity: "PSIR Paper I - Political Theories" },
      { time: "15:30 - 18:30", activity: "Post-Independence India" },
      { time: "18:30 - 20:00", activity: "Evening Walk / Break" },
      { time: "20:00 - 23:00", activity: "CSAT Practice" },
      { time: "23:00 - 00:00", activity: "MCQ Practice" },
    ],
  },
  Saturday: {
    title: "Weekend Practice Day",
    tasks: [
      { time: "07:00 - 08:00", activity: "Wake up + Newspaper" },
      { time: "08:00 - 11:00", activity: "Full-Length Test Practice" },
      { time: "11:15 - 14:15", activity: "Test Analysis + PYQs" },
      { time: "15:30 - 18:30", activity: "Essay Practice + Ethics" },
      { time: "18:30 - 20:00", activity: "Evening Walk / Break" },
      { time: "20:00 - 23:00", activity: "Monthly CA + Notes Cleanup" },
      { time: "23:00 - 00:00", activity: "MCQ Practice" },
    ],
  },
  Sunday: {
    title: "Weekend Practice Day",
    tasks: [
      { time: "07:00 - 08:00", activity: "Wake up + Newspaper" },
      { time: "08:00 - 11:00", activity: "Full-Length Test Practice" },
      { time: "11:15 - 14:15", activity: "Test Analysis + PYQs" },
      { time: "15:30 - 18:30", activity: "Essay Practice + Ethics" },
      { time: "18:30 - 20:00", activity: "Evening Walk / Break" },
      { time: "20:00 - 23:00", activity: "Monthly CA + Notes Cleanup" },
      { time: "23:00 - 00:00", activity: "MCQ Practice" },
    ],
  },
});

export const motivationalQuotes = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "The mind is everything. What you think you become.", author: "Buddha" },
  { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { quote: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
  { quote: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot" },
  { quote: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
  { quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
];

export const BREAK_REMINDER_INTERVAL_SECONDS = 60 * 60; // Remind every 60 minutes