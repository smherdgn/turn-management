
# TURN User Management UI & Admin Panel

## English

This project provides a web interface for managing a Coturn TURN server. It initially started as a client-side simulation (`index.html` and related React components) and has evolved into a full-fledged Next.js application acting as an admin panel. This panel allows administrators to manage TURN users, monitor Coturn service status, control the service (start/stop/restart), view logs, and provides a setup guide for Coturn.

### Core Technologies

*   **Frontend (Simulation - Legacy):** React, TypeScript, Tailwind CSS (via CDN)
*   **Frontend (Admin Panel):** Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI
*   **Backend (Admin Panel):** Next.js API Routes, Node.js (`child_process` for system commands)
*   **TURN Server:** Coturn (managed by this panel)
*   **Authentication:** JWT (JSON Web Tokens) with cookies

### Features

#### Legacy Simulation (`index.html`):
*   List mock TURN users.
*   Add new mock users with username and password.
*   Delete mock users.
*   Client-side operations with simulated delay (no actual backend calls).

#### Next.js Admin Panel (`app/` directory):
*   **Authentication:**
    *   Secure login page for administrators.
    *   JWT-based session management using HTTP-only cookies.
    *   Logout functionality.
*   **User Management (via `turnadmin`):**
    *   List active TURN users for the configured realm.
    *   Add new TURN users with username and password.
    *   Delete existing TURN users.
*   **Service Status & Control (via `systemctl`):**
    *   View the current status of the Coturn service (e.g., active, inactive, failed).
    *   Start, stop, and restart the Coturn service.
*   **Log Viewer:**
    *   Display the last 50 lines from the Coturn server log file (e.g., `/var/log/turnserver.log`).
    *   Auto-refresh logs periodically.
*   **Coturn Setup Guide:**
    *   Checks if `turnserver` command is available.
    *   Provides installation instructions for Coturn on Ubuntu/Debian.
    *   Displays example configurations for `/etc/turnserver.conf` and the project's `.env.local` file.
    *   Guidance on setting up the admin panel's user database (`data/users.json`).
*   **User Interface:**
    *   Responsive design for desktop and mobile.
    *   Utilizes Shadcn UI components for a modern look and feel.
    *   Toast notifications for user feedback.
    *   Clear visual indicators for loading states and actions.

### Project Structure Overview

*   **`index.html`, `index.tsx`, `App.tsx`, `components/*.tsx` (in root):** The original client-side simulation.
*   **`app/`:** The Next.js application.
    *   **`app/(admin)/`:** Authenticated routes (users, status, setup pages) with a shared layout.
    *   **`app/login/`:** Public login page.
    *   **`app/api/`:** Backend API routes for authentication, user management, service control, etc.
    *   **`components/ui/`:** Shadcn UI components.
    *   **`hooks/`:** Custom React hooks (e.g., `useAuth`, `useToast`).
    *   **`lib/`:** Utility functions (e.g., `cn` for Tailwind class merging).
    *   **`data/`:** Directory for storing admin panel user data (e.g., `users.json`).
*   **`public/`:** Static assets for the Next.js app.
*   **`tailwind.config.ts`, `postcss.config.js`:** Tailwind CSS configuration for Next.js.
*   **`middleware.ts`:** Next.js middleware for protecting API routes.

### Setup and Installation (Next.js Admin Panel)

**Prerequisites:**
*   Node.js (v18 or newer recommended)
*   npm or yarn
*   A running Coturn server on the same machine or a machine accessible via SSH (if commands were to be run remotely, which is not the current setup). This panel assumes `turnadmin` and `systemctl` commands are executable by the user running the Next.js application.
*   `sudo` access for the user running the Next.js application if it needs to control `systemctl` (highly recommended to configure `sudoers` for passwordless execution of specific commands only).

**1. Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

**2. Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

