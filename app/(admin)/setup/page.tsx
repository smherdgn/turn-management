
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
// Toaster AdminLayout'a taşındı
// import { Toaster } from "@/components/ui/toaster";
import { Loader2, CheckCircle2, AlertCircle, DownloadCloud, Settings, FileText, RefreshCcw } from "lucide-react";
import { Button } from '@/components/ui/button';

interface CoturnStatus {
  installed: boolean;
  version?: string;
  message?: string;
  details?: string;
}

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  className?: string;
}

const CodeBlock = ({ children, language, className }: CodeBlockProps): JSX.Element => {
  return (
    <pre className={`bg-slate-800 text-slate-200 p-3 md:p-4 rounded-md text-xs font-mono overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 ${className}`}>
      <code className={language ? `language-${language}` : ''}>
        {children}
      </code>
    </pre>
  );
};

const turnserverConfExample = `
# /etc/turnserver.conf (Example Minimal Configuration for Coturn)
# ===============================================================

# Listening port for STUN/TURN (UDP and TCP)
listening-port=3478

# Optional: TLS listening port (for TURNS)
# tls-listening-port=5349

# Your server's public IP address(es). Coturn must be on a publicly accessible IP.
# Replace YOUR_SERVER_PUBLIC_IP with the actual IP.
listening-ip=YOUR_SERVER_PUBLIC_IP
# If your server is behind NAT, you might need 'external-ip'
# Example for NAT: external-ip=YOUR_ROUTER_PUBLIC_IP/YOUR_SERVER_LOCAL_IP

# Relay IP address (often the same as listening-ip, or a specific internal IP if multiple NICs)
relay-ip=YOUR_SERVER_PUBLIC_IP

# Realm for authentication of TURN users (those using the TURN service).
# This MUST match the REALM in your .env.local for this admin UI,
# as 'turnadmin' commands executed by the panel use this realm.
realm=your.domain.com # Or your public IP if not using a domain

# Enable Long-Term Credential Mechanism for TURN users.
# This allows TURN users (e.g., WebRTC clients) to be added/managed dynamically by 'turnadmin'
# (via this admin panel's "User Management" page) without restarting Coturn.
lt-cred-mech

# Use a static authentication secret for 'turnadmin' to authenticate itself to Coturn.
# This is a shared secret between 'turnadmin' and the Coturn server.
use-auth-secret
static-auth-secret=YOUR_SUPER_SECRET_STATIC_AUTH_KEY # Change this to a strong, random string!

# User database file for TURN users: 'turnadmin' stores TURN user credentials here.
# Ensure this file is writable by the user running the coturn process.
# This is different from the admin panel's user database (data/users.json).
userdb=/var/lib/turn/turndb # Common location; adjust if needed.

# Log file location for Coturn server logs.
log-file=/var/log/turnserver.log

# Verbosity level (no-verbose, verbose, or use -v command line flag)
# verbose

# Optional: Specify user for coturn process if not running as root (recommended for security)
# proc-user=turnserver
# proc-group=turnserver

# Optional: For TLS (TURNS) with a valid SSL certificate
# cert=/etc/ssl/your_domain/fullchain.pem
# pkey=/etc/ssl/your_domain/privkey.pem
`;

