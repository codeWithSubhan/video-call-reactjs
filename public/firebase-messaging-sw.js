importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDH98w7RFSq53QNiKnvuYJkwPa1Hxs2KNU",
  authDomain: "senior-connex-reactjs.firebaseapp.com",
  projectId: "senior-connex-reactjs",
  storageBucket: "senior-connex-reactjs.appspot.com",
  messagingSenderId: "1027086329672",
  appId: "1:1027086329672:web:1f8a6eb940eecfabc3f57d",
  measurementId: "G-W6305W0YFB",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "image.webp",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