**3. Configure Environment Variables:**
   Create a `.env.local` file in the root of the project. Refer to the "Coturn Setup Guide" page within the application or the example configuration files provided in `app/(admin)/setup/page.tsx` for required variables.
   Key variables:
   *   `REALM`: The realm configured in your `/etc/turnserver.conf`. This panel's `turnadmin` commands will operate on this realm.
   *   `USER_DB_PATH`: Path to the JSON file storing admin panel user credentials (e.g., `data/users.json`).
   *   `JWT_SECRET`: A strong, random string for signing JWTs (e.g., `openssl rand -hex 32`).
   *   `AUTH_COOKIE_NAME`: Name for the authentication cookie (e.g., `admin-auth-token`).
   *   `TURN_LOG_FILE`: Absolute path to the Coturn log file (e.g., `/var/log/turnserver.log`) for server-side API access.
   *   `NEXT_PUBLIC_TURN_LOG_FILE`: Same as `TURN_LOG_FILE`, but for client-side display purposes.
   *   `NEXT_PUBLIC_USER_DB_PATH_DISPLAY`: Display path for the admin user database in the UI (e.g., `data/users.json`).

   **Example `.env.local` (see `app/(admin)/setup/page.tsx` for a more detailed example):**
   ```ini
   # .env.local
   REALM=your.domain.com
   USER_DB_PATH=data/users.json
   JWT_SECRET=your_super_strong_random_jwt_secret_key
   AUTH_COOKIE_NAME=turn-admin-session

   TURN_LOG_FILE=/var/log/turnserver.log
   NEXT_PUBLIC_TURN_LOG_FILE=/var/log/turnserver.log
   NEXT_PUBLIC_USER_DB_PATH_DISPLAY=data/users.json
   ```

**4. Setup Admin Panel User Database:**
   Create the directory and file specified by `USER_DB_PATH` (e.g., `data/users.json`).
   The file should be a JSON array of user objects.
   **Example `data/users.json`:**
   ```json
   [
     {
       "email": "admin@example.com",
       "passwordHash": "yoursecurepassword",
       "role": "admin"
     }
   ]
   ```
   **SECURITY WARNING:** The `passwordHash` in this example is plaintext. **For production, you MUST hash passwords using a strong algorithm like bcrypt** and modify the `/api/login/route.ts` to compare hashed passwords.

**5. Configure Coturn (`/etc/turnserver.conf`):**
   Ensure your Coturn configuration is compatible with `turnadmin` for user management. Key settings (refer to `app/(admin)/setup/page.tsx` for a detailed example):
   *   `lt-cred-mech`: Enable long-term credential mechanism.
   *   `use-auth-secret`: Enable static shared secret for `turnadmin`.
   *   `static-auth-secret=YOUR_COTURN_ADMIN_SHARED_SECRET`: Set a strong secret. This is **NOT** the JWT secret. It's for `turnadmin` to authenticate to Coturn.
   *   `realm=YOUR_REALM`: Must match the `REALM` in your `.env.local`.
   *   `userdb=/var/lib/turn/turndb`: Path where `turnadmin` stores TURN user credentials. Ensure the user running Coturn can write to this file/directory.

**6. Permissions for System Commands:**
   The Next.js application executes `turnadmin` and `sudo systemctl ...` commands.
   *   **`turnadmin`:** The user running the Next.js app must have permission to execute `turnadmin`. This usually means `turnadmin` is in the system's PATH.
   *   **`systemctl`:** Controlling services typically requires root privileges.
        *   **Option 1 (Not Recommended for Production):** Run the Next.js app as root.
        *   **Option 2 (Better):** Configure `sudoers` to allow the user running the Next.js app to execute specific `systemctl` commands (`start`, `stop`, `restart`, `is-active` for `coturn.service`) without a password.
           Example `/etc/sudoers.d/nextjs-coturn` entry:
           ```
           your_nextjs_user ALL=(ALL) NOPASSWD: /bin/systemctl start coturn, /bin/systemctl stop coturn, /bin/systemctl restart coturn, /bin/systemctl is-active coturn
           ```
           Replace `your_nextjs_user` with the actual username.

**7. Run the Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will typically be available at `http://localhost:3000`.

**8. Build for Production:**
   ```bash
   npm run build
   npm run start
   # or
   yarn build
   yarn start
   ```

### API Routes (Next.js Admin Panel)

*   `POST /api/login`: Authenticates an admin user.
*   `GET /api/logout`: Clears the authentication cookie and logs out the admin user.
*   `GET /api/me`: Checks the current admin user's authentication status.
*   `GET /api/users`: Lists all TURN users for the configured realm.
*   `POST /api/users`: Adds a new TURN user.
*   `DELETE /api/users/[username]`: Deletes a specific TURN user.
*   `GET /api/status`: Gets the current status of the Coturn service.
*   `GET /api/logs`: Retrieves the latest Coturn service logs.
*   `POST /api/start`: Starts the Coturn service.
*   `POST /api/stop`: Stops the Coturn service.
*   `POST /api/restart`: Restarts the Coturn service.
*   `GET /api/coturn-check`: Checks if Coturn (`turnserver` command) is installed and accessible.

