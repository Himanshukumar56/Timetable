import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";

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
        <XCircleButton onClick={onClose} />
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

export default DailyTaskModal;
