import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";
import { addIdsToTasks } from "../../utils/helpers"; // Import helper
import { initialWeeklyScheduleData } from "../../utils/constants"; // Import constants

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
        <XCircleButton onClick={onClose} />
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

export default WeeklyPlannerModal;
