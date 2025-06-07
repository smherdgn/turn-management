
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Not explicitly used with FormField
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';

const loginFormSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi girin." }),
  password: z.string().min(1, { message: "Şifre boş olamaz." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="mt-4 text-slate-600 text-lg">{message}</p>
  </div>
);

export default function LoginPage() {
  // Redirect to /status if already authenticated
  const { isLoading: isCheckingAuth } = useRedirectIfAuthenticated('/status'); 
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "", // Example: "admin@turnpanel.local"
      password: "", 
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Giriş Başarılı",
          description: responseData.message || "Yönetim paneline yönlendiriliyorsunuz...",
          variant: "default",
        });
        router.push('/status'); // Redirect to /status or another default admin page
        // router.refresh(); // Not always needed, depends on how auth state is propagated
      } else {
        toast({
          variant: "destructive",
          title: "Giriş Başarısız",
          description: responseData.message || "E-posta veya şifre hatalı.",
        });
      }
    } catch (error) {
      console.error("Login request failed:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Giriş sırasında bir ağ hatası veya sunucu hatası oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingAuth) {
    return <LoadingScreen message="Kimlik durumu kontrol ediliyor..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-slate-800 flex items-center justify-center">
            <LogIn className="mr-3 h-8 w-8 text-blue-600" /> Yönetici Girişi
          </CardTitle>
          <CardDescription className="text-slate-600 pt-1">
            Devam etmek için lütfen giriş yapın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">E-posta</FormLabel>
                    <FormControl>
                      <Input id="email" type="email" placeholder="admin@example.com" {...field} aria-label="Email"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Şifre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                          aria-label="Password"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500 hover:text-slate-700"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                Giriş Yap
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="text-center text-xs text-slate-500">
            <p>Erişim için yönetici kimlik bilgilerinizi kullanın.</p>
            <p className="mt-1 text-red-600"><strong>Not:</strong> Demo için şifreler düz metin olarak saklanmaktadır. Gerçekte bcrypt kullanılmalıdır.</p>
          </CardFooter>
      </Card>
    </div>
  );
}
