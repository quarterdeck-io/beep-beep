"use client"

import Navigation from "@/components/Navigation"
import { useState } from "react"

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
  const [upc, setUpc] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [productData, setProductData] = useState<ProductData | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setProductData(null)
    setLoading(true)

    try {
      // This is a placeholder for the actual eBay API call
      // You will implement this with your eBay API credentials
      
      setError("eBay API integration is pending. Please configure your eBay API credentials.")
      
      // Example of what the API call would look like:
      // const res = await fetch(`/api/ebay/search?upc=${upc}`)
      // const data = await res.json()
      // if (!res.ok) throw new Error(data.error)
      // setProductData(data)
      
    } catch (err: any) {
      setError(err.message || "Failed to search product")
    } finally {
      setLoading(false)
    }
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
                {error}
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

