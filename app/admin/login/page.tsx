"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simple authentication (in production, use proper auth)
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("adminLoggedIn", "true")
      router.push("/admin")
    } else {
      setError("Invalid username or password")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/placeholder.svg?height=45&width=45" alt="Durga Logistics Logo" className="w-11 h-11 rounded" />
              <h1 className="text-xl font-semibold">Durga Logistics</h1>
            </div>
            <nav className="flex gap-4">
              <a href="/" className="px-4 py-2 hover:bg-white/20 rounded transition-colors">
                Search
              </a>
              <span className="px-4 py-2 bg-white/20 rounded">Admin</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Card className="w-full max-width-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Lock className="w-6 h-6" />
                Admin Login
              </CardTitle>
              <p className="text-gray-600">Access the administrative dashboard</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>

              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Durga Logistics</h3>
              <p className="text-gray-300">Secure verification system for authorized drivers and vehicles.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-1">
                <li>
                  <a href="/" className="text-gray-300 hover:text-blue-400">
                    Search Drivers
                  </a>
                </li>
                <li>
                  <a href="/admin/login" className="text-gray-300 hover:text-blue-400">
                    Admin Login
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-gray-300">Email: adarshsingh7089@gmail.com</p>
              <p className="text-gray-300">Phone: +918617204176</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-400">
            <p>&copy; 2025 Durga Logistics. Developed by Gemini Security Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
