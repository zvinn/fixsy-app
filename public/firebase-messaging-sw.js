/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyAnHVuBwkFiHgUihFvFpf3SwNNbfPjRIhc",
    authDomain: "fixsy-app-1d3b7.firebaseapp.com",
    projectId: "fixsy-app-1d3b7",
    storageBucket: "fixsy-app-1d3b7.firebasestorage.app",
    messagingSenderId: "618012473906",
    appId: "1:618012473906:web:f5bfe5bee5afa89cff5a2b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
