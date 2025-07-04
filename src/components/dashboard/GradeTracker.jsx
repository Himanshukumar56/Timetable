import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const GradeTracker = ({ grades, onEdit, onDelete }) => {
  const { themeClasses } = useTheme();

  return (
    <div className={`p-4 rounded-lg shadow-md ${themeClasses.secondaryBg}`}>
      <h2 className={`text-lg font-semibold mb-4 ${themeClasses.primaryText}`}>Grade Tracker</h2>
      <div className="overflow-x-auto">
        <table className={`min-w-full ${themeClasses.primaryBg}`}>
          <thead>
            <tr className={`${themeClasses.tertiaryBg}`}>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Subject</th>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Assignment</th>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Marks</th>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Notes</th>
              <th className={`py-2 px-4 ${themeClasses.border} ${themeClasses.primaryText} text-left`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {grades && grades.length > 0 ? (
              grades.map((grade) => (
                <tr key={grade.id} className={`${themeClasses.primaryBg} hover:${themeClasses.tertiaryBg}`}>
                  <td className={`py-2 px-4 ${themeClasses.border} ${themeClasses.secondaryText}`}>{grade.subject}</td>
                  <td className={`py-2 px-4 ${themeClasses.border} ${themeClasses.secondaryText}`}>{grade.assignment}</td>
                  <td className={`py-2 px-4 ${themeClasses.border} ${themeClasses.secondaryText}`}>{grade.marks}</td>
                  <td className={`py-2 px-4 ${themeClasses.border} ${themeClasses.secondaryText}`}>{grade.notes}</td>
                  <td className={`py-2 px-4 ${themeClasses.border}`}>
                    <button onClick={() => onEdit(grade)} className="text-blue-500 hover:text-blue-700 mr-2">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => onDelete(grade.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={`py-4 px-4 text-center ${themeClasses.secondaryText}`}>
                  No grades added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeTracker;
