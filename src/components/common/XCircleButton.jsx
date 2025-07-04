import React from "react";
import { XCircle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const XCircleButton = ({ onClick, title = "Close" }) => {
  const { themeClasses } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`absolute top-3 right-3 ${themeClasses.secondaryText} hover:${themeClasses.primaryText} p-2 rounded-full hover:${themeClasses.tertiaryBg} transition-colors`}
      title={title}
    >
      <XCircle className="w-6 h-6" />
    </button>
  );
};

export default XCircleButton;