All API routes (except `/api/login`) are protected and require a valid JWT. Middleware in `middleware.ts` handles this.

### Important Security Notes

*   **Admin Password Hashing:** The current implementation for admin login (`/api/login/route.ts` and `data/users.json`) uses **plaintext passwords for demonstration purposes**. In a production environment, you **MUST** implement strong password hashing (e.g., using `bcrypt`) for storing and verifying admin credentials.
*   **`sudo` for `systemctl`:** Executing `systemctl` commands with `sudo` from a web application poses significant security risks if not handled carefully. Always prefer configuring `sudoers` for passwordless execution of *only the necessary specific commands* by the application's user, rather than running the entire application as root or granting broad `sudo` privileges.
*   **JWT Secret (`JWT_SECRET`):** Keep this secret confidential and make it strong and unique. It's crucial for securing admin sessions.
*   **Coturn `static-auth-secret`:** This secret in `/etc/turnserver.conf` is used by `turnadmin` to authenticate to the Coturn server. It should also be strong and kept confidential.
*   **File Permissions:**
    *   Ensure the `USER_DB_PATH` file (e.g., `data/users.json`) is readable by the Next.js application user and not publicly accessible via the webserver if it's within the web root (which `data/` is not by default in Next.js public serving).
    *   Ensure Coturn's `userdb` file (e.g., `/var/lib/turn/turndb`) is writable by the user Coturn runs as.
*   **Input Validation:** All API routes handling user input perform validation, which is good practice.
*   **Environment Variables:** Do not commit `.env.local` files containing sensitive information to public repositories. Use environment variable management provided by your deployment platform for production.

---

## Türkçe

Bu proje, bir Coturn TURN sunucusunu yönetmek için bir web arayüzü sunar. Başlangıçta istemci taraflı bir simülasyon (`index.html` ve ilgili React bileşenleri) olarak başlamış ve zamanla bir yönetici paneli işlevi gören tam teşekküllü bir Next.js uygulamasına dönüşmüştür. Bu panel, yöneticilerin TURN kullanıcılarını yönetmesine, Coturn servis durumunu izlemesine, servisi kontrol etmesine (başlatma/durdurma/yeniden başlatma), günlükleri görüntülemesine ve Coturn için bir kurulum rehberi sunmasına olanak tanır.

### Temel Teknolojiler

*   **Ön Yüz (Simülasyon - Eski):** React, TypeScript, Tailwind CSS (CDN aracılığıyla)
*   **Ön Yüz (Yönetici Paneli):** Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI
*   **Arka Uç (Yönetici Paneli):** Next.js API Rotaları, Node.js (`child_process` sistem komutları için)
*   **TURN Sunucusu:** Coturn (bu panel tarafından yönetilir)
*   **Kimlik Doğrulama:** JWT (JSON Web Tokenları) çerezlerle

### Özellikler

#### Eski Simülasyon (`index.html`):
*   Sahte TURN kullanıcılarını listeleme.
*   Kullanıcı adı ve şifre ile yeni sahte kullanıcılar ekleme.
*   Sahte kullanıcıları silme.
*   Simüle edilmiş gecikmeyle istemci taraflı işlemler (gerçek arka uç çağrısı yok).

#### Next.js Yönetici Paneli (`app/` dizini):
*   **Kimlik Doğrulama:**
    *   Yöneticiler için güvenli giriş sayfası.
    *   HTTP-only çerezler kullanarak JWT tabanlı oturum yönetimi.
    *   Çıkış yapma işlevselliği.
*   **Kullanıcı Yönetimi (`turnadmin` aracılığıyla):**
    *   Yapılandırılmış realm için aktif TURN kullanıcılarını listeleme.
    *   Kullanıcı adı ve şifre ile yeni TURN kullanıcıları ekleme.
    *   Mevcut TURN kullanıcılarını silme.
*   **Servis Durumu ve Kontrolü (`systemctl` aracılığıyla):**
    *   Coturn servisinin mevcut durumunu görüntüleme (örneğin, aktif, inaktif, başarısız).
    *   Coturn servisini başlatma, durdurma ve yeniden başlatma.
*   **Günlük Görüntüleyici:**
    *   Coturn sunucu günlük dosyasından (örneğin, `/var/log/turnserver.log`) son 50 satırı görüntüleme.
    *   Günlükleri periyodik olarak otomatik yenileme.
