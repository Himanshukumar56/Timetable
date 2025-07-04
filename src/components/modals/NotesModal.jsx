import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Book } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";
import { useFirestore } from "../../hooks/useFirestore";

const NotesModal = ({
  onClose,
  selectedSubject,
  userId,
  setShowSubjectsModal,
}) => {
  const { themeClasses } = useTheme();
  const {
    getSubjectNotes,
    addSubjectNote,
    updateSubjectNote,
    deleteSubjectNote,
  } = useFirestore(userId);

  const [notesForSelectedSubject, setNotesForSelectedSubject] = useState([]);
  const [newSubjectNoteTitle, setNewSubjectNoteTitle] = useState("");
  const [newSubjectNoteContent, setNewSubjectNoteContent] = useState("");
  const [editingSubjectNote, setEditingSubjectNote] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (selectedSubject?.id) {
        setLoadingNotes(true);
        const fetchedNotes = await getSubjectNotes(selectedSubject.id);
        setNotesForSelectedSubject(
          fetchedNotes.sort(
            (a, b) => b.createdAt.toDate() - a.createdAt.toDate()
          )
        ); // Sort by creation date
        setLoadingNotes(false);
      }
    };
    fetchNotes();
  }, [selectedSubject, getSubjectNotes]);

  const handleAddOrUpdateSubjectNote = async () => {
    if (
      !newSubjectNoteTitle.trim() ||
      !newSubjectNoteContent.trim() ||
      !selectedSubject?.id
    ) {
      console.error("Title and content cannot be empty.");
      return;
    }

    if (editingSubjectNote) {
      await updateSubjectNote(
        selectedSubject.id,
        editingSubjectNote.id,
        newSubjectNoteTitle,
        newSubjectNoteContent
      );
      setEditingSubjectNote(null);
    } else {
      await addSubjectNote(
        selectedSubject.id,
        newSubjectNoteTitle,
        newSubjectNoteContent
      );
    }
    setNewSubjectNoteTitle("");
    setNewSubjectNoteContent("");
    const updatedNotes = await getSubjectNotes(selectedSubject.id);
    setNotesForSelectedSubject(
      updatedNotes.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
    );
  };

  const handleEditSubjectNote = (note) => {
    setEditingSubjectNote(note);
    setNewSubjectNoteTitle(note.title);
    setNewSubjectNoteContent(note.content);
  };

  const handleDeleteSubjectNote = async (noteId) => {
    if (
      window.confirm("Are you sure you want to delete this note?") &&
      selectedSubject?.id
    ) {
      await deleteSubjectNote(selectedSubject.id, noteId);
      const updatedNotes = await getSubjectNotes(selectedSubject.id);
      setNotesForSelectedSubject(
        updatedNotes.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      );
      if (editingSubjectNote?.id === noteId) {
        setEditingSubjectNote(null);
        setNewSubjectNoteTitle("");
        setNewSubjectNoteContent("");
      }
    }
  };

  const handleBackToSubjects = () => {
    onClose();
    setShowSubjectsModal(true);
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
          Notes for: {selectedSubject?.name}
        </h3>

        <div
          className={`mb-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-inner`}
        >
          <h4
            className={`text-lg font-semibold mb-3 ${themeClasses.primaryText}`}
          >
            {editingSubjectNote ? "Edit Note" : "Add New Note"}
          </h4>
          <input
            type="text"
            placeholder="Note Title"
            className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2`}
            value={newSubjectNoteTitle}
            onChange={(e) => setNewSubjectNoteTitle(e.target.value)}
          />
          <textarea
            placeholder="Note Content"
            className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 h-32`}
            value={newSubjectNoteContent}
            onChange={(e) => setNewSubjectNoteContent(e.target.value)}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleAddOrUpdateSubjectNote}
              className={`flex-1 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText} flex items-center justify-center space-x-2`}
            >
              {editingSubjectNote ? (
                <>
                  <Edit className="w-5 h-5" /> <span>Update Note</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> <span>Add Note</span>
                </>
              )}
            </button>
            {editingSubjectNote && (
              <button
                onClick={() => {
                  setEditingSubjectNote(null);
                  setNewSubjectNoteTitle("");
                  setNewSubjectNoteContent("");
                }}
                className={`flex-1 px-4 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <h4 className={`text-xl font-bold mb-4 ${themeClasses.primaryText}`}>
          Your Notes
        </h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {loadingNotes ? (
            <p className={`${themeClasses.secondaryText} text-center py-4`}>
              Loading notes...
            </p>
          ) : notesForSelectedSubject.length === 0 ? (
            <p className={`${themeClasses.secondaryText} text-center py-4`}>
              No notes for this subject yet.
            </p>
          ) : (
            notesForSelectedSubject.map((note) => (
              <div
                key={note.id}
                className={`${themeClasses.tertiaryBg} p-3 rounded-lg shadow-sm`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`font-semibold ${themeClasses.primaryText}`}>
                    {note.title}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSubjectNote(note)}
                      className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.tertiaryBg} transition-colors`}
                      title="Edit Note"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubjectNote(note.id)}
                      className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm ${themeClasses.secondaryText} mb-2`}>
                  {note.content}
                </p>
                <div className="flex justify-between items-center text-xs">
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
              </div>
            ))
          )}
        </div>
        {/* New "Back to Subjects" button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleBackToSubjects}
            className={`px-6 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors font-semibold ${themeClasses.primaryText} flex items-center space-x-2`}
          >
            <Book className="w-5 h-5" />
            <span>Back to Subjects</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
