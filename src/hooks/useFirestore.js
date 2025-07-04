import { useState, useEffect, useCallback } from "react";
import {
  getUserDocRef,
  getScheduleCollectionRef,
  getNotesCollectionRef,
  getSubjectsCollectionRef,
  getTemplatesCollectionRef,
  getStudyHistoryCollectionRef,
  getGradesCollectionRef,
  getExamsCollectionRef,
  getCompletedTasksCollectionRef,
  addDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  getCollectionData,
} from "../firebase/firebaseService";
import {
  doc,
  setDoc,
  collection,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export const useFirestore = (userId) => {
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weeklyScheduleTemplates, setWeeklyScheduleTemplates] = useState([]);
  const [studyHistory, setStudyHistory] = useState([]);
  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    if (!userId) {
      setWeeklySchedule({});
      setNotes([]);
      setSubjects([]);
      setWeeklyScheduleTemplates([]);
      setStudyHistory([]);
      setGrades([]);
      setExams([]);
      setCompletedTasks({});
      return;
    }

    const unsubSchedule = subscribeToCollection(
      getScheduleCollectionRef(userId),
      (data) => {
        const scheduleMap = {};
        data.forEach((doc) => (scheduleMap[doc.id] = doc)); // Day names are doc IDs
        setWeeklySchedule(scheduleMap);
      }
    );

    const unsubNotes = subscribeToCollection(
      getNotesCollectionRef(userId),
      setNotes
    );
    const unsubSubjects = subscribeToCollection(
      getSubjectsCollectionRef(userId),
      setSubjects
    );
    const unsubTemplates = subscribeToCollection(
      getTemplatesCollectionRef(userId),
      setWeeklyScheduleTemplates
    );
    const unsubStudyHistory = subscribeToCollection(
      getStudyHistoryCollectionRef(userId),
      setStudyHistory
    );

    const unsubGrades = subscribeToCollection(
      getGradesCollectionRef(userId),
      setGrades
    );

    const unsubExams = subscribeToCollection(
      getExamsCollectionRef(userId),
      setExams
    );

    const unsubCompletedTasks = subscribeToCollection(
      getCompletedTasksCollectionRef(userId),
      (data) => {
        const tasksMap = {};
        data.forEach((doc) => (tasksMap[doc.id] = doc));
        setCompletedTasks(tasksMap);
      }
    );

    return () => {
      unsubSchedule();
      unsubNotes();
      unsubSubjects();
      unsubTemplates();
      unsubStudyHistory();
      unsubGrades();
      unsubExams();
      unsubCompletedTasks();
    };
  }, [userId]);

  // Schedule operations
  const saveWeeklySchedule = useCallback(
    async (scheduleData) => {
      if (!userId) return;
      for (const day in scheduleData) {
        const docRef = doc(getScheduleCollectionRef(userId), day);
        await setDoc(docRef, scheduleData[day], { merge: true });
      }
    },
    [userId]
  );

  // Notes operations (General Notes)
  const addNote = useCallback(
    async (noteContent) => {
      if (!userId) return;
      await addDocument(getNotesCollectionRef(userId), {
        content: noteContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
    [userId]
  );

  const deleteNote = useCallback(
    async (noteId) => {
      if (!userId) return;
      const noteDocRef = doc(getNotesCollectionRef(userId), noteId);
      await deleteDocument(noteDocRef);
    },
    [userId]
  );

  const updateNote = useCallback(
    async (noteId, newContent) => {
      if (!userId) return;
      const noteDocRef = doc(getNotesCollectionRef(userId), noteId);
      await updateDocument(noteDocRef, {
        content: newContent,
        updatedAt: new Date(),
      });
    },
    [userId]
  );

  // Subject operations
  const addSubject = useCallback(
    async (name, category) => {
      if (!userId) return;
      await addDocument(getSubjectsCollectionRef(userId), {
        name,
        category,
        createdAt: new Date(),
      });
    },
    [userId]
  );

  const updateSubject = useCallback(
    async (subjectId, newName, newCategory) => {
      if (!userId) return;
      const subjectDocRef = doc(getSubjectsCollectionRef(userId), subjectId);
      await updateDocument(subjectDocRef, {
        name: newName,
        category: newCategory,
      });
    },
    [userId]
  );

  const deleteSubject = useCallback(
    async (subjectId) => {
      if (!userId) return;
      const subjectDocRef = doc(getSubjectsCollectionRef(userId), subjectId);
      await deleteDocument(subjectDocRef);

      // Also delete all notes associated with this subject
      const subjectNotesRef = collection(
        getUserDocRef(userId),
        "subjects",
        subjectId,
        "notes"
      );
      const notesToDelete = await getCollectionData(subjectNotesRef);
      for (const note of notesToDelete) {
        await deleteDocument(doc(subjectNotesRef, note.id));
      }
    },
    [userId]
  );

  // Subject Note operations
  const getSubjectNotes = useCallback(
    async (subjectId) => {
      if (!userId) return [];
      const notesRef = collection(
        getSubjectsCollectionRef(userId),
        subjectId,
        "notes"
      );
      return await getCollectionData(notesRef);
    },
    [userId]
  );

  const addSubjectNote = useCallback(
    async (subjectId, title, content) => {
      if (!userId) return;
      const notesRef = collection(
        getSubjectsCollectionRef(userId),
        subjectId,
        "notes"
      );
      await addDocument(notesRef, {
        title,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
    [userId]
  );

  const updateSubjectNote = useCallback(
    async (subjectId, noteId, newTitle, newContent) => {
      if (!userId) return;
      const noteDocRef = doc(
        collection(getSubjectsCollectionRef(userId), subjectId, "notes"),
        noteId
      );
      await updateDocument(noteDocRef, {
        title: newTitle,
        content: newContent,
        updatedAt: new Date(),
      });
    },
    [userId]
  );

  const deleteSubjectNote = useCallback(
    async (subjectId, noteId) => {
      if (!userId) return;
      const noteDocRef = doc(
        collection(getSubjectsCollectionRef(userId), subjectId, "notes"),
        noteId
      );
      await deleteDocument(noteDocRef);
    },
    [userId]
  );

  // Template operations
  const saveScheduleTemplate = useCallback(
    async (templateName, scheduleData, templateIdToUpdate = null) => {
      if (!userId) return;
      const dataToSave = {
        name: templateName,
        schedule: scheduleData,
        createdAt: new Date(),
      };
      if (templateIdToUpdate) {
        await updateDocument(
          doc(getTemplatesCollectionRef(userId), templateIdToUpdate),
          { name: templateName, schedule: scheduleData }
        );
      } else {
        await addDocument(getTemplatesCollectionRef(userId), dataToSave);
      }
    },
    [userId]
  );

  const loadScheduleTemplate = useCallback(
    async (templateId) => {
      if (!userId) return null;
      const templateDoc = await getDoc(
        doc(getTemplatesCollectionRef(userId), templateId)
      );
      return templateDoc.exists() ? templateDoc.data().schedule : null;
    },
    [userId]
  );

  const deleteScheduleTemplate = useCallback(
    async (templateId) => {
      if (!userId) return;
      await deleteDocument(doc(getTemplatesCollectionRef(userId), templateId));
    },
    [userId]
  );

  // Study History operations
  const addStudyHistoryEntry = useCallback(
    async (entry) => {
      if (!userId) return;
      await addDocument(getStudyHistoryCollectionRef(userId), {
        ...entry,
        date: entry.date || new Date(),
      });
    },
    [userId]
  );

  // Get data without real-time subscription (e.g., for specific queries)
  const getDailyStudyData = useCallback(
    async (date) => {
      if (!userId) return [];
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        getStudyHistoryCollectionRef(userId),
        where("date", ">=", startOfDay),
        where("date", "<=", endOfDay)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data());
    },
    [userId]
  );

  // Grade operations
  const addGrade = useCallback(
    async (gradeData) => {
      if (!userId) return;
      await addDocument(getGradesCollectionRef(userId), {
        ...gradeData,
        createdAt: new Date(),
      });
    },
    [userId]
  );

  const updateGrade = useCallback(
    async (gradeId, updatedData) => {
      if (!userId) return;
      const gradeDocRef = doc(getGradesCollectionRef(userId), gradeId);
      await updateDocument(gradeDocRef, updatedData);
    },
    [userId]
  );

  const deleteGrade = useCallback(
    async (gradeId) => {
      if (!userId) return;
      const gradeDocRef = doc(getGradesCollectionRef(userId), gradeId);
      await deleteDocument(gradeDocRef);
    },
    [userId]
  );

  // Exam operations
  const addExam = useCallback(
    async (examData) => {
      if (!userId) return;
      await addDocument(getExamsCollectionRef(userId), {
        ...examData,
        createdAt: new Date(),
      });
    },
    [userId]
  );

  const updateExam = useCallback(
    async (examId, updatedData) => {
      if (!userId) return;
      const examDocRef = doc(getExamsCollectionRef(userId), examId);
      await updateDocument(examDocRef, updatedData);
    },
    [userId]
  );

  const deleteExam = useCallback(
    async (examId) => {
      if (!userId) return;
      const examDocRef = doc(getExamsCollectionRef(userId), examId);
      await deleteDocument(examDocRef);
    },
    [userId]
  );

  const saveCompletedTasks = useCallback(
    async (tasks) => {
      if (!userId) return;
      for (const day in tasks) {
        const docRef = doc(getCompletedTasksCollectionRef(userId), day);
        await setDoc(docRef, tasks[day]);
      }
    },
    [userId]
  );

  return {
    weeklySchedule,
    setWeeklySchedule,
    notes,
    subjects,
    weeklyScheduleTemplates,
    studyHistory,
    grades,
    exams,
    completedTasks,
    saveWeeklySchedule,
    addNote,
    deleteNote,
    updateNote,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectNotes,
    addSubjectNote,
    updateSubjectNote,
    deleteSubjectNote,
    saveScheduleTemplate,
    loadScheduleTemplate,
    deleteScheduleTemplate,
    addStudyHistoryEntry,
    getDailyStudyData,
    addGrade,
    updateGrade,
    deleteGrade,
    addExam,
    updateExam,
    deleteExam,
    saveCompletedTasks,
  };
};
