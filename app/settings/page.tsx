"use client"

import Navigation from "@/components/Navigation"
import { useState, useEffect } from "react"

interface Policy {
  id: string
  name: string
  description?: string
}

interface EbayPolicies {
  fulfillmentPolicies: Policy[]
  paymentPolicies: Policy[]
  returnPolicies: Policy[]
}

export default function SettingsPage() {
  const [nextSkuCounter, setNextSkuCounter] = useState<number>(1)
  const [skuPrefix, setSkuPrefix] = useState<string | null>(null)
  const [initialSkuInput, setInitialSkuInput] = useState<string>("")
  const [prefixInput, setPrefixInput] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [savingCounter, setSavingCounter] = useState(false)
  const [savingPrefix, setSavingPrefix] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showSearch, setShowSearch] = useState(false)

  // eBay Business Policies state
  const [availablePolicies, setAvailablePolicies] = useState<EbayPolicies | null>(null)
  const [loadingPolicies, setLoadingPolicies] = useState(false)
  const [savingPolicies, setSavingPolicies] = useState(false)
  const [selectedPaymentPolicy, setSelectedPaymentPolicy] = useState<string>("")
  const [selectedReturnPolicy, setSelectedReturnPolicy] = useState<string>("")
  const [selectedFulfillmentPolicy, setSelectedFulfillmentPolicy] = useState<string>("")
  const [ebayConnected, setEbayConnected] = useState(false)

  // Banned Keywords state
  const [bannedKeywords, setBannedKeywords] = useState<Array<{ id: string; keyword: string }>>([])
  const [newKeyword, setNewKeyword] = useState<string>("")
  const [loadingKeywords, setLoadingKeywords] = useState(false)
  const [savingKeyword, setSavingKeyword] = useState(false)
  const [deletingKeyword, setDeletingKeyword] = useState<string | null>(null)

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

  // Check if eBay is connected and fetch saved policies
  useEffect(() => {
    const checkEbayConnection = async () => {
      try {
        const res = await fetch("/api/ebay/check-connection")
        if (res.ok) {
          const data = await res.json()
          setEbayConnected(data.connected)
          
          if (data.connected) {
            // Automatically fetch available policies from eBay
            setLoadingPolicies(true)
            try {
              const policiesRes = await fetch("/api/ebay/policies")
              if (policiesRes.ok) {
                const policiesData = await policiesRes.json()
                setAvailablePolicies(policiesData)
                
                // Then fetch saved policy preferences
                const savedRes = await fetch("/api/settings/ebay-policies")
                if (savedRes.ok) {
                  const savedData = await savedRes.json()
                  setSelectedPaymentPolicy(savedData.paymentPolicyId || "")
                  setSelectedReturnPolicy(savedData.returnPolicyId || "")
                  setSelectedFulfillmentPolicy(savedData.fulfillmentPolicyId || "")
                }
              } else {
                // Handle error response
                const errorData = await policiesRes.json()
                console.error("Error fetching policies:", errorData)
                
                if (errorData.needsReconnect) {
                  setMessage({ 
                    type: "error", 
                    text: `${errorData.error} Please disconnect and reconnect your eBay account to grant the required permissions.`
                  })
                } else {
                  setMessage({ 
                    type: "error", 
                    text: errorData.error || "Failed to fetch eBay policies. Please try again."
                  })
                }
              }
            } catch (error) {
              console.error("Failed to fetch policies:", error)
              setMessage({ 
                type: "error", 
                text: "Failed to load eBay policies. Please refresh the page or try again."
              })
            } finally {
              setLoadingPolicies(false)
            }
          }
        }
      } catch (error) {
        console.error("Failed to check eBay connection:", error)
      }
    }

    checkEbayConnection()
  }, [])

  // Fetch banned keywords on mount
  useEffect(() => {
    const fetchBannedKeywords = async () => {
      try {
        setLoadingKeywords(true)
        const res = await fetch("/api/settings/banned-keywords")
        if (res.ok) {
          const data = await res.json()
          setBannedKeywords(data.keywords || [])
        }
      } catch (error) {
        console.error("Failed to fetch banned keywords:", error)
      } finally {
        setLoadingKeywords(false)
      }
    }

    fetchBannedKeywords()
  }, [])

  // Fetch available policies when user clicks to load them
  const fetchAvailablePolicies = async () => {
    setLoadingPolicies(true)
    setMessage(null) // Clear any previous messages

    try {
      const res = await fetch("/api/ebay/policies")
      if (res.ok) {
        const data = await res.json()
        setAvailablePolicies(data)
        
        // Check if policies are empty
        const totalPolicies = 
          (data.fulfillmentPolicies?.length || 0) + 
          (data.paymentPolicies?.length || 0) + 
          (data.returnPolicies?.length || 0)
        
        if (totalPolicies === 0) {
          setMessage({ 
            type: "error", 
            text: "No policies found. Please create business policies in your eBay account settings first."
          })
        } else {
          setMessage({ 
            type: "success", 
            text: `✓ Loaded ${totalPolicies} policies from eBay`
          })
        }
      } else {
        const errorData = await res.json()
        console.error("Error fetching policies:", errorData)
        
        if (errorData.needsReconnect) {
          setMessage({ 
            type: "error", 
            text: `${errorData.error} Click below to reconnect.`
          })
        } else {
          setMessage({ 
            type: "error", 
            text: errorData.error || "Failed to fetch policies. Please try again."
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error)
      setMessage({ type: "error", text: "Failed to fetch eBay policies. Please check your connection." })
    } finally {
      setLoadingPolicies(false)
    }
  }

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
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to save SKU counter")
        setMessage({ type: "error", text: errorMsg })
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
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to save prefix")
        setMessage({ type: "error", text: errorMsg })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save prefix" })
    } finally {
      setSavingPrefix(false)
    }
  }

  const handleSavePolicies = async () => {
    setSavingPolicies(true)
    setMessage(null)

    try {
      // Find the selected policy names
      const paymentPolicy = availablePolicies?.paymentPolicies.find(p => p.id === selectedPaymentPolicy)
      const returnPolicy = availablePolicies?.returnPolicies.find(p => p.id === selectedReturnPolicy)
      const fulfillmentPolicy = availablePolicies?.fulfillmentPolicies.find(p => p.id === selectedFulfillmentPolicy)

      const res = await fetch("/api/settings/ebay-policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentPolicyId: selectedPaymentPolicy || null,
          paymentPolicyName: paymentPolicy?.name || null,
          returnPolicyId: selectedReturnPolicy || null,
          returnPolicyName: returnPolicy?.name || null,
          fulfillmentPolicyId: selectedFulfillmentPolicy || null,
          fulfillmentPolicyName: fulfillmentPolicy?.name || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "✓ eBay policies configured successfully" })
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to save policies")
        setMessage({ type: "error", text: errorMsg })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save eBay policies" })
    } finally {
      setSavingPolicies(false)
    }
  }

  const handleAddKeyword = async () => {
    if (!newKeyword || newKeyword.trim().length === 0) {
      setMessage({ type: "error", text: "Please enter a keyword" })
      return
    }

    setSavingKeyword(true)
    setMessage(null)

    try {
      const res = await fetch("/api/settings/banned-keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: newKeyword.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        setBannedKeywords([...bannedKeywords, data.keyword])
        setNewKeyword("")
        setMessage({ type: "success", text: "✓ Keyword added successfully" })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add keyword" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add keyword" })
    } finally {
      setSavingKeyword(false)
    }
  }

  const handleDeleteKeyword = async (id: string) => {
    setDeletingKeyword(id)
    setMessage(null)

    try {
      const res = await fetch(`/api/settings/banned-keywords?id=${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (res.ok) {
        setBannedKeywords(bannedKeywords.filter(k => k.id !== id))
        setMessage({ type: "success", text: "✓ Keyword removed successfully" })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to remove keyword" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove keyword" })
    } finally {
      setDeletingKeyword(null)
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
            Beep Beep Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Configure your eBay business policies and listing settings before creating listings.
          </p>

          {/* Search Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {showSearch ? "Hide Search" : "Search SKU Settings"}
            </button>

            {showSearch && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by counter or prefix (e.g., '689', 'ASS', 'SKU-1')"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      // Search logic - filter current settings
                      const query = searchQuery.toLowerCase()
                      const matchesCounter = nextSkuCounter.toString().includes(query)
                      const matchesPrefix = (skuPrefix || "Auto-detection").toLowerCase().includes(query)
                      const matchesSku = `${skuPrefix || "SKU"}-${nextSkuCounter}`.toLowerCase().includes(query)
                      
                      if (matchesCounter || matchesPrefix || matchesSku) {
                        setMessage({ type: "success", text: `✓ Found: Counter ${nextSkuCounter}, Prefix: ${skuPrefix || "Auto-detection"}` })
                      } else {
                        setMessage({ type: "error", text: "No matching SKU settings found" })
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setMessage(null)
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {searchQuery && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-600 dark:text-gray-400">
                    <p>Current Prefix: <strong className="text-gray-900 dark:text-white">{skuPrefix || "SKU (default)"}</strong></p>
                    <p className="mt-1">Current Counter: <strong className="text-gray-900 dark:text-white">{nextSkuCounter}</strong></p>
                    <p className="mt-1">Next SKU will be: <strong className="text-blue-600 dark:text-blue-400 text-lg font-mono">{skuPrefix || "SKU"}-0000{nextSkuCounter}</strong></p>
                    <p className="mt-1 text-xs text-gray-500">Format: <span className="font-mono">{`{Prefix}-0000{Counter}`}</span> (0000 prepended)</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
              }`}
            >
              <p>{message.text}</p>
              {message.type === "error" && message.text.includes("reconnect") && (
                <div className="mt-3 flex gap-3">
                  <a
                    href="/api/ebay/disconnect"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Disconnect eBay
                  </a>
                  <a
                    href="/ebay-connect"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Reconnect with New Permissions
                  </a>
                </div>
              )}
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Set the initial SKU number for your listings. This will be used as the starting point and incremented for each new listing.
              </p>
              
              <div className="inline-block px-4 py-2 mb-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md font-medium">
                Next SKU Counter: {nextSkuCounter}
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
              
              <div className="inline-block px-4 py-2 mb-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md font-medium">
                Current Prefix: {skuPrefix || "SKU (default)"}
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
                Set your custom SKU prefix (e.g., DVD, PROD, ITEM). All SKUs will use format: <span className="font-mono font-semibold">{`{Prefix}-0000{Counter}`}</span>
              </p>
            </div>
          </div>

          {/* eBay Business Policies Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              eBay Business Policies
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Configure your eBay business policies. These policies define payment, return, and shipping terms for your listings.
            </p>

            {!ebayConnected ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-300">
                  Please connect your eBay account first to configure business policies.
                </p>
                <a
                  href="/ebay-connect"
                  className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Connect eBay Account
                </a>
              </div>
            ) : loadingPolicies ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your eBay policies...</p>
              </div>
            ) : !availablePolicies ? (
              <div className="text-center">
                <button
                  onClick={fetchAvailablePolicies}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Load eBay Policies
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Click to fetch your available eBay business policies
                </p>
              </div>
            ) : (
                  <div className="space-y-6">
                    {/* Payment Policy */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Payment Policy:
                      </label>
                      <select
                        value={selectedPaymentPolicy}
                        onChange={(e) => setSelectedPaymentPolicy(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a Payment Policy</option>
                        {availablePolicies.paymentPolicies.map((policy) => (
                          <option key={policy.id} value={policy.id}>
                            {policy.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Return Policy */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Return Policy:
                      </label>
                      <select
                        value={selectedReturnPolicy}
                        onChange={(e) => setSelectedReturnPolicy(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a Return Policy</option>
                        {availablePolicies.returnPolicies.map((policy) => (
                          <option key={policy.id} value={policy.id}>
                            {policy.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fulfillment Policy */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Fulfillment Policy:
                      </label>
                      <select
                        value={selectedFulfillmentPolicy}
                        onChange={(e) => setSelectedFulfillmentPolicy(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a Fulfillment Policy</option>
                        {availablePolicies.fulfillmentPolicies.map((policy) => (
                          <option key={policy.id} value={policy.id}>
                            {policy.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSavePolicies}
                        disabled={savingPolicies}
                        className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingPolicies ? "Saving..." : "Save Settings"}
                      </button>
                      <button
                        onClick={fetchAvailablePolicies}
                        disabled={loadingPolicies}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingPolicies ? "Refreshing..." : "Refresh Policies"}
                      </button>
                      <button
                        onClick={() => setMessage({ type: "success", text: "You can configure policies later" })}
                        className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                      >
                        Skip for Now
                      </button>
                    </div>
                  </div>
            )}
          </div>

          {/* Keyword Ban Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Keyword Ban
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Add keywords to hide/mask when displaying products. These keywords will be replaced with asterisks (*) in product titles and descriptions.
            </p>

            {/* Add Keyword Form */}
            <div className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddKeyword()
                    }
                  }}
                  placeholder="Enter keyword to ban (e.g., DVD, Blu-Ray)"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddKeyword}
                  disabled={savingKeyword || !newKeyword.trim()}
                  className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingKeyword ? "Adding..." : "Add Keyword"}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Keywords are case-insensitive and will match whole words only
              </p>
            </div>

            {/* Banned Keywords List */}
            {loadingKeywords ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading keywords...</p>
              </div>
            ) : bannedKeywords.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No banned keywords yet. Add keywords above to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Banned Keywords ({bannedKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bannedKeywords.map((keyword) => (
                    <div
                      key={keyword.id}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                    >
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        {keyword.keyword}
                      </span>
                      <button
                        onClick={() => handleDeleteKeyword(keyword.id)}
                        disabled={deletingKeyword === keyword.id}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                        aria-label={`Remove ${keyword.keyword}`}
                      >
                        {deletingKeyword === keyword.id ? (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

