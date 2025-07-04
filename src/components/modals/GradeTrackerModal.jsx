import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const GradeTrackerModal = ({ isOpen, onClose, onSave, grade: editingGrade }) => {
  const { themeClasses } = useTheme();
  const [subject, setSubject] = useState('');
  const [assignment, setAssignment] = useState('');
  const [marks, setMarks] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingGrade) {
      setSubject(editingGrade.subject);
      setAssignment(editingGrade.assignment);
      setMarks(editingGrade.marks);
      setNotes(editingGrade.notes);
    } else {
      setSubject('');
      setAssignment('');
      setMarks('');
      setNotes('');
    }
  }, [editingGrade]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !assignment || !marks) {
      alert('Please fill out all fields.');
      return;
    }
    onSave({ subject, assignment, marks: parseFloat(marks), notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${themeClasses.secondaryBg}`}>
        <h2 className={`text-xl font-bold mb-4 ${themeClasses.primaryText}`}>{editingGrade ? 'Edit Grade' : 'Add Grade'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="subject" className={`block text-sm font-medium ${themeClasses.secondaryText}`}>Subject</label>
            <input type="text" id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${themeClasses.primaryBg} ${themeClasses.primaryText} ${themeClasses.border}`} />
          </div>
          <div className="mb-4">
            <label htmlFor="assignment" className={`block text-sm font-medium ${themeClasses.secondaryText}`}>Assignment</label>
            <input type="text" id="assignment" name="assignment" value={assignment} onChange={(e) => setAssignment(e.target.value)} className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${themeClasses.primaryBg} ${themeClasses.primaryText} ${themeClasses.border}`} />
          </div>
          <div className="mb-4">
            <label htmlFor="marks" className={`block text-sm font-medium ${themeClasses.secondaryText}`}>Marks</label>
            <input type="number" id="marks" name="marks" value={marks} onChange={(e) => setMarks(e.target.value)} className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${themeClasses.primaryBg} ${themeClasses.primaryText} ${themeClasses.border}`} />
          </div>
          <div className="mb-4">
            <label htmlFor="notes" className={`block text-sm font-medium ${themeClasses.secondaryText}`}>Notes</label>
            <textarea id="notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${themeClasses.primaryBg} ${themeClasses.primaryText} ${themeClasses.border}`} />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded-md mr-2 ${themeClasses.tertiaryBg} ${themeClasses.primaryText} hover:${themeClasses.secondaryBg}`}>Cancel</button>
            <button type="submit" className={`px-4 py-2 rounded-md ${themeClasses.accentBg} text-white hover:${themeClasses.accentHover}`}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeTrackerModal;
