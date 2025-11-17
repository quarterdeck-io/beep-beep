"use client"

import Navigation from "@/components/Navigation"
import { useState } from "react"

export default function EbayConnectPage() {
  const [connecting, setConnecting] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [message, setMessage] = useState("")

  const handleConnect = async () => {
    setConnecting(true)
    setMessage("eBay OAuth integration is being configured. Please add your eBay API credentials to continue.")
    
    // This is a placeholder for the eBay OAuth flow
    // You will implement the actual OAuth flow here with your eBay credentials
    
    setConnecting(false)
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
              <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-400 rounded">
                {message}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {connecting ? "Connecting..." : "Connect eBay Account"}
              </button>

              {accessToken && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Access Token (Preview)
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded font-mono text-sm break-all">
                    {accessToken.substring(0, 50)}...
                  </div>
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ Successfully connected to eBay
                  </p>
                </div>
              )}
            </div>
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

