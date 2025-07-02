import React, { useState, useEffect, useCallback, useRef } from "react";
import * as d3 from "d3"; // Import D3.js
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
  Loader2, // Import Loader2 icon for loading state
  Play, // For stopwatch play button
  Pause, // For stopwatch pause button
  RotateCcw, // For stopwatch reset button
  LogOut, // Import LogOut icon for logout button
  Mail, // For email sign-in icon
  UserPlus, // For register icon
} from "lucide-react";

// Firebase imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // Import getAnalytics
import {
  getAuth,
  onAuthStateChanged,
  signOut, // Import signOut for logout functionality
  createUserWithEmailAndPassword, // For user registration
  signInWithEmailAndPassword, // For user login
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup, // Import signInWithPopup for Google Sign-In
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";

// Your web app's Firebase configuration (directly included for this environment)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Derive appId from firebaseConfig.appId (or use a default if not present)
// This is used for Firestore collection paths to scope data to the current application.
const appId = firebaseConfig.appId; // Directly use the appId from config

// Helper function to add unique IDs to tasks
// This ensures each task has a stable ID for tracking completion status.
const addIdsToTasks = (schedule) => {
  let taskIdCounter = 0;
  const newSchedule = {};
  for (const day in schedule) {
    newSchedule[day] = {
      ...schedule[day],
      tasks: schedule[day].tasks.map((task) => ({
        ...task,
        id: taskIdCounter++, // Assign a unique ID to each task
      })),
    };
  }
  return newSchedule;
};

// Define the initial weekly schedule outside the component
// This data serves as the default structure for the study timetable.
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

// StudyHeatmap Component: Visualizes study progress over time using D3.js
const StudyHeatmap = ({ studyHistory, onClose }) => {
  const svgRef = useRef();
  const today = new Date();
  // Calculate date one year ago for heatmap range
  const oneYearAgo = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  );

  useEffect(() => {
    const data = {};
    // Aggregate history by date, including studyDuration
    studyHistory.forEach((entry) => {
      const dateKey = new Date(entry.date).toDateString(); // Normalize date to compare
      if (!data[dateKey]) {
        data[dateKey] = {
          date: new Date(entry.date),
          progress: 0,
          studyDuration: 0, // Initialize studyDuration
          count: 0,
        };
      }
      data[dateKey].progress += entry.progress;
      data[dateKey].studyDuration += entry.studyDuration || 0; // Add studyDuration
      data[dateKey].count++;
    });

    // Calculate average progress and total duration for each day
    const dailyData = Object.values(data).map((d) => ({
      date: d.date,
      avgProgress: d.progress / d.count,
      totalStudyDuration: d.studyDuration, // Total duration for the day
    }));

    // Create a map for quick lookup
    const dateMap = new Map(dailyData.map((d) => [d.date.toDateString(), d]));

    const cellSize = 15; // Size of each day's square in the heatmap
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

    const formatDay = d3.timeFormat("%w"); // Day of the week (0-6)
    const formatWeek = d3.timeFormat("%U"); // Week of the year (0-53)
    const formatMonth = d3.timeFormat("%b"); // Abbreviated month name

    // Generate all days for the last year to ensure a continuous heatmap
    const allDays = d3.timeDays(oneYearAgo, today);

    // Color scale for progress (e.g., from light green to dark green)
    // Simulates GitHub contribution graph colors.
    const colorScale = d3
      .scaleQuantize()
      .domain([0, 100]) // Progress from 0% to 100%
      .range(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]); // GitHub-like green shades

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render to prevent duplicates on re-render

    // Calculate dynamic width based on number of weeks in the year range
    const numWeeks = d3.timeWeeks(
      d3.timeSunday(oneYearAgo), // Start from Sunday of the week one year ago
      d3.timeSunday(today) // End at Sunday of the current week
    ).length;
    const width = numWeeks * (cellSize + 2) + 50; // Estimate width based on number of weeks and cell spacing
    const height = (cellSize + 2) * 7 + 50; // Height for 7 days + padding for labels

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`); // Set viewBox for responsiveness

    const g = svg.append("g").attr("transform", `translate(30, 20)`); // Padding for labels

    // Append day labels (Mon, Tue, etc.) on the left side of the heatmap
    g.selectAll(".day-label")
      .data(weekDays)
      .enter()
      .append("text")
      .attr("class", "text-xs fill-gray-400")
      .attr("x", -5)
      .attr("y", (d, i) => i * (cellSize + 2) + cellSize / 2)
      .attr("dy", ".35em") // Vertical alignment
      .attr("text-anchor", "end") // Align text to the end (right)
      .text((d) => d);

    // Append rectangles for each day, colored by study progress
    g.selectAll(".day")
      .data(allDays)
      .enter()
      .append("rect")
      .attr("class", "day rounded-sm")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", (d) => formatWeek(d) * (cellSize + 2)) // Position by week of the year
      .attr("y", (d) => formatDay(d) * (cellSize + 2)) // Position by day of the week
      .attr("fill", (d) => {
        const entry = dateMap.get(d.toDateString());
        return entry ? colorScale(entry.avgProgress) : colorScale(0); // Default to 0% if no data for the day
      })
      .append("title") // Tooltip to show details on hover
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

    // Append month labels at the top of the heatmap
    g.selectAll(".month-label")
      .data(d3.timeMonths(oneYearAgo, today))
      .enter()
      .append("text")
      .attr("class", "text-xs fill-gray-400")
      .attr("x", (d) => formatWeek(d) * (cellSize + 2)) // Position by week of the month's start
      .attr("y", -10)
      .text((d) => formatMonth(d));
  }, [studyHistory, today, oneYearAgo]); // Re-render if studyHistory changes

  // Helper to format duration for display (e.g., 1h 30m 15s)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <h3 className="text-xl font-bold mb-4">Study Heatmap</h3>
        <p className="text-gray-400 mb-4">
          Daily study progress and accumulated study time over the last year.
        </p>
        <div className="flex justify-center items-center">
          <svg
            ref={svgRef}
            className="bg-gray-900 rounded-lg shadow-inner"
          ></svg>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main StudyTracker Component
const StudyTracker = () => {
  // State variables for managing UI and data
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [currentDay, setCurrentDay] = useState("");
  const [weeklyScheduleState, setWeeklyScheduleState] = useState(
    initialWeeklyScheduleData
  );
  const [completedTasks, setCompletedTasks] = useState({});
  const [notes, setNotes] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfileHeatmap, setShowProfileHeatmap] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [studyHistory, setStudyHistory] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Firebase states
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Guest"); // State to store the user's display name
  const [loading, setLoading] = useState(true); // Tracks initial Firebase loading
  const [authReady, setAuthReady] = useState(false); // Ensures Firestore operations wait for auth state

  // States for authentication modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // True for register form, false for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(""); // To display authentication errors

  // Stopwatch states
  const [time, setTime] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null); // Ref for setInterval ID
  const [dailyStudyTime, setDailyStudyTime] = useState(0); // To store and accumulate daily study time from Firestore

  // --- Firebase Initialization and Authentication ---
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestoreInstance = getFirestore(app);
      getAnalytics(app); // Initialize Analytics

      setAuth(authInstance);
      setDb(firestoreInstance);

      // Listen for auth state changes
      // This listener runs whenever the user's sign-in state changes (login, logout, initial load)
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) {
          setUserId(user.uid);
          // Prioritize user.displayName for greeting, fallback to email, then generic "User"
          setUserName(user.displayName || user.email || "User");
          console.log("User UID:", user.uid);
          setShowAuthModal(false); // Hide auth modal if user is logged in
        } else {
          setUserId(null);
          setUserName("Guest"); // Reset name on logout
          console.log("No user signed in.");
          // If no user is signed in and not currently loading, show auth modal
          if (!loading) {
            setShowAuthModal(true);
          }
        }
        setAuthReady(true); // Auth state is now known
        setLoading(false); // Stop loading once auth state is determined
      });

      return () => unsubscribe(); // Cleanup auth listener on component unmount
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      setLoading(false);
      setAuthReady(true);
    }
  }, []); // Empty dependency array means this effect runs once on mount

  // --- Authentication Handlers (Login/Register/Logout) ---
  const handleAuth = async () => {
    setAuthError(""); // Clear previous errors
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
        console.log("User registered and logged in with email!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in with email!");
      }
      setShowAuthModal(false); // Close modal on successful authentication
      setAuthError(""); // Clear any lingering errors
    } catch (error) {
      console.error("Authentication error:", error.code, error.message);
      let errorMessage = "Authentication failed. Please try again.";
      // Provide more user-friendly error messages based on Firebase error codes
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

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setAuthError("");
    if (!auth) {
      setAuthError("Firebase Auth not initialized.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("Signed in with Google!");
      setShowAuthModal(false); // Close modal on successful authentication
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
        console.log("User logged out.");
        // Clear any user-specific data from local state after logout
        setCompletedTasks({});
        setNotes([]);
        setStudyHistory([]);
        setTime(0);
        setDailyStudyTime(0);
        setAuthError(""); // Clear any auth errors
        setEmail(""); // Clear email and password fields in the form
        setPassword("");
        setShowAuthModal(true); // Show the login modal again after logout
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
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current); // Cleanup on unmount
  }, [isRunning]);

  // Format stopwatch time for display (HH:MM:SS)
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
  };

  const stopStopwatch = async () => {
    setIsRunning(false);
    // Save the accumulated time to Firestore for the current day
    if (db && userId) {
      const todayDate = new Date().toLocaleDateString();
      const dailyStudyTimeRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/dailyStudyTime`,
        todayDate.replace(/\//g, "-") // Use a Firestore-friendly date string as ID
      );
      try {
        await setDoc(
          dailyStudyTimeRef,
          {
            date: todayDate,
            day: currentDay,
            duration: time, // Save current stopwatch time
            timestamp: new Date(),
          },
          { merge: true } // Merge to update if document exists
        );
        console.log("Daily study time saved:", time);
      } catch (error) {
        console.error("Error saving daily study time:", error);
      }
    }
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setTime(0);
  };

  // --- Fetching Data from Firestore ---
  useEffect(() => {
    // Only attempt to fetch data if Firestore is initialized, user is authenticated, and auth state is ready
    if (!db || !userId || !authReady) {
      console.log("Firestore not ready to fetch data.");
      return;
    }

    // Define Firestore document and collection references for the current user
    const userDocRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/userData/data`
    );
    const notesCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/notes`
    );
    const historyCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/history`
    );
    const dailyStudyTimeCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/dailyStudyTime`
    );

    // Listen for completed tasks (real-time updates)
    const unsubscribeCompletedTasks = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().completedTasks) {
          setCompletedTasks(docSnap.data().completedTasks);
        } else {
          setCompletedTasks({}); // Reset if no data
        }
      },
      (error) => console.error("Error fetching completed tasks:", error)
    );

    // Listen for notes (real-time updates)
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
        ); // Sort by createdAt timestamp (newest first)
      },
      (error) => console.error("Error fetching notes:", error)
    );

    // Listen for study history (real-time updates)
    const unsubscribeHistory = onSnapshot(
      historyCollectionRef,
      (snapshot) => {
        const fetchedHistory = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setStudyHistory(
          fetchedHistory.sort((a, b) => {
            // Sort history by timestamp (newest first)
            const dateA = a.timestamp?.toDate() || new Date(a.date); // Fallback to date string if timestamp is missing
            const dateB = b.timestamp?.toDate() || new Date(b.date);
            return dateB - dateA;
          })
        );
      },
      (error) => console.error("Error fetching study history:", error)
    );

    // Listen for daily study time (real-time updates)
    const unsubscribeDailyStudyTime = onSnapshot(
      dailyStudyTimeCollectionRef,
      (snapshot) => {
        const todayDate = new Date().toLocaleDateString();
        const todayEntry = snapshot.docs.find(
          (doc) => doc.id === todayDate.replace(/\//g, "-")
        );
        if (todayEntry && todayEntry.data().duration !== undefined) {
          setTime(todayEntry.data().duration); // Set stopwatch to saved time
          setDailyStudyTime(todayEntry.data().duration); // Also update dailyStudyTime state
        } else {
          setTime(0); // Reset stopwatch if no data for today
          setDailyStudyTime(0);
        }
      },
      (error) => console.error("Error fetching daily study time:", error)
    );

    // Return cleanup function to unsubscribe from all listeners when component unmounts or dependencies change
    return () => {
      unsubscribeCompletedTasks();
      unsubscribeNotes();
      unsubscribeHistory();
      unsubscribeDailyStudyTime();
    };
  }, [db, userId, authReady, appId]); // Re-run when db, userId, or authReady changes

  // Set current day after initial load
  useEffect(() => {
    if (!loading) {
      setCurrentDay(getCurrentDayOfWeek());
    }
  }, [loading]);

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

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time for display in the header
  const formattedDateTime = currentDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Function to get time-based greeting
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

  // Toggles the completion status of a task and updates Firestore
  const toggleTask = async (day, taskId) => {
    if (!db || !userId) {
      console.warn("Firestore not initialized or user not authenticated.");
      return;
    }

    // Create a new object for completed tasks with the toggled status
    const newCompletedTasks = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId],
    };

    // Optimistically update UI for immediate feedback
    setCompletedTasks(newCompletedTasks);

    // Update the weeklyScheduleState to reorder tasks locally (completed tasks move to bottom)
    setWeeklyScheduleState((prevSchedule) => {
      const newSchedule = { ...prevSchedule };
      const currentDayTasks = [...newSchedule[day].tasks];
      currentDayTasks.sort((a, b) => {
        const aCompleted = newCompletedTasks[a.id];
        const bCompleted = newCompletedTasks[b.id];
        if (aCompleted && !bCompleted) return 1; // a is completed, b is not -> a goes after b
        if (!aCompleted && bCompleted) return -1; // a is not completed, b is -> a goes before b
        return 0; // maintain original order if both same status
      });
      newSchedule[day] = {
        ...newSchedule[day],
        tasks: currentDayTasks,
      };
      return newSchedule;
    });

    // Save the updated completed tasks to Firestore
    try {
      const userDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/userData/data`
      );
      await setDoc(
        userDocRef,
        { completedTasks: newCompletedTasks },
        { merge: true }
      ); // Use merge to only update the `completedTasks` field
      console.log("Completed tasks updated in Firestore.");
    } catch (error) {
      console.error("Error updating completed tasks in Firestore:", error);
      // Revert UI if Firestore update fails (optional, but good for robust apps)
      setCompletedTasks(completedTasks); // Revert to previous state
    }
  };

  // Adds a new note to Firestore
  const addNote = async () => {
    if (!db || !userId || !newNote.trim()) {
      console.warn(
        "Firestore not initialized, user not authenticated, or note is empty."
      );
      return;
    }

    const noteToAdd = {
      text: newNote.trim(),
      date: new Date().toLocaleDateString(),
      day: currentDay,
      createdAt: new Date(), // Add a timestamp for sorting
    };

    try {
      const notesCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/notes`
      );
      await addDoc(notesCollectionRef, noteToAdd); // Add a new document with a generated ID
      setNewNote(""); // Clear input only on success
      console.log("Note added to Firestore.");
    } catch (error) {
      console.error("Error adding note to Firestore:", error);
    }
  };

  // Deletes a note from Firestore
  const deleteNote = async (idToDelete) => {
    if (!db || !userId) {
      console.warn("Firestore not initialized or user not authenticated.");
      return;
    }
    try {
      const noteDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/notes`,
        idToDelete
      );
      await deleteDoc(noteDocRef); // Delete the document by its ID
      console.log("Note deleted from Firestore.");
    } catch (error) {
      console.error("Error deleting note from Firestore:", error);
    }
  };

  // Calculates the progress percentage for a given day
  const calculateDayProgress = useCallback(
    (day) => {
      const dayTasks = weeklyScheduleState[day]?.tasks || []; // Handle potential undefined schedule data
      if (dayTasks.length === 0) return 0;
      const completed = dayTasks.filter(
        (task) => completedTasks[task.id]
      ).length;
      return Math.round((completed / dayTasks.length) * 100);
    },
    [weeklyScheduleState, completedTasks]
  );

  // Marks the current day's progress and study duration as complete in history
  const markDayComplete = async () => {
    if (!db || !userId) {
      console.warn("Firestore not initialized or user not authenticated.");
      return;
    }

    const todayDate = new Date().toLocaleDateString();
    const progress = calculateDayProgress(currentDay);

    const historyEntry = {
      day: currentDay,
      date: todayDate,
      progress: progress,
      completedTasksCount: weeklyScheduleState[currentDay].tasks.filter(
        (task) => completedTasks[task.id]
      ).length,
      totalTasksCount: weeklyScheduleState[currentDay].tasks.length,
      studyDuration: dailyStudyTime, // Include the daily accumulated study time
      timestamp: new Date(), // Add a timestamp for unique ID and sorting
    };

    try {
      // Use a specific ID for updates to ensure only one entry per day per user
      // Combines current day and ISO date for a consistent, unique key
      const historyDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/history`,
        `${currentDay}-${new Date().toISOString().split("T")[0]}`
      );
      await setDoc(historyDocRef, historyEntry, { merge: true }); // Use setDoc with merge to update or create
      setShowConfirmation(true); // Show confirmation message
      setTimeout(() => setShowConfirmation(false), 3000); // Hide after 3 seconds
      console.log("History updated/saved to Firestore.");
    } catch (error) {
      console.error("Error marking day complete in Firestore:", error);
    }
  };

  // --- Conditional Rendering for Loading and Authentication ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center flex-col">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-4" />
        <p>Loading your study data...</p>
      </div>
    );
  }

  // Show authentication modal if no user is logged in and not loading
  if (!userId && !loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {isRegistering ? "Register" : "Login"} to Study Tracker
          </h2>
          {authError && (
            <p className="text-red-400 text-center mb-4">{authError}</p>
          )}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleAuth}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
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
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
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
              setAuthError(""); // Clear error when toggling form type
            }}
            className="w-full mt-4 text-center text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    );
  }

  // --- Main Application UI (Dashboard) ---
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <BookOpen className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">UPSC Study Tracker</h1>
        </div>

        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          {/* Time-based Greeting and User's Name */}
          <div className="text-lg text-white flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-400" />
            {getGreetingTime()}, {userName}!
          </div>
          <div className="text-sm text-gray-400">{formattedDateTime}</div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-end gap-3">
          <button
            onClick={() => {
              setNewNote(""); // Clear new note input when opening modal for adding
              setShowNotes(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>

          <button
            onClick={() => setShowNotes(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>My Notes</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>

          <button
            onClick={() => setShowProfileHeatmap(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          {/* Logout Button (only show if a user is logged in) */}
          {userId && (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* User ID Display (for debugging/info) */}
      {userId && (
        <div className="bg-gray-700 text-gray-300 text-xs py-1 px-4 text-center">
          User ID: <span className="font-mono">{userId}</span>
        </div>
      )}

      {/* Confirmation Message for saving history */}
      {showConfirmation && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50">
          History saved successfully!
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar - Day Navigation */}
        <div className="w-full lg:w-64 bg-gray-800 p-4 lg:min-h-screen">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Week Schedule
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentDay === day
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{day}</span>
                  <div className="text-sm">{calculateDayProgress(day)}%</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {weeklyScheduleState[day]?.title || "Loading..."}{" "}
                  {/* Use optional chaining */}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Study Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <h2 className="text-3xl font-bold mb-3 sm:mb-0">
                {currentDay} -{" "}
                {weeklyScheduleState[currentDay]?.title || "Loading..."}
              </h2>
              <button
                onClick={markDayComplete}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
              >
                Mark Day Complete
              </button>
            </div>

            {/* Stopwatch Section */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h4 className="text-lg font-semibold mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2" /> Daily Study Timer
              </h4>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-4xl font-bold text-blue-400">
                  {formatTime(time)}
                </span>
                <div className="flex space-x-2">
                  {!isRunning ? (
                    <button
                      onClick={startStopwatch}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                      title="Start Timer"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      onClick={stopStopwatch}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                      title="Pause Timer"
                    >
                      <Pause className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={resetStopwatch}
                    className="p-2 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Daily Progress</span>
                <span className="text-sm font-medium">
                  {calculateDayProgress(currentDay)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateDayProgress(currentDay)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {weeklyScheduleState[currentDay]?.tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-gray-800 p-4 rounded-lg border-l-4 transition-all ${
                  completedTasks[task.id]
                    ? "border-green-500 bg-gray-700"
                    : "border-blue-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-blue-400">
                      {task.time}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleTask(currentDay, task.id)}
                    className="p-1 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    {completedTasks[task.id] ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>

                <p
                  className={`mt-2 ${
                    completedTasks[task.id]
                      ? "text-gray-400 line-through"
                      : "text-white"
                  }`}
                >
                  {task.activity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Study Notes</h3>

            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a new note..."
                className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <button
                onClick={addNote}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
              >
                Add Note
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {notes.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No notes added yet.
                </p>
              )}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gray-700 p-3 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      {note.date} - {note.day}
                    </div>
                    <p className="text-sm">{note.text}</p>
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

            <button
              onClick={() => setShowNotes(false)}
              className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Study History</h3>

            <div className="space-y-3 pr-2">
              {studyHistory.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No study history yet.
                </p>
              )}
              {studyHistory.map((entry) => (
                <div key={entry.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{entry.day}</span>
                    <span className="text-sm text-gray-400">{entry.date}</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Progress: {entry.progress}% ({entry.completedTasksCount}/{" "}
                    {entry.totalTasksCount} tasks)
                    {entry.studyDuration !== undefined && (
                      <span className="ml-2">
                        | Time: {formatTime(entry.studyDuration)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
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
    </div>
  );
};

export default StudyTracker;
