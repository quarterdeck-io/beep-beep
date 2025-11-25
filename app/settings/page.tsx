"use client"

import Navigation from "@/components/Navigation"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const [nextSkuCounter, setNextSkuCounter] = useState<number>(1)
  const [skuPrefix, setSkuPrefix] = useState<string | null>(null)
  const [initialSkuInput, setInitialSkuInput] = useState<string>("")
  const [prefixInput, setPrefixInput] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [savingCounter, setSavingCounter] = useState(false)
  const [savingPrefix, setSavingPrefix] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/sku")
        if (res.ok) {
          const data = await res.json()
          setNextSkuCounter(data.nextSkuCounter || 1)
          setSkuPrefix(data.skuPrefix)
          setPrefixInput(data.skuPrefix || "")
        }
      } catch (error) {
        console.error("Failed to fetch SKU settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveCounter = async () => {
    if (!initialSkuInput || initialSkuInput.trim() === "") {
      setMessage({ type: "error", text: "Please enter an initial SKU number" })
      return
    }

    const counter = parseInt(initialSkuInput)
    if (isNaN(counter) || counter < 1) {
      setMessage({ type: "error", text: "SKU counter must be a positive integer" })
      return
    }

    setSavingCounter(true)
    setMessage(null)

    try {
      const res = await fetch("/api/settings/sku/counter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ initialSku: counter }),
      })

      const data = await res.json()

      if (res.ok) {
        setNextSkuCounter(data.nextSkuCounter)
        setInitialSkuInput("")
        setMessage({ type: "success", text: "✓ SKU configured successfully" })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save SKU counter" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save SKU counter" })
    } finally {
      setSavingCounter(false)
    }
  }

  const handleSavePrefix = async () => {
    setSavingPrefix(true)
    setMessage(null)

    try {
      const res = await fetch("/api/settings/sku/prefix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefix: prefixInput }),
      })

      const data = await res.json()

      if (res.ok) {
        setSkuPrefix(data.skuPrefix)
        setMessage({ type: "success", text: "✓ Prefix configured successfully" })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save prefix" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save prefix" })
    } finally {
      setSavingPrefix(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center text-gray-600 dark:text-gray-400">Loading settings...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Electron Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Configure your eBay business policies and listing settings before creating listings.
          </p>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* SKU Configuration Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              SKU Configuration
            </h2>

            {/* Initial SKU Number Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Initial SKU Number
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Set the initial SKU number for your listings. This will be used as the starting point and incremented for each new listing.
              </p>
              
              <div className="mb-4">
                <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md font-medium">
                  Next SKU Counter: {nextSkuCounter}
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={initialSkuInput}
                  onChange={(e) => setInitialSkuInput(e.target.value)}
                  placeholder="Enter initial SKU"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSaveCounter}
                  disabled={savingCounter}
                  className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingCounter ? "Saving..." : "Save SKU"}
                </button>
              </div>
            </div>

            {/* SKU Prefix Override Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                SKU Prefix Override
              </h3>
              
              <div className="mb-4">
                <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md font-medium">
                  Current Prefix: {skuPrefix || "Auto-detection"}
                </div>
              </div>

              <div className="flex gap-3 mb-2">
                <input
                  type="text"
                  value={prefixInput}
                  onChange={(e) => setPrefixInput(e.target.value)}
                  placeholder="e.g., DVD, BLU, CD"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSavePrefix}
                  disabled={savingPrefix}
                  className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPrefix ? "Saving..." : "Save Prefix"}
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Optional: Override the automatic SKU prefix detection. Leave empty to use auto-detection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