*   **Coturn Kurulum Rehberi:**
    *   `turnserver` komutunun kullanılabilir olup olmadığını kontrol etme.
    *   Ubuntu/Debian üzerinde Coturn için kurulum talimatları sunma.
    *   `/etc/turnserver.conf` ve projenin `.env.local` dosyası için örnek yapılandırmalar gösterme.
    *   Yönetici panelinin kullanıcı veritabanı (`data/users.json`) kurulumu hakkında rehberlik.
*   **Kullanıcı Arayüzü:**
    *   Masaüstü ve mobil için duyarlı tasarım.
    *   Modern bir görünüm ve his için Shadcn UI bileşenlerini kullanma.
    *   Kullanıcı geri bildirimi için anlık bildirimler (toast).
    *   Yükleme durumları ve eylemler için net görsel göstergeler.

### Proje Yapısı Genel Bakış

*   **`index.html`, `index.tsx`, `App.tsx`, `components/*.tsx` (kök dizinde):** Orijinal istemci taraflı simülasyon.
*   **`app/`:** Next.js uygulaması.
    *   **`app/(admin)/`:** Paylaşılan bir düzene sahip kimliği doğrulanmış rotalar (kullanıcılar, durum, kurulum sayfaları).
    *   **`app/login/`:** Herkese açık giriş sayfası.
    *   **`app/api/`:** Kimlik doğrulama, kullanıcı yönetimi, servis kontrolü vb. için arka uç API rotaları.
    *   **`components/ui/`:** Shadcn UI bileşenleri.
    *   **`hooks/`:** Özel React kancaları (örneğin, `useAuth`, `useToast`).
    *   **`lib/`:** Yardımcı fonksiyonlar (örneğin, Tailwind sınıf birleştirme için `cn`).
    *   **`data/`:** Yönetici paneli kullanıcı verilerini saklamak için dizin (örneğin, `users.json`).
*   **`public/`:** Next.js uygulaması için statik varlıklar.
*   **`tailwind.config.ts`, `postcss.config.js`:** Next.js için Tailwind CSS yapılandırması.
*   **`middleware.ts`:** API rotalarını korumak için Next.js ara yazılımı.

### Kurulum ve Yükleme (Next.js Yönetici Paneli)

**Ön Koşullar:**
*   Node.js (v18 veya daha yenisi önerilir)
*   npm veya yarn
*   Aynı makinede veya SSH ile erişilebilen bir makinede çalışan bir Coturn sunucusu (komutların uzaktan çalıştırılması durumunda, ki bu mevcut kurulum değil). Bu panel, `turnadmin` ve `systemctl` komutlarının Next.js uygulamasını çalıştıran kullanıcı tarafından yürütülebilir olduğunu varsayar.
*   Next.js uygulamasını çalıştıran kullanıcının `systemctl`'i kontrol etmesi gerekiyorsa `sudo` erişimi (yalnızca belirli komutların parolasız yürütülmesi için `sudoers` yapılandırması şiddetle tavsiye edilir).

**1. Depoyu Klonlayın:**
   ```bash
   git clone <depo-url>
   cd <depo-dizini>
   ```

