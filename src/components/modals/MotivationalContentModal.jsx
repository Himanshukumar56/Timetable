import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";

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
        <XCircleButton onClick={onClose} />
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

export default MotivationalContentModal;
