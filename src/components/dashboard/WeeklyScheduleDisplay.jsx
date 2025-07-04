import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const WeeklyScheduleDisplay = ({
  currentDay,
  weeklySchedule,
  completedTasks,
  toggleTaskCompletion,
  handleManageDailyTasks,
}) => {
  const { themeClasses } = useTheme();

  const currentDaySchedule = weeklySchedule[currentDay] || {
    title: "No Plan Set",
    tasks: [],
  };

  return (
    <div
      className={`p-6 rounded-lg ${themeClasses.secondaryBg} ${themeClasses.shadow}`}
    >
      <h2
        className={`text-2xl font-bold mb-4 ${themeClasses.primaryText} text-center`}
      >
        Your Daily Plan ({currentDay})
      </h2>
      <h3
        className={`text-xl font-semibold mb-4 ${themeClasses.accent} text-center`}
      >
        {currentDaySchedule.title}
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
        {currentDaySchedule.tasks.length === 0 ? (
          <p className={`${themeClasses.secondaryText} text-center py-4`}>
            No tasks scheduled for today.
          </p>
        ) : (
          currentDaySchedule.tasks.map((task, index) => (
            <div
              key={task.id || index}
              className={`flex items-center justify-between p-3 rounded-lg shadow-sm ${
                completedTasks[currentDay]?.[task.id || index]
                  ? "bg-green-900 text-white"
                  : themeClasses.tertiaryBg
              }`}
            >
              <div>
                <p
                  className={`font-medium ${
                    completedTasks[currentDay]?.[task.id || index]
                      ? "text-white"
                      : themeClasses.primaryText
                  }`}
                >
                  {task.time}
                </p>
                <p
                  className={`text-sm ${
                    completedTasks[currentDay]?.[task.id || index]
                      ? "text-gray-300"
                      : themeClasses.secondaryText
                  }`}
                >
                  {task.activity}
                </p>
              </div>
              <button
                onClick={() =>
                  toggleTaskCompletion(currentDay, task.id || index)
                }
                className={`p-1 rounded-full ${
                  completedTasks[currentDay]?.[task.id || index]
                    ? "text-green-400 hover:text-green-500"
                    : `${themeClasses.secondaryText} hover:${themeClasses.primaryText}`
                }`}
                title={
                  completedTasks[currentDay]?.[task.id || index]
                    ? "Mark as Incomplete"
                    : "Mark as Complete"
                }
              >
                {completedTasks[currentDay]?.[task.id || index] ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => handleManageDailyTasks(currentDay)}
          className={`px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText}`}
        >
          Manage Today's Tasks
        </button>
      </div>
    </div>
  );
};

export default WeeklyScheduleDisplay;
