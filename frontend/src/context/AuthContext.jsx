import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default demo user fallback for testing/first run without live Firebase backend setup
  const demoUsers = {
    'admin@erp.edu': { name: 'Super Admin', role: 'SuperAdmin', department: 'Administration', email: 'admin@erp.edu' },
    'hod@erp.edu': { name: 'Dr. Ramesh HOD', role: 'Hod', department: 'Computer Science', email: 'hod@erp.edu' },
    'faculty@erp.edu': { name: 'Prof. Anitha Kumar', role: 'Faculty', department: 'Computer Science', email: 'faculty@erp.edu' },
    'student@erp.edu': { name: 'Karthik S', role: 'Student', department: 'Computer Science', usn: '12345', email: 'student@erp.edu' }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Try fetching user profile from Firestore 'users' collection
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            setRole(data.role || 'Student');
          } else {
            // Fallback user record
            const defaultData = {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              role: 'SuperAdmin'
            };
            setUserProfile(defaultData);
            setRole('SuperAdmin');
          }
        } catch (err) {
          console.warn("Firestore auth profile error, using fallback state:", err);
          setUserProfile({ email: user.email, role: 'SuperAdmin', name: user.email });
          setRole('SuperAdmin');
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // Demo mock login fallback for development if Firebase Auth is not configured with live credentials
      if (demoUsers[email]) {
        const mockUser = { uid: `demo_${Date.now()}`, email, displayName: demoUsers[email].name };
        setCurrentUser(mockUser);
        setUserProfile(demoUsers[email]);
        setRole(demoUsers[email].role);
        return { user: mockUser };
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signout error:", err);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setRole(null);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const verifyEmail = () => {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
  };

  const value = {
    currentUser,
    userProfile,
    role,
    login,
    logout,
    resetPassword,
    verifyEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
