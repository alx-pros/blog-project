"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import Footer from "@/components/web/Footer";

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const user = useQuery(api.auth.getCurrentUser);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully");
            router.push("/");
          },
          onError: (error) => {
            toast.error(error?.error?.message || "Failed to logout");
          },
        },
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast.error("Please enter your password to delete your account");
      return;
    }

    if (!confirm("Are you absolutely sure? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete account
      await authClient.deleteUser({
        password,
      });
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col w-full pt-20 max-w-3xl mx-auto px-4">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-extrabold text-primary">Account Settings</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="size-4 mr-2" />
                Logout
              </>
            )}
          </Button>
        </div>

        {/* Email & Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" value={user?.email || ""} disabled className="bg-white dark:bg-black" />
              <p className="text-xs text-paragraph">Your registered email address</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input type="text" value={user?.name || ""} disabled className="bg-white dark:bg-black" />
              <p className="text-xs text-paragraph">Your display name on the platform</p>
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="border-[#DA2E34] dark:border-[#D93036]">
          <CardHeader>
            <CardTitle className="text-[#DA2E34] dark:text-[#D93036]">Delete Account</CardTitle>
            <CardDescription>
              This action is permanent. All your posts and comments will be deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Enter your password to delete account
                </label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isDeleting}
                  className="bg-white dark:bg-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-paragraph"
                  disabled={isDeleting}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || !password.trim()}
              className="w-full cursor-pointer hover:bg-[#AE2A2E] bg-[#DA2E34] dark:hover:bg-[#FF6166] dark:bg-[#D93036]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </CardContent>
        </Card>

        <Footer />
      </div>
    </div>
  );
}
