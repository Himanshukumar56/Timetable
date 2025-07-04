import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ExamCountdown = ({ exams, onEdit, onDelete }) => {
  const { themeClasses } = useTheme();

  const calculateCountdown = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`p-4 rounded-lg shadow-md ${themeClasses.secondaryBg}`}>
      <h2 className={`text-lg font-semibold mb-4 ${themeClasses.primaryText}`}>Exam Countdown</h2>
      <div className="overflow-x-auto">
        <table className={`min-w-full ${themeClasses.primaryBg}`}>
          <thead>
            <tr className={`${themeClasses.tertiaryBg}`}>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Subject</th>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Date</th>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Days Left</th>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams && exams.length > 0 ? (
              exams.map((exam) => (
                <tr key={exam.id} className={`${themeClasses.primaryBg} hover:${themeClasses.tertiaryBg}`}>
                  <td className={`py-2 px-4 ${themeClasses.border} ${themeClasses.secondaryText}`}>{exam.subject}</td>
                  <td className={`py-2 px-4 ${themeClasses.border} ${themeClasses.secondaryText}`}>{exam.date}</td>
                  <td className={`py-2 px-4 ${themeClasses.border} ${themeClasses.secondaryText}`}>{calculateCountdown(exam.date)}</td>
                  <td className={`py-2 px-4 ${themeClasses.border}`}>
                    <button onClick={() => onEdit(exam)} className="text-blue-500 hover:text-blue-700 mr-2">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => onDelete(exam.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={`py-4 px-4 text-center ${themeClasses.secondaryText}`}>
                  No exams added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamCountdown;
