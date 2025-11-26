// Firebase yapılandırması
// ⚠️ ÖNEMLİ: Firebase Console'dan aldığın config bilgilerini buraya yapıştır!

const firebaseConfig = {
  apiKey: "AIzaSyDz3kqMkkTgHqqEsrhp7fkh6DDEmQT5kZA",
  authDomain: "risale-i-nur-okuma-takip.firebaseapp.com",
  databaseURL: "https://risale-i-nur-okuma-takip-default-rtdb.firebaseio.com", // Eğer çalışmazsa Firebase Console > Realtime Database kısmından URL'i kontrol et
  projectId: "risale-i-nur-okuma-takip",
  storageBucket: "risale-i-nur-okuma-takip.firebasestorage.app",
  messagingSenderId: "116777811906",
  appId: "1:116777811906:web:58fa5510a3d13cdeb2e05b",
  measurementId: "G-2FP92VVQ54"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
window.database = firebase.database();
console.log('Firebase initialized:', window.database);

