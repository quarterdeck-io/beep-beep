"use client"

import Navigation from "@/components/Navigation"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Html5QrcodeScanner } from "html5-qrcode"

interface ProductData {
  title?: string
  price?: {
    value?: string
    currency?: string
  }
  condition?: string
  itemWebUrl?: string
  image?: {
    imageUrl?: string
  }
  seller?: {
    username?: string
    feedbackPercentage?: string
  }
  [key: string]: any
}

export default function ProductSearchPage() {
  const router = useRouter()
  const [upc, setUpc] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState("")
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [scannerActive, setScannerActive] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementId = "html5-qrcode-scanner"

  useEffect(() => {
    // Check if user has connected eBay account
    const checkEbayConnection = async () => {
      try {
        const res = await fetch("/api/ebay/check-connection")
        const data = await res.json()
        setIsConnected(data.connected)
      } catch (err) {
        setIsConnected(false)
      } finally {
        setChecking(false)
      }
    }

    checkEbayConnection()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setProductData(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/ebay/search?upc=${encodeURIComponent(upc)}`)
      const data = await res.json()

      if (!res.ok) {
        // If token refresh failed, update connection status
        if (data.needsReconnect) {
          setIsConnected(false)
        }
        throw new Error(data.error || "Failed to search product")
      }

      setProductData(data)
    } catch (err: any) {
      setError(err.message || "Failed to search product")
    } finally {
      setLoading(false)
    }
  }

  const startScanner = () => {
    if (scannerActive || scannerRef.current) {
      return
    }

    setScannerActive(true)
    setError("")
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((err) => {
        console.error("Error clearing scanner:", err)
      })
      scannerRef.current = null
    }
    setScannerActive(false)
    
    // Clear the scanner element
    const element = document.getElementById(scannerElementId)
    if (element) {
      element.innerHTML = ""
    }
  }

  // Initialize scanner when modal is rendered
  useEffect(() => {
    if (!scannerActive) {
      // Clean up if scanner was stopped
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
      return
    }

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const element = document.getElementById(scannerElementId)
      if (!element) {
        console.error("Scanner element not found")
        setError("Failed to initialize scanner. Please try again.")
        setScannerActive(false)
        return
      }

      // Clear any existing content
      element.innerHTML = ""

      try {
        const scanner = new Html5QrcodeScanner(
          scannerElementId,
          {
            qrbox: {
              width: 250,
              height: 250,
            },
            fps: 10,
            supportedScanTypes: [0, 1], // Support both 1D and 2D barcodes
          },
          false // verbose
        )

        scannerRef.current = scanner

        scanner.render(
          (decodedText) => {
            // Successfully scanned
            setUpc(decodedText)
            stopScanner()
            // Optionally auto-search
            // You can uncomment the next line to auto-search after scanning
            // handleSearch(new Event('submit') as any)
          },
          (errorMessage) => {
            // Error callback - ignore, scanner will keep trying
            // Only log if it's a significant error
            if (errorMessage && !errorMessage.includes("NotFoundException")) {
              console.debug("Scanner error:", errorMessage)
            }
          }
        )
      } catch (err) {
        console.error("Error initializing scanner:", err)
        setError("Failed to start camera. Please check permissions and try again.")
        setScannerActive(false)
      }
    }, 100) // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer)
      // Cleanup scanner if component unmounts or scannerActive changes
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [scannerActive])

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 text-center">
            <div className="text-gray-600 dark:text-gray-400">Checking eBay connection...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Product Search
            </h1>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
              <svg
                className="mx-auto h-16 w-16 text-yellow-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-400 mb-4">
                eBay Account Not Connected
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300 mb-6">
                You need to connect your eBay account via OAuth before you can search for products.
              </p>
              <Link
                href="/ebay-connect"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Connect eBay Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Product Search
          </h1>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label
                  htmlFor="upc"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Enter UPC Code
                </label>
                <div className="flex gap-4">
                  <input
                    id="upc"
                    type="text"
                    value={upc}
                    onChange={(e) => setUpc(e.target.value)}
                    placeholder="e.g., 885909950805"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={scannerActive ? stopScanner : startScanner}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    {scannerActive ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Stop Scanner
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        Scan Barcode
                      </>
                    )}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 rounded">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Error</p>
                    <p>{error}</p>
                  </div>
                  {(error.includes("reconnect") || error.includes("connect")) && (
                    <Link
                      href="/ebay-connect"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0"
                    >
                      Reconnect eBay
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Barcode Scanner Modal */}
            {scannerActive && (
              <div className="mt-4 fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Scan Barcode
                    </h3>
                    <button
                      onClick={stopScanner}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div id={scannerElementId} className="w-full"></div>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                    Position the barcode within the frame
                  </p>
                </div>
              </div>
            )}
          </div>

          {productData && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Product Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  {productData.image?.imageUrl && (
                    <div>
                      <img
                        src={productData.image.imageUrl}
                        alt={productData.title || "Product"}
                        className="w-full h-auto rounded-lg shadow"
                      />
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="space-y-4">
                    {productData.title && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Title
                        </h3>
                        <p className="mt-1 text-lg text-gray-900 dark:text-white">
                          {productData.title}
                        </p>
                      </div>
                    )}

                    {productData.price && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Price
                        </h3>
                        <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {productData.price.currency} {productData.price.value}
                        </p>
                      </div>
                    )}

                    {productData.condition && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Condition
                        </h3>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {productData.condition}
                        </p>
                      </div>
                    )}

                    {productData.seller && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Seller
                        </h3>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {productData.seller.username}
                          {productData.seller.feedbackPercentage && (
                            <span className="ml-2 text-green-600 dark:text-green-400">
                              ({productData.seller.feedbackPercentage}% positive)
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {productData.itemWebUrl && (
                      <div>
                        <a
                          href={productData.itemWebUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                          View on eBay
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* All Product Data (Debug/Complete View) */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Complete Product Data
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(productData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {!productData && !error && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Enter a UPC code to search for products on eBay
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

