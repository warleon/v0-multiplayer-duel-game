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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
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
            <CardTitle className="text-2xl font-bold text-white">Battle Arena</CardTitle>
            <CardDescription className="text-purple-200">Enter the arena and prove your worth</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                {isLoading ? "Entering Arena..." : "Enter Arena"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-purple-200 text-sm">
                New warrior?{" "}
                <Link
                  href="/auth/signup"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
                >
                  Join the battle
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
