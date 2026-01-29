import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestore'; // Assuming this import exists or will be added

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    function signup(email, password, fullName) {
        return createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
            if (fullName) {
                await updateProfile(userCredential.user, { displayName: fullName });
            }
            return userCredential;
        });
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch user role from Firestore before setting loading to false
                try {
                    // Slight delay to allow Firestore write to complete if this is a new signup
                    // This is a safeguard, though awaiting createUserProfile in Register should handle it
                    const profile = await getUserProfile(user.uid);
                    setUserRole(profile?.role);
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setUserRole(null);
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
