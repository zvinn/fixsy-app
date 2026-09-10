// scripts/setup-admin.ts
// ✅ Script to create the first admin user in Firestore
// Run this ONCE to set up your admin account

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase config
const firebaseConfig = {
    // Copy from your .env or Firebase console
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Add admin user to admins collection
 * IMPORTANT: Replace with your actual Firebase UID after logging in
 */
async function setupAdmin() {
    try {
        const adminUID = 'YOUR_FIREBASE_UID_HERE'; // ⚠️ Replace with your UID
        const adminEmail = 'YOUR_EMAIL_HERE'; // ⚠️ Replace with your email

        if (adminUID === 'YOUR_FIREBASE_UID_HERE') {
            console.error('❌ Please update the adminUID and adminEmail in this script first!');
            console.log('\nSteps:');
            console.log('1. Log in to your app normally');
            console.log('2. Open browser console and run: firebase.auth().currentUser.uid');
            console.log('3. Copy the UID and replace it in this script');
            console.log('4. Run this script again');
            return;
        }

        // Add to admins collection
        await addDoc(collection(db, 'admins'), {
            uid: adminUID,
            email: adminEmail,
            createdAt: new Date().toISOString(),
            role: 'super_admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   UID: ${adminUID}`);
        console.log(`   Email: ${adminEmail}`);
        console.log('\nYou can now log in as admin.');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    }
}

setupAdmin();
