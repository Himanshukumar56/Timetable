import React, { useState } from "react";
import { Save, Upload, Edit, Trash2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";

const ManageTemplatesModal = ({
  onClose,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  currentSchedule,
}) => {
  const { themeClasses } = useTheme();
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateToUpdate, setTemplateToUpdate] = useState(null); // template ID being updated

  const handleSaveCurrentAsTemplate = () => {
    if (!newTemplateName.trim()) {
      console.error("Please enter a template name.");
      return;
    }
    onSaveTemplate(newTemplateName.trim(), currentSchedule, templateToUpdate);
    setNewTemplateName("");
    setTemplateToUpdate(null);
  };

  const startUpdateTemplate = (templateId, templateName) => {
    setNewTemplateName(templateName);
    setTemplateToUpdate(templateId);
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
          Manage Schedule Templates
        </h3>

        <div
          className={`mb-6 p-4 ${themeClasses.tertiaryBg} rounded-lg shadow-inner`}
        >
          <h4
            className={`text-lg font-semibold mb-3 ${themeClasses.primaryText}`}
          >
            {templateToUpdate
              ? "Update Template"
              : "Save Current Schedule as New Template"}
          </h4>
          <input
            type="text"
            placeholder="Enter template name"
            className={`w-full p-3 ${themeClasses.secondaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveCurrentAsTemplate}
              className={`flex-1 px-4 py-2 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText}`}
            >
              <Save className="w-5 h-5 inline-block mr-2" />{" "}
              {templateToUpdate ? "Update Template" : "Save Template"}
            </button>
            {templateToUpdate && (
              <button
                onClick={() => {
                  setNewTemplateName("");
                  setTemplateToUpdate(null);
                }}
                className={`flex-1 px-4 py-2 ${themeClasses.tertiaryBg} hover:${themeClasses.secondaryBg} rounded-lg transition-colors ${themeClasses.primaryText}`}
              >
                Cancel Update
              </button>
            )}
          </div>
        </div>

        <h4 className={`text-xl font-bold mb-4 ${themeClasses.primaryText}`}>
          Your Saved Templates
        </h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {templates.length === 0 && (
            <p className={`${themeClasses.secondaryText} text-center py-4`}>
              No templates saved yet.
            </p>
          )}
          {templates.map((template) => (
            <div
              key={template.id}
              className={`${themeClasses.tertiaryBg} p-3 rounded-lg flex items-center justify-between shadow-sm`}
            >
              <span className={`font-medium ${themeClasses.primaryText}`}>
                {template.name}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    startUpdateTemplate(template.id, template.name)
                  }
                  className={`p-1 rounded-full ${themeClasses.accent} hover:${themeClasses.accent} hover:${themeClasses.secondaryBg} transition-colors`}
                  title="Update Template"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteTemplate(template.id)}
                  className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
                  title="Delete Template"
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

export default ManageTemplatesModal;
