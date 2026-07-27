import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Generic CRUD operations generator for Firestore collections
export const createCrudService = (collectionName) => {
  const colRef = collection(db, collectionName);

  return {
    // Get all documents with optional filters
    getAll: async (constraints = []) => {
      try {
        const q = query(colRef, ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error(`Error getting documents from ${collectionName}:`, error);
        throw error;
      }
    },

    // Subscribe to real-time updates
    subscribe: (callback, constraints = []) => {
      const q = query(colRef, ...constraints);
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
      }, (error) => {
        console.error(`Realtime error in ${collectionName}:`, error);
      });
    },

    // Get single document by ID
    getById: async (id) => {
      try {
        const docRef = doc(db, collectionName, id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching document ${id} from ${collectionName}:`, error);
        throw error;
      }
    },

    // Add new document
    add: async (data) => {
      try {
        const docData = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        const res = await addDoc(colRef, docData);
        return { id: res.id, ...data };
      } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw error;
      }
    },

    // Update existing document
    update: async (id, data) => {
      try {
        const docRef = doc(db, collectionName, id);
        const updateData = {
          ...data,
          updatedAt: serverTimestamp()
        };
        await updateDoc(docRef, updateData);
        return { id, ...data };
      } catch (error) {
        console.error(`Error updating document ${id} in ${collectionName}:`, error);
        throw error;
      }
    },

    // Delete document
    delete: async (id) => {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return id;
      } catch (error) {
        console.error(`Error deleting document ${id} from ${collectionName}:`, error);
        throw error;
      }
    }
  };
};

// Collections export definitions
export const userService = createCrudService('users');
export const studentService = createCrudService('students');
export const facultyService = createCrudService('faculty');
export const departmentService = createCrudService('departments');
export const courseService = createCrudService('courses');
export const subjectService = createCrudService('subjects');
export const semesterService = createCrudService('semesters');
export const attendanceService = createCrudService('attendance');
export const internalMarksService = createCrudService('internalMarks');
export const semesterMarksService = createCrudService('semesterMarks');
export const assignmentService = createCrudService('assignments');
export const notesService = createCrudService('notes');
export const timetableService = createCrudService('timetable');
export const reportService = createCrudService('reports');
export const downloadService = createCrudService('downloads');
export const notificationService = createCrudService('notifications');
export const activityLogService = createCrudService('activityLogs');
export const settingsService = createCrudService('settings');

// Helper to log user activity
export const logActivity = async (userId, userName, action, details) => {
  try {
    await activityLogService.add({
      userId: userId || 'system',
      userName: userName || 'System User',
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};
