import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  ClipboardList,
  History,
  Plus,
  Trash2,
  FileText,
  Loader2,
  CheckCircle,
  Edit, // Added Edit icon as it was used in previous context but not in this import list
} from "lucide-react";
import { useTheme } from "./contexts/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";
import { useTimer } from "./hooks/useTimer";
import { BREAK_REMINDER_INTERVAL_SECONDS } from "./utils/constants";
import { formatDuration } from "./utils/helpers";

// Modals
import AuthModal from "./components/modals/AuthModal";
import DailyTaskModal from "./components/dashboard/DailyTasksSection";
import WeeklyPlannerModal from "./components/modals/WeeklyPlannerModal";
import ManageTemplatesModal from "./components/modals/ManageTemplatesModal";
import MotivationalContentModal from "./components/modals/MotivationalContentModal";
import ThemeSettingsModal from "./components/modals/ThemeSettingsModal";
import BreakReminderModal from "./components/modals/BreakReminderModal";
import SubjectModal from "./components/modals/SubjectModal";
import NotesModal from "./components/modals/NotesModal";
import GeneralNotesModal from "./components/modals/GeneralNotesModal";
import CalendarModal from "./components/modals/CalendarModal";
import StudyHeatmap from "./components/dashboard/StudyHeatmap";
import GradeTracker from "./components/dashboard/GradeTracker";
import GradeTrackerModal from "./components/modals/GradeTrackerModal";
import ExamCountdown from "./components/dashboard/ExamCountdown";
import ExamModal from "./components/modals/ExamModal";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import WeeklyScheduleDisplay from "./components/dashboard/WeeklyScheduleDisplay";

