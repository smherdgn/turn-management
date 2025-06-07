
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
// Toaster'ı AdminLayout'a taşıdık, buradan kaldırıyoruz.
// import { Toaster } from "@/components/ui/toaster"; 
import { UserPlus, Trash2, Users, Loader2, Eye, EyeOff } from "lucide-react";

interface User {
  username: string;
  realm: string;
}

const addUserFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }).max(50),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).max(100),
});

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof addUserFormSchema>>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function onSubmit(values: z.infer<typeof addUserFormSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add user');
      }
      toast({
        title: "Success",
        description: responseData.message,
      });
      form.reset(); 
      setShowPassword(false);
      fetchUsers(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding user",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete user '${username}'?`)) {
      return;
    }
    setDeletingUser(username);
    try {
      // Updated to use path parameter for username
      const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete user');
      }
      toast({
        title: "Success",
        description: responseData.message,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: error.message,
      });
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    // Min-h-screen ve p-4 gibi genel sayfa yapılandırmaları AdminLayout'tan gelecek
    // <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
    <>
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">TURN Kullanıcı Yönetimi</h1>
        <p className="text-lg text-slate-600 mt-1 md:mt-2">TURN sunucunuz için kullanıcıları yönetin.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> {/* max-w-6xl mx-auto AdminLayout'tan gelebilir */}
        <Card className="lg:col-span-1 rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl md:text-2xl">
              <UserPlus className="mr-2 h-5 w-5 md:h-6 md:w-6 text-blue-600" /> Yeni Kullanıcı Ekle
            </CardTitle>
            <CardDescription>Yeni bir TURN kullanıcısı eklemek için kullanıcı adı ve şifre girin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="ör. testuser" {...field} aria-label="Username"/>
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
                      <FormLabel>Şifre</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 6 karakter" 
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
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Kullanıcı Ekle
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl md:text-2xl">
              <Users className="mr-2 h-5 w-5 md:h-6 md:w-6 text-blue-600" /> Mevcut Kullanıcılar
            </CardTitle>
            <CardDescription>Realm <strong className="text-slate-700">{users[0]?.realm || 'N/A'}</strong> için mevcut TURN kullanıcıları listesi.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-3 text-slate-600">Kullanıcılar yükleniyor...</p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Kullanıcı bulunamadı.</p>
            ) : (
              <div className="overflow-x-auto">
                <ul className="space-y-3 min-w-[400px]">
                  {users.map((user) => (
                    <li
                      key={user.username}
                      className="flex items-center justify-between p-3 bg-slate-100 rounded-lg hover:bg-slate-200/70 transition-colors"
                    >
                      <div>
                        <span className="font-medium text-slate-800">{user.username}</span>
                        <p className="text-sm text-slate-500">Realm: {user.realm}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.username)}
                        disabled={deletingUser === user.username}
                        aria-label={`Delete user ${user.username}`}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        {deletingUser === user.username ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* <Toaster /> // AdminLayout'a taşındı */}
      {/* Footer AdminLayout'tan gelecek */}
    </>
    // </div>
  );
}
