import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "react-toastify";
import { handleAudio } from "./App";

const firebaseConfig = {
  apiKey: "AIzaSyDH98w7RFSq53QNiKnvuYJkwPa1Hxs2KNU",
  authDomain: "senior-connex-reactjs.firebaseapp.com",
  projectId: "senior-connex-reactjs",
  storageBucket: "senior-connex-reactjs.appspot.com",
  messagingSenderId: "1027086329672",
  appId: "1:1027086329672:web:1f8a6eb940eecfabc3f57d",
  measurementId: "G-W6305W0YFB",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);

      generateToken();
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

async function generateToken() {
  const vapidKey =
    "BL7nJ58sMYLL0r7B2hDx1MIXI-6iaFAu_QxDCRtiijjWdTI-nrLGRZN9dmtHUYCDdNlY6sso7_V2XWaDxB621lA";
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      if (localStorage.getItem("fcmToken")) {
        console.log("FCM Token:", localStorage.getItem("fcmToken"));
      } else {
        const token = await getToken(messaging, { vapidKey });
        console.log("FCM Token:", token);
        localStorage.setItem("fcmToken", token);
      }
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    window.location.reload();
  }
}

// onMessage(messaging, (payload) => {
//   // console.log("Message received in foreground:", payload);
//   // toast.info(`${payload.notification.title}   ${payload.notification.body}`);
//   handleAudio();
// });

export { messaging };