**2. Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   # veya
   yarn install
   ```

**3. Ortam Değişkenlerini Yapılandırın:**
   Projenin kök dizininde bir `.env.local` dosyası oluşturun. Gerekli değişkenler için uygulama içindeki "Coturn Kurulum Rehberi" sayfasına veya `app/(admin)/setup/page.tsx` içinde sağlanan örnek yapılandırma dosyalarına bakın.
   Temel değişkenler:
   *   `REALM`: `/etc/turnserver.conf` dosyanızda yapılandırılan realm. Bu panelin `turnadmin` komutları bu realm üzerinde çalışacaktır.
   *   `USER_DB_PATH`: Yönetici paneli kullanıcı kimlik bilgilerini saklayan JSON dosyasının yolu (örneğin, `data/users.json`).
   *   `JWT_SECRET`: JWT'leri imzalamak için güçlü, rastgele bir dize (örneğin, `openssl rand -hex 32`).
   *   `AUTH_COOKIE_NAME`: Kimlik doğrulama çerezi için ad (örneğin, `admin-auth-token`).
   *   `TURN_LOG_FILE`: Coturn günlük dosyasının mutlak yolu (örneğin, `/var/log/turnserver.log`) sunucu taraflı API erişimi için.
   *   `NEXT_PUBLIC_TURN_LOG_FILE`: `TURN_LOG_FILE` ile aynı, ancak istemci taraflı görüntüleme amaçları için.
   *   `NEXT_PUBLIC_USER_DB_PATH_DISPLAY`: Yönetici kullanıcı veritabanının UI'de görüntülenecek yolu (örneğin, `data/users.json`).

   **Örnek `.env.local` (daha detaylı bir örnek için `app/(admin)/setup/page.tsx` dosyasına bakın):**
   ```ini
   # .env.local
   REALM=sizin.alanadiniz.com
   USER_DB_PATH=data/users.json
   JWT_SECRET=sizin_cok_guclu_rastgele_jwt_gizli_anahtariniz
   AUTH_COOKIE_NAME=turn-admin-oturum

   TURN_LOG_FILE=/var/log/turnserver.log
   NEXT_PUBLIC_TURN_LOG_FILE=/var/log/turnserver.log
   NEXT_PUBLIC_USER_DB_PATH_DISPLAY=data/users.json
   ```

**4. Yönetici Paneli Kullanıcı Veritabanını Kurun:**
   `USER_DB_PATH` ile belirtilen dizini ve dosyayı oluşturun (örneğin, `data/users.json`).
   Dosya, kullanıcı nesnelerinden oluşan bir JSON dizisi olmalıdır.
   **Örnek `data/users.json`:**
   ```json
   [
     {
       "email": "admin@example.com",
       "passwordHash": "guvenlisifreniz",
       "role": "admin"
     }
   ]
   ```
   **GÜVENLİK UYARISI:** Bu örnekteki `passwordHash` düz metindir. **Üretim için, parolaları bcrypt gibi güçlü bir algoritma kullanarak hashlemeniz** ve `/api/login/route.ts` dosyasını hashlenmiş parolaları karşılaştıracak şekilde değiştirmeniz **GEREKİR**.

**5. Coturn'u Yapılandırın (`/etc/turnserver.conf`):**
   Coturn yapılandırmanızın kullanıcı yönetimi için `turnadmin` ile uyumlu olduğundan emin olun. Temel ayarlar (detaylı bir örnek için `app/(admin)/setup/page.tsx` dosyasına bakın):
   *   `lt-cred-mech`: Uzun süreli kimlik bilgisi mekanizmasını etkinleştirin.
   *   `use-auth-secret`: `turnadmin` için statik paylaşılan sırrı etkinleştirin.
   *   `static-auth-secret=SİZİN_COTURN_YÖNETİCİ_PAYLAŞILAN_SIRRINIZ`: Güçlü bir sır ayarlayın. Bu, JWT sırrı **DEĞİLDİR**. `turnadmin`'in Coturn'e kimlik doğrulaması içindir.
   *   `realm=SİZİN_REALMİNİZ`: `.env.local` dosyanızdaki `REALM` ile eşleşmelidir.
   *   `userdb=/var/lib/turn/turndb`: `turnadmin`'in TURN kullanıcı kimlik bilgilerini sakladığı yol. Coturn'u çalıştıran kullanıcının bu dosyaya/dizine yazabildiğinden emin olun.

**6. Sistem Komutları İçin İzinler:**
   Next.js uygulaması `turnadmin` ve `sudo systemctl ...` komutlarını yürütür.
   *   **`turnadmin`:** Next.js uygulamasını çalıştıran kullanıcının `turnadmin`'i yürütme izni olmalıdır. Bu genellikle `turnadmin`'in sistemin PATH'inde olduğu anlamına gelir.
   *   **`systemctl`:** Servisleri kontrol etmek genellikle kök ayrıcalıkları gerektirir.
        *   **Seçenek 1 (Üretim İçin Önerilmez):** Next.js uygulamasını root olarak çalıştırın.
        *   **Seçenek 2 (Daha İyi):** Next.js uygulamasını çalıştıran kullanıcının belirli `systemctl` komutlarını (`coturn.service` için `start`, `stop`, `restart`, `is-active`) parolasız yürütmesine izin vermek için `sudoers` yapılandırın.
           Örnek `/etc/sudoers.d/nextjs-coturn` girişi:
           ```
           sizin_nextjs_kullaniciniz ALL=(ALL) NOPASSWD: /bin/systemctl start coturn, /bin/systemctl stop coturn, /bin/systemctl restart coturn, /bin/systemctl is-active coturn
           ```
           `sizin_nextjs_kullaniciniz` yerine gerçek kullanıcı adını yazın.

**7. Geliştirme Sunucusunu Çalıştırın:**
   ```bash
   npm run dev
   # veya
   yarn dev
   ```
   Uygulama genellikle `http://localhost:3000` adresinde kullanılabilir olacaktır.

