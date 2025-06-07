
# TeleTıp Web/Mobil Uygulaması

Bu proje, hastalar ve doktorlar arasında görüntülü görüşmeler, randevu yönetimi ve güvenli iletişim sağlamayı amaçlayan bir tele-tıp platformudur. React Native kullanılarak hem web hem de mobil platformlarda çalışacak şekilde geliştirilmiştir.

## Temel Özellikler

- **Kullanıcı Kimlik Doğrulama:** E-posta/Şifre ve Biyometrik (Parmak İzi/Yüz Tanıma) giriş seçenekleri.
- **Güvenli Görüntülü Görüşmeler:** WebRTC tabanlı, uçtan uca şifreli (DTLS-SRTP) görüntülü ve sesli iletişim.
- **Oda Tabanlı Görüşme Sistemi:** Kullanıcıların belirli bir oda kimliği (Room ID) ile görüşmelere katılması.
- **Kullanıcı Rolleri:** 'Hasta' (Patient) ve 'Doktor' (Doctor) olmak üzere iki temel kullanıcı rolü.
- **Ayarlar:** Uygulama teması (Açık/Koyu Mod) ve dil (İngilizce/Türkçe) seçimi.
- **Güvenlik Özellikleri:**
    - Jailbreak/Root tespiti ile cihaz güvenliği kontrolü.
    - WebRTC için `iceTransportPolicy: 'relay'` kullanarak IP sızıntısını önleme (TURN sunucusu üzerinden).
    - Güvenli depolama (react-native-encrypted-storage).
    - Veri işleme için kullanıcı rızası yönetimi.
- **Bildirimler:** Yerel bildirimler (örn: gelen aramalar, randevu hatırlatıcıları - Notifee ile).
- **Çoklu Dil Desteği:** i18next ile İngilizce ve Türkçe dil seçenekleri.
- **Hata Takibi ve Performans İzleme:** Sentry entegrasyonu.
- **Geliştirici Araçları:** Hata ayıklama ekranı (Debug Screen) ile RTC durumu, bağlı kullanıcılar ve log geçmişi görüntüleme.

## Kullanılan Teknolojiler

- **Ana Çatı:** React, React Native, TypeScript
- **Navigasyon:** React Navigation (Stack, Bottom Tabs)
- **State Yönetimi:** Zustand (Global state için basit ve etkili)
- **Stil:** Tailwind CSS (Tailwind RN ile React Native adaptasyonu)
- **Uluslararasılaştırma (i18n):** i18next, react-i18next
- **Gerçek Zamanlı İletişim:** Socket.IO Client
- **Görüntülü Görüşme (WebRTC):** react-native-webrtc
- **Bildirimler:** @notifee/react-native
- **Güvenli Depolama:** react-native-encrypted-storage
- **Hata Takibi:** @sentry/react-native
- **Formlar ve UI Bileşenleri:** Özel geliştirilmiş genel bileşenler
- **Testler:**
    - Jest (Birim ve entegrasyon testleri)
    - React Native Testing Library (Bileşen testleri)
    - Detox (E2E - Uçtan Uca Testler)
- **Backend (Varsayımsal İhtiyaçlar):**
    - Node.js, Express.js (veya benzeri bir backend framework)
    - Socket.IO (Sinyalleşme sunucusu ve gerçek zamanlı olaylar için)
    - Veritabanı (örn: PostgreSQL, MongoDB - kullanıcı bilgileri, randevular vb. için)
    - TURN/STUN sunucusu (WebRTC bağlantı kurulumu için gereklidir)
    - Kimlik doğrulama servisi (JWT tabanlı)

## Proje Yapısı

Proje, modüler ve bakımı kolay bir yapıyı hedefler. Ana dizinler ve içerikleri:

