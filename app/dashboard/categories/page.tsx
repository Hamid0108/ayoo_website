"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Tags } from "lucide-react"
import { DashboardLayout as DashboardLayoutBase } from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/useAuth"
import { BackendlessService, type Category } from "@/lib/backendless"
import { ProtectedRoute as AuthGuard } from "@/components/protected-route"

interface CategoryFormData {
  name: string
  description: string
  enabled: boolean
}

const DashboardLayout = DashboardLayoutBase as any

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Organize your products into categories for better management</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