const App = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" })
  );

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showDailyTaskModal, setShowDailyTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // Task object being edited
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskActivity, setNewTaskActivity] = useState("");
  const [showWeeklyPlannerModal, setShowWeeklyPlannerModal] = useState(false);

  const [showManageTemplatesModal, setShowManageTemplatesModal] =
    useState(false);
  const [showMotivationalContentModal, setShowMotivationalContentModal] =
    useState(false);
  const [showThemeSettingsModal, setShowThemeSettingsModal] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [showProfileHeatmap, setShowProfileHeatmap] = useState(false);

  // Subject and Notes Management
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showGeneralNotesModal, setShowGeneralNotesModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showGradeTrackerModal, setShowGradeTrackerModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const { themeClasses } = useTheme();
  const {
    userId,
    userName,
    authError,
    loading,
    handleRegister,
    handleLogin,
    handleGoogleSignIn,
    handleLogout,
    setAuthError,
  } = useAuth();
  const {
    weeklySchedule,
    setWeeklySchedule,
    subjects,
    weeklyScheduleTemplates,
    studyHistory,
    saveWeeklySchedule,
    addSubject,
    updateSubject,
    deleteSubject,
    saveScheduleTemplate,
    loadScheduleTemplate,
    deleteScheduleTemplate, // This is the correct function
    addStudyHistoryEntry,
    getDailyStudyData,
    addGrade,
    grades,
    updateGrade,
    deleteGrade,
    addExam,
    updateExam,
    deleteExam,
    exams,
    completedTasks,
    saveCompletedTasks,
  } = useFirestore(userId);

  const handleEditGrade = (grade) => {
    setEditingGrade(grade);
    setShowGradeTrackerModal(true);
  };

  const handleSaveGrade = async (gradeData) => {
    if (editingGrade) {
      await updateGrade(editingGrade.id, gradeData);
    } else {
      await addGrade(gradeData);
    }
    setEditingGrade(null);
    setShowGradeTrackerModal(false);
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setShowExamModal(true);
  };

  const handleSaveExam = async (examData) => {
    if (editingExam) {
      await updateExam(editingExam.id, examData);
    } else {
      await addExam(examData);
    }
    setEditingExam(null);
    setShowExamModal(false);
  };


  const { time, isRunning, startTimer, pauseTimer, resetTimer } = useTimer(() =>
    setShowBreakReminder(true)
  );

  const [dailyStudyTime, setDailyStudyTime] = useState(0); // Total time for the day, persistent across sessions
  const [currentStreak, setCurrentStreak] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Update current date/time and day
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
      setCurrentDay(
        new Date().toLocaleDateString("en-US", { weekday: "long" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist daily study time
  useEffect(() => {
    if (!userId) return;
    const saveDailyTime = async () => {
      const existingData = await getDailyStudyData(new Date());
      let totalToday = existingData.reduce(
        (acc, entry) => acc + (entry.studyDuration || 0),
        0
      );
      setDailyStudyTime(totalToday);
    };
    saveDailyTime();
  }, [userId, getDailyStudyData]);

  useEffect(() => {
    const updateDailyStudyTimeInDb = async () => {
      if (userId && time > 0) {
        const today = new Date();
        const dayOfWeek = today.toLocaleDateString("en-US", {
          weekday: "long",
        });
        const tasksForToday = weeklySchedule[dayOfWeek]?.tasks || [];
        const completedTasksForToday = tasksForToday.filter(
          (task) => completedTasks[dayOfWeek]?.[task.id]
        );
        const progress =
          tasksForToday.length > 0
            ? (completedTasksForToday.length / tasksForToday.length) * 100
            : 0;

        // Check if there's an existing entry for today
        const existingEntries = await getDailyStudyData(today);
        if (existingEntries.length > 0) {
          // Find the last entry for today and update it
          await addStudyHistoryEntry({
            date: today,
            studyDuration: time,
            progress: progress,
          });
        } else {
          // Add a new entry for today
          await addStudyHistoryEntry({
            date: today,
            studyDuration: time,
            progress: progress,
          });
        }
      }
    };

    if (!isRunning && time > 0) {
      updateDailyStudyTimeInDb();
    }
  }, [
    isRunning,
    time,
    userId,
    addStudyHistoryEntry,
    getDailyStudyData,
    weeklySchedule,
    completedTasks,
  ]);

  // Handle clicks outside dropdown
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
  }, []);

  // Check for pending tasks after 10 PM
  useEffect(() => {
    const checkPendingTasks = () => {
      const now = new Date();
      if (now.getHours() >= 22) {
        const dayOfWeek = now.toLocaleDateString("en-US", {
          weekday: "long",
        });
        const tasksForToday = weeklySchedule[dayOfWeek]?.tasks || [];
        const pendingTasks = tasksForToday.filter(
          (task) => !completedTasks[dayOfWeek]?.[task.id]
        );
        if (pendingTasks.length > 0) {
          setNotifications([
            {
              message: `You have ${pendingTasks.length} pending task(s) for today.`,
            },
          ]);
        }
      }
    };

    const interval = setInterval(checkPendingTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [weeklySchedule, completedTasks]);

  // --- Streak Calculation (Needs comprehensive logic) ---
  useEffect(() => {
    if (!userId) return;
    const calculateStreak = async () => {
      const sortedHistory = [...studyHistory].sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateA - dateB;
      });

      let current = 0;
      let longest = 0;
      let lastDate = null;

      for (const entry of sortedHistory) {
        const entryDate = entry.date?.toDate
          ? entry.date.toDate()
          : new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        if (lastDate) {
          const diffTime = Math.abs(entryDate - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            current++;
          } else if (diffDays > 1) {
            current = 1;
          }
        } else {
          current = 1; // First entry starts a streak of 1
        }
        longest = Math.max(longest, current);
        lastDate = entryDate;
      }
      setCurrentStreak(current);
    };
    calculateStreak();
  }, [studyHistory, userId]);

  const toggleTaskCompletion = useCallback(
    (day, taskId) => {
      const newCompletedTasks = {
        ...completedTasks,
        [day]: {
          ...(completedTasks[day] || {}),
          [taskId]: !completedTasks[day]?.[taskId],
        },
      };
      saveCompletedTasks(newCompletedTasks);

      const tasksForToday = weeklySchedule[day]?.tasks || [];
      const completedTasksForToday = tasksForToday.filter(
        (task) => newCompletedTasks[day]?.[task.id]
      );
      const progress =
        tasksForToday.length > 0
          ? (completedTasksForToday.length / tasksForToday.length) * 100
          : 0;

      addStudyHistoryEntry({
        date: new Date(),
        studyDuration: 0, // No study duration is added when toggling a task
        progress: progress,
      });
    },
    [completedTasks, saveCompletedTasks, weeklySchedule, addStudyHistoryEntry]
  );

  const handleManageDailyTasks = () => {
    setShowDailyTaskModal(true);
    setEditingTask(null); // Clear any previous editing state
    setNewTaskTime("");
    setNewTaskActivity("");
  };

  const handleSaveDailyTasks = useCallback(
    async (day, updatedTasks) => {
      if (!userId) {
        alert("Please log in to save tasks.");
        return;
      }
      // Update local state first for responsiveness
      setWeeklySchedule((prev) => ({
        ...prev,
        [day]: { ...prev[day], tasks: updatedTasks },
      }));
      // Then save to Firestore
      const scheduleToSave = {
        ...weeklySchedule,
        [day]: { ...weeklySchedule[day], tasks: updatedTasks },
      };
      await saveWeeklySchedule(scheduleToSave);
    },
    [userId, weeklySchedule, saveWeeklySchedule]
  );

  const handleAuthSubmit = useCallback(async () => {
    if (isRegistering) {
      await handleRegister(email, password);
    } else {
      await handleLogin(email, password);
    }
    // Auth hook will update userId, which triggers data fetching
  }, [email, password, isRegistering, handleRegister, handleLogin]);

  // Subject Handlers
  const handleAddSubject = useCallback(
    async (name, category) => {
      if (!userId) {
        alert("Please log in to add subjects.");
        return;
      }
      await addSubject(name, category);
    },
    [userId, addSubject]
  );

  const handleUpdateSubject = useCallback(
    async (subjectId, newName, newCategory) => {
      if (!userId) {
        alert("Please log in to update subjects.");
        return;
      }
      await updateSubject(subjectId, newName, newCategory);
    },
    [userId, updateSubject]
  );

  const handleDeleteSubject = useCallback(
    async (subjectId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this subject and all its notes?"
        )
      ) {
        if (!userId) {
          alert("Please log in to delete subjects.");
          return;
        }
        await deleteSubject(subjectId);
      }
    },
    [userId, deleteSubject]
  );

  const handleViewSubjectNotes = (subject) => {
    setSelectedSubject(subject);
    setShowSubjectsModal(false);
    setShowNotesModal(true);
  };

  const handleSaveTemplate = useCallback(
    async (name, scheduleData, templateIdToUpdate) => {
      if (!userId) {
        alert("Please log in to save templates.");
        return;
      }
      await saveScheduleTemplate(name, scheduleData, templateIdToUpdate);
    },
    [userId, saveScheduleTemplate]
  );

  const handleLoadTemplate = useCallback(
    async (templateId) => {
      if (!userId) {
        alert("Please log in to load templates.");
        return;
      }
      const loadedSchedule = await loadScheduleTemplate(templateId);
      if (loadedSchedule) {
        setWeeklySchedule(loadedSchedule);
        await saveWeeklySchedule(loadedSchedule); // Save loaded schedule as current
        alert("Template loaded successfully!");
      } else {
        alert("Failed to load template.");
      }
      setShowManageTemplatesModal(false);
    },
    [userId, loadScheduleTemplate, saveWeeklySchedule]
  );

  const handleDeleteTemplate = useCallback(
    async (templateId) => {
      if (window.confirm("Are you sure you want to delete this template?")) {
        if (!userId) {
          alert("Please log in to delete templates.");
          return;
        }
        // FIX: Changed 'deleteDeleteTemplate' to 'deleteScheduleTemplate'
        await deleteScheduleTemplate(templateId);
      }
    },
    [userId, deleteScheduleTemplate] // Dependency array updated
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${themeClasses.primaryBg} ${themeClasses.primaryText}`}
      >
        <Loader2 className="w-16 h-16 animate-spin" />
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <AuthModal
        onClose={() => {}} // No close button when it's the main view
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        authError={authError}
        handleAuthSubmit={handleAuthSubmit}
        handleGoogleSignIn={handleGoogleSignIn}
        userId={userId}
        userName={userName}
        handleLogout={handleLogout}
        setAuthError={setAuthError}
        isModal={false} // Make it a full page
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${themeClasses.primaryBg} ${themeClasses.primaryText}`}
    >
      <Header
        userName={userName}
        onShowAuthModal={() => setShowAuthModal(true)}
        onShowWeeklyPlanner={() => setShowWeeklyPlannerModal(true)}
        onShowNotes={() => setShowGeneralNotesModal(true)}
        onShowCalendar={() => setShowCalendarModal(true)}
        onShowProfileHeatmap={() => setShowProfileHeatmap(true)}
        onShowManageTemplates={() => setShowManageTemplatesModal(true)}
        onShowMotivationalContent={() => setShowMotivationalContentModal(true)}
        onShowThemeSettings={() => setShowThemeSettingsModal(true)}
        onShowSubjectsModal={() => setShowSubjectsModal(true)}
        onShowGradeTracker={() => setShowGradeTrackerModal(true)}
        onShowExamModal={() => setShowExamModal(true)}
        notifications={notifications}
        dropdownRef={dropdownRef}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        currentStreak={currentStreak}
        handleLogout={handleLogout}
      />

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Time and Timer */}
        <section
          className={`lg:col-span-1 p-6 rounded-lg ${themeClasses.secondaryBg} ${themeClasses.shadow} flex flex-col items-center justify-center`}
        >
          <h2 className={`text-xl font-bold mb-4 ${themeClasses.accent}`}>
            Current Time
          </h2>
          <p
            className={`text-5xl font-extrabold ${themeClasses.primaryText} mb-4`}
          >
            {currentDateTime.toLocaleTimeString()}
          </p>
          <p className={`text-lg ${themeClasses.secondaryText}`}>
            {currentDateTime.toLocaleDateString()}
          </p>

          <div className="mt-8 text-center w-full">
            <h3 className={`text-xl font-bold mb-4 ${themeClasses.accent}`}>
              Study Timer
            </h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="w-8 h-8 text-blue-400" />
              <span
                className={`text-4xl font-bold ${themeClasses.primaryText}`}
              >
                {formatDuration(time)}
              </span>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className={`p-3 rounded-full ${themeClasses.accentBg} ${themeClasses.accentHover} transition-colors`}
                title={isRunning ? "Pause Timer" : "Start Timer"}
              >
                {isRunning ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={resetTimer}
                className={`p-3 rounded-full ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} transition-colors`}
                title="Reset Timer"
              >
                <RotateCcw className="w-6 h-6 text-gray-300" />
              </button>
            </div>
            <p className={`${themeClasses.secondaryText} text-sm mt-4`}>
              Total study time today:{" "}
              <span className="font-semibold">
                {formatDuration(dailyStudyTime + time)}
              </span>
            </p>
          </div>
        </section>

        {/* Daily Schedule */}
        <section className="lg:col-span-2">
          <WeeklyScheduleDisplay
            currentDay={currentDay}
            weeklySchedule={weeklySchedule}
            completedTasks={completedTasks}
            toggleTaskCompletion={toggleTaskCompletion}
            handleManageDailyTasks={handleManageDailyTasks}
          />
        </section>

        <section className="lg:col-span-3">
          <GradeTracker
            grades={grades}
            onEdit={handleEditGrade}
            onDelete={deleteGrade}
          />
        </section>
        <section className="lg:col-span-3">
          <ExamCountdown exams={exams} onEdit={handleEditExam} onDelete={deleteExam} />
        </section>
      </main>

      <Footer />

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          isRegistering={isRegistering}
          setIsRegistering={setIsRegistering}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          authError={authError}
          handleAuthSubmit={handleAuthSubmit}
          handleGoogleSignIn={handleGoogleSignIn}
          userId={userId}
          userName={userName}
          handleLogout={handleLogout}
          setAuthError={setAuthError}
        />
      )}
      {showDailyTaskModal && (
        <DailyTaskModal
          day={currentDay}
          tasks={weeklySchedule[currentDay]?.tasks || []}
          onClose={() => setShowDailyTaskModal(false)}
          onSaveTasks={(updatedTasks) =>
            handleSaveDailyTasks(currentDay, updatedTasks)
          }
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          newTaskTime={newTaskTime}
          setNewTaskTime={setNewTaskTime}
          newTaskActivity={newTaskActivity}
          setNewTaskActivity={setNewTaskActivity}
        />
      )}
      {showDailyTaskModal && (
        <DailyTaskModal
          day={currentDay}
          tasks={weeklySchedule[currentDay]?.tasks || []}
          onClose={() => setShowDailyTaskModal(false)}
          onSaveTasks={(updatedTasks) =>
            handleSaveDailyTasks(currentDay, updatedTasks)
          }
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          newTaskTime={newTaskTime}
          setNewTaskTime={setNewTaskTime}
          newTaskActivity={newTaskActivity}
          setNewTaskActivity={setNewTaskActivity}
        />
      )}
      {showWeeklyPlannerModal && (
        <WeeklyPlannerModal
          currentSchedule={weeklySchedule}
          onClose={() => setShowWeeklyPlannerModal(false)}
          onSaveWeeklySchedule={saveWeeklySchedule}
        />
      )}
      {showManageTemplatesModal && (
        <ManageTemplatesModal
          onClose={() => setShowManageTemplatesModal(false)}
          templates={weeklyScheduleTemplates}
          onSaveTemplate={handleSaveTemplate}
          onLoadTemplate={handleLoadTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          currentSchedule={weeklySchedule}
        />
      )}
      {showMotivationalContentModal && (
        <MotivationalContentModal
          onClose={() => setShowMotivationalContentModal(false)}
        />
      )}
      {showThemeSettingsModal && (
        <ThemeSettingsModal onClose={() => setShowThemeSettingsModal(false)} />
      )}
      {showBreakReminder && (
        <BreakReminderModal
          onClose={() => setShowBreakReminder(false)}
          onDismiss={() => setShowBreakReminder(false)}
        />
      )}
      {showSubjectsModal && (
        <SubjectModal
          onClose={() => setShowSubjectsModal(false)}
          subjects={subjects}
          onAddSubject={handleAddSubject}
          onUpdateSubject={handleUpdateSubject}
          onDeleteSubject={handleDeleteSubject}
          onViewNotes={handleViewSubjectNotes}
        />
      )}
      {showNotesModal && selectedSubject && (
        <NotesModal
          onClose={() => {
            setShowNotesModal(false);
            setSelectedSubject(null);
          }}
          selectedSubject={selectedSubject}
          userId={userId}
          setShowSubjectsModal={setShowSubjectsModal}
        />
      )}
      {showProfileHeatmap && (
        <StudyHeatmap
          studyHistory={studyHistory}
          onClose={() => setShowProfileHeatmap(false)}
        />
      )}
      {showGeneralNotesModal && (
        <GeneralNotesModal
          onClose={() => setShowGeneralNotesModal(false)}
          userId={userId}
        />
      )}
      {showCalendarModal && (
        <CalendarModal onClose={() => setShowCalendarModal(false)} />
      )}
      {showGradeTrackerModal && (
        <GradeTrackerModal
          isOpen={showGradeTrackerModal}
          onClose={() => {
            setShowGradeTrackerModal(false);
            setEditingGrade(null);
          }}
          onSave={handleSaveGrade}
          grade={editingGrade}
        />
      )}
      {showExamModal && (
        <ExamModal
          isOpen={showExamModal}
          onClose={() => {
            setShowExamModal(false);
            setEditingExam(null);
          }}
          onSave={handleSaveExam}
          exam={editingExam}
        />
      )}
    </div>
  );
};

export default App;
