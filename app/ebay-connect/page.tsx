"use client"

import Navigation from "@/components/Navigation"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function EbayConnectContent() {
  const searchParams = useSearchParams()
  const [connecting, setConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      try {
        const res = await fetch("/api/ebay/check-connection")
        const data = await res.json()
        setIsConnected(data.connected)
      } catch (err) {
        console.error("Failed to check connection:", err)
      }
    }

    checkConnection()

    // Handle OAuth callback success/error
    const success = searchParams.get("success")
    const errorParam = searchParams.get("error")

    if (success === "true") {
      setMessage("✓ Successfully connected to eBay!")
      setIsConnected(true)
    } else if (errorParam) {
      const errorMessages: Record<string, string> = {
        missing_credentials: "eBay API credentials not configured. Please add EBAY_CLIENT_ID and EBAY_CLIENT_SECRET to your .env.local file.",
        oauth_failed: "Failed to initiate OAuth flow. Please try again.",
        oauth_declined: "You declined the eBay authorization.",
        unauthorized: "Unauthorized request. Please try again.",
        no_code: "No authorization code received from eBay.",
        token_exchange_failed: "Failed to exchange authorization code for access token.",
        callback_failed: "OAuth callback failed. Please try again."
      }
      setError(errorMessages[errorParam] || "An unknown error occurred")
    }
  }, [searchParams])

  const handleConnect = () => {
    setConnecting(true)
    // Redirect to OAuth flow
    window.location.href = "/api/ebay/connect"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Connect eBay Account
          </h1>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              eBay Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your eBay account to get an access token for searching products.
              This will allow you to use the eBay Browse API to search for products by UPC.
            </p>

            {message && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded">
                {error}
              </div>
            )}

            {isConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-400">
                        eBay Account Connected
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You can now search for products!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/product-search"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Search Products
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  {connecting ? "Redirecting to eBay..." : "Connect eBay Account"}
                </button>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
              Setup Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-yellow-700 dark:text-yellow-300 text-sm">
              <li>Create an eBay developer account at developer.ebay.com</li>
              <li>Create an application to get your Client ID and Client Secret</li>
              <li>Add your credentials to the .env.local file</li>
              <li>Implement the OAuth 2.0 flow (coming soon)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EbayConnectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">Loading...</div>
        </div>
      </div>
    }>
      <EbayConnectContent />
    </Suspense>
  )
}