-   `index.html`: Web uygulaması için HTML giriş noktası.
-   `index.tsx`: Web için React uygulamasını başlatan ana TypeScript dosyası. `App.tsx` (web versiyonu) dosyasını render eder.
-   `index.js`: React Native mobil uygulaması için giriş noktası. `src/App.tsx` (mobil versiyonu) dosyasını kaydeder.
-   `app.json`: Uygulama adı, görünen ad gibi React Native meta verileri.
-   `babel.config.js`: Babel yapılandırması (modül çözücü alias'ları dahil).
-   `metro.config.js`: Metro bundler yapılandırması.
-   `tailwind.config.js`: Tailwind CSS'in React Native için yapılandırması.
-   `tailwind.json`: `tailwind-rn` tarafından `tailwind.config.js` kullanılarak üretilen stil dosyası.
-   `tsconfig.json`: Ana TypeScript yapılandırması (path alias'ları içerir).
-   `src/`: Uygulamanın ana kaynak kodlarını içerir.
    -   `App.tsx`: React Native mobil için ana uygulama bileşeni. Global sağlayıcılar (NavigationContainer, SafeAreaProvider, TailwindProvider), Sentry ve i18n başlatma işlemleri burada yapılır. Cihaz güvenlik kontrolleri (Jailbreak) de bu dosyada ele alınır.
    -   `components/`: Yeniden kullanılabilir UI bileşenleri.
        -   `common/`: `Button`, `TextInput`, `Icon`, `Toast`, `LoadingOverlay`, `Checkbox`, `ConsentModal` gibi genel amaçlı bileşenler.
        -   `VideoCall/` (Örnek): Görüntülü arama arayüzüne özel bileşenler (`LocalStreamView`, `RemoteStreamView`).
    -   `constants/`: Uygulama genelinde kullanılan sabit değerler (`API_ENDPOINTS`, `SOCKET_EVENTS`, `STORAGE_KEYS`, `LOG_EVENT_TYPES`, tema renkleri (`theme.ts`)).
    -   `hooks/`: Özel React hook'ları (örn: `useAuth`, `useBiometrics`, `useCallConnection`, `useJailbreakDetection`).
    -   `i18n/`: Uluslararasılaştırma (i18next) yapılandırması ve dil dosyaları (`locales/en.json`, `locales/tr.json`).
    -   `navigation/`: React Navigation yapılandırması.
        -   `AuthNavigator.tsx`: Kimlik doğrulama akışı ekranları (Login).
        -   `AppNavigator.tsx`: Ana uygulama ekranlarını içeren stack navigatör (TabNavigator'ı ve CallScreen'i barındırır).
        -   `TabNavigator.tsx`: Alt tab navigasyonu (RoomEntry, Dashboard, Profile, Settings, Debug).
        -   `RootNavigator.tsx`: Kimlik doğrulama durumuna göre `AuthNavigator` ve `AppNavigator` arasında geçiş yapar.
        -   `types.ts`: Navigasyon parametreleri ve ekran prop tipleri.
    -   `screens/`: Uygulama ekranları (`LoginScreen.tsx`, `RoomEntryScreen.tsx`, `DashboardScreen.tsx`, `CallScreen.tsx`, `ProfileScreen.tsx`, `SettingsScreen.tsx`, `LoadingScreen.tsx`, `DebugScreen.tsx`).
    -   `services/`: Backend API çağrıları, Socket.IO bağlantı yönetimi, WebRTC mantığı, bildirim yönetimi, Sentry ve consent loglama gibi servisler.
        -   `api.ts`: Axios istemci yapılandırması (interceptor'lar ile).
        -   `authService.ts`: Kimlik doğrulama ile ilgili API çağrıları (mock).
        -   `socketService.ts`: Socket.IO istemci yönetimi.
        -   `rtcService.ts`: WebRTC bağlantı mantığı.
        -   `notificationService.ts`: Notifee ile bildirim yönetimi.
        -   `sentryService.ts`: Sentry başlatma ve yardımcı fonksiyonlar.
        -   `consentLogService.ts`: Rıza ile ilgili olayları loglama.
        -   `jwtUtils.ts`: JWT token işlemleri için yardımcı fonksiyonlar.
    -   `store/`: Zustand ile state yönetimi.
        -   `useAuthStore.ts`: Kimlik doğrulama ve kullanıcı bilgileri state'i.
        -   `useAppStore.ts`: Uygulama geneli ayarlar (tema, dil) state'i.
        -   `useCallStore.ts`: Aktif arama, streamler ve bağlantı durumu state'i.
    -   `types/`: Global TypeScript tip tanımlamaları (`index.ts`, `env.d.ts`).
    -   `utils/`: Yardımcı fonksiyonlar.
        -   `logger.ts`: Kapsamlı loglama sistemi (Sentry entegrasyonlu, log buffer'lı).
        -   `storage.ts`: `react-native-encrypted-storage` için sarmalayıcı (wrapper).
        -   `permissions.ts`: İzin yönetimi (kamera, mikrofon vb.).
        -   `sanitizer.ts`: PII (Kişisel Tanımlanabilir Bilgi) içeren verileri maskelemek için.
-   `tests/`: Jest ile yazılmış birim ve entegrasyon testleri (`auth.test.ts`, `rtcService.test.ts`).
-   `e2e/`: Detox ile yazılmış E2E testleri (`loginFlow.spec.ts`, `callFlow.spec.ts`).
-   `.env.example`: Çevre değişkenleri için örnek dosya. Gerçek değerler `.env` dosyasında tutulmalıdır.

## Kurulum ve Başlatma

Projeyi yerel makinenizde kurmak ve çalıştırmak için aşağıdaki adımları izleyin:

### Ön Gereksinimler
- Node.js (LTS versiyonu önerilir)
- Yarn veya npm
- Android Studio (Android geliştirme için) ve yapılandırılmış bir emülatör/cihaz
- Xcode (iOS geliştirme için) ve yapılandırılmış bir simülatör/cihaz (sadece macOS üzerinde)
- Ruby ve Bundler (iOS bağımlılıkları için)
- Watchman (macOS/Linux üzerinde dosya sistemi izleme için önerilir)

### Adımlar

1.  **Depoyu Klonlayın:**
    ```bash
    git clone <repository-url>
    cd teletipapp
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    # veya
    # yarn install
    ```
    Eğer iOS için geliştirme yapıyorsanız:
    ```bash
    cd ios && bundle install && bundle exec pod install && cd ..
    ```

3.  **Çevre Değişkenleri:**
    Proje kök dizininde `.env` adında bir dosya oluşturun. Örnek olarak `src/types/env.d.ts` dosyasındaki değişkenleri veya aşağıdaki şablonu kullanabilirsiniz:
    ```env
    API_URL=http://localhost:3000 # Backend API adresiniz
    SENTRY_DSN=your_sentry_dsn_here # Sentry DSN anahtarınız
    API_KEY=YOUR_GEMINI_API_KEY # Google Gemini API anahtarınız

    # TURN Sunucu Bilgileri (Opsiyonel, rtcService içinde fallback değerler var)
    TURN_URL= # turns:your-turn-server.com:5349
    TURN_USERNAME= # your_turn_username
    TURN_PASSWORD= # your_turn_password
    ```
    **ÖNEMLİ (API_KEY):** Google Gemini API (`@google/genai`) anahtarı **kesinlikle** `process.env.API_KEY` ortam değişkeninden alınmalıdır. Bu değişkenin, uygulamanın çalıştığı ortamda önceden yapılandırılmış ve erişilebilir olduğu varsayılır. Uygulama, kullanıcıdan bu anahtarı girmesini **istemeyecektir** veya arayüzde bunun için bir alan sunmayacaktır.

4.  **Tailwind CSS (React Native için):**
    Bu proje için `tailwind.json` dosyası depoya dahil edilmiştir. Ancak, `tailwind.config.js` dosyasında değişiklik yaparsanız, aşağıdaki komutla `tailwind.json` dosyasını yeniden oluşturmanız gerekebilir:
    ```bash
    npm run tailwind:build
    # veya değişiklikleri izlemek için:
    # npm run tailwind:build -- --watch
    ```

### Uygulamayı Çalıştırma

#### Web (index.html ile Geliştirme)
Bu proje `index.html` ve `index.tsx` dosyalarını kullanarak bir web uygulaması olarak da çalıştırılabilir (özellikle React bileşenlerini hızlıca test etmek için). Bir HTTP sunucusu (örneğin Node.js tabanlı `http-server` veya VS Code Live Server eklentisi) kullanarak `index.html` dosyasını tarayıcıda açın.
```bash
npm install -g http-server
http-server . -p 8080
```
Ardından tarayıcıda `http://localhost:8080` adresine gidin.

#### React Native (Mobil)

1.  **Metro Bundler'ı Başlatın:**
    ```bash
    npm start
    # veya
    # yarn start
    ```

2.  **Android:**
    (Android Studio ve Emulator/Cihaz ayarları yapılmış olmalıdır)
    ```bash
    npm run android
    # veya
    # yarn android
    ```

3.  **iOS:**
    (Xcode ve Simülatör/Cihaz ayarları yapılmış olmalıdır.)
    ```bash
    npm run ios
    # veya
    # yarn ios
    ```

## Testleri Çalıştırma

-   **Birim ve Bileşen Testleri (Jest):**
    ```bash
    npm test
    # veya
    # yarn test
    ```

-   **E2E Testleri (Detox):**
    Detox kurulumu ve yapılandırması için [Detox dökümanlarına](https://wix.github.io/Detox/docs/introduction/getting-started) bakın.
    Örnek komutlar (projenizin `package.json` dosyasındaki script'lere göre uyarlayın):
    ```bash
    # iOS Debug (önce build edin)
    npm run detox:build:ios:debug
    npm run detox:test:ios:debug

    # Android Debug (önce build edin)
    npm run detox:build:android:debug
    npm run detox:test:android:debug
    ```

## Linting

Kod stilini kontrol etmek ve olası hataları bulmak için:
```bash
npm run lint
```

## Katkıda Bulunma

Katkıda bulunmak isterseniz, lütfen bir "issue" açarak sorunu veya öneriyi tartışın ya da bir "pull request" gönderin. Geliştirme süreçleri ve kodlama standartları hakkında daha fazla bilgi için `CONTRIBUTING.md` (oluşturulacaksa) dosyasına göz atın.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için `LICENSE` (oluşturulacaksa) dosyasına bakın.
