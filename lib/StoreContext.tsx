"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { BackendlessService, StoreInfo } from "@/lib/backendless"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

interface StoreContextType {
  storeInfo: StoreInfo | null
  loading: boolean
  refreshStoreInfo: () => Promise<void>
  updateStoreInfo: (data: Partial<StoreInfo>) => Promise<void>
  toggleStoreStatus: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshStoreInfo = async () => {
    if (!user) {
      setStoreInfo(null)
      setLoading(false)
      return
    }

    try {
      const merchantId = user.merchantId || `merchant_${user.objectId}`
      const info = await BackendlessService.getStoreInfo(merchantId)
      setStoreInfo(info)
    } catch (error) {
      console.error("Failed to fetch store info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStoreInfo()
  }, [user])

  const updateStoreInfo = async (data: Partial<StoreInfo>) => {
    if (!storeInfo?.objectId) return

    try {
      const updated = await BackendlessService.updateStoreInfo(storeInfo.objectId, data)
      setStoreInfo(updated)
      toast({
        title: "Success",
        description: "Store information updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update store info:", error)
      toast({
        title: "Error",
        description: "Failed to update store information.",
        variant: "destructive",
      })
      throw error
    }
  }

  const toggleStoreStatus = async () => {
    console.log("toggleStoreStatus called", { storeInfo })
    
    let currentStoreInfo = storeInfo
    
    // If storeInfo is missing, try to fetch it if we have a user
    if (!currentStoreInfo?.objectId && user) {
      try {
        const merchantId = user.merchantId || `merchant_${user.objectId}`
        console.log("Fetching store info before toggle...")
        currentStoreInfo = await BackendlessService.getStoreInfo(merchantId)
        setStoreInfo(currentStoreInfo)
      } catch (e) {
        console.error("Failed to fetch store info in toggle:", e)
      }
    }

    if (!currentStoreInfo?.objectId) {
      console.error("Cannot toggle store status: storeInfo or objectId is missing")
      toast({
        title: "Error",
        description: "Store information not found. Please refresh the page.",
        variant: "destructive",
      })
      return
    }

    const newStatus = !currentStoreInfo.storeOpen
    console.log("Toggling store status to:", newStatus)
    
    // Optimistic update
    setStoreInfo((prev: StoreInfo | null) => prev ? { ...prev, storeOpen: newStatus } : null)

    try {
      const updated = await BackendlessService.updateStoreInfo(currentStoreInfo.objectId, {
        storeOpen: newStatus
      })
      console.log("Store status updated successfully:", updated)
      setStoreInfo(updated)
      toast({
        title: newStatus ? "Store Opened" : "Store Closed",
        description: newStatus ? "Your store is now accepting orders." : "Your store is now closed.",
      })
    } catch (error) {
      console.error("Failed to toggle store status:", error)
      // Revert
      setStoreInfo((prev: StoreInfo | null) => prev ? { ...prev, storeOpen: !newStatus } : null)
      toast({
        title: "Error",
        description: "Failed to update store status.",
        variant: "destructive",
      })
    }
  }

  return (
    <StoreContext.Provider value={{ storeInfo, loading, refreshStoreInfo, updateStoreInfo, toggleStoreStatus }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