const envLocalExample = `
# .env.local (in the root of this Next.js admin panel project)
# ============================================================

# REALM: This MUST match the 'realm' in /etc/turnserver.conf.
# It's used by 'turnadmin' commands (e.g., adding/listing TURN users).
REALM=your.domain.com

# USER_DB_PATH: Path to THIS ADMIN PANEL's user database file (JSON format).
# Relative to the project root. Contains credentials for logging into this admin panel.
# Example: data/users.json
USER_DB_PATH=data/users.json

# JWT_SECRET: Strong, random secret for signing/verifying admin panel authentication tokens.
# Generate with: openssl rand -hex 32
JWT_SECRET=your-very-strong-and-secret-jwt-key-for-admin-panel

# AUTH_COOKIE_NAME: Name for the admin panel's authentication cookie.
AUTH_COOKIE_NAME=admin-auth-token

# --- Optional Client-Side Variables (prefixed with NEXT_PUBLIC_) ---

# NEXT_PUBLIC_TURN_LOG_FILE: Display path for TURN server log file in the UI.
# Server-side API (/api/logs) uses TURN_LOG_FILE (see below).
NEXT_PUBLIC_TURN_LOG_FILE=/var/log/turnserver.log

# NEXT_PUBLIC_USER_DB_PATH_DISPLAY: Display path for ADMIN PANEL's user DB in UI.
# Server-side API (/api/login) uses USER_DB_PATH (see above).
NEXT_PUBLIC_USER_DB_PATH_DISPLAY=data/users.json

# NEXT_PUBLIC_ADMIN_EMAIL: Optional, for pre-filling email in login form (client-side only).
# NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# --- Optional Server-Side Variables (for API routes) ---

# TURN_LOG_FILE: Actual path for /api/logs to read TURN server logs (server-side).
# If same as NEXT_PUBLIC_TURN_LOG_FILE, you might only need one if your build process handles it.
# For clarity, define explicitly if different or for server-only access.
TURN_LOG_FILE=/var/log/turnserver.log

# API_KEY: Example for future Gemini API integration (not used by default).
# API_KEY=your_gemini_api_key
`;


