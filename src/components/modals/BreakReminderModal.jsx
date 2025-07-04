import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

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

export default BreakReminderModal;
