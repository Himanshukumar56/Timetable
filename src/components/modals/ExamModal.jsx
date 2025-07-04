import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ExamModal = ({ isOpen, onClose, onSave, exam: editingExam }) => {
  const { themeClasses } = useTheme();
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (editingExam) {
      setSubject(editingExam.subject);
      setDate(editingExam.date);
    } else {
      setSubject('');
      setDate('');
    }
  }, [editingExam]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !date) {
      alert('Please fill out all fields.');
      return;
    }
    onSave({ subject, date });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${themeClasses.secondaryBg}`}>
        <h2 className={`text-xl font-bold mb-4 ${themeClasses.primaryText}`}>{editingExam ? 'Edit Exam' : 'Add Exam'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="subject" className={`block text-sm font-medium ${themeClasses.secondaryText}`}>Subject</label>
            <input type="text" id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${themeClasses.primaryBg} ${themeClasses.primaryText} ${themeClasses.border}`} />
          </div>
          <div className="mb-4">
            <label htmlFor="date" className={`block text-sm font-medium ${themeClasses.secondaryText}`}>Date</label>
            <input type="date" id="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${themeClasses.primaryBg} ${themeClasses.primaryText} ${themeClasses.border}`} />
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

export default ExamModal;
