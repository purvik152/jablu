/*
* =================================================================================================
* FILE: src/components/custom/SignupPageComponent.tsx
*
* This is the signup form, refactored into a reusable component.
* =================================================================================================
*/
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function FormMessage({ type, message }: { type: 'error' | 'success', message: string }) {
  if (!message) return null;
  const color = type === 'error' ? 'text-red-600' : 'text-green-600';
  return <p className={`text-sm font-medium ${color}`}>{message}</p>;
}

export function SignupPageComponent() {
  const router = useRouter();
  const [role, setRole] = useState("shopkeeper");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      
      // After signup, automatically log the user in
      const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
      });
      const loginData = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginData.message || "Auto-login failed.");

      if (role === "seller") {
        router.push("/dashboard/seller");
      } else {
        router.push("/dashboard/shopkeeper");
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
        <CardTitle className="text-xl">Create an Account</CardTitle>
        <CardDescription>Enter your information to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label htmlFor="first-name">First name</Label><Input id="first-name" name="first-name" placeholder="Max" className=" bg-[#FDFBF4]" required /></div>
              <div className="grid gap-2"><Label htmlFor="last-name">Last name</Label><Input id="last-name" name="last-name" placeholder="Robinson" className=" bg-[#FDFBF4]" required /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" className=" bg-[#FDFBF4]" required /></div>
            <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" className=" bg-[#FDFBF4]"required /></div>
            <div className="grid gap-2">
              <Label htmlFor="role">I am a...</Label>
              <Select onValueChange={setRole} defaultValue={role}>
                <SelectTrigger className=" bg-[#FDFBF4]"><SelectValue placeholder="Select your role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="shopkeeper">Shopkeeper</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <FormMessage type="error" message={error} />}
            <Button type="submit" className="w-full bg-[#BEA093] hover:bg-[#FBF3E5] hover:text-[#BEA093]" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create an account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
