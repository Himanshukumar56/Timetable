import React, { useState } from "react";
import { Book, Edit, Trash2, Plus } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";

const SubjectModal = ({
  onClose,
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onViewNotes,
}) => {
  const { themeClasses } = useTheme();
  const [editingSubject, setEditingSubject] = useState(null); // Subject object being edited
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCategory, setNewSubjectCategory] = useState("mains");

  const handleAddOrUpdateSubject = () => {
    if (!newSubjectName.trim()) {
      console.error("Subject name cannot be empty.");
      return;
    }
    if (editingSubject) {
      onUpdateSubject(editingSubject.id, newSubjectName, newSubjectCategory);
      setEditingSubject(null);
    } else {
      onAddSubject(newSubjectName, newSubjectCategory);
    }
    setNewSubjectName("");
    setNewSubjectCategory("mains");
  };

  const startEditing = (subject) => {
    setEditingSubject(subject);
    setNewSubjectName(subject.name);
    setNewSubjectCategory(subject.category || "mains");
  };

  const cancelEditing = () => {
    setEditingSubject(null);
    setNewSubjectName("");
    setNewSubjectCategory("mains");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto ${themeClasses.shadow} relative`}
      >
        <XCircleButton onClick={onClose} />
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          Manage Subjects
        </h3>

        <div
          className={`mb-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-inner`}
        >
          <h4
            className={`text-lg font-semibold mb-3 ${themeClasses.primaryText}`}
          >
            {editingSubject ? "Edit Subject" : "Add New Subject"}
          </h4>
          <input
            type="text"
            placeholder="Subject Name (e.g., History, Polity)"
            className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2`}
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
          />
          <select
            className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={newSubjectCategory}
            onChange={(e) => setNewSubjectCategory(e.target.value)}
          >
            <option value="mains">Mains</option>
            <option value="prelims">Prelims</option>
            <option value="optional">Optional</option>
            <option value="current_affairs">Current Affairs</option>
            <option value="essay">Essay</option>
          </select>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAddOrUpdateSubject}
              className={`flex-1 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText} flex items-center justify-center space-x-2`}
            >
              {editingSubject ? (
                <>
                  <Edit className="w-5 h-5" /> <span>Update Subject</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> <span>Add Subject</span>
                </>
              )}
            </button>
            {editingSubject && (
              <button
                onClick={cancelEditing}
                className={`flex-1 px-4 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <h4 className={`text-xl font-bold mb-4 ${themeClasses.primaryText}`}>
          Your Subjects
        </h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {subjects.length === 0 && (
            <p className={`${themeClasses.secondaryText} text-center py-4`}>
              No subjects added yet.
            </p>
          )}
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`${themeClasses.tertiaryBg} p-3 rounded-lg flex items-center justify-between shadow-sm`}
            >
              <div>
                <p className={`font-medium ${themeClasses.primaryText}`}>
                  {subject.name}
                </p>
                <span className={`text-xs ${themeClasses.secondaryText}`}>
                  Category: {subject.category}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onViewNotes(subject)}
                  className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.secondaryBg} transition-colors`}
                  title="View Notes"
                >
                  <Book className="w-5 h-5" />
                </button>
                <button
                  onClick={() => startEditing(subject)}
                  className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.secondaryBg} transition-colors`}
                  title="Edit Subject"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteSubject(subject.id)}
                  className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                  title="Delete Subject"
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

export default SubjectModal;
