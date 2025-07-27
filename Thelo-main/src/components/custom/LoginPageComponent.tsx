/*
* =================================================================================================
* FILE: src/components/custom/LoginPageComponent.tsx
*
* This is the login form, refactored into a reusable component.
* =================================================================================================
*/
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FormMessage({ type, message }: { type: 'error' | 'success', message: string }) {
  if (!message) return null;
  const color = type === 'error' ? 'text-red-600' : 'text-green-600';
  return <p className={`text-sm font-medium ${color}`}>{message}</p>;
}

export function LoginPageComponent() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed.");
      
      if (data.user.role === 'seller') {
        router.push('/dashboard/seller');
      } else {
        router.push('/dashboard/shopkeeper');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" className=" bg-[#FDFBF4]" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" className=" bg-[#FDFBF4]" required />
            </div>
            {error && <FormMessage type="error" message={error} />}
            <Button type="submit" className="w-full bg-[#BEA093] hover:bg-[#FBF3E5] hover:text-[#BEA093]" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
