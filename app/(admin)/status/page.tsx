
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, StopCircle, RefreshCcw, Terminal, Loader2, ServerCrash, CheckCircle2, HelpCircle, Power } from "lucide-react";

type ServiceStatus = "active" | "inactive" | "failed" | "activating" | "deactivating" | "unknown" | "";
type ControlAction = "start" | "stop" | "restart";

interface ApiResponse {
  success: boolean;
  output: string;
  message?: string; // For backward compatibility or general messages
  error?: string; // Specific error message from API
}

export default function StatusPage() {
  const [status, setStatus] = useState<ServiceStatus>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isControlling, setIsControlling] = useState<ControlAction | null>(null);
  const { toast } = useToast();

  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch('/api/status');
      const data: ApiResponse = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || data.output || 'Failed to fetch status');
      }
      // Assuming data.output contains the status string like "active", "inactive"
      setStatus(data.output as ServiceStatus);
    } catch (error: any) {
      setStatus("unknown");
      toast({
        variant: "destructive",
        title: "Error fetching status",
        description: error.message,
      });
    } finally {
      setIsLoadingStatus(false);
    }
  }, [toast]);

  const fetchLogs = useCallback(async (showToastOnError = true) => {
    setIsLoadingLogs(true);
    try {
      const response = await fetch('/api/logs');
      const data = await response.json(); // Assuming /api/logs returns { logs: [] } or error structure
      if (!response.ok) {
         const errorMsg = data.message || data.error || (data.logs && Array.isArray(data.logs) && data.logs.length > 0 ? data.logs[0] : 'Failed to fetch logs');
        if (showToastOnError) {
            throw new Error(errorMsg);
        } else {
             if (!logs.some(log => log.startsWith("Error:"))) {
                setLogs(prevLogs => [`Error fetching logs (auto-refresh): \${errorMsg}`, ...prevLogs.slice(0,49)]);
             }
             console.warn("Auto-refresh logs failed:", errorMsg);
        }
        return; 
      }
      setLogs(data.logs || []);
    } catch (error: any) {
      if (showToastOnError) {
        toast({
          variant: "destructive",
          title: "Error fetching logs",
          description: error.message,
        });
      }
      if (!logs.some(log => log.startsWith("Error:"))) {
         setLogs(prevLogs => [`Error fetching logs: \${error.message}`, ...prevLogs.slice(0,49)]);
      }
    } finally {
      setIsLoadingLogs(false);
    }
  }, [toast, logs]); 

  useEffect(() => {
    fetchStatus();
    fetchLogs(false); 

    const logInterval = setInterval(() => {
      fetchLogs(false); 
    }, 10000); // Log refresh interval: 10 saniye

    return () => {
      clearInterval(logInterval); 
    };
  }, [fetchStatus, fetchLogs]);

  const handleControlAction = async (action: ControlAction) => {
    setIsControlling(action);
    let apiPath = '';
    switch(action) {
      case 'start': apiPath = '/api/start'; break;
      case 'stop': apiPath = '/api/stop'; break;
      case 'restart': apiPath = '/api/restart'; break;
      default:
        toast({ variant: "destructive", title: "Invalid Action", description: "Unknown control action." });
        setIsControlling(null);
        return;
    }

    try {
      const response = await fetch(apiPath, {
        method: 'POST',
        // No body needed for these specific POST requests as action is in URL/endpoint itself
        // headers: { 'Content-Type': 'application/json' }, // Not strictly needed without a body
      });
      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) { // Check for non-ok HTTP status or success:false in payload
        throw new Error(data.error || data.output || `Failed to \${action} service`);
      }
      toast({
        title: "Success",
        description: data.output || `Service \${action} command sent.`,
      });
      // Refresh status and logs after a short delay to allow service to update
      setTimeout(fetchStatus, 1500); 
      setTimeout(() => fetchLogs(false), 2000); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Error \${action}ing service`,
        description: error.message,
      });
    } finally {
      setIsControlling(null);
    }
  };

  const getStatusBadge = () => {
    if (isLoadingStatus) {
      return <Badge variant="secondary" className="animate-pulse text-xs">Yükleniyor...</Badge>;
    }
    switch (status) {
      case "active":
        return <Badge variant="success" className="text-xs"><CheckCircle2 className="mr-1 h-3 w-3" /> Aktif</Badge>;
      case "inactive":
        return <Badge variant="destructive" className="text-xs"><Power className="mr-1 h-3 w-3" /> Pasif</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-xs"><ServerCrash className="mr-1 h-3 w-3" /> Başarısız</Badge>;
      case "activating":
        return <Badge variant="warning" className="text-xs"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Aktifleşiyor</Badge>;
      case "deactivating":
        return <Badge variant="warning" className="text-xs"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Pasifleşiyor</Badge>;
      default:
        return <Badge variant="outline" className="text-xs"><HelpCircle className="mr-1 h-3 w-3" /> Bilinmiyor (`\${status}`)</Badge>;
    }
  };
  
  const controlButtons: { action: ControlAction; label: string; icon: React.ElementType; variant: "default" | "destructive" | "secondary" }[] = [
    { action: "start", label: "Başlat", icon: Play, variant: "default" },
    { action: "stop", label: "Durdur", icon: StopCircle, variant: "destructive" },
    { action: "restart", label: "Yeniden Başlat", icon: RefreshCcw, variant: "secondary" },
  ];

  return (
    <>
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Servis Durumu</h1>
        <p className="text-lg text-slate-600 mt-1 md:mt-2">Coturn TURN sunucunuzu izleyin ve kontrol edin.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl md:text-2xl">
              <Power className="mr-2 h-5 w-5 md:h-6 md:w-6 text-blue-600" /> Coturn Servisi
            </CardTitle>
            <CardDescription>Mevcut durum ve kontrol eylemleri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Durum:</span>
              {getStatusBadge()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {controlButtons.map(({action, label, icon: Icon, variant}) => (
                <Button
                  key={action}
                  onClick={() => handleControlAction(action)}
                  disabled={isLoadingStatus || isControlling !== null || (action === 'start' && status === 'active') || (action === 'stop' && (status === 'inactive' || status === 'failed' || status === ''))}
                  variant={variant}
                  size="sm"
                  className="w-full"
                  aria-label={`\${label} coturn service`}
                >
                  {isControlling === action ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="mr-2 h-4 w-4" />
                  )}
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
           <CardFooter>
             <Button variant="outline" size="sm" onClick={() => { fetchStatus(); fetchLogs(true);}} className="w-full" disabled={isLoadingStatus || isLoadingLogs || isControlling !== null}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Tümünü Yenile
             </Button>
           </CardFooter>
        </Card>

        <Card className="lg:col-span-2 rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl md:text-2xl">
              <Terminal className="mr-2 h-5 w-5 md:h-6 md:w-6 text-blue-600" /> Servis Logları
            </CardTitle>
            <CardDescription>
              <code className="text-xs bg-slate-200 p-0.5 rounded-sm">{process.env.NEXT_PUBLIC_TURN_LOG_FILE || "/var/log/turnserver.log"}</code> dosyasından son 50 satır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLogs && logs.length === 0 ? (
              <div className="flex items-center justify-center h-80" aria-live="polite">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-3 text-slate-600">Loglar yükleniyor...</p>
              </div>
            ) : (
              <div 
                className="h-80 overflow-y-auto bg-slate-900 text-slate-200 p-3 md:p-4 rounded-md text-xs font-mono scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800"
                role="log"
                aria-live="polite"
                aria-atomic="false" 
                aria-relevant="additions text"
              >
                {logs.length > 0 ? logs.map((line, index) => (
                  <div key={index} className={`whitespace-pre-wrap \${line.toLowerCase().includes("error") ? "text-red-400" : line.toLowerCase().includes("warn") || line.toLowerCase().includes("warning") ? "text-yellow-400" : ""}`}>{line}</div>
                )) : <p className="text-slate-400">Görüntülenecek log yok veya loglar boş.</p>}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => fetchLogs(true)} className="w-full" disabled={isLoadingLogs || isControlling !== null}>
              {isLoadingLogs && !logs.length ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Logları Yenile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
