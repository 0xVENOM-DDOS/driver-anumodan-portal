"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { Download, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

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

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [recentDrivers, setRecentDrivers] = useState<Driver[]>([])

  // Form state
  const [formData, setFormData] = useState({
    driverName: "",
    dateOfBirth: "",
    validFrom: "",
    validUpto: "",
    vehicleNumber: "",
    licenseNumber: "",
    dlFetched: "",
    anumodanFetched: "",
  })

  const [files, setFiles] = useState({
    certificate: null as File | null,
    driverPhoto: null as File | null,
    licensePhoto: null as File | null,
  })

  const [previews, setPreviews] = useState({
    driverPhoto: "",
    licensePhoto: "",
  })

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminLoggedIn")
    if (adminAuth !== "true") {
      router.push("/admin/login")
      return
    }
    setIsAuthenticated(true)
    loadRecentDrivers()
  }, [router])

  const loadRecentDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("date_added", { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentDrivers(data || [])
    } catch (error) {
      console.error("Error loading recent drivers:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof typeof files) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles((prev) => ({ ...prev, [fileType]: file }))

      // Create preview for images
      if (fileType !== "certificate" && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => ({
            ...prev,
            [fileType]: e.target?.result as string,
          }))
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage.from("driver-documents").upload(filePath, file)

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("driver-documents").getPublicUrl(filePath)

    return { fileName: file.name, url: publicUrl, size: file.size }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      // Validate required fields
      if (!files.certificate) {
        throw new Error("Certificate file is required")
      }

      // Validate file types and sizes
      if (files.certificate.type !== "application/pdf") {
        throw new Error("Certificate must be a PDF file")
      }

      if (files.certificate.size > 10 * 1024 * 1024) {
        throw new Error("Certificate file must be less than 10MB")
      }

      if (
        files.driverPhoto &&
        (!files.driverPhoto.type.startsWith("image/") || files.driverPhoto.size > 5 * 1024 * 1024)
      ) {
        throw new Error("Driver photo must be an image file less than 5MB")
      }

      if (
        files.licensePhoto &&
        (!files.licensePhoto.type.startsWith("image/") || files.licensePhoto.size > 5 * 1024 * 1024)
      ) {
        throw new Error("License photo must be an image file less than 5MB")
      }

      // Upload files
      const certificateData = await uploadFile(files.certificate, "certificates")

      let driverPhotoData = null
      if (files.driverPhoto) {
        driverPhotoData = await uploadFile(files.driverPhoto, "driver-photos")
      }

      let licensePhotoData = null
      if (files.licensePhoto) {
        licensePhotoData = await uploadFile(files.licensePhoto, "license-photos")
      }

      // Insert driver record
      const { error: insertError } = await supabase.from("drivers").insert({
        driver_name: formData.driverName,
        date_of_birth: formData.dateOfBirth,
        valid_from: formData.validFrom,
        valid_upto: formData.validUpto,
        vehicle_number: formData.vehicleNumber.toUpperCase(),
        license_number: formData.licenseNumber.toUpperCase(),
        dl_fetched: formData.dlFetched === "yes",
        anumodan_fetched: formData.anumodanFetched === "yes",
        certificate_file: certificateData.fileName,
        certificate_url: certificateData.url,
        certificate_size: certificateData.size,
        driver_photo_file: driverPhotoData?.fileName || null,
        driver_photo_url: driverPhotoData?.url || null,
        driver_photo_size: driverPhotoData?.size || null,
        license_photo_file: licensePhotoData?.fileName || null,
        license_photo_url: licensePhotoData?.url || null,
        license_photo_size: licensePhotoData?.size || null,
      })

      if (insertError) throw insertError

      setMessage("Driver authorization added successfully!")
      setMessageType("success")

      // Reset form
      setFormData({
        driverName: "",
        dateOfBirth: "",
        validFrom: "",
        validUpto: "",
        vehicleNumber: "",
        licenseNumber: "",
        dlFetched: "",
        anumodanFetched: "",
      })
      setFiles({
        certificate: null,
        driverPhoto: null,
        licensePhoto: null,
      })
      setPreviews({
        driverPhoto: "",
        licensePhoto: "",
      })

      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>
      fileInputs.forEach((input) => (input.value = ""))

      loadRecentDrivers()
    } catch (error: any) {
      setMessage(error.message || "Error adding driver record")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn")
    router.push("/admin/login")
  }

  const exportData = async () => {
    try {
      const { data, error } = await supabase.from("drivers").select("*").order("date_added", { ascending: false })

      if (error) throw error

      const csvData = data.map((driver) => ({
        "Driver Name": driver.driver_name,
        "Date of Birth": driver.date_of_birth,
        "Vehicle Number": driver.vehicle_number,
        "License Number": driver.license_number,
        "Valid From": driver.valid_from,
        "Valid Up To": driver.valid_upto,
        "DL Fetched from Parivahan": driver.dl_fetched ? "Yes" : "No",
        "Anumodan Fetched DL": driver.anumodan_fetched ? "Yes" : "No",
        "Driver Photo": driver.driver_photo_file || "Not provided",
        "License Photo": driver.license_photo_file || "Not provided",
        "Certificate File": driver.certificate_file,
        "Date Added": new Date(driver.date_added).toLocaleDateString(),
      }))

      const csvContent = convertToCSV(csvData)
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `driver_records_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert("Error exporting data")
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ]
    return csvRows.join("\n")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>
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
            <nav className="flex items-center gap-4">
              <a href="/" className="px-4 py-2 hover:bg-white/20 rounded transition-colors">
                Search
              </a>
              <span className="px-4 py-2 bg-white/20 rounded">Admin Dashboard</span>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Durga Logistics - Admin Dashboard</h2>
          <p className="text-gray-600">Manage driver authorizations and certificates</p>
        </div>

        {/* Data Management Tools */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Management Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Records (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Driver Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Driver Authorization</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="driverName">Driver Name *</Label>
                      <Input
                        id="driverName"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validFrom">Valid From *</Label>
                      <Input
                        id="validFrom"
                        name="validFrom"
                        type="date"
                        value={formData.validFrom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="validUpto">Valid Up To *</Label>
                      <Input
                        id="validUpto"
                        name="validUpto"
                        type="date"
                        value={formData.validUpto}
                        onChange={handleInputChange}
                        min={formData.validFrom}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                      <Input
                        id="vehicleNumber"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., ABC-1234"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., DL123456789"
                        required
                      />
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-4">Verification Status</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium">DL Fetched from Parivahan:</Label>
                        <RadioGroup
                          value={formData.dlFetched}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, dlFetched: value }))}
                          className="flex gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="dl-yes" />
                            <Label htmlFor="dl-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="dl-no" />
                            <Label htmlFor="dl-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Anumodan Fetched DL:</Label>
                        <RadioGroup
                          value={formData.anumodanFetched}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, anumodanFetched: value }))}
                          className="flex gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="anumodan-yes" />
                            <Label htmlFor="anumodan-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="anumodan-no" />
                            <Label htmlFor="anumodan-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  {/* Photo Documentation */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Photo Documentation (Optional)</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload photos for future reference when generating Anumodan for unverified licenses
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="driverPhoto">Driver's Photo</Label>
                        <Input
                          id="driverPhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "driverPhoto")}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (max 5MB)</p>
                        {previews.driverPhoto && (
                          <img
                            src={previews.driverPhoto || "/placeholder.svg"}
                            alt="Driver Preview"
                            className="mt-2 w-32 h-24 object-cover rounded border"
                          />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="licensePhoto">License Photo</Label>
                        <Input
                          id="licensePhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "licensePhoto")}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (max 5MB)</p>
                        {previews.licensePhoto && (
                          <img
                            src={previews.licensePhoto || "/placeholder.svg"}
                            alt="License Preview"
                            className="mt-2 w-32 h-24 object-cover rounded border"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Certificate Upload */}
                  <div>
                    <Label htmlFor="certificate">Upload Certificate (PDF) *</Label>
                    <Input
                      id="certificate"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "certificate")}
                      required
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Please upload a PDF certificate file (max 10MB)</p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                    {loading ? "Adding..." : "Add Driver Authorization"}
                  </Button>
                </form>

                {message && (
                  <Alert
                    className={`mt-4 ${messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    <AlertDescription className={messageType === "success" ? "text-green-700" : "text-red-700"}>
                      {message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Records */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Authorizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentDrivers.map((driver) => (
                    <div key={driver.id} className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-semibold">{driver.driver_name}</h4>
                      <p className="text-sm text-gray-600">
                        <strong>Vehicle:</strong> {driver.vehicle_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>License:</strong> {driver.license_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Valid Until:</strong> {formatDate(driver.valid_upto)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={driver.dl_fetched ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          DL: {driver.dl_fetched ? "Yes" : "No"}
                        </Badge>
                        <Badge
                          className={
                            driver.anumodan_fetched ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          Anumodan: {driver.anumodan_fetched ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {recentDrivers.length === 0 && <p className="text-gray-500 text-center">No records found</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Driver Authority Portal</h3>
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
            <p>&copy; 2025 Driver Authority Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
