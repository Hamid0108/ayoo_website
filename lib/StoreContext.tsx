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
    if (!storeInfo?.objectId) return

    const newStatus = !storeInfo.storeOpen
    
    // Optimistic update
    setStoreInfo((prev: StoreInfo | null) => prev ? { ...prev, storeOpen: newStatus } : null)

    try {
      const updated = await BackendlessService.updateStoreInfo(storeInfo.objectId, {
        storeOpen: newStatus
      })
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
