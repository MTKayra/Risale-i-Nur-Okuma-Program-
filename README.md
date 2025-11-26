# Risale-i Nur Okuma Takip Sistemi - Firebase Versiyonu

Bu sürüm Firebase Realtime Database kullanarak verileri bulut üzerinde saklar. Böylece farklı cihazlardan aynı gruplara erişilebilir.

## Firebase Kurulumu

### 1. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) adresine git
2. "Add project" (Proje Ekle) butonuna tıkla
3. Proje adını gir (örn: `risale-tracking`)
4. Google Analytics'i isteğe bağlı olarak etkinleştir
5. "Create project" (Proje Oluştur) butonuna tıkla

### 2. Realtime Database'i Etkinleştir

1. Sol menüden **"Realtime Database"** seçeneğine tıkla
2. **"Create Database"** (Veritabanı Oluştur) butonuna tıkla
3. **"Start in test mode"** (Test modunda başlat) seçeneğini seç (geliştirme için)
4. Bölge seç (örn: `europe-west1` veya `us-central1`)
5. **"Enable"** (Etkinleştir) butonuna tıkla

### 3. Firebase Config Bilgilerini Al

1. Sol menüden **⚙️ Project Settings** (Proje Ayarları) ikonuna tıkla
2. Aşağı kaydır ve **"Your apps"** (Uygulamalarınız) bölümüne gel
3. **Web** (</>) ikonuna tıkla
4. App nickname (Uygulama takma adı) gir (örn: `risale-app`)
5. **"Register app"** (Uygulamayı Kaydet) butonuna tıkla
6. Açılan ekranda **config** objesini kopyala (şu şekilde görünecek):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "risale-tracking.firebaseapp.com",
  databaseURL: "https://risale-tracking-default-rtdb.firebaseio.com",
  projectId: "risale-tracking",
  storageBucket: "risale-tracking.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 4. Config'i Dosyaya Yapıştır

1. `firebase-config.js` dosyasını aç
2. `BURAYA_..._GELECEK` yazan yerleri Firebase Console'dan kopyaladığın değerlerle değiştir
3. Dosyayı kaydet

### 5. Database Kurallarını Ayarla (Güvenlik)

1. Firebase Console'da **Realtime Database** → **Rules** sekmesine git
2. Şu kuralları yapıştır (geliştirme için - herkes okuyup yazabilir):

```json
{
  "rules": {
    "groups": {
      ".read": true,
      ".write": true
    },
    "groupsByCode": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. **"Publish"** (Yayınla) butonuna tıkla

⚠️ **NOT:** Bu kurallar herkesin veri okuyup yazmasına izin verir. Üretim ortamında daha güvenli kurallar kullanmalısın.

## Kullanım

1. `index.html` dosyasını tarayıcıda aç
2. "Yeni Grup Oluştur" butonuna tıkla
3. Grup kodu otomatik oluşturulur
4. Üye ekle, sil, paylaş - tüm veriler Firebase'de saklanır
5. Farklı cihazlardan aynı grup kodunu kullanarak aynı gruba erişebilirsin

## Özellikler

- ✅ Firebase Realtime Database ile bulut veri saklama
- ✅ Gerçek zamanlı senkronizasyon (bir cihazda eklenen üye diğer cihazlarda anında görünür)
- ✅ Farklı cihazlardan erişim
- ✅ Paylaşılabilir linkler (`?join=KOD`)
- ✅ Koyu/Açık mod
- ✅ İstatistikler (toplam sayfa, zaman, ortalamalar)

## Sorun Giderme

- **"Firebase is not defined" hatası:** `firebase-config.js` dosyasının `index.html`'den önce yüklendiğinden emin ol
- **Veriler görünmüyor:** Firebase Console'da Realtime Database'in aktif olduğunu ve kuralların doğru ayarlandığını kontrol et
- **Grup bulunamıyor:** Grup kodunun doğru yazıldığından ve Firebase'de veri olduğundan emin ol

