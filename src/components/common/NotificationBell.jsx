import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const NotificationBell = ({ notifications }) => {
  const { themeClasses } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`relative p-2 rounded-full ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} transition-colors`}
        aria-label="Notifications"
      >
        <Bell className={`w-6 h-6 ${themeClasses.primaryText}`} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 ${themeClasses.secondaryBg} rounded-md shadow-lg py-2 z-50`}
        >
          <div className={`px-4 py-2 font-bold ${themeClasses.primaryText}`}>
            Notifications
          </div>
          <div className="border-t border-gray-600 my-1"></div>
          {notifications.length === 0 ? (
            <p className={`px-4 py-2 text-sm ${themeClasses.secondaryText}`}>
              No new notifications.
            </p>
          ) : (
            notifications.map((notif, index) => (
              <div
                key={index}
                className={`px-4 py-2 text-sm ${themeClasses.primaryText}`}
              >
                {notif.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
