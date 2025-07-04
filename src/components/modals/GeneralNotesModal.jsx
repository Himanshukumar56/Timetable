import React, { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";
import { useFirestore } from "../../hooks/useFirestore";

const GeneralNotesModal = ({ onClose, userId }) => {
  const { themeClasses } = useTheme();
  const { notes, addNote, updateNote, deleteNote } = useFirestore(userId);

  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  const handleSaveNote = async () => {
    if (newNote.trim() === "") {
      alert("Note content cannot be empty.");
      return;
    }
    if (editingNote) {
      await updateNote(editingNote.id, newNote);
      setEditingNote(null);
    } else {
      await addNote(newNote);
    }
    setNewNote("");
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote(note.content);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      await deleteNote(noteId);
      if (editingNote?.id === noteId) {
        setEditingNote(null);
        setNewNote("");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${themeClasses.shadow} relative`}
      >
        <XCircleButton onClick={onClose} />
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          General Notes
        </h3>

        <div
          className={`mb-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-inner`}
        >
          <h4
            className={`text-lg font-semibold mb-3 ${themeClasses.primaryText}`}
          >
            {editingNote ? "Edit Note" : "Add New Note"}
          </h4>
          <textarea
            placeholder="Add a new general note..."
            className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 h-24`}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveNote}
              className={`flex-1 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText} flex items-center justify-center space-x-2`}
            >
              {editingNote ? (
                <>
                  <Edit className="w-5 h-5" /> <span>Update Note</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> <span>Add Note</span>
                </>
              )}
            </button>
            {editingNote && (
              <button
                onClick={() => {
                  setEditingNote(null);
                  setNewNote("");
                }}
                className={`flex-1 px-4 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {notes.length === 0 ? (
            <p className={`${themeClasses.secondaryText} text-center py-4`}>
              No general notes added yet.
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`${themeClasses.tertiaryBg} p-3 rounded-lg shadow-sm`}
              >
                <p className={`font-medium ${themeClasses.primaryText} flex-1`}>
                  {note.content}
                </p>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className={`${themeClasses.secondaryText}`}>
                    Created:{" "}
                    {new Date(note.createdAt?.toDate()).toLocaleString()}
                  </span>
                  {note.updatedAt?.toDate().getTime() !==
                    note.createdAt?.toDate().getTime() && (
                    <span
                      className={`text-xs ${themeClasses.secondaryText} text-right`}
                    >
                      Updated:{" "}
                      {new Date(note.updatedAt?.toDate()).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.tertiaryBg} transition-colors`}
                    title="Edit Note"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralNotesModal;
