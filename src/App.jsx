import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import * as d3 from "d3";
import {
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  History,
  Plus,
  Trash2,
  User,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  LogOut,
  Mail,
  UserPlus,
  Edit,
  Menu,
  Award, // For Streak icon
  Palette, // For Theme icon
  BellRing, // For Reminders icon
  HeartHandshake, // For Motivation icon
  Settings, // For general settings
  Eye, // For view template
  Save, // For save template
  Upload, // For load template
  Book, // For Subject icon
  ClipboardList, // For Notes icon
} from "lucide-react";

// Firebase imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc, // Ensure addDoc is imported
  deleteDoc,
  collection,
  onSnapshot,
  getDoc, // Explicitly import getDoc
  updateDoc, // Explicitly import updateDoc
  getDocs, // Explicitly import getDocs
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SSENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const appId = firebaseConfig.appId;

// Helper function to add unique IDs to tasks
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

const initialWeeklyScheduleData = addIdsToTasks({
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

const ThemeContext = createContext(null);

const themes = {
  dark: {
    primaryBg: "bg-gray-900",
    secondaryBg: "bg-gray-800",
    tertiaryBg: "bg-gray-700",
    primaryText: "text-white",
    secondaryText: "text-gray-400",
    accent: "text-blue-400",
    accentBg: "bg-blue-600",
    accentHover: "hover:bg-blue-700",
    border: "border-gray-700",
    shadow: "shadow-xl",
  },
  light: {
    primaryBg: "bg-gray-100",
    secondaryBg: "bg-white",
    tertiaryBg: "bg-gray-200",
    primaryText: "text-gray-900",
    secondaryText: "text-gray-600",
    accent: "text-blue-600",
    accentBg: "bg-blue-500",
    accentHover: "hover:bg-blue-600",
    border: "border-gray-300",
    shadow: "shadow-md",
  },
};

const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("dark"); // Default to dark

  useEffect(() => {
    const savedTheme = localStorage.getItem("appTheme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    } else {
      setCurrentTheme("dark"); // Fallback to dark if no valid theme is saved
    }
  }, []);

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem("appTheme", themeName);
    }
  };

  const themeClasses = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ themeClasses, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

