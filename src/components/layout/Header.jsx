import React from "react";
import {
  Menu,
  Calendar,
  ClipboardList,
  Award,
  Palette,
  BellRing,
  HeartHandshake,
  Settings,
  User,
  LogOut,
  Book,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getGreeting } from "../../utils/greetings";
import NotificationBell from "../common/NotificationBell";

const Header = ({
  userName,
  onShowAuthModal,
  onShowWeeklyPlanner,
  onShowNotes,
  onShowProfileHeatmap,
  onShowManageTemplates,
  onShowMotivationalContent,
  onShowThemeSettings,
  onShowSubjectsModal,
  onShowCalendar,
  onShowGradeTracker,
  onShowExamModal,
  notifications,
  dropdownRef,
  showDropdown,
  setShowDropdown,
  currentStreak,
  handleLogout,
}) => {
  const { themeClasses } = useTheme();

  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  const closeDropdown = () => setShowDropdown(false);

  return (
    <header
      className={`p-4 ${themeClasses.secondaryBg} ${themeClasses.shadow} flex items-center justify-between`}
    >
      <h1 className={`text-3xl font-extrabold ${themeClasses.primaryText}`}>
        {getGreeting()}, {userName}
      </h1>

      <div className="flex items-center space-x-4">
        <NotificationBell notifications={notifications} />
        <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className={`p-2 rounded-lg ${themeClasses.tertiaryBg} ${themeClasses.primaryText} hover:${themeClasses.secondaryBg}`}
        >
          <Menu className="w-6 h-6" />
        </button>
        {showDropdown && (
          <div
            className={`absolute right-0 mt-2 w-56 ${themeClasses.secondaryBg} rounded-md shadow-lg py-1 z-50`}
          >
            <button
              onClick={() => {
                onShowWeeklyPlanner();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <Calendar className="w-5 h-5" />
              <span>Weekly Plan</span>
            </button>
            <button
              onClick={() => {
                onShowSubjectsModal();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <Book className="w-5 h-5" />
              <span>Subjects</span>
            </button>
            <button
              onClick={() => {
                onShowNotes();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <ClipboardList className="w-5 h-5" />
              <span>General Notes</span>
            </button>
            <button
              onClick={() => {
                onShowProfileHeatmap();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <Award className="w-5 h-5" />
              <span>Progress</span>
              {currentStreak > 0 && (
                <span
                  className={`ml-1 text-xs font-bold ${themeClasses.accent} rounded-full px-2 py-1`}
                >
                  🔥 {currentStreak}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onShowMotivationalContent();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Motivation</span>
            </button>
            <button
              onClick={() => {
                onShowThemeSettings();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <Palette className="w-5 h-5" />
              <span>Theme</span>
            </button>
            <button
              onClick={() => {
                onShowManageTemplates();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <Settings className="w-5 h-5" />
              <span>Templates</span>
            </button>
            <button
              onClick={() => {
                onShowCalendar();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => {
                onShowGradeTracker();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <Award className="w-5 h-5" />
              <span>Grade Tracker</span>
            </button>
            <button
              onClick={() => {
                onShowExamModal();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <Calendar className="w-5 h-5" />
              <span>Exams</span>
            </button>
            <div className="border-t border-gray-600 my-1"></div>
            <button
              onClick={() => {
                onShowAuthModal();
                closeDropdown();
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.primaryText} hover:${themeClasses.tertiaryBg} w-full text-left`}
            >
              <User className="w-5 h-5" />
              <span>
                {userName === "Guest" ? "Login / Register" : userName}
              </span>
            </button>
            {userName !== "Guest" && (
              <button
                onClick={() => {
                  handleLogout();
                  closeDropdown();
                }}
                className={`flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:${themeClasses.tertiaryBg} w-full text-left`}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default Header;
