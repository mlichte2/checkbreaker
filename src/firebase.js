import firebase from "firebase";
import { FirebaseAPIKEY } from "./keys";

const firebaseConfig = {
  apiKey: FirebaseAPIKEY,
  authDomain: "jsd13-first-firebase-app.firebaseapp.com",
  databaseURL: "https://jsd13-first-firebase-app-default-rtdb.firebaseio.com/",
  projectId: "jsd13-first-firebase-app",
  storageBucket: "jsd13-first-firebase-app.appspot.com",
  messagingSenderId: "112203651031",
  appId: "1:112203651031:web:172ab5f076ded1c5645d92",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

export default db;