export default function SetupPage() {
  const [coturnStatus, setCoturnStatus] = useState<CoturnStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCoturnCheck = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/coturn-check');
      const data: CoturnStatus = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
            toast({ variant: "destructive", title: "Authentication Error", description: data.message || "Session expired or unauthorized. Please log in again."});
            // Consider redirecting to login: router.push('/login');
        }
        throw new Error(data.message || 'Failed to check coturn status from API');
      }
      setCoturnStatus(data);
    } catch (error: any) {
      setCoturnStatus({ installed: false, message: `Error checking coturn status: ${error.message}` });
      if (!error.message.includes("Authentication Error")) { // Avoid double toast for auth errors
        toast({
          variant: "destructive",
          title: "Error Checking Coturn",
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCoturnCheck();
  }, [fetchCoturnCheck]);

  const renderInstallationSteps = () => (
    <Card className="rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <DownloadCloud className="mr-2 h-5 w-5 md:h-6 md:w-6 text-orange-500" /> Coturn Kurulumu (Ubuntu/Debian)
        </CardTitle>
        <CardDescription>
          Coturn (TURN Sunucusu) kurulu değil veya erişilebilir durumda değil gibi görünüyor. Kurulum ve yapılandırma için aşağıdaki adımları izleyin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2 text-slate-700">1. Coturn Kurulumu</h3>
          <p className="text-sm text-slate-600 mb-2">
            Paket yöneticisini kullanarak Coturn'u kurabilirsiniz:
          </p>
          <CodeBlock language="bash">
            {`sudo apt update
sudo apt install coturn`}
          </CodeBlock>
          <p className="text-sm text-slate-600 mt-2">
            En son sürüm için, kaynaktan derlemeyi veya resmi GitHub sürümlerini kontrol etmeyi düşünebilirsiniz:
            <a href="https://github.com/coturn/coturn/releases" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              Coturn GitHub Sürümleri
            </a>
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2 text-slate-700">2. Coturn Yapılandırması (<code className="text-base">/etc/turnserver.conf</code>)</h3>
          <p className="text-sm text-slate-600 mb-2">
            Coturn'un ana yapılandırma dosyasını (<code className="text-xs bg-slate-200 p-0.5 rounded-sm">/etc/turnserver.conf</code>) düzenleyin.
            Ubuntu/Debian'da, Coturn'u systemd servisi olarak başlatmak için <code className="text-xs bg-slate-200 p-0.5 rounded-sm">/etc/default/coturn</code> dosyasındaki <code className="text-xs bg-slate-200 p-0.5 rounded-sm">#TURNSERVER_ENABLED=1</code> satırının başındaki yorumu kaldırarak <code className="text-xs bg-slate-200 p-0.5 rounded-sm">TURNSERVER_ENABLED=1</code> yapmanız gerekebilir.
          </p>
          <CodeBlock language="bash">{`sudo nano /etc/default/coturn  # Uncomment TURNSERVER_ENABLED=1
sudo nano /etc/turnserver.conf`}</CodeBlock>
          <p className="text-sm text-slate-600 my-2">
            Aşağıda örnek bir <code className="text-xs bg-slate-200 p-0.5 rounded-sm">turnserver.conf</code> yapılandırması bulunmaktadır. Ayarları kendi sisteminize göre düzenleyin.
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600 hover:underline text-sm">
              Örnek <code className="text-xs text-blue-600 p-0.5 rounded-sm">turnserver.conf</code> göster
            </summary>
            <CodeBlock language="ini" className="mt-2">{turnserverConfExample}</CodeBlock>
          </details>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2 text-slate-700">3. Admin Paneli için <code className="text-lg mx-1">.env.local</code> Yapılandırması</h3>
          <p className="text-sm text-slate-600 mb-2">
            Bu Next.js admin paneli projesinin kök dizininde bir <code className="text-xs bg-slate-200 p-0.5 rounded-sm">.env.local</code> dosyası oluşturun (veya mevcutsa düzenleyin). Bu dosya, admin panelinin çalışması için gerekli ortam değişkenlerini içermelidir:
          </p>
           <details className="mt-2">
            <summary className="cursor-pointer text-blue-600 hover:underline text-sm">
              Örnek <code className="text-xs text-blue-600 p-0.5 rounded-sm">.env.local</code> içeriğini göster
            </summary>
            <CodeBlock language="ini" className="mt-2">{envLocalExample}</CodeBlock>
          </details>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2 text-slate-700 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-600" /> 4. Admin Paneli Kullanıcı Veritabanı (<code className="text-lg mx-1 break-all">{process.env.NEXT_PUBLIC_USER_DB_PATH_DISPLAY || 'data/users.json'}</code>)
          </h3>
          <p className="text-sm text-slate-600 mb-2">
            Admin paneline giriş yapmak için kullanılacak kullanıcı kimlik bilgilerini içeren bir JSON dosyası oluşturun. Bu dosyanın yolu <code className="text-xs bg-slate-200 p-0.5 rounded-sm">.env.local</code> dosyasındaki <code className="text-xs bg-slate-200 p-0.5 rounded-sm">USER_DB_PATH</code> değişkeni ile belirtilir.
            Proje kök dizininde <code className="text-xs bg-slate-200 p-0.5 rounded-sm">data</code> klasörünü ve içinde <code className="text-xs bg-slate-200 p-0.5 rounded-sm">users.json</code> dosyasını oluşturun:
          </p>
          <CodeBlock language="bash">{`mkdir -p data
nano data/users.json`}</CodeBlock>
          <p className="text-sm text-slate-600 my-2">
            <code className="text-xs bg-slate-200 p-0.5 rounded-sm">{process.env.NEXT_PUBLIC_USER_DB_PATH_DISPLAY || 'data/users.json'}</code> dosyasının içeriği aşağıdaki gibi bir JSON dizisi olmalıdır:
          </p>
           <CodeBlock language="json" className="mt-1">{`[
  {
    "email": "admin@example.com",
    "passwordHash": "yoursecurepassword", 
    "role": "admin"
  }
]`}
          </CodeBlock>
           <p className="text-xs text-red-600 mt-1">
            <strong>ÖNEMLİ GÜVENLİK NOTU:</strong> Yukarıdaki <code className="text-xs bg-red-100 p-0.5 rounded-sm">passwordHash</code> düz metindir. <strong>Üretim ortamlarında ASLA düz metin şifre kullanmayın.</strong> Gerçek bir uygulamada, şifreleri güvenli bir şekilde hash'lemek için <code className="text-xs bg-slate-200 p-0.5 rounded-sm">bcrypt</code> gibi bir kütüphane kullanmalı ve <code className="text-xs bg-slate-200 p-0.5 rounded-sm">/api/login</code> rotasında hash'lenmiş şifreyi doğrulamalısınız. Bu örnek, kurulum kolaylığı amacıyla düz metin kullanmaktadır.
           </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2 text-slate-700">5. Coturn Servisini Etkinleştirme ve Başlatma</h3>
          <p className="text-sm text-slate-600 mb-2">
            Yapılandırma dosyalarını kaydettikten sonra Coturn servisini etkinleştirin ve başlatın:
          </p>
          <CodeBlock language="bash">
            {`sudo systemctl enable coturn
sudo systemctl start coturn
sudo systemctl status coturn`}
          </CodeBlock>
        </div>

         <div>
            <h3 className="font-semibold text-lg mb-2 text-slate-700">6. Doğrulama</h3>
            <p className="text-sm text-slate-600 mb-2">
                Coturn kurulumu ve admin paneli yapılandırmasından sonra, bu sayfayı yenileyin. Coturn sürümüyle birlikte bir başarı mesajı görmelisiniz.
                TURN sunucunuzu <a href="https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Trickle ICE</a> gibi bir araçla da test edebilirsiniz (TURN kullanıcısı oluşturduktan sonra).
            </p>
            <Button onClick={fetchCoturnCheck} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin': ''}`} />
                Coturn Durumunu Yeniden Kontrol Et
            </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderInstalledStatus = () => (
    <Card className="rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <CheckCircle2 className="mr-2 h-5 w-5 md:h-6 md:w-6 text-green-500" /> Coturn Durumu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <span className="text-sm font-medium text-green-700">Durum:</span>
          <Badge variant="success" className="text-xs">Kurulu</Badge>
        </div>
        {coturnStatus?.version && (
          <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-sm font-medium text-slate-700">Versiyon:</span>
            <Badge variant="secondary" className="text-xs">{coturnStatus.version}</Badge>
          </div>
        )}
        {coturnStatus?.details && (
           <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-1">Detaylar:</p>
            <p className="text-xs text-slate-600">{coturnStatus.details}</p>
          </div>
        )}
        <p className="text-sm text-slate-600">
          Coturn kurulu ve erişilebilir görünüyor. Admin panelinin diğer sayfalarını kullanarak TURN kullanıcılarını ve servis durumunu yönetebilirsiniz.
        </p>
         <Button onClick={fetchCoturnCheck} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin': ''}`} />
            Coturn Durumunu Yeniden Kontrol Et
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <>
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center">
          <Settings className="mr-3 h-8 w-8 md:h-10 md:w-10 text-blue-600" /> Coturn Kurulum Rehberi
        </h1>
        <p className="text-lg text-slate-600 mt-1 md:mt-2">Coturn kurulumunu kontrol edin ve admin paneli için yapılandırma talimatlarını alın.</p>
      </header>

      <div className="max-w-3xl mx-auto">
        {isLoading && !coturnStatus ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="ml-4 text-slate-600 text-lg">Coturn durumu kontrol ediliyor...</p>
          </div>
        ) : coturnStatus?.installed ? (
          renderInstalledStatus()
        ) : (
          <>
            {renderInstallationSteps()}
            {coturnStatus && !coturnStatus.installed && coturnStatus.message && (
              <Card className="mt-6 rounded-xl shadow-lg bg-yellow-50 border-yellow-200">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg md:text-xl text-yellow-800">
                        <AlertCircle className="mr-2 h-5 w-5" /> Tespit Notu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-yellow-700">{coturnStatus.message}</p>
                    {coturnStatus.details && <p className="text-xs text-yellow-600 mt-1">Detaylar: {coturnStatus.details}</p>}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
