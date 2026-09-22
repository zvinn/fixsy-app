/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Firebase configuration is read from query params or self configuration
const urlParams = new URLSearchParams(self.location.search);
const apiKey = urlParams.get('apiKey') || (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.apiKey) || "demo-api-key";
const projectId = urlParams.get('projectId') || (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.projectId) || "fixsy-app-1d3b7";
const messagingSenderId = urlParams.get('messagingSenderId') || (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.messagingSenderId) || "618012473906";
const appId = urlParams.get('appId') || (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.appId) || "1:618012473906:web:demo";

firebase.initializeApp({
    apiKey: apiKey,
    authDomain: `${projectId}.firebaseapp.com`,
    projectId: projectId,
    storageBucket: `${projectId}.firebasestorage.app`,
    messagingSenderId: messagingSenderId,
    appId: appId
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

self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.');
    event.notification.close();
    // Open the app data
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url.indexOf('/') !== -1 && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
