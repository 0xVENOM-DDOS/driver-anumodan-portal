"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Search, Lock, Download, Eye, Calendar, Car, FileText, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Driver {
  id: string
  driver_name: string
  date_of_birth: string
  valid_from: string
  valid_upto: string
  vehicle_number: string
  license_number: string
  dl_fetched: boolean
  anumodan_fetched: boolean
  certificate_file: string
  certificate_url: string
  certificate_size: number
  driver_photo_file?: string
  driver_photo_url?: string
  driver_photo_size?: number
  license_photo_file?: string
  license_photo_url?: string
  license_photo_size?: number
  date_added: string
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState("")

  useEffect(() => {
    const savedAuth = localStorage.getItem("searchLoggedIn")
    const savedUser = localStorage.getItem("currentSearchUser")
    if (savedAuth === "true" && savedUser) {
      setIsAuthenticated(true)
      setCurrentUser(savedUser)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Simple authentication (in production, use proper auth)
    const validCredentials = {
      search: "search123",
      admin: "admin123",
    }

    if (validCredentials[username as keyof typeof validCredentials] === password) {
      setIsAuthenticated(true)
      setCurrentUser(username)
      localStorage.setItem("searchLoggedIn", "true")
      localStorage.setItem("currentSearchUser", username)
    } else {
      setError("Invalid credentials. Access denied.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser("")
    localStorage.removeItem("searchLoggedIn")
    localStorage.removeItem("currentSearchUser")
    setSearchResults([])
    setSearchTerm("")
  }

  const searchDrivers = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data, error: searchError } = await supabase
        .from("drivers")
        .select("*")
        .or(`driver_name.ilike.%${searchTerm}%,vehicle_number.ilike.%${searchTerm}%`)
        .order("date_added", { ascending: false })

      if (searchError) throw searchError

      setSearchResults(data || [])
    } catch (err) {
      setError("Error searching drivers. Please try again.")
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async (driver: Driver) => {
    try {
      if (!driver.certificate_url) {
        alert("Certificate file not available")
        return
      }

      const response = await fetch(driver.certificate_url)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = driver.certificate_file || "certificate.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert("Error downloading certificate")
      console.error("Download error:", error)
    }
  }

  const viewCertificate = (driver: Driver) => {
    if (driver.certificate_url) {
      window.open(driver.certificate_url, "_blank")
    } else {
      alert("Certificate not available for viewing")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Security Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Lock className="w-4 h-4" />
              <span>
                <strong>Secure Access:</strong> Login required to access driver verification system.
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/placeholder.svg?height=45&width=45"
                  alt="Durga Logistics Logo"
                  className="w-11 h-11 rounded"
                />
                <h1 className="text-xl font-semibold">Durga Logistics</h1>
              </div>
              <nav className="flex gap-4">
                <span className="px-4 py-2 bg-white/20 rounded">Secure Search</span>
                <a href="/admin" className="px-4 py-2 hover:bg-white/20 rounded transition-colors">
                  Admin
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-md border-2 border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Lock className="w-6 h-6" />
                  Secure Access Required
                </CardTitle>
                <p className="text-gray-600">Please login to access the driver verification system</p>
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
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Access Search System
                  </Button>
                </form>

                {error && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900">Authorized Personnel Only</p>
                  <p className="text-blue-700 text-sm">Contact administrator for access credentials</p>
                </div>
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
                <p className="text-gray-300">Secure Driver Authorization Portal</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Developer</h4>
                <p className="text-gray-300">
                  <strong>Adarsh Kumar Singh</strong>
                </p>
                <p className="text-gray-300">Email: adarshsingh7089@gmail.com</p>
                <p className="text-gray-300">Phone: +918617204176</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Security Notice</h4>
                <p className="text-gray-300 text-sm">
                  <strong>🔒 Secure System:</strong> All access is logged and monitored.
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Authorized Use Only:</strong> Unauthorized access is prohibited.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-400">
              <p>&copy; 2025 Durga Logistics. Developed by Adarsh Kumar Singh. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Security Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            <span>
              <strong>Secure Access:</strong> Authenticated session active.
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/placeholder.svg?height=45&width=45" alt="Durga Logistics Logo" className="w-11 h-11 rounded" />
              <h1 className="text-xl font-semibold">Durga Logistics</h1>
            </div>
            <nav className="flex items-center gap-4">
              <span className="px-4 py-2 bg-white/20 rounded">Secure Search</span>
              <a href="/admin" className="px-4 py-2 hover:bg-white/20 rounded transition-colors">
                Admin
              </a>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="border-2 border-green-200 mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Search className="w-6 h-6" />
              Secure Driver Verification
            </CardTitle>
            <p className="text-gray-600">Search for authorized drivers by vehicle number or driver name</p>
            <Badge className="bg-green-100 text-green-800 w-fit mx-auto">Logged in as: {currentUser}</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Enter vehicle number or driver name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchDrivers()}
                className="flex-1"
              />
              <Button onClick={searchDrivers} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-6">
            {searchResults.map((driver) => {
              const isValid = new Date(driver.valid_upto) >= new Date()

              return (
                <Card key={driver.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{driver.driver_name}</CardTitle>
                      <Badge className={isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {isValid ? "Valid" : "Expired"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Driver Details */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">{formatDate(driver.date_of_birth)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Vehicle Number</p>
                          <p className="font-medium">{driver.vehicle_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">License Number</p>
                          <p className="font-medium">{driver.license_number}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valid From</p>
                        <p className="font-medium">{formatDate(driver.valid_from)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valid Up To</p>
                        <p className="font-medium">{formatDate(driver.valid_upto)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Certificate</p>
                        <p className="font-medium text-sm">
                          {driver.certificate_file} ({formatFileSize(driver.certificate_size)})
                        </p>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Verification Status</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          {driver.dl_fetched ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={driver.dl_fetched ? "text-green-700" : "text-red-700"}>
                            DL Fetched from Parivahan: {driver.dl_fetched ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {driver.anumodan_fetched ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={driver.anumodan_fetched ? "text-green-700" : "text-red-700"}>
                            Anumodan Fetched DL: {driver.anumodan_fetched ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Photo Gallery */}
                    {(driver.driver_photo_url || driver.license_photo_url) && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Photo Documentation</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Driver Photo</h5>
                            {driver.driver_photo_url ? (
                              <img
                                src={driver.driver_photo_url || "/placeholder.svg"}
                                alt="Driver Photo"
                                className="w-32 h-24 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(driver.driver_photo_url, "_blank")}
                              />
                            ) : (
                              <div className="w-32 h-24 bg-gray-200 rounded border flex items-center justify-center text-gray-500 text-xs">
                                No Photo Available
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">License Photo</h5>
                            {driver.license_photo_url ? (
                              <img
                                src={driver.license_photo_url || "/placeholder.svg"}
                                alt="License Photo"
                                className="w-32 h-24 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(driver.license_photo_url, "_blank")}
                              />
                            ) : (
                              <div className="w-32 h-24 bg-gray-200 rounded border flex items-center justify-center text-gray-500 text-xs">
                                No Photo Available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => downloadCertificate(driver)} className="bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </Button>
                      <Button onClick={() => viewCertificate(driver)} variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {searchResults.length === 0 && searchTerm && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No results found for your search</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Durga Logistics</h3>
              <p className="text-gray-300">Secure Driver Authorization Portal</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Developer</h4>
              <p className="text-gray-300">
                <strong>Adarsh Kumar Singh</strong>
              </p>
              <p className="text-gray-300">Email: adarshsingh7089@gmail.com</p>
              <p className="text-gray-300">Phone: +918617204176</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Security Notice</h4>
              <p className="text-gray-300 text-sm">
                <strong>🔒 Secure System:</strong> All access is logged and monitored.
              </p>
              <p className="text-gray-300 text-sm">
                <strong>Authorized Use Only:</strong> Unauthorized access is prohibited.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-400">
            <p>&copy; 2025 Durga Logistics. Developed by Adarsh Kumar Singh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
