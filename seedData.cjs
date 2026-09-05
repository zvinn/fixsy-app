const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDe--mP0szbc4n2U1ywQB6QaPV9NKv8Pe0",
    authDomain: "fixsy-fefcb.firebaseapp.com",
    projectId: "fixsy-fefcb",
    storageBucket: "fixsy-fefcb.firebasestorage.app",
    messagingSenderId: "688567914798",
    appId: "1:688567914798:web:f9a87a545015a9a837aabf",
    measurementId: "G-R62C56SY2T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const technicians = [
    // سباكة
    { name: "أحمد سيد", email: "ahmed.plumber@dummy.com", specialty: "سباكة", price: 150, rating: 4.8, role: "tech", img: "https://ui-avatars.com/api/?name=Ahmed+Sayed&background=0D8ABC&color=fff" },
    { name: "محمود السباك", email: "mahmoud.p@dummy.com", specialty: "سباكة", price: 120, rating: 4.5, role: "tech", img: "https://ui-avatars.com/api/?name=Mahmoud+S&background=random" },
    // كهرباء
    { name: "محمد علي", email: "m.ali.electric@dummy.com", specialty: "كهرباء", price: 200, rating: 4.9, role: "tech", img: "https://ui-avatars.com/api/?name=Mohamed+Ali&background=F59E0B&color=fff" },
    { name: "إبراهيم كهرباء", email: "ibrahim.e@dummy.com", specialty: "كهرباء", price: 180, rating: 4.7, role: "tech", img: "https://ui-avatars.com/api/?name=Ibrahim+K&background=random" },
    // نجارة
    { name: "عصام النجار", email: "essam.n@dummy.com", specialty: "نجارة", price: 250, rating: 4.6, role: "tech", img: "https://ui-avatars.com/api/?name=Essam+N&background=8B4513&color=fff" },
    // تكييف
    { name: "خالد تكييف", email: "khaled.ac@dummy.com", specialty: "تكييف", price: 300, rating: 4.9, role: "tech", img: "https://ui-avatars.com/api/?name=Khaled+AC&background=3B82F6&color=fff" },
    // نقاشة
    { name: "سعيد بتاع النقاشة", email: "saeed.p@dummy.com", specialty: "نقاشة", price: 100, rating: 4.3, role: "tech", img: "https://ui-avatars.com/api/?name=Saeed+P&background=EC4899&color=fff" },
    // أجهزة منزلية
    { name: "حسن صيانة", email: "hassan.app@dummy.com", specialty: "أجهزة منزلية", price: 200, rating: 4.7, role: "tech", img: "https://ui-avatars.com/api/?name=Hassan+M&background=10B981&color=fff" },
    // دش
    { name: "مصطفى دش", email: "mostafa.d@dummy.com", specialty: "دش", price: 80, rating: 4.5, role: "tech", img: "https://ui-avatars.com/api/?name=Mostafa+D&background=6366F1&color=fff" },
    // الوميتال
    { name: "هاني الوميتال", email: "hani.a@dummy.com", specialty: "الوميتال", price: 220, rating: 4.8, role: "tech", img: "https://ui-avatars.com/api/?name=Hani+A&background=64748B&color=fff" }
];

async function seed() {
    console.log("Starting to seed technicians...");
    const techsCollection = collection(db, "technicians");
    for (const tech of technicians) {
        try {
            await addDoc(techsCollection, tech);
            console.log(`Added technician: ${tech.name}`);
        } catch (e) {
            console.error(`Error adding ${tech.name}: `, e);
        }
    }
    console.log("Seeding complete!");
    process.exit(0);
}

seed();