const StudyHeatmap = ({ studyHistory, onClose }) => {
  const svgRef = useRef();
  const today = new Date();
  const oneYearAgo = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  );

  const { themeClasses } = useTheme();

  useEffect(() => {
    const data = {};
    studyHistory.forEach((entry) => {
      const dateKey = new Date(entry.date).toDateString();
      if (!data[dateKey]) {
        data[dateKey] = {
          date: new Date(entry.date),
          progress: 0,
          studyDuration: 0,
          count: 0,
        };
      }
      data[dateKey].progress += entry.progress;
      data[dateKey].studyDuration += entry.studyDuration || 0;
      data[dateKey].count++;
    });

    const dailyData = Object.values(data).map((d) => ({
      date: d.date,
      avgProgress: d.progress / d.count,
      totalStudyDuration: d.studyDuration,
    }));

    const dateMap = new Map(dailyData.map((d) => [d.date.toDateString(), d]));

    const cellSize = 15;
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formatDay = d3.timeFormat("%w");
    const formatWeek = d3.timeFormat("%U");
    const formatMonth = d3.timeFormat("%b");

    const allDays = d3.timeDays(oneYearAgo, today);

    const colorScale = d3
      .scaleQuantize()
      .domain([0, 100])
      .range(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]); // GitHub-like greens

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const numWeeks = d3.timeWeeks(
      d3.timeSunday(oneYearAgo),
      d3.timeSunday(today)
    ).length;
    const width = numWeeks * (cellSize + 2) + 50;
    const height = (cellSize + 2) * 7 + 50;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g").attr("transform", `translate(30, 20)`);

    g.selectAll(".day-label")
      .data(weekDays)
      .enter()
      .append("text")
      .attr("class", `text-xs ${themeClasses.secondaryText}`)
      .attr("x", -5)
      .attr("y", (d, i) => i * (cellSize + 2) + cellSize / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text((d) => d);

    g.selectAll(".day")
      .data(allDays)
      .enter()
      .append("rect")
      .attr("class", "day rounded-sm")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", (d) => formatWeek(d) * (cellSize + 2))
      .attr("y", (d) => formatDay(d) * (cellSize + 2))
      .attr("fill", (d) => {
        const entry = dateMap.get(d.toDateString());
        return entry ? colorScale(entry.avgProgress) : colorScale(0);
      })
      .append("title")
      .text((d) => {
        const entry = dateMap.get(d.toDateString());
        const dateStr = d.toLocaleDateString();
        const duration = entry
          ? formatDuration(entry.totalStudyDuration)
          : "0s";
        return `${dateStr}: ${
          entry ? entry.avgProgress.toFixed(0) : 0
        }% progress, Study Time: ${duration}`;
      });

    g.selectAll(".month-label")
      .data(d3.timeMonths(oneYearAgo, today))
      .enter()
      .append("text")
      .attr("class", `text-xs ${themeClasses.secondaryText}`)
      .attr("x", (d) => formatWeek(d) * (cellSize + 2))
      .attr("y", -10)
      .text((d) => formatMonth(d));
  }, [studyHistory, today, oneYearAgo, themeClasses]);

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto ${themeClasses.shadow} relative`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
          title="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          Study Heatmap
        </h3>
        <p className={`${themeClasses.secondaryText} mb-6 text-center`}>
          Daily study progress and accumulated study time over the last year.
        </p>
        <div className="flex justify-center items-center">
          <svg
            ref={svgRef}
            className={`${themeClasses.primaryBg} rounded-lg shadow-inner`}
          ></svg>
        </div>
      </div>
    </div>
  );
};

// DailyTaskModal Component for adding/editing tasks for a specific day
const DailyTaskModal = ({
  day,
  tasks,
  onClose,
  onSaveTasks,
  editingTask,
  setEditingTask,
  newTaskTime,
  setNewTaskTime,
  newTaskActivity,
  setNewTaskActivity,
}) => {
  const { themeClasses } = useTheme();

  const handleAddTask = () => {
    if (newTaskTime.trim() === "" || newTaskActivity.trim() === "") {
      console.error("Please enter both time and activity.");
      return;
    }
    const newTasks = [
      ...tasks,
      { time: newTaskTime, activity: newTaskActivity, id: Date.now() },
    ];
    onSaveTasks(newTasks);
    setNewTaskTime("");
    setNewTaskActivity("");
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTaskTime(task.time);
    setNewTaskActivity(task.activity);
  };

  const handleSaveEditedTask = () => {
    if (newTaskTime.trim() === "" || newTaskActivity.trim() === "") {
      console.error("Please enter both time and activity.");
      return;
    }
    const updatedTasks = tasks.map((t) =>
      t.id === editingTask.id
        ? { ...t, time: newTaskTime, activity: newTaskActivity }
        : t
    );
    onSaveTasks(updatedTasks);
    setEditingTask(null);
    setNewTaskTime("");
    setNewTaskActivity("");
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      onSaveTasks(updatedTasks);
      setEditingTask(null); // Clear editing if deleted task was being edited
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto ${themeClasses.shadow} relative`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
          title="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          Manage Tasks for {day}
        </h3>

        <div
          className={`mb-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-inner`}
        >
          <h4
            className={`text-lg font-semibold mb-3 ${themeClasses.primaryText}`}
          >
            {editingTask ? "Edit Task" : "Add New Task"}
          </h4>
          <input
            type="text"
            placeholder="Time (e.g., 09:00 - 10:00)"
            className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
          />
          <input
            type="text"
            placeholder="Activity (e.g., Read Current Affairs)"
            className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={newTaskActivity}
            onChange={(e) => setNewTaskActivity(e.target.value)}
          />
          <div className="flex space-x-2">
            {editingTask ? (
              <button
                onClick={handleSaveEditedTask}
                className={`flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold ${themeClasses.primaryText}`}
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={handleAddTask}
                className={`flex-1 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText}`}
              >
                Add Task
              </button>
            )}
            {editingTask && (
              <button
                onClick={() => {
                  setEditingTask(null);
                  setNewTaskTime("");
                  setNewTaskActivity("");
                }}
                className={`flex-1 px-4 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {tasks.length === 0 && (
            <p className={`${themeClasses.secondaryText} text-center py-4`}>
              No tasks for this day yet.
            </p>
          )}
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`${themeClasses.tertiaryBg} p-3 rounded-lg flex items-center justify-between shadow-sm`}
            >
              <div>
                <p className={`font-medium ${themeClasses.accent}`}>
                  {task.time}
                </p>
                <p className={`text-sm ${themeClasses.primaryText}`}>
                  {task.activity}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTask(task)}
                  className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.tertiaryBg} transition-colors`}
                  title="Edit Task"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// WeeklyPlannerModal Component for planning the entire week
const WeeklyPlannerModal = ({
  currentSchedule,
  onClose,
  onSaveWeeklySchedule,
}) => {
  const { themeClasses } = useTheme();
  const [tempSchedule, setTempSchedule] = useState(() => {
    const clonedSchedule = JSON.parse(JSON.stringify(currentSchedule));
    Object.keys(initialWeeklyScheduleData).forEach((day) => {
      if (!clonedSchedule[day]) {
        clonedSchedule[day] = {
          title: initialWeeklyScheduleData[day].title,
          tasks: [],
        };
      }
      if (!clonedSchedule[day].tasks) {
        clonedSchedule[day].tasks = [];
      }
      if (!clonedSchedule[day].title) {
        clonedSchedule[day].title = initialWeeklyScheduleData[day].title;
      }
    });
    return clonedSchedule;
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleTitleChange = (day, newTitle) => {
    setTempSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], title: newTitle },
    }));
  };

  const handleTaskChange = (day, taskId, field, value) => {
    setTempSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: prev[day].tasks.map((task) =>
          task.id === taskId ? { ...task, [field]: value } : task
        ),
      },
    }));
  };

  const handleAddTask = (day) => {
    setTempSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: [...prev[day].tasks, { time: "", activity: "", id: Date.now() }],
      },
    }));
  };

  const handleDeleteTask = (day, taskId) => {
    setTempSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: prev[day].tasks.filter((task) => task.id !== taskId),
      },
    }));
  };

  const handleSave = () => {
    const finalSchedule = addIdsToTasks(tempSchedule); // Ensure all tasks have IDs before saving
    onSaveWeeklySchedule(finalSchedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto ${themeClasses.shadow} relative`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
          title="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          Plan Your Week
        </h3>
        <p className={`${themeClasses.secondaryText} mb-6 text-center`}>
          Define your study schedule for each day of the week.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className={`${themeClasses.tertiaryBg} p-4 rounded-lg shadow-md`}
            >
              <h4
                className={`text-lg font-semibold ${themeClasses.accent} mb-3`}
              >
                {day}
              </h4>
              <div className="mb-3">
                <label
                  className={`block text-sm font-medium ${themeClasses.secondaryText} mb-1`}
                >
                  Day Title:
                </label>
                <input
                  type="text"
                  value={tempSchedule[day]?.title || ""}
                  onChange={(e) => handleTitleChange(day, e.target.value)}
                  placeholder="e.g., Daily Study Plan"
                  className={`w-full p-2 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <p
                className={`text-sm font-medium ${themeClasses.secondaryText} mb-2`}
              >
                Tasks:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {(tempSchedule[day]?.tasks || []).map((task) => (
                  <div
                    key={task.id}
                    className={`flex flex-col ${themeClasses.secondaryBg} p-2 rounded-lg`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <input
                        type="text"
                        value={task.time}
                        onChange={(e) =>
                          handleTaskChange(day, task.id, "time", e.target.value)
                        }
                        placeholder="Time (e.g., 07:00-08:00)"
                        className={`flex-1 p-1 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} text-sm focus:outline-none focus:ring-1 focus:ring-blue-400`}
                      />
                      <button
                        onClick={() => handleDeleteTask(day, task.id)}
                        className="p-1 text-red-400 hover:text-red-500 hover:bg-gray-400 rounded-full transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={task.activity}
                      onChange={(e) =>
                        handleTaskChange(
                          day,
                          task.id,
                          "activity",
                          e.target.value
                        )
                      }
                      placeholder="Activity (e.g., Wake up + Newspaper)"
                      className={`w-full p-1 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} text-sm focus:outline-none focus:ring-1 focus:ring-blue-400`}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleAddTask(day)}
                className={`w-full flex items-center justify-center space-x-2 px-3 py-1.5 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors text-sm mt-2 ${themeClasses.primaryText}`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={handleSave}
            className={`px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-base font-semibold ${themeClasses.primaryText}`}
          >
            Save Weekly Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// New component for managing schedule templates
const ManageTemplatesModal = ({
  onClose,
  templates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  currentSchedule,
}) => {
  const { themeClasses } = useTheme();
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateToUpdate, setTemplateToUpdate] = useState(null); // template ID being updated

  const handleSaveCurrentAsTemplate = () => {
    if (!newTemplateName.trim()) {
      console.error("Please enter a template name.");
      return;
    }
    onSaveTemplate(newTemplateName.trim(), currentSchedule, templateToUpdate);
    setNewTemplateName("");
    setTemplateToUpdate(null);
  };

  const startUpdateTemplate = (templateId, templateName) => {
    setNewTemplateName(templateName);
    setTemplateToUpdate(templateId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${themeClasses.shadow} relative`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
          title="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          Manage Schedule Templates
        </h3>

        <div
          className={`mb-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-inner`}
        >
          <h4
            className={`text-lg font-semibold mb-3 ${themeClasses.primaryText}`}
          >
            {templateToUpdate
              ? "Update Template"
              : "Save Current Schedule as New Template"}
          </h4>
          <input
            type="text"
            placeholder="Enter template name"
            className={`w-full p-3 ${themeClasses.secondaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveCurrentAsTemplate}
              className={`flex-1 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText}`}
            >
              <Save className="w-5 h-5 inline-block mr-2" />{" "}
              {templateToUpdate ? "Update Template" : "Save Template"}
            </button>
            {templateToUpdate && (
              <button
                onClick={() => {
                  setNewTemplateName("");
                  setTemplateToUpdate(null);
                }}
                className={`flex-1 px-4 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
              >
                Cancel Update
              </button>
            )}
          </div>
        </div>

        <h4 className={`text-xl font-bold mb-4 ${themeClasses.primaryText}`}>
          Your Saved Templates
        </h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {templates.length === 0 && (
            <p className={`${themeClasses.secondaryText} text-center py-4`}>
              No templates saved yet.
            </p>
          )}
          {templates.map((template) => (
            <div
              key={template.id}
              className={`${themeClasses.tertiaryBg} p-3 rounded-lg flex items-center justify-between shadow-sm`}
            >
              <span className={`font-medium ${themeClasses.primaryText}`}>
                {template.name}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => onLoadTemplate(template.id)}
                  className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.secondaryBg} transition-colors`}
                  title="Load Template"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    startUpdateTemplate(template.id, template.name)
                  }
                  className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.secondaryBg} transition-colors`}
                  title="Update Template"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteTemplate(template.id)}
                  className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                  title="Delete Template"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// New component for Motivational Content Library
const MotivationalContentModal = ({ onClose }) => {
  const { themeClasses } = useTheme();
  const inspirationalLinks = [
    {
      title: "UPSC Toppers' Strategies",
      url: "https://www.drishtiias.com/blog/UPSC-Toppers-Strategy",
    },
    {
      title: "Habit Stacking for UPSC",
      url: "https://www.youtube.com/watch?v=gT8wNqF0F5w",
    },
    {
      title: "Dealing with Failure in UPSC",
      url: "https://www.insightsonindia.com/upsc-civil-services-exam/upsc-motivations/how-to-deal-with-failure-in-upsc-civil-services-exam/",
    },
    {
      title: "Why UPSC Aspirants Fail and How to Avoid It",
      url: "https://upscpathshala.com/blog/upsc-aspirants-fail-and-how-to-avoid-it/",
    },
    {
      title: "The Power of Consistency",
      url: "https://jamesclear.com/consistency",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${themeClasses.shadow} relative`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
          title="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          Motivational Content
        </h3>

        <div className="space-y-4">
          <p className={`${themeClasses.secondaryText} text-center`}>
            Find articles and videos to keep you motivated on your UPSC journey!
          </p>
          <div className="space-y-3 custom-scrollbar pr-2">
            {inspirationalLinks.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block ${themeClasses.tertiaryBg} p-4 rounded-lg hover:${themeClasses.secondaryBg} transition-colors shadow-sm`}
              >
                <h4 className={`font-semibold ${themeClasses.accent}`}>
                  {item.title}
                </h4>
                <p className={`text-sm ${themeClasses.secondaryText}`}>
                  {item.url}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// New component for Theme Settings
const ThemeSettingsModal = ({ onClose, currentTheme, setTheme }) => {
  const { themeClasses } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-sm ${themeClasses.shadow} relative`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
          title="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          Theme Settings
        </h3>

        <div className="space-y-4">
          <p className={`${themeClasses.secondaryText} text-center`}>
            Choose your preferred app theme:
          </p>
          <div className="flex justify-around mt-4">
            {Object.keys(themes).map((themeName) => (
              <button
                key={themeName}
                onClick={() => setTheme(themeName)}
                className={`p-3 rounded-full border-2 ${
                  currentTheme === themeName
                    ? `border-${themes[themeName].accent.replace("text-", "")}`
                    : `border-${themes[themeName].tertiaryBg.replace(
                        "bg-",
                        ""
                      )}`
                } ${
                  themes[themeName].primaryBg
                } w-16 h-16 flex items-center justify-center text-xs font-semibold ${
                  themes[themeName].primaryText
                } capitalize`}
              >
                {themeName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// New component for Break Reminder
const BreakReminderModal = ({ onClose, onDismiss }) => {
  const { themeClasses } = useTheme();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-sm ${themeClasses.shadow} text-center relative`}
      >
        <h3 className={`text-2xl font-bold mb-3 ${themeClasses.primaryText}`}>
          Time for a Break!
        </h3>
        <p className={`${themeClasses.secondaryText} mb-6`}>
          You've been studying hard. Take a short break to refresh your mind!
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onDismiss}
            className={`px-6 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText}`}
          >
            Dismiss
          </button>
          <button
            onClick={onClose}
            className={`px-6 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

// Motivational Quotes (moved outside component for reusability)
const motivationalQuotes = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    quote:
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    quote: "Strive not to be a success, but rather to be of value.",
    author: "Albert Einstein",
  },
  {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    quote: "The mind is everything. What you think you become.",
    author: "Buddha",
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    quote: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
  },
  {
    quote:
      "If you want to live a happy life, tie it to a goal, not to people or things.",
    author: "Albert Einstein",
  },
  {
    quote:
      "Perseverance is not a long race; it is many short races one after the other.",
    author: "Walter Elliot",
  },
  {
    quote:
      "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson",
  },
  {
    quote:
      "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar",
  },
];

// Main StudyTracker Component
const StudyTracker = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [currentDay, setCurrentDay] = useState("");
  const [weeklyScheduleState, setWeeklyScheduleState] = useState(
    initialWeeklyScheduleData
  );
  const [completedTasks, setCompletedTasks] = useState({});
  const [notes, setNotes] = useState([]); // General notes, not subject-specific
  const [showNotes, setShowNotes] = useState(false); // For general notes modal
  const [showHistory, setShowHistory] = useState(false);
  const [showProfileHeatmap, setShowProfileHeatmap] = useState(false);
  const [newNote, setNewNote] = useState(""); // For general notes
  const [studyHistory, setStudyHistory] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // New states for task/weekly planning
  const [showDailyTaskModal, setShowDailyTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // Task object being edited
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskActivity, setNewTaskActivity] = useState("");
  const [showWeeklyPlannerModal, setShowWeeklyPlannerModal] = useState(false);

  // Header Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Footer Quote state
  const [dailyQuote, setDailyQuote] = useState({ quote: "", author: "" });

  // Firebase states
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Guest");
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const [dailyStudyTime, setDailyStudyTime] = useState(0); // Total time for the day, persistent across sessions

  // New features states:
  const [weeklyScheduleTemplates, setWeeklyScheduleTemplates] = useState([]);
  const [showManageTemplatesModal, setShowManageTemplatesModal] =
    useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [showMotivationalContentModal, setShowMotivationalContentModal] =
    useState(false);
  const [showThemeSettingsModal, setShowThemeSettingsModal] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const BREAK_REMINDER_INTERVAL_SECONDS = 60 * 60; // Remind every 60 minutes
  const lastBreakReminderTimeRef = useRef(0); // To prevent multiple reminders in short succession

  // New states for Subject Management
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null); // Subject object being edited
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCategory, setNewSubjectCategory] = useState("mains");

  // New states for Notes Management (within Subjects)
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [notesForSelectedSubject, setNotesForSelectedSubject] = useState([]);
  const [newSubjectNoteTitle, setNewSubjectNoteTitle] = useState("");
  const [newSubjectNoteContent, setNewSubjectNoteNoteContent] = useState("");
  const [editingSubjectNote, setEditingSubjectNote] = useState(null);

  const { themeClasses, setTheme, currentTheme } = useTheme();

  // --- Firebase Initialization and Authentication ---
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestoreInstance = getFirestore(app);
      getAnalytics(app);

      setAuth(authInstance);
      setDb(firestoreInstance);

      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
          setUserName(user.displayName || user.email || "User");
          setShowAuthModal(false);

          // Fetch user data including streak and theme
          const userDocRef = doc(
            firestoreInstance,
            `artifacts/${appId}/users/${user.uid}/userData/data`
          );
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCurrentStreak(userData.currentStreak || 0);
            setLongestStreak(userData.longestStreak || 0);
            setTheme(userData.theme || "dark"); // Load user's theme preference, default to dark
          }
        } else {
          setUserId(null);
          setUserName("Guest");
          if (!loading) {
            setShowAuthModal(true);
          }
        }
        setAuthReady(true);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      setLoading(false);
      setAuthReady(true);
    }
  }, [db, setTheme, loading]); // Added db, setTheme, loading to dependency array

  // --- Authentication Handlers (Login/Register/Logout) ---
  const handleAuth = async () => {
    setAuthError("");
    if (!auth) {
      setAuthError("Firebase Auth not initialized.");
      return;
    }
    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuthModal(false);
      setAuthError("");
    } catch (error) {
      console.error("Authentication error:", error.code, error.message);
      let errorMessage = "Authentication failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try logging in.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password.";
      }
      setAuthError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    if (!auth) {
      setAuthError("Firebase Auth not initialized.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
      setAuthError("");
    } catch (error) {
      console.error("Google Sign-In error:", error.code, error.message);
      let errorMessage = "Google Sign-In failed. Please try again.";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in window closed. Please try again.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Another sign-in request is in progress.";
      }
      setAuthError(errorMessage);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        setCompletedTasks({});
        setNotes([]);
        setStudyHistory([]);
        setTime(0);
        setDailyStudyTime(0);
        setAuthError("");
        setEmail("");
        setPassword("");
        setShowAuthModal(true);
        setWeeklyScheduleState(initialWeeklyScheduleData);
        setShowDropdown(false); // Close dropdown on logout
        setCurrentStreak(0); // Reset streak on logout
        setLongestStreak(0); // Reset longest streak on logout
        setWeeklyScheduleTemplates([]); // Clear templates on logout
        setSubjects([]); // Clear subjects on logout
        setNotesForSelectedSubject([]); // Clear notes on logout
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  // --- Stopwatch Logic ---
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
        if (
          (time + 1) % BREAK_REMINDER_INTERVAL_SECONDS === 0 &&
          time + 1 !== 0
        ) {
          if (
            Date.now() / 1000 - lastBreakReminderTimeRef.current >
            BREAK_REMINDER_INTERVAL_SECONDS / 2
          ) {
            // Prevent rapid firing
            setShowBreakReminder(true);
            lastBreakReminderTimeRef.current = Date.now() / 1000;
          }
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, time]); // Added time to dependency array to re-evaluate reminder logic

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const startStopwatch = () => {
    setIsRunning(true);
    // Reset reminder timer when starting/resuming stopwatch
    lastBreakReminderTimeRef.current = Date.now() / 1000;
  };

  const stopStopwatch = async () => {
    setIsRunning(false);
    if (db && userId) {
      const todayDate = new Date().toLocaleDateString();
      const dailyStudyTimeRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/dailyStudyTime`,
        todayDate.replace(/\//g, "-")
      );
      try {
        await setDoc(
          dailyStudyTimeRef,
          {
            date: todayDate,
            day: currentDay,
            duration: time,
            timestamp: new Date(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error saving daily study time:", error);
      }
    }
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setTime(0);
    setDailyStudyTime(0); // Also reset dailyStudyTime
    // Reset reminder timer
    lastBreakReminderTimeRef.current = 0;
  };

  // --- Fetching Data from Firestore ---
  useEffect(() => {
    if (!db || !userId || !authReady) {
      return;
    }

    const userDocRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/userData/data`
    );
    const notesCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/notes`
    ); // General notes
    const historyCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/history`
    );
    const dailyStudyTimeCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/dailyStudyTime`
    );
    const templatesCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/scheduleTemplates`
    );
    const subjectsCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/subjects`
    ); // New collection for subjects

    const unsubscribeUserData = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.completedTasks) {
            setCompletedTasks(data.completedTasks);
          } else {
            setCompletedTasks({});
          }
          if (data.customWeeklySchedule) {
            setWeeklyScheduleState(addIdsToTasks(data.customWeeklySchedule));
          } else {
            setWeeklyScheduleState(initialWeeklyScheduleData);
          }
          setCurrentStreak(data.currentStreak || 0);
          setLongestStreak(data.longestStreak || 0);
          setTheme(data.theme || "dark"); // Ensure theme is loaded on snapshot, default to dark
        } else {
          setCompletedTasks({});
          setWeeklyScheduleState(initialWeeklyScheduleData);
          setCurrentStreak(0);
          setLongestStreak(0);
          setTheme("dark"); // Default theme if no user data
        }
      },
      (error) => console.error("Error fetching user data:", error)
    );

    const unsubscribeNotes = onSnapshot(
      notesCollectionRef,
      (snapshot) => {
        const fetchedNotes = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setNotes(
          fetchedNotes.sort(
            (a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()
          )
        );
      },
      (error) => console.error("Error fetching notes:", error)
    );

    const unsubscribeHistory = onSnapshot(
      historyCollectionRef,
      (snapshot) => {
        const fetchedHistory = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        // Sort by timestamp to ensure latest is first for display
        setStudyHistory(
          fetchedHistory.sort((a, b) => {
            const dateA = a.timestamp
              ? new Date(a.timestamp)
              : new Date(a.date);
            const dateB = b.timestamp
              ? new Date(b.timestamp)
              : new Date(b.date);
            return dateB - dateA;
          })
        );
      },
      (error) => console.error("Error fetching study history:", error)
    );

    const unsubscribeDailyStudyTime = onSnapshot(
      dailyStudyTimeCollectionRef,
      (snapshot) => {
        const todayDate = new Date().toLocaleDateString();
        const todayEntry = snapshot.docs.find(
          (doc) => doc.id === todayDate.replace(/\//g, "-")
        );
        if (todayEntry && todayEntry.data().duration !== undefined) {
          setTime(todayEntry.data().duration);
          setDailyStudyTime(todayEntry.data().duration);
        } else {
          setTime(0);
          setDailyStudyTime(0);
        }
      },
      (error) => console.error("Error fetching daily study time:", error)
    );

    // Subscribe to schedule templates
    const unsubscribeTemplates = onSnapshot(
      templatesCollectionRef,
      (snapshot) => {
        const fetchedTemplates = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setWeeklyScheduleTemplates(fetchedTemplates);
      },
      (error) => console.error("Error fetching schedule templates:", error)
    );

    // Subscribe to subjects
    const unsubscribeSubjects = onSnapshot(
      subjectsCollectionRef,
      (snapshot) => {
        const fetchedSubjects = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setSubjects(
          fetchedSubjects.sort((a, b) => a.name.localeCompare(b.name))
        );
      },
      (error) => console.error("Error fetching subjects:", error)
    );

    return () => {
      unsubscribeUserData();
      unsubscribeNotes();
      unsubscribeHistory();
      unsubscribeDailyStudyTime();
      unsubscribeTemplates();
      unsubscribeSubjects(); // Cleanup subject listener
    };
  }, [db, userId, authReady, appId, setTheme]); // Added setTheme to dependencies

  useEffect(() => {
    if (!loading && currentDay === "") {
      setCurrentDay(getCurrentDayOfWeek());
    }
  }, [loading, currentDay]);

  // --- Local State Management and Helper Functions ---
  const getCurrentDayOfWeek = () => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return daysOfWeek[new Date().getDay()];
  };

  const getYesterdayDateString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = currentDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getGreetingTime = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const toggleTask = async (day, taskId) => {
    if (!db || !userId) {
      return;
    }

    const newCompletedTasks = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId],
    };

    setCompletedTasks(newCompletedTasks);

    setWeeklyScheduleState((prevSchedule) => {
      const newSchedule = { ...prevSchedule };
      const currentDayTasks = [...(newSchedule[day]?.tasks || [])];
      currentDayTasks.sort((a, b) => {
        const aCompleted = newCompletedTasks[a.id];
        const bCompleted = newCompletedTasks[b.id];
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        return 0;
      });
      newSchedule[day] = {
        ...newSchedule[day],
        tasks: currentDayTasks,
      };
      return newSchedule;
    });

    try {
      const userDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/userData/data`
      );
      await setDoc(
        userDocRef,
        { completedTasks: newCompletedTasks },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating completed tasks in Firestore:", error);
      setCompletedTasks(completedTasks); // Revert on error
    }
  };

  const addNote = async () => {
    // General notes, not subject-specific
    if (!db || !userId || !newNote.trim()) {
      return;
    }

    const noteToAdd = {
      text: newNote.trim(),
      date: new Date().toLocaleDateString(),
      day: currentDay,
      createdAt: new Date(),
    };

    try {
      const notesCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/notes`
      );
      await addDoc(notesCollectionRef, noteToAdd);
      setNewNote("");
    } catch (error) {
      console.error("Error adding note to Firestore:", error);
    }
  };

  const deleteNote = async (idToDelete) => {
    // General notes, not subject-specific
    if (!db || !userId) {
      return;
    }
    try {
      const noteDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/notes`,
        idToDelete
      );
      await deleteDoc(noteDocRef);
    } catch (error) {
      console.error("Error deleting note from Firestore:", error);
    }
  };

  const calculateDayProgress = useCallback(
    (day) => {
      const dayTasks = weeklyScheduleState[day]?.tasks || [];
      if (dayTasks.length === 0) return 0;
      const completed = dayTasks.filter(
        (task) => completedTasks[task.id]
      ).length;
      return Math.round((completed / dayTasks.length) * 100);
    },
    [weeklyScheduleState, completedTasks]
  );

  const markDayComplete = async () => {
    if (!db || !userId) {
      return;
    }

    const todayDate = new Date().toLocaleDateString();
    const progress = calculateDayProgress(currentDay);

    const historyEntry = {
      day: currentDay,
      date: todayDate, // Keep for display
      progress: progress,
      completedTasksCount: (
        weeklyScheduleState[currentDay]?.tasks || []
      ).filter((task) => completedTasks[task.id]).length,
      totalTasksCount: (weeklyScheduleState[currentDay]?.tasks || []).length,
      studyDuration: dailyStudyTime,
      timestamp: new Date().toISOString(), // Store ISO string for precise sorting
    };

    try {
      // Use addDoc to create a new document for each completion
      const historyCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/history`
      );
      await addDoc(historyCollectionRef, historyEntry);

      // Streak Logic
      const userDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/userData/data`
      );
      // Fetch latest history to correctly calculate streak
      // Note: This logic for streak calculation might need refinement if multiple entries per day are common.
      // For simplicity, let's assume `studyHistory` is already up-to-date from the `onSnapshot` listener.
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().split("T")[0];

      // To check if yesterday was complete, we need to query the history for any entry from yesterday with >= 70% progress.
      // For simplicity, let's assume `studyHistory` is already up-to-date from the `onSnapshot` listener.
      const yesterdayEntries = studyHistory.filter(
        (entry) =>
          new Date(entry.timestamp).toISOString().split("T")[0] ===
            yesterdayISO && entry.progress >= 70
      );
      const wasYesterdayComplete = yesterdayEntries.length > 0;

      let newCurrentStreak = currentStreak;
      if (progress >= 70) {
        // If today's progress is sufficient
        if (wasYesterdayComplete) {
          newCurrentStreak += 1;
        } else {
          newCurrentStreak = 1; // Start new streak
        }
      } else {
        newCurrentStreak = 0; // Break streak
      }

      const newLongestStreak = Math.max(longestStreak, newCurrentStreak);

      await updateDoc(userDocRef, {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastStreakDate: todayDate,
      });

      setCurrentStreak(newCurrentStreak);
      setLongestStreak(newLongestStreak);

      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (error) {
      console.error("Error marking day complete in Firestore:", error);
    }
  };

  // --- Daily Task Management Functions (Add/Edit/Delete) ---
  const saveDailyTasks = async (updatedTasks) => {
    if (!db || !userId) {
      return;
    }
    // Update local state first for responsiveness
    setWeeklyScheduleState((prevSchedule) => ({
      ...prevSchedule,
      [currentDay]: {
        ...prevSchedule[currentDay],
        tasks: updatedTasks,
      },
    }));

    try {
      const userDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/userData/data`
      );
      // Ensure the entire customWeeklySchedule is updated
      await setDoc(
        userDocRef,
        {
          customWeeklySchedule: {
            ...weeklyScheduleState, // Use previous state here as update is async
            [currentDay]: {
              ...weeklyScheduleState[currentDay],
              tasks: updatedTasks,
            },
          },
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating daily tasks in Firestore:", error);
      // Optional: Revert local state on error if needed
    }
  };

  // --- Weekly Planner Functions ---
  const saveWeeklySchedule = async (newFullSchedule) => {
    if (!db || !userId) {
      return;
    }
    setWeeklyScheduleState(newFullSchedule); // Update local state immediately

    try {
      const userDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/userData/data`
      );
      await setDoc(
        userDocRef,
        { customWeeklySchedule: newFullSchedule },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving weekly schedule to Firestore:", error);
    }
  };

  // --- Flexible Schedule Templates Functions ---
  const saveScheduleTemplate = async (
    templateName,
    scheduleData,
    templateIdToUpdate = null
  ) => {
    if (!db || !userId || !templateName.trim()) {
      return;
    }
    try {
      const templatesCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/scheduleTemplates`
      );
      const templateToSave = {
        name: templateName,
        schedule: addIdsToTasks(scheduleData),
        createdAt: new Date(),
      };

      if (templateIdToUpdate) {
        // Update existing template
        await updateDoc(
          doc(templatesCollectionRef, templateIdToUpdate),
          templateToSave
        );
        console.log(`Template "${templateName}" updated successfully!`);
      } else {
        // Add new template
        await addDoc(templatesCollectionRef, templateToSave);
        console.log(`Template "${templateName}" saved successfully!`);
      }
    } catch (error) {
      console.error("Error saving schedule template:", error);
    }
  };

  const loadScheduleTemplate = async (templateId) => {
    if (!db || !userId) {
      return;
    }
    try {
      const templatesCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/scheduleTemplates`
      );
      const templateDoc = await getDoc(doc(templatesCollectionRef, templateId));
      if (templateDoc.exists()) {
        const loadedSchedule = templateDoc.data().schedule;
        setWeeklyScheduleState(addIdsToTasks(loadedSchedule));
        setShowManageTemplatesModal(false);
        console.log(
          `Template "${templateDoc.data().name}" loaded successfully!`
        );
      } else {
        console.error("Template not found.");
      }
    } catch (error) {
      console.error("Error loading schedule template:", error);
    }
  };

  const deleteScheduleTemplate = async (templateId) => {
    if (!db || !userId) {
      return;
    }
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        const templatesCollectionRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/scheduleTemplates`
        );
        await deleteDoc(doc(templatesCollectionRef, templateId));
        console.log("Template deleted successfully!");
      } catch (error) {
        console.error("Error deleting schedule template:", error);
      }
    }
  };

  // --- Subject Management Functions ---
  const handleAddSubject = async () => {
    if (!db || !userId || !newSubjectName.trim()) {
      console.error("Subject name cannot be empty.");
      return;
    }
    try {
      const subjectsCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/subjects`
      );
      if (editingSubject) {
        await updateDoc(doc(subjectsCollectionRef, editingSubject.id), {
          name: newSubjectName.trim(),
          category: newSubjectCategory,
          updatedAt: new Date(),
        });
        console.log("Subject updated successfully!");
        setEditingSubject(null);
      } else {
        await addDoc(subjectsCollectionRef, {
          name: newSubjectName.trim(),
          category: newSubjectCategory,
          createdAt: new Date(),
        });
        console.log("Subject added successfully!");
      }
      setNewSubjectName("");
      setNewSubjectCategory("mains");
    } catch (error) {
      console.error("Error adding/editing subject:", error);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setNewSubjectName(subject.name);
    setNewSubjectCategory(subject.category);
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!db || !userId) return;
    if (
      window.confirm(
        "Are you sure you want to delete this subject and all its notes?"
      )
    ) {
      try {
        // Delete notes subcollection first (manual deletion, or use Cloud Function for recursive delete)
        const notesSnapshot = await getDocs(
          collection(
            db,
            `artifacts/${appId}/users/${userId}/subjects/${subjectId}/notes`
          )
        );
        const deleteNotesPromises = notesSnapshot.docs.map((noteDoc) =>
          deleteDoc(noteDoc.ref)
        );
        await Promise.all(deleteNotesPromises);

        // Then delete the subject document
        await deleteDoc(
          doc(db, `artifacts/${appId}/users/${userId}/subjects`, subjectId)
        );
        console.log("Subject and its notes deleted successfully!");
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    }
  };

  // --- Notes Management Functions (for selected subject) ---
  const handleAddSubjectNote = async () => {
    if (
      !db ||
      !userId ||
      !selectedSubject ||
      !newSubjectNoteTitle.trim() ||
      !newSubjectNoteContent.trim()
    ) {
      console.error("Note title and content cannot be empty.");
      return;
    }
    try {
      const notesCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/subjects/${selectedSubject.id}/notes`
      );
      if (editingSubjectNote) {
        await updateDoc(doc(notesCollectionRef, editingSubjectNote.id), {
          title: newSubjectNoteTitle.trim(),
          content: newSubjectNoteContent.trim(),
          updatedAt: new Date(),
        });
        console.log("Note updated successfully!");
        setEditingSubjectNote(null);
      } else {
        await addDoc(notesCollectionRef, {
          title: newSubjectNoteTitle.trim(),
          content: newSubjectNoteContent.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log("Note added successfully!");
      }
      setNewSubjectNoteTitle("");
      setNewSubjectNoteNoteContent("");
    } catch (error) {
      console.error("Error adding/editing subject note:", error);
    }
  };

  const handleEditSubjectNote = (note) => {
    setEditingSubjectNote(note);
    setNewSubjectNoteTitle(note.title);
    setNewSubjectNoteNoteContent(note.content);
  };

  const handleDeleteSubjectNote = async (noteId) => {
    if (!db || !userId || !selectedSubject) return;
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteDoc(
          doc(
            db,
            `artifacts/${appId}/users/${userId}/subjects/${selectedSubject.id}/notes`,
            noteId
          )
        );
        console.log("Note deleted successfully!");
      } catch (error) {
        console.error("Error deleting subject note:", error);
      }
    }
  };

  const fetchNotesForSubject = useCallback(
    async (subjectId) => {
      if (!db || !userId || !subjectId) {
        setNotesForSelectedSubject([]);
        return;
      }
      const notesRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/subjects/${subjectId}/notes`
      );
      const unsubscribeNotes = onSnapshot(
        notesRef,
        (snapshot) => {
          const fetchedNotes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotesForSelectedSubject(
            fetchedNotes.sort(
              (a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()
            )
          );
        },
        (error) => {
          console.error("Error fetching notes for subject:", error);
        }
      );
      return unsubscribeNotes;
    },
    [db, userId, appId]
  );

  useEffect(() => {
    let unsubscribe = () => {};
    if (selectedSubject && showNotesModal) {
      unsubscribe = fetchNotesForSubject(selectedSubject.id);
    }
    return () => unsubscribe();
  }, [selectedSubject, showNotesModal, fetchNotesForSubject]);

  // --- Header Dropdown Logic ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // --- Daily Motivational Quote Logic ---
  useEffect(() => {
    const today = new Date().toDateString(); // e.g., "Thu Jul 04 2024"
    const storedQuote = localStorage.getItem("dailyQuote");
    const storedDate = localStorage.getItem("dailyQuoteDate");

    if (storedQuote && storedDate === today) {
      setDailyQuote(JSON.parse(storedQuote));
    } else {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      const newQuote = motivationalQuotes[randomIndex];
      setDailyQuote(newQuote);
      localStorage.setItem("dailyQuote", JSON.stringify(newQuote));
      localStorage.setItem("dailyQuoteDate", today);
    }
  }, []);

  if (loading) {
    return (
      <div
        className={`min-h-screen ${themeClasses.primaryBg} ${themeClasses.primaryText} flex items-center justify-center flex-col`}
      >
        <Loader2
          className={`w-10 h-10 animate-spin ${themeClasses.accent} mb-4`}
        />
        <p>Loading your study data...</p>
      </div>
    );
  }

  if (!userId && !loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div
          className={`${themeClasses.secondaryBg} p-8 rounded-lg ${themeClasses.shadow} w-full max-w-md`}
        >
          <h2
            className={`text-3xl font-bold ${themeClasses.primaryText} mb-6 text-center`}
          >
            {isRegistering ? "Register" : "Login"} to Study Tracker
          </h2>
          {authError && (
            <p className="text-red-400 text-center mb-4">{authError}</p>
          )}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleAuth}
              className={`w-full p-3 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2 ${themeClasses.primaryText}`}
            >
              {isRegistering ? (
                <UserPlus className="w-5 h-5" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              <span>
                {isRegistering ? "Register with Email" : "Login with Email"}
              </span>
            </button>
            <div className="relative flex py-5 items-center">
              <div
                className={`${themeClasses.border} flex-grow border-t`}
              ></div>
              <span
                className={`flex-shrink mx-4 ${themeClasses.secondaryText}`}
              >
                OR
              </span>
              <div
                className={`${themeClasses.border} flex-grow border-t`}
              ></div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2 text-white"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
              <span>Sign in with Google</span>
            </button>
          </div>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setAuthError("");
            }}
            className={`w-full mt-4 text-center ${themeClasses.accent} hover:${themeClasses.accent} transition-colors text-sm`}
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeClasses.primaryBg} ${themeClasses.primaryText} flex flex-col`}
    >
      {/* Header */}
      <header
        className={`${themeClasses.secondaryBg} ${themeClasses.border} border-b px-4 py-3 flex flex-col sm:flex-row items-center justify-between relative z-10`}
      >
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <BookOpen className={`w-7 h-7 ${themeClasses.accent}`} />
          <h1
            className={`text-xl sm:text-2xl font-bold ${themeClasses.primaryText}`}
          >
            UPSC Study Tracker
          </h1>
        </div>

        <div className="flex items-center space-x-3 mb-3 sm:mb-0 text-center sm:text-right">
          <div className={`${themeClasses.primaryText} flex items-center`}>
            <User className={`w-4 h-4 mr-2 ${themeClasses.secondaryText}`} />
            <span className="hidden sm:inline">{getGreetingTime()}, </span>
            {userName}!
          </div>
          <div
            className={`text-xs ${themeClasses.secondaryText} hidden md:block`}
          >
            {formattedDateTime}
          </div>
        </div>

        {/* Dropdown Menu for Features */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center space-x-2 px-3 py-1.5 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors text-sm ${themeClasses.primaryText}`}
          >
            <Menu className="w-5 h-5" />
            <span>Menu</span>
          </button>

          {showDropdown && (
            <div
              className={`absolute right-0 mt-2 w-48 ${themeClasses.tertiaryBg} rounded-md ${themeClasses.shadow} py-1 z-20`}
            >
              <button
                onClick={() => {
                  setShowWeeklyPlannerModal(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm`}
              >
                <Calendar className="w-4 h-4" />
                <span>Planner</span>
              </button>
              <button
                onClick={() => {
                  setNewNote("");
                  setShowNotes(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm`}
              >
                <Plus className="w-4 h-4" />
                <span>New Note (General)</span>
              </button>
              <button
                onClick={() => {
                  setShowNotes(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm`}
              >
                <FileText className="w-4 h-4" />
                <span>My Notes (General)</span>
              </button>
              <button
                onClick={() => {
                  setShowHistory(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileHeatmap(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowManageTemplatesModal(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm border-t ${themeClasses.border} mt-1 pt-2`}
              >
                <Save className="w-4 h-4" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => {
                  setShowMotivationalContentModal(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Motivation</span>
              </button>
              <button
                onClick={() => {
                  setShowThemeSettingsModal(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm`}
              >
                <Palette className="w-4 h-4" />
                <span>Themes</span>
              </button>
              <button
                onClick={() => {
                  setShowSubjectsModal(true);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm`}
              >
                <Book className="w-4 h-4" />
                <span>Subject Manager</span>
              </button>
              {userId && (
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.primaryText} hover:${themeClasses.secondaryBg} w-full text-left transition-colors text-sm border-t ${themeClasses.border} mt-1 pt-2`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {showConfirmation && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50 animate-bounce-in">
          History saved successfully!
        </div>
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar - Day Navigation */}
        <div
          className={`w-full lg:w-64 ${themeClasses.secondaryBg} p-4 lg:min-h-screen border-b lg:border-b-0 lg:border-r ${themeClasses.border}`}
        >
          <h3
            className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.primaryText}`}
          >
            <Calendar className={`w-5 h-5 mr-2 ${themeClasses.accent}`} />
            Week Schedule
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                  currentDay === day
                    ? `${themeClasses.accentBg} ${themeClasses.primaryText} shadow-md`
                    : `${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} ${themeClasses.secondaryText}`
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{day}</span>
                  <div className={`text-xs ${themeClasses.secondaryText}`}>
                    {calculateDayProgress(day)}%
                  </div>
                </div>
                <div className={`text-xs ${themeClasses.secondaryText} mt-1`}>
                  {weeklyScheduleState[day]?.title || "Loading..."}
                </div>
              </button>
            ))}
          </div>

          {/* Streak Display in Sidebar */}
          <div
            className={`mt-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-md`}
          >
            <h4
              className={`text-lg font-semibold mb-2 flex items-center ${themeClasses.primaryText}`}
            >
              <Award className={`w-5 h-5 mr-2 ${themeClasses.accent}`} /> Study
              Streaks
            </h4>
            <p className={`${themeClasses.secondaryText} text-sm mb-1`}>
              Current Streak:{" "}
              <span className={`font-bold ${themeClasses.accent}`}>
                {currentStreak}
              </span>{" "}
              days
            </p>
            <p className={`${themeClasses.secondaryText} text-sm`}>
              Longest Streak:{" "}
              <span className={`font-bold ${themeClasses.accent}`}>
                {longestStreak}
              </span>{" "}
              days
            </p>
          </div>
        </div>

        {/* Main Study Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-0 text-center sm:text-left w-full sm:w-auto ${themeClasses.primaryText}`}
              >
                {currentDay} -{" "}
                <span className={`${themeClasses.accent}`}>
                  {weeklyScheduleState[currentDay]?.title || "Loading..."}
                </span>
              </h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setNewTaskTime("");
                    setNewTaskActivity("");
                    setShowDailyTaskModal(true);
                  }}
                  className={`w-full sm:w-auto px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors text-sm flex items-center justify-center space-x-2 ${themeClasses.primaryText}`}
                >
                  <Edit className="w-4 h-4" />
                  <span>Manage Daily Tasks</span>
                </button>
                <button
                  onClick={markDayComplete}
                  className={`w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm flex items-center justify-center ${themeClasses.primaryText}`}
                >
                  Mark Day Complete
                </button>
              </div>
            </div>

            {/* Stopwatch Section */}
            <div
              className={`${themeClasses.secondaryBg} p-4 rounded-lg mb-6 shadow-md`}
            >
              <h4
                className={`text-lg font-semibold mb-2 flex items-center ${themeClasses.primaryText}`}
              >
                <Clock
                  className={`w-5 h-5 mr-2 ${themeClasses.secondaryText}`}
                />{" "}
                Daily Study Timer
              </h4>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <span className={`text-4xl font-bold ${themeClasses.accent}`}>
                  {formatTime(time)}
                </span>
                <div className="flex space-x-2">
                  {!isRunning ? (
                    <button
                      onClick={startStopwatch}
                      className={`p-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-full transition-colors ${themeClasses.primaryText}`}
                      title="Start Timer"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      onClick={stopStopwatch}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors text-white"
                      title="Pause Timer"
                    >
                      <Pause className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={resetStopwatch}
                    className={`p-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-full transition-colors ${themeClasses.primaryText}`}
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`${themeClasses.secondaryBg} p-4 rounded-lg mb-6 shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${themeClasses.secondaryText}`}>
                  Daily Progress
                </span>
                <span
                  className={`text-sm font-medium ${themeClasses.primaryText}`}
                >
                  {calculateDayProgress(currentDay)}%
                </span>
              </div>
              <div
                className={`w-full ${themeClasses.tertiaryBg} rounded-full h-2`}
              >
                <div
                  className={`${themeClasses.accentBg.replace(
                    "bg-",
                    "bg-"
                  )} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${calculateDayProgress(currentDay)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {(weeklyScheduleState[currentDay]?.tasks || []).length === 0 && (
              <p className={`${themeClasses.secondaryText} text-center py-4`}>
                No tasks planned for today. Click "Manage Daily Tasks" to add
                some!
              </p>
            )}
            {(weeklyScheduleState[currentDay]?.tasks || []).map((task) => (
              <div
                key={task.id}
                className={`${
                  themeClasses.secondaryBg
                } p-4 rounded-lg border-l-4 transition-all duration-200 ease-in-out ${
                  completedTasks[task.id]
                    ? "border-green-500 " + themeClasses.tertiaryBg
                    : "border-blue-500" // Kept blue for consistency for incomplete tasks
                } shadow-sm hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock
                      className={`w-4 h-4 ${themeClasses.secondaryText}`}
                    />
                    <span className={`font-medium ${themeClasses.accent}`}>
                      {task.time}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleTask(currentDay, task.id)}
                    className={`p-1 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
                  >
                    {completedTasks[task.id] ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle
                        className={`w-6 h-6 ${themeClasses.secondaryText}`}
                      />
                    )}
                  </button>
                </div>

                <p
                  className={`mt-2 ${
                    completedTasks[task.id]
                      ? `${themeClasses.secondaryText} line-through`
                      : `${themeClasses.primaryText}`
                  }`}
                >
                  {task.activity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`${themeClasses.secondaryBg} ${themeClasses.border} border-t px-6 py-4 text-center ${themeClasses.secondaryText} text-sm mt-auto`}
      >
        <p className="italic">"{dailyQuote.quote}"</p>
        <p className="mt-1 font-semibold">- {dailyQuote.author}</p>
      </footer>

      {/* Modals */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div
            className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto ${themeClasses.shadow} relative`}
          >
            <button
              onClick={() => setShowNotes(false)}
              className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
              title="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3
              className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
            >
              Study Notes (General)
            </h3>

            <div className="mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a new note..."
                className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                rows="3"
              />
              <button
                onClick={addNote}
                className={`mt-3 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold text-sm ${themeClasses.primaryText}`}
              >
                Add Note
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {notes.length === 0 && (
                <p className={`${themeClasses.secondaryText} text-center py-4`}>
                  No notes added yet.
                </p>
              )}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`${themeClasses.tertiaryBg} p-3 rounded-lg flex items-center justify-between shadow-sm`}
                >
                  <div>
                    <div
                      className={`text-xs ${themeClasses.secondaryText} mb-1`}
                    >
                      {note.date} - {note.day}
                    </div>
                    <p className={`text-sm ${themeClasses.primaryText}`}>
                      {note.text}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div
            className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto ${themeClasses.shadow} relative`}
          >
            <button
              onClick={() => setShowHistory(false)}
              className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
              title="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3
              className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
            >
              Study History
            </h3>

            <div className="space-y-3 pr-2 custom-scrollbar">
              {studyHistory.length === 0 && (
                <p className={`${themeClasses.secondaryText} text-center py-4`}>
                  No study history yet.
                </p>
              )}
              {studyHistory.map((entry) => (
                <div
                  key={entry.id} // Use entry.id which is the unique document ID
                  className={`${themeClasses.tertiaryBg} p-3 rounded-lg shadow-sm`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${themeClasses.primaryText}`}>
                      {entry.day}
                    </span>
                    <span className={`text-sm ${themeClasses.secondaryText}`}>
                      {new Date(entry.timestamp).toLocaleString()}{" "}
                      {/* Show full timestamp */}
                    </span>
                  </div>
                  <div className={`text-sm ${themeClasses.secondaryText}`}>
                    Progress:{" "}
                    <span className={`${themeClasses.accent}`}>
                      {entry.progress}%
                    </span>{" "}
                    ({entry.completedTasksCount}/{entry.totalTasksCount} tasks)
                    {entry.studyDuration !== undefined && (
                      <span className="ml-2">
                        | Time:{" "}
                        <span className={`${themeClasses.accent}`}>
                          {formatTime(entry.studyDuration)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Heatmap Modal */}
      {showProfileHeatmap && (
        <StudyHeatmap
          studyHistory={studyHistory}
          onClose={() => setShowProfileHeatmap(false)}
        />
      )}

      {/* Daily Task Management Modal */}
      {showDailyTaskModal && (
        <DailyTaskModal
          day={currentDay}
          tasks={weeklyScheduleState[currentDay]?.tasks || []}
          onClose={() => setShowDailyTaskModal(false)}
          onSaveTasks={saveDailyTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          newTaskTime={newTaskTime}
          setNewTaskTime={setNewTaskTime}
          newTaskActivity={newTaskActivity}
          setNewTaskActivity={setNewTaskActivity}
        />
      )}

      {/* Weekly Planner Modal */}
      {showWeeklyPlannerModal && (
        <WeeklyPlannerModal
          currentSchedule={weeklyScheduleState}
          onClose={() => setShowWeeklyPlannerModal(false)}
          onSaveWeeklySchedule={saveWeeklySchedule}
        />
      )}

      {/* Manage Schedule Templates Modal */}
      {showManageTemplatesModal && (
        <ManageTemplatesModal
          onClose={() => setShowManageTemplatesModal(false)}
          templates={weeklyScheduleTemplates}
          onSaveTemplate={saveScheduleTemplate}
          onLoadTemplate={loadScheduleTemplate}
          onDeleteTemplate={deleteScheduleTemplate}
          currentSchedule={weeklyScheduleState}
        />
      )}

      {/* Motivational Content Library Modal */}
      {showMotivationalContentModal && (
        <MotivationalContentModal
          onClose={() => setShowMotivationalContentModal(false)}
        />
      )}

      {/* Theme Settings Modal */}
      {showThemeSettingsModal && (
        <ThemeSettingsModal
          onClose={() => setShowThemeSettingsModal(false)}
          currentTheme={currentTheme}
          setTheme={setTheme}
        />
      )}

      {/* Break Reminder Modal */}
      {showBreakReminder && (
        <BreakReminderModal
          onClose={() => setShowBreakReminder(false)}
          onDismiss={() => {
            setShowBreakReminder(false);
            lastBreakReminderTimeRef.current = Date.now() / 1000; // Reset timer for another interval
          }}
        />
      )}

      {/* Subject Manager Modal */}
      {showSubjectsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div
            className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${themeClasses.shadow} relative`}
          >
            <button
              onClick={() => {
                setShowSubjectsModal(false);
                setEditingSubject(null);
                setNewSubjectName("");
                setNewSubjectCategory("mains");
              }}
              className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
              title="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3
              className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
            >
              Manage Subjects
            </h3>

            <div
              className={`mb-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-inner`}
            >
              <h4
                className={`text-lg font-semibold mb-3 ${themeClasses.primaryText}`}
              >
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </h4>
              <input
                type="text"
                placeholder="Subject Name (e.g., Indian Economy)"
                className={`w-full p-3 ${themeClasses.secondaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3`}
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
              <select
                className={`w-full p-3 ${themeClasses.secondaryBg} rounded-lg ${themeClasses.primaryText} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4`}
                value={newSubjectCategory}
                onChange={(e) => setNewSubjectCategory(e.target.value)}
              >
                <option value="mains">Mains</option>
                <option value="prelims">Prelims</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddSubject}
                  className={`flex-1 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText}`}
                >
                  {editingSubject ? "Save Changes" : "Add Subject"}
                </button>
                {editingSubject && (
                  <button
                    onClick={() => {
                      setEditingSubject(null);
                      setNewSubjectName("");
                      setNewSubjectCategory("mains");
                    }}
                    className={`flex-1 px-4 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <h4
              className={`text-xl font-bold mb-4 ${themeClasses.primaryText}`}
            >
              Your Subjects
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {subjects.length === 0 && (
                <p className={`${themeClasses.secondaryText} text-center py-4`}>
                  No subjects added yet.
                </p>
              )}
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`${themeClasses.tertiaryBg} p-3 rounded-lg flex items-center justify-between shadow-sm`}
                >
                  <div>
                    <p className={`font-medium ${themeClasses.primaryText}`}>
                      {subject.name}
                    </p>
                    <span
                      className={`text-xs ${themeClasses.secondaryText} capitalize`}
                    >
                      {subject.category}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSubject(subject);
                        setShowNotesModal(true);
                        setShowSubjectsModal(false); // Close subjects modal when opening notes modal
                      }}
                      className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.secondaryBg} transition-colors`}
                      title="View Notes"
                    >
                      <ClipboardList className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditSubject(subject)}
                      className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.secondaryBg} transition-colors`}
                      title="Edit Subject"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal (for a specific subject) */}
      {showNotesModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div
            className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${themeClasses.shadow} relative`}
          >
            {/* Close button (X icon) */}
            <button
              onClick={() => {
                setShowNotesModal(false);
                setEditingSubjectNote(null);
                setNewSubjectNoteTitle("");
                setNewSubjectNoteNoteContent("");
                setSelectedSubject(null); // Clear selected subject on close
                setShowSubjectsModal(true); // Reopen subjects modal
              }}
              className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
              title="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3
              className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
            >
              Notes for:{" "}
              <span className={`${themeClasses.accent}`}>
                {selectedSubject.name}
              </span>
            </h3>

            <div
              className={`mb-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-inner`}
            >
              <h4
                className={`text-lg font-semibold mb-3 ${themeClasses.primaryText}`}
              >
                {editingSubjectNote ? "Edit Note" : "Add New Note"}
              </h4>
              <input
                type="text"
                placeholder="Note Title"
                className={`w-full p-3 ${themeClasses.secondaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3`}
                value={newSubjectNoteTitle}
                onChange={(e) => setNewSubjectNoteTitle(e.target.value)}
              />
              <textarea
                placeholder="Note Content..."
                className={`w-full p-3 ${themeClasses.secondaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4`}
                rows="5"
                value={newSubjectNoteContent}
                onChange={(e) => setNewSubjectNoteNoteContent(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddSubjectNote}
                  className={`flex-1 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText}`}
                >
                  {editingSubjectNote ? "Save Changes" : "Add Note"}
                </button>
                {editingSubjectNote && (
                  <button
                    onClick={() => {
                      setEditingSubjectNote(null);
                      setNewSubjectNoteTitle("");
                      setNewSubjectNoteNoteContent("");
                    }}
                    className={`flex-1 px-4 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <h4
              className={`text-xl font-bold mb-4 ${themeClasses.primaryText}`}
            >
              Previous Notes
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {notesForSelectedSubject.length === 0 && (
                <p className={`${themeClasses.secondaryText} text-center py-4`}>
                  No notes for this subject yet.
                </p>
              )}
              {notesForSelectedSubject.map((note) => (
                <div
                  key={note.id}
                  className={`${themeClasses.tertiaryBg} p-3 rounded-lg flex flex-col shadow-sm`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className={`font-medium ${themeClasses.primaryText}`}>
                      {note.title}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSubjectNote(note)}
                        className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.secondaryBg} transition-colors`}
                        title="Edit Note"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubjectNote(note.id)}
                        className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${themeClasses.secondaryText} mb-2`}>
                    {note.content}
                  </p>
                  <span
                    className={`text-xs ${themeClasses.secondaryText} text-right`}
                  >
                    Saved: {new Date(note.createdAt?.toDate()).toLocaleString()}
                  </span>
                  {note.updatedAt &&
                    note.updatedAt.toDate().getTime() !==
                      note.createdAt?.toDate().getTime() && (
                      <span
                        className={`text-xs ${themeClasses.secondaryText} text-right`}
                      >
                        Updated:{" "}
                        {new Date(note.updatedAt?.toDate()).toLocaleString()}
                      </span>
                    )}
                </div>
              ))}
            </div>
            {/* New "Back to Subjects" button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setEditingSubjectNote(null);
                  setNewSubjectNoteTitle("");
                  setNewSubjectNoteNoteContent("");
                  setSelectedSubject(null);
                  setShowSubjectsModal(true);
                }}
                className={`px-6 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors font-semibold ${themeClasses.primaryText} flex items-center space-x-2`}
              >
                <Book className="w-5 h-5" />
                <span>Back to Subjects</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap the main app component with the ThemeProvider
const App = () => (
  <ThemeProvider>
    <StudyTracker />
  </ThemeProvider>
);

export default App;
