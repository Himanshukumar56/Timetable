import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { themes } from "../../utils/themes"; // Import themes directly
import XCircleButton from "../common/XCircleButton";

const ThemeSettingsModal = ({ onClose }) => {
  const { themeClasses, setTheme, currentTheme } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-sm ${themeClasses.shadow} relative`}
      >
        <XCircleButton onClick={onClose} />
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

export default ThemeSettingsModal;