**8. Üretim İçin Derleyin:**
   ```bash
   npm run build
   npm run start
   # veya
   yarn build
   yarn start
   ```

### API Rotaları (Next.js Yönetici Paneli)

*   `POST /api/login`: Bir yönetici kullanıcının kimliğini doğrular.
*   `GET /api/logout`: Kimlik doğrulama çerezini temizler ve yönetici kullanıcının oturumunu kapatır.
*   `GET /api/me`: Mevcut yönetici kullanıcısının kimlik doğrulama durumunu kontrol eder.
*   `GET /api/users`: Yapılandırılmış realm için tüm TURN kullanıcılarını listeler.
*   `POST /api/users`: Yeni bir TURN kullanıcısı ekler.
*   `DELETE /api/users/[username]`: Belirli bir TURN kullanıcısını siler.
*   `GET /api/status`: Coturn servisinin mevcut durumunu alır.
*   `GET /api/logs`: En son Coturn servis günlüklerini alır.
*   `POST /api/start`: Coturn servisini başlatır.
*   `POST /api/stop`: Coturn servisini durdurur.
*   `POST /api/restart`: Coturn servisini yeniden başlatır.
*   `GET /api/coturn-check`: Coturn'un (`turnserver` komutu) kurulu ve erişilebilir olup olmadığını kontrol eder.

Tüm API rotaları (`/api/login` hariç) korunmaktadır ve geçerli bir JWT gerektirir. `middleware.ts` içindeki ara yazılım bunu yönetir.

### Önemli Güvenlik Notları

*   **Yönetici Parola Hashleme:** Yönetici girişi için mevcut uygulama (`/api/login/route.ts` ve `data/users.json`) **gösterim amacıyla düz metin parolalar kullanır**. Bir üretim ortamında, yönetici kimlik bilgilerini saklamak ve doğrulamak için **MUTLAKA** güçlü parola hashleme (örneğin, `bcrypt` kullanarak) uygulamanız gerekir.
*   **`systemctl` için `sudo`:** Bir web uygulamasından `sudo` ile `systemctl` komutlarını yürütmek, dikkatli bir şekilde ele alınmazsa önemli güvenlik riskleri oluşturur. Uygulamanın kullanıcısı tarafından *yalnızca gerekli belirli komutların* parolasız yürütülmesi için `sudoers` yapılandırmayı, tüm uygulamayı root olarak çalıştırmak veya geniş `sudo` ayrıcalıkları vermek yerine her zaman tercih edin.
*   **JWT Sırrı (`JWT_SECRET`):** Bu sırrı gizli tutun ve güçlü ve benzersiz yapın. Yönetici oturumlarını güvence altına almak için kritik öneme sahiptir.
*   **Coturn `static-auth-secret`:** `/etc/turnserver.conf` dosyasındaki bu sır, `turnadmin` tarafından Coturn sunucusuna kimlik doğrulamak için kullanılır. Bu da güçlü olmalı ve gizli tutulmalıdır.
*   **Dosya İzinleri:**
    *   `USER_DB_PATH` dosyasının (örneğin, `data/users.json`) Next.js uygulama kullanıcısı tarafından okunabilir olduğundan ve web kökü içindeyse (ki `data/` varsayılan olarak Next.js genel sunumunda değildir) web sunucusu aracılığıyla herkese açık olarak erişilemediğinden emin olun.
    *   Coturn'un `userdb` dosyasının (örneğin, `/var/lib/turn/turndb`) Coturn'un çalıştığı kullanıcı tarafından yazılabilir olduğundan emin olun.
*   **Giriş Doğrulama:** Kullanıcı girdisini işleyen tüm API rotaları, iyi bir uygulama olan doğrulamayı gerçekleştirir.
*   **Ortam Değişkenleri:** Hassas bilgiler içeren `.env.local` dosyalarını herkese açık depolara göndermeyin. Üretim için dağıtım platformunuz tarafından sağlanan ortam değişkeni yönetimini kullanın.
