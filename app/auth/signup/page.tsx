"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            username,
            display_name: displayName || username,
          },
        },
      })
      if (error) throw error
      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Join the Arena</CardTitle>
            <CardDescription className="text-purple-200">Create your warrior profile and start dueling</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-purple-100">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="shadowwarrior"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-purple-100">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Shadow Warrior"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-100">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="warrior@arena.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-100">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/30">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Creating Warrior..." : "Create Warrior"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-purple-200 text-sm">
                Already a warrior?{" "}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
                  Enter the arena
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
