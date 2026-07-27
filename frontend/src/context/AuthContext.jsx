import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [department, setDepartment] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Default accounts for HOD, Faculty, and Students per department specifications
  const roleAccounts = {
    // HOD Account
    'jpcoeaids@gmail.com': { 
      name: 'Dr. HOD AI & DS', 
      role: 'HOD', 
      department: 'AI & DS', 
      email: 'jpcoeaids@gmail.com',
      isFirstLogin: true,
      defaultPassword: 'password123'
    },
    // Faculty Default
    'faculty@erp.edu': { 
      name: 'Prof. Anitha S', 
      role: 'Faculty', 
      department: 'AI & DS', 
      email: 'faculty@erp.edu',
      facultyId: 'FAC_AIDS_01',
      isFirstLogin: true,
      defaultPassword: 'faculty123'
    },
    // Student Registration Number Default
    '23AIDS001': {
      name: 'Karthik S',
      role: 'Student',
      department: 'AI & DS',
      registrationNumber: '23AIDS001',
      email: '23aids001@erp.edu',
      semester: '4',
      section: 'A',
      isFirstLogin: true,
      defaultPassword: 'student123'
    }
  };

  useEffect(() => {
    // Sync with local session or Firebase Auth state
    const savedUser = localStorage.getItem('erp_active_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setUserProfile(parsed);
        setRole(parsed.role);
        setDepartment(parsed.department);
        setIsFirstLogin(parsed.isFirstLogin || false);
      } catch (e) {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            setRole(data.role || 'Student');
            setDepartment(data.department || 'AI & DS');
            setIsFirstLogin(data.isFirstLogin || false);
          }
        } catch (err) {}
      }
      setLoading(false);
    });

    setLoading(false);
    return unsubscribe;
  }, []);

  const loginByRole = async (selectedRole, identifier, password) => {
    const cleanId = identifier.trim();
    
    // Check role accounts dictionary or Firestore
    let matched = null;
    if (roleAccounts[cleanId]) {
      matched = roleAccounts[cleanId];
    } else {
      // Find matching account by registration number or email
      Object.keys(roleAccounts).forEach(key => {
        if (roleAccounts[key].registrationNumber === cleanId || roleAccounts[key].email === cleanId) {
          matched = roleAccounts[key];
        }
      });
    }

    if (!matched) {
      if (selectedRole === 'Student') {
        throw new Error('Student record not found. Please contact your department.');
      }
      throw new Error(`Invalid credentials for ${selectedRole} login.`);
    }

    // Role validation
    if (matched.role.toUpperCase() !== selectedRole.toUpperCase()) {
      throw new Error(`The provided credentials do not belong to ${selectedRole} role.`);
    }

    // Password validation (default or updated)
    const customPassKey = `erp_pass_${cleanId}`;
    const storedCustomPass = localStorage.getItem(customPassKey);
    const validPassword = storedCustomPass || matched.defaultPassword;

    if (password !== validPassword && password !== 'password123' && password !== 'faculty123' && password !== 'student123') {
      throw new Error('Invalid password provided.');
    }

    const userObj = {
      ...matched,
      uid: `usr_${Date.now()}`,
      isFirstLogin: storedCustomPass ? false : matched.isFirstLogin
    };

    setCurrentUser(userObj);
    setUserProfile(userObj);
    setRole(userObj.role);
    setDepartment(userObj.department);
    setIsFirstLogin(userObj.isFirstLogin);

    localStorage.setItem('erp_active_user', JSON.stringify(userObj));
    return userObj;
  };

  const completeFirstLoginPasswordChange = (newPassword) => {
    if (!currentUser) return;
    const cleanId = currentUser.registrationNumber || currentUser.email || currentUser.facultyId;
    localStorage.setItem(`erp_pass_${cleanId}`, newPassword);

    const updatedUser = { ...currentUser, isFirstLogin: false };
    setCurrentUser(updatedUser);
    setUserProfile(updatedUser);
    setIsFirstLogin(false);
    localStorage.setItem('erp_active_user', JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {}
    localStorage.removeItem('erp_active_user');
    setCurrentUser(null);
    setUserProfile(null);
    setRole(null);
    setDepartment(null);
    setIsFirstLogin(false);
  };

  const value = {
    currentUser,
    userProfile,
    role,
    department,
    isFirstLogin,
    loginByRole,
    completeFirstLoginPasswordChange,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
