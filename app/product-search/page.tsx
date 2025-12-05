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
  const [scanningStatus, setScanningStatus] = useState("")
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementId = "html5-qrcode-scanner"
  const errorCooldownRef = useRef<NodeJS.Timeout | null>(null)
  
  // Editable fields state
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedCondition, setEditedCondition] = useState("")
  const [editedPrice, setEditedPrice] = useState("")
  
  // Listing state
  const [listingLoading, setListingLoading] = useState(false)
  const [listingSuccess, setListingSuccess] = useState<string | null>(null)
  const [listingError, setListingError] = useState<string | null>(null)
  const [listedSku, setListedSku] = useState<string | null>(null)
  
  // Missing item specifics state
  const [missingAspects, setMissingAspects] = useState<string[]>([])
  const [aspectDefinitions, setAspectDefinitions] = useState<any[]>([])
  const [userProvidedAspects, setUserProvidedAspects] = useState<Record<string, string>>({})
  const [showAspectForm, setShowAspectForm] = useState(false)
  
  // SKU Preview state
  const [skuPreview, setSkuPreview] = useState<string>("")
  const [loadingSku, setLoadingSku] = useState(false)
  
  // Duplicate detection state
  const [hasDuplicates, setHasDuplicates] = useState(false)
  const [duplicateSku, setDuplicateSku] = useState<string>("")
  const [duplicateUpc, setDuplicateUpc] = useState<string>("")
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  
  
  // Mean price tracking state
  const [isMeanPrice, setIsMeanPrice] = useState(false)
  
  // Available conditions for dropdown
  const conditions = [
    "Used - Very Good",
    "Used - Excellent",
    "Used - Good",
    "Used - Acceptable",
    "Brand New",
    "Like New",
    "Very Good",
    "Good",
    "New Other",
    "New with Defects",
    "Manufacturer Refurbished",
    "Seller Refurbished",
    "For Parts or Not Working"
  ]
  
  // Helper function to get condition description text
  const getConditionDescription = (condition: string): string => {
    const descriptionMap: { [key: string]: string } = {
      "Brand New": "A brand-new, unused, unopened, undamaged item in its original packaging.",
      "Like New": "An item that looks like it just came from the store. The item may have been opened or used only once or twice, with no visible signs of wear. All accessories and original packaging are included.",
      "Very Good": "An item that has been used but remains in very good condition. The item shows minimal signs of wear and is fully functional with no defects. All major features work perfectly.",
      "Good": "An item that has been used and shows normal signs of wear. The item is fully functional but may have minor cosmetic issues such as light scratches, scuffs, or marks. All features work as expected.",
      "New Other": "A new, unused item with absolutely no signs of wear. The item may be missing original packaging or protective wrapping, or may be in original packaging but not sealed.",
      "New with Defects": "A new, unused item with defects or irregularities. The item may have cosmetic imperfections, be a factory second, or be damaged in a way that does not affect its operation.",
      "Manufacturer Refurbished": "An item that has been restored to working order by the manufacturer. This means the item has been inspected, cleaned, and repaired to meet manufacturer specifications and is in excellent condition.",
      "Seller Refurbished": "An item that has been restored to working order by the seller or a third party not approved by the manufacturer. This means the item has been inspected, cleaned, and repaired to full working order and is in excellent condition.",
      "Used - Excellent": "An item that has been used but is in excellent condition with no noticeable cosmetic or functional defects. The item may show minimal signs of use.",
      "Used - Very Good": "An item that has been used but remains in very good condition. The item shows some limited signs of wear but is fully functional with no defects.",
      "Used - Good": "An item that has been used and shows signs of wear. The item is fully functional but may have cosmetic issues such as scratches, scuffs, or minor marks.",
      "Used - Acceptable": "An item that has been used with obvious signs of wear. The item is fully functional but may have significant cosmetic defects.",
      "For Parts or Not Working": "An item that does not function as intended or is not fully operational. This item may be used for replacement parts or requires repair.",
    }
    
    return descriptionMap[condition] || ""
  }
  
  // Helper function to add debug log
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setDebugLogs((prev) => [...prev.slice(-9), logMessage]) // Keep last 10 logs
  }

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

  const performSearch = async (searchValue: string) => {
    const trimmedUpc = searchValue.trim()
    
    setError("")
    setProductData(null)
    setListingError(null) // Clear any previous listing errors
    setHasDuplicates(false) // Clear duplicate state for new search
    setDuplicateSku("")
    setDuplicateUpc("")
    setUpc(trimmedUpc) // Update UPC state for display
    setLoading(true)

    try {
      const res = await fetch(`/api/ebay/search?upc=${encodeURIComponent(trimmedUpc)}`)
      const data = await res.json()

      if (!res.ok) {
        // If token refresh failed, update connection status
        if (data.needsReconnect) {
          setIsConnected(false)
        }
        throw new Error(data.error || "Failed to search product")
      }

      setProductData(data)
      // Initialize editable fields with product data
      setEditedTitle(data.title || "")
      setEditedDescription(data.shortDescription || data.description || "")
      setEditedCondition(data.condition || "Used - Very Good")
      setEditedPrice(data.price?.value || "0.00")
      setIsMeanPrice(data._searchMetadata?.isMeanPrice || false)
      setIsEditing(false)
      setListingSuccess(null) // Clear success message for new search
      
      // Fetch SKU preview for this listing
      fetchSkuPreview()
      
      // Check for duplicates in eBay inventory using the searched UPC
      checkForDuplicates(trimmedUpc).catch(() => {
        // Don't block the user if check fails
      })
    } catch (err: any) {
      setError(err.message || "Failed to search product")
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveEdit = () => {
    if (!productData) return
    
    // Update product data with edited values
    setProductData({
      ...productData,
      title: editedTitle,
      description: editedDescription,
      shortDescription: editedDescription,
      condition: editedCondition,
      price: {
        ...productData.price,
        value: editedPrice,
        currency: productData.price?.currency || "USD"
      }
    })
    setIsEditing(false)
    setListingSuccess(null)
    setListingError(null)
  }
  
  const handleCancelEdit = () => {
    // Reset to original values
    if (productData) {
      setEditedTitle(productData.title || "")
      setEditedDescription(productData.shortDescription || productData.description || "")
      setEditedCondition(productData.condition || "Used - Very Good")
      setEditedPrice(productData.price?.value || "0.00")
    }
    setIsEditing(false)
  }
  
  const handleClearProduct = () => {
    // Clear all product-related state
    setProductData(null)
    setUpc("") // Clear UPC from search bar
    setEditedTitle("")
    setEditedDescription("")
    setEditedCondition("")
    setEditedPrice("")
    setIsMeanPrice(false) // Clear mean price flag
    setIsEditing(false)
    setListingLoading(false)
    setListingSuccess(null)
    setListingError(null)
    setListedSku(null) // Clear previous SKU on manual clear
    setMissingAspects([])
    setAspectDefinitions([])
    setUserProvidedAspects({})
    setShowAspectForm(false)
    setError("")
    setSkuPreview("") // Clear SKU preview
    setHasDuplicates(false) // Clear duplicate detection
    setDuplicateSku("")
    setDuplicateUpc("")
  }
  
  // Check if products with this UPC already exist in eBay inventory
  const checkForDuplicates = async (upcCode: string) => {
    if (!upcCode || upcCode.trim() === "") {
      return
    }
    
    const trimmedUpc = upcCode.trim()
    setCheckingDuplicates(true)
    setHasDuplicates(false)
    setDuplicateSku("")
    setDuplicateUpc("")
    
    try {
      const apiUrl = `/api/ebay/check-duplicate?upc=${encodeURIComponent(trimmedUpc)}`
      const res = await fetch(apiUrl)
      
      if (res.ok) {
        const data = await res.json()
        
        if (data.hasDuplicates && data.duplicates && data.duplicates.length > 0) {
          // Show first duplicate SKU
          setHasDuplicates(true)
          setDuplicateSku(data.duplicates[0].sku || "")
          setDuplicateUpc(data.upc || trimmedUpc)
        } else {
          setHasDuplicates(false)
          setDuplicateSku("")
          setDuplicateUpc("")
        }
      } else {
        // If API call failed, clear duplicate state
        setHasDuplicates(false)
        setDuplicateSku("")
        setDuplicateUpc("")
      }
    } catch (error) {
      // On error, clear duplicate state (don't show false positives)
      setHasDuplicates(false)
      setDuplicateSku("")
      setDuplicateUpc("")
    } finally {
      setCheckingDuplicates(false)
    }
  }
  
  // Fetch SKU preview for the next listing
  const fetchSkuPreview = async (updatePreviousSku = true) => {
    setLoadingSku(true)
    try {
      const res = await fetch("/api/settings/sku")
      if (res.ok) {
        const data = await res.json()
        const prefix = data.skuPrefix || "SKU"
        const counter = data.nextSkuCounter || 1
        const preview = `${prefix}-0000${counter}`
        setSkuPreview(preview)
        
        // Also set the previous SKU (last listed product) if requested
        if (updatePreviousSku) {
          if (counter > 1) {
            const previousCounter = counter - 1
            const previousSku = `${prefix}-0000${previousCounter}`
            setListedSku(previousSku)
          } else {
            setListedSku(null) // No previous SKU if this is the first one
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch SKU preview:", error)
    } finally {
      setLoadingSku(false)
    }
  }
  
  const handleListOnEbay = async (additionalAspects?: Record<string, string>) => {
    if (!productData) return
    
    setListingLoading(true)
    setListingError(null)
    setListingSuccess(null)
    setShowAspectForm(false)
    
    try {
      // Merge user-provided aspects with existing aspects
      const currentAspects = productData.localizedAspects || productData.aspects || {}
      const mergedAspects = { ...currentAspects }
      
      // Add user-provided aspects
      if (additionalAspects) {
        Object.keys(additionalAspects).forEach(key => {
          if (additionalAspects[key]) {
            mergedAspects[key] = [additionalAspects[key]]
          }
        })
      }
      
      const response = await fetch("/api/ebay/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Editable fields
          title: editedTitle || productData.title || "",
          description: editedDescription || productData.shortDescription || productData.description || "",
          price: editedPrice || productData.price?.value || "0.00",
          condition: editedCondition || productData.condition || "Used - Very Good",
          
          // Images - primary and additional
          imageUrl: productData.image?.imageUrl || "",
          additionalImages: productData.additionalImages || [],
          
          // Category information from Browse API
          categoryId: productData.categoryId || "",
          categories: productData.categories || [],
          
          // Product identifiers
          upc: upc || productData.gtin || "", // Pass the scanned UPC
          ean: productData.ean || "",
          isbn: productData.isbn || "",
          mpn: productData.mpn || "",
          brand: productData.brand || "",
          
          // eBay Product ID for better catalog matching
          epid: productData.epid || "",
          
          // Product aspects (item specifics) - merged with user-provided
          aspects: mergedAspects,
          
          // Condition ID from Browse API
          conditionId: productData.conditionId || "",
          
          // Short description (may contain Platform info)
          shortDescription: productData.shortDescription || "",
          
          // Reference URL (for debugging/logging)
          itemWebUrl: productData.itemWebUrl || "",
        }),
      })
      
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error(`Failed to parse response: ${response.status} ${response.statusText}`)
      }
      
      if (!response.ok) {
        // Check if this is a missing item specifics error
        if (data.action === "missing_item_specifics" && data.missingItemSpecifics) {
          setMissingAspects(data.missingItemSpecifics)
          setAspectDefinitions(data.aspectDefinitions || [])
          
          // Pre-fill form with suggested values if available
          const prefillAspects: Record<string, string> = {}
          data.aspectDefinitions?.forEach((def: any) => {
            if (def.suggestedValue) {
              prefillAspects[def.name] = def.suggestedValue
            }
          })
          setUserProvidedAspects(prefillAspects)
          
          setShowAspectForm(true)
          setListingError(null) // Clear error to show form instead
          setListingLoading(false)
          return // Don't throw error, show form instead
        }
        
        // Log the error for debugging
        console.error("Listing error:", {
          status: response.status,
          error: data.error,
          errorCode: data.errorCode,
          needsReconnect: data.needsReconnect,
          details: data.details,
          rawEbayError: data.rawEbayError
        })
        
        // Display RAW eBay error for debugging
        let errorMessage = "eBay API Error:\n\n"
        
        // Show raw eBay error if available
        if (data.rawEbayError) {
          errorMessage += "RAW eBay Response:\n" + JSON.stringify(data.rawEbayError, null, 2) + "\n\n"
        }
        
        // Show our processed error
        errorMessage += "Error: " + (data.error || "Failed to list product on eBay") + "\n"
        
        if (data.errorCode) {
          errorMessage += "Error Code: " + data.errorCode + "\n"
        }
        
        if (data.hint) {
          errorMessage += "Hint: " + data.hint
        }
        
        // Add received data for debugging if available
        if (data.received) {
          console.error("Received data:", data.received)
        }
        if (data.details) {
          console.error("eBay API Error Details:", JSON.stringify(data.details, null, 2))
          // Also log individual errors if available
          if (data.details.errors && Array.isArray(data.details.errors)) {
            data.details.errors.forEach((err: any, index: number) => {
              console.error(`Error ${index + 1}:`, {
                errorId: err.errorId,
                domain: err.domain,
                category: err.category,
                message: err.message,
                longMessage: err.longMessage,
                parameters: err.parameters
              })
            })
          }
        }
        throw new Error(errorMessage)
      }
      
      setListingSuccess(data.listingUrl || data.message || "Product listed successfully!")
      // Capture the SKU that was used for this listing and calculate next SKU
      if (data.sku) {
        setListedSku(data.sku)
        
        // Calculate the next SKU based on the returned SKU
        // Format: PREFIX-0000XXX where XXX is the counter
        const skuParts = data.sku.split('-0000')
        if (skuParts.length === 2) {
          const prefix = skuParts[0]
          const currentCounter = parseInt(skuParts[1])
          if (!isNaN(currentCounter)) {
            const nextCounter = currentCounter + 1
            const nextSku = `${prefix}-0000${nextCounter}`
            setSkuPreview(nextSku)
          } else {
            // Fallback to fetching from API
            fetchSkuPreview(false)
          }
        } else {
          // Fallback to fetching from API
          fetchSkuPreview(false)
        }
      } else {
        // Fallback to fetching from API
        fetchSkuPreview(false)
      }
      setIsEditing(false)
    } catch (err: any) {
      setListingError(err.message || "Failed to list product on eBay")
    } finally {
      setListingLoading(false)
    }
  }
  
  const handleSubmitAspects = () => {
    // Validate all required aspects are filled
    const allFilled = missingAspects.every(aspect => {
      const aspectDef = aspectDefinitions.find((a: any) => a.name === aspect)
      if (aspectDef && aspectDef.values && aspectDef.values.length > 0) {
        // Has predefined values, check if user selected one
        return userProvidedAspects[aspect] && userProvidedAspects[aspect].trim() !== ""
      }
      // Free text, just check if filled
      return userProvidedAspects[aspect] && userProvidedAspects[aspect].trim() !== ""
    })
    
    if (!allFilled) {
      setListingError("Please fill in all required item specifics before listing.")
      return
    }
    
    // Retry listing with user-provided aspects
    handleListOnEbay(userProvidedAspects)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await performSearch(upc)
  }

  const startScanner = () => {
    addDebugLog("🔍 startScanner() called")
    addDebugLog(`🔍 scannerActive: ${scannerActive}, scannerRef exists: ${!!scannerRef.current}`)
    
    if (scannerActive || scannerRef.current) {
      addDebugLog("⚠️ Scanner already active, returning early")
      return
    }

    addDebugLog("🔍 Setting scanner state to active")
    setScannerActive(true)
    setError("")
    setScanningStatus("Initializing camera...")
    setDebugLogs([]) // Clear previous logs
    addDebugLog("✅ Scanner state updated")
  }

  const stopScanner = () => {
    addDebugLog("🔍 stopScanner() called")
    addDebugLog(`🔍 scannerRef.current exists: ${!!scannerRef.current}`)
    
    // Clear error cooldown timeout if exists
    if (errorCooldownRef.current) {
      clearTimeout(errorCooldownRef.current)
      errorCooldownRef.current = null
    }
    
    if (scannerRef.current) {
      addDebugLog("🔍 Clearing scanner instance...")
        scannerRef.current.clear().catch((err) => {
          addDebugLog(`❌ Error clearing scanner: ${err?.message || "Unknown error"}`)
        })
      scannerRef.current = null
      addDebugLog("✅ Scanner instance cleared")
    }
    
    addDebugLog("🔍 Setting scanner state to inactive")
    setScannerActive(false)
    setScanningStatus("")
    
    // Clear the scanner element
    const element = document.getElementById(scannerElementId)
    if (element) {
      addDebugLog("🔍 Clearing scanner DOM element")
      element.innerHTML = ""
      addDebugLog("✅ Scanner DOM element cleared")
    } else {
      addDebugLog("⚠️ Scanner DOM element not found for cleanup")
    }
    
    addDebugLog("✅ stopScanner() complete")
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
    addDebugLog("🔍 Setting up scanner initialization timer...")
    const timer = setTimeout(() => {
      addDebugLog("🔍 Timer fired, looking for scanner element...")
      const element = document.getElementById(scannerElementId)
      addDebugLog(`🔍 Element lookup result: ${!!element}`)
      addDebugLog(`🔍 Element ID searched: ${scannerElementId}`)
      
      if (!element) {
        addDebugLog("❌ Scanner element not found!")
        const similarIds = Array.from(document.querySelectorAll('[id*="scanner"], [id*="qr"], [id*="barcode"]')).map(el => el.id)
        addDebugLog(`❌ Available similar IDs: ${similarIds.join(", ") || "none"}`)
        setError("Failed to initialize scanner. Please try again.")
        setScannerActive(false)
        return
      }

      addDebugLog("✅ Scanner element found, clearing content...")
      // Clear any existing content
      element.innerHTML = ""
      addDebugLog("✅ Scanner element cleared")

      try {
        addDebugLog("🔍 Starting scanner initialization...")
        addDebugLog(`🔍 Scanner element ID: ${scannerElementId}`)
        addDebugLog(`🔍 Scanner element found: ${!!element}`)
        
        // Optimized configuration for barcode scanning (especially 1D barcodes like UPC)
        const config = {
          qrbox: {
            width: 400,  // Wider box for 1D barcodes (UPC/EAN)
            height: 120, // Reduced height for more compact scan area
          },
          fps: 20, // Higher FPS for faster scanning
          aspectRatio: 1.777778, // 16:9 aspect ratio for better camera quality
          disableFlip: true, // Disable flip for better performance
          supportedScanTypes: [0, 1], // Support both 1D and 2D barcodes
          rememberLastUsedCamera: true, // Remember camera selection
          showTorchButtonIfSupported: true, // Show torch button if available
          showZoomSliderIfSupported: true, // Show zoom slider if available
        }
        
        addDebugLog(`🔍 Scanner config: ${JSON.stringify(config)}`)
        
        const scanner = new Html5QrcodeScanner(
          scannerElementId,
          config,
          true // verbose - ENABLED FOR DEBUGGING
        )

        addDebugLog(`✅ Scanner instance created: ${!!scanner}`)
        scannerRef.current = scanner

        addDebugLog("🔍 Starting scanner.render()...")
        scanner.render(
          (decodedText) => {
            // Successfully scanned - validate it looks like a UPC
            addDebugLog("✅ Barcode detected!")
            addDebugLog(`✅ Raw decoded text: "${decodedText}"`)
            addDebugLog(`✅ Decoded text type: ${typeof decodedText}, length: ${decodedText.length}`)
            
            setScanningStatus("Barcode/QR Code detected!")
            const cleanedText = decodedText.trim()
            addDebugLog(`✅ Cleaned text: "${cleanedText}"`)
            
            // Basic validation: UPC codes are typically 8, 12, or 13 digits
            const isValidUPC = /^\d{8,13}$/.test(cleanedText)
            addDebugLog(`✅ Is valid UPC format: ${isValidUPC}`)
            
            if (isValidUPC) {
              addDebugLog(`✅ Setting UPC value: ${cleanedText}`)
              setUpc(cleanedText)
              // Small delay to show success message
              setTimeout(() => {
                addDebugLog("🔍 Stopping scanner after successful scan")
                setScanningStatus("Searching...")
                stopScanner()
                // Auto-trigger search after scanning
                addDebugLog("🔍 Auto-triggering search...")
                performSearch(cleanedText)
              }, 500)
            } else {
              // Not a valid UPC format, but still use it (might be EAN or other format)
              addDebugLog(`⚠️ Not standard UPC format, but using value: ${cleanedText}`)
              setUpc(cleanedText)
              setTimeout(() => {
                addDebugLog("🔍 Stopping scanner after scan (non-UPC format)")
                setScanningStatus("Searching...")
                stopScanner()
                // Auto-trigger search after scanning
                addDebugLog("🔍 Auto-triggering search...")
                performSearch(cleanedText)
              }, 500)
            }
          },
          (errorMessage) => {
            // Error callback - update status for user feedback
            if (errorMessage && !errorMessage.includes("NotFoundException")) {
              // Clear any existing cooldown
              if (errorCooldownRef.current) {
                clearTimeout(errorCooldownRef.current)
              }
              
              addDebugLog(`⚠️ Scanner error: ${errorMessage}`)
              setScanningStatus("Error detected - pausing...")
              
              // Add setTimeout to pause scanning after error before continuing
              errorCooldownRef.current = setTimeout(() => {
                addDebugLog("✅ Resuming scan after error cooldown")
                // Show scanning status
                if (errorMessage.includes("No MultiFormat Readers")) {
                  addDebugLog("⚠️ No MultiFormat Readers error")
                  setScanningStatus("Waiting for barcode...")
                } else {
                  addDebugLog("⚠️ Other scanning error")
                  setScanningStatus("Scanning...")
                }
                errorCooldownRef.current = null
              }, 1000) // Wait 1 second before resuming after error
            } else {
              // NotFoundException is normal - no barcode in frame yet
              // Don't log every NotFoundException to avoid spam
              setScanningStatus("Scanning...")
            }
          }
        )
        
        addDebugLog("✅ Scanner.render() called successfully")
        // Update status after initialization
        setScanningStatus("Ready - Position barcode in frame")
        addDebugLog("✅ Scanner initialization complete")
      } catch (err: any) {
        addDebugLog("❌ Error initializing scanner!")
        addDebugLog(`❌ Error message: ${err?.message || "Unknown error"}`)
        addDebugLog(`❌ Error name: ${err?.name || "Unknown"}`)
        if (err?.stack) {
          addDebugLog(`❌ Error stack: ${err.stack.substring(0, 200)}...`)
        }
        
        let errorMessage = "Failed to start camera. "
        
        if (err?.message?.includes("Permission denied") || err?.message?.includes("NotAllowedError")) {
          addDebugLog("❌ Permission denied error")
          errorMessage += "Please allow camera access in your browser settings."
        } else if (err?.message?.includes("NotFoundError") || err?.message?.includes("No camera")) {
          addDebugLog("❌ Camera not found error")
          errorMessage += "No camera found. Please connect a camera or use manual input."
        } else if (err?.message?.includes("NotReadableError")) {
          addDebugLog("❌ Camera not readable error")
          errorMessage += "Camera is already in use by another application."
        } else {
          addDebugLog("❌ Generic camera error")
          errorMessage += "Please check permissions and try again."
        }
        
        addDebugLog(`❌ Setting error message: ${errorMessage}`)
        setError(errorMessage)
        setScannerActive(false)
        setScanningStatus("")
        addDebugLog("❌ Error handling complete")
      }
    }, 100) // Small delay to ensure DOM is ready

    return () => {
      addDebugLog("🔍 useEffect cleanup function called")
      clearTimeout(timer)
      addDebugLog("🔍 Timer cleared")
      // Cleanup scanner if component unmounts or scannerActive changes
      if (scannerRef.current) {
        addDebugLog("🔍 Cleaning up scanner in useEffect cleanup")
        scannerRef.current.clear().catch((err) => {
          addDebugLog(`❌ Error in cleanup: ${err?.message || "Unknown"}`)
        })
        scannerRef.current = null
        addDebugLog("✅ Scanner cleaned up in useEffect")
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
  
  // Add keyboard support for Escape key to clear product and Spacebar to list on eBay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only clear if:
      // 1. Escape key is pressed
      // 2. Product data exists
      // 3. Scanner is not active (to avoid conflicts)
      // 4. No aspect form is showing (to allow escape to close form first)
      if (e.key === "Escape" && productData && !scannerActive && !showAspectForm) {
        handleClearProduct()
      }
      
      // Handle aspect form keyboard shortcuts
      if (showAspectForm) {
        // Space to confirm/submit aspects
        if (e.key === " " && 
            !(e.target instanceof HTMLInputElement) &&
            !(e.target instanceof HTMLTextAreaElement) &&
            !(e.target instanceof HTMLSelectElement)) {
          e.preventDefault()
          handleSubmitAspects()
        }
        // Escape to cancel aspect form
        if (e.key === "Escape") {
          setShowAspectForm(false)
          setMissingAspects([])
          setUserProvidedAspects({})
        }
      }
      
      // List on eBay with spacebar:
      // 1. Spacebar is pressed
      // 2. Product data exists
      // 3. Not currently editing (to avoid conflicts with text inputs)
      // 4. Not currently listing (to avoid duplicate listings)
      // 5. Scanner is not active
      // 6. No aspect form is showing
      // 7. Target is not an input, textarea, or button (to avoid conflicts)
      if (
        e.key === " " && 
        productData && 
        !isEditing && 
        !listingLoading && 
        !scannerActive && 
        !showAspectForm &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLButtonElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault() // Prevent page scroll
        handleListOnEbay()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [productData, scannerActive, showAspectForm, isEditing, listingLoading])

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

  const shouldShowConnectScreen =
    !isConnected && !productData && !error && !listingError && !listingSuccess

  if (shouldShowConnectScreen) {
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
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
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
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Scan Barcode
                    </h3>
                    <button
                      onClick={stopScanner}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      aria-label="Close scanner"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Scanner Container */}
                  <div id={scannerElementId} className="w-full mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 max-h-[250px]"></div>
                  
                  {/* Scanning Status */}
                  {scanningStatus && (
                    <div className="mb-4 text-center">
                      <p className={`text-sm font-medium ${
                        scanningStatus.includes("Error") || scanningStatus.includes("error")
                          ? "text-red-600 dark:text-red-400"
                          : scanningStatus.includes("detected") && !scanningStatus.includes("Error")
                          ? "text-green-600 dark:text-green-400" 
                          : scanningStatus.includes("Initializing")
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}>
                        {scanningStatus}
                      </p>
                    </div>
                  )}
                  
                  {/* Scanning Tips */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tips for Better Scanning
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li>Hold the barcode steady and parallel to the screen</li>
                      <li>Ensure good lighting (avoid glare and shadows)</li>
                      <li>Keep the barcode within the scanning frame</li>
                      <li>Hold the device 4-6 inches away from the barcode</li>
                      <li>Make sure the barcode is clear and not damaged</li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                    Position the barcode horizontally within the frame
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Duplicate Checking Notice */}
          {checkingDuplicates && productData && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Checking for duplicates from your connected eBay account...
                </p>
              </div>
            </div>
          )}

          {/* Duplicate Warning Banner */}
          {hasDuplicates && productData && duplicateSku && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-700 dark:text-red-400 mb-2">
                  Duplicate Notice
                </h3>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-red-200 dark:border-red-800 mb-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Existing Listing SKU:
                  </p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-400 font-mono">
                    {duplicateSku}
                  </p>
                </div>
                <p className="text-xs text-red-600 dark:text-red-300">
                  <span className="font-semibold">UPC:</span> <span className="font-mono font-semibold">{duplicateUpc || upc}</span> - This product is already listed in your eBay inventory.
                </p>
              </div>
            </div>
          )}
          
          {/* Show product details */}
          {productData && (
            <>
              {/* Previously Listed SKU - Show when exists */}
              <div className="flex gap-3.5">
                {listedSku && (
                  <div className="mb-6">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-700 rounded-lg w-96">
                      <h3 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                        Previous SKU Number
                      </h3>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400 font-mono">
                        {listedSku}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        This SKU was assigned to your last listed product
                      </p>
                    </div>
                  </div>
                )}
                
                {/* SKU Preview */}
                <div className="mb-6">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg w-96">
                    <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                      SKU Preview
                    </h3>
                    {loadingSku ? (
                      <p className="text-sm text-purple-600 dark:text-purple-400">Loading...</p>
                    ) : skuPreview ? (
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 font-mono">
                        {skuPreview}
                      </p>
                    ) : (
                      <p className="text-sm text-purple-600 dark:text-purple-400">No SKU available</p>
                    )}
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      This SKU will be assigned when you list this product
                    </p>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcut Hint */}
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400 justify-center">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span>Use</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Space</kbd>
                <span>to confirm or</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Escape</kbd>
                <span>to cancel</span>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Product Information
                  </h2>
                </div>

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
                    {/* Edit/Save buttons */}
                    <div className="flex justify-end gap-2 mb-4">
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            // Ensure condition defaults to "Used - Very Good" if empty
                            if (!editedCondition || editedCondition.trim() === "") {
                              setEditedCondition("Used - Very Good")
                            }
                            setIsEditing(true)
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title - Editable */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Title
                      </h3>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                          placeholder="Enter product title"
                        />
                      ) : (
                        <p className="mt-1 text-lg text-gray-900 dark:text-white">
                          {productData.title || "No title"}
                        </p>
                      )}
                    </div>

                    {/* Description - Editable */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Description
                      </h3>
                      {isEditing ? (
                        <textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter product description"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">
                          {productData.shortDescription || productData.description || "No description"}
                        </p>
                      )}
                    </div>

                    {/* Price - Editable */}
                    {productData.price && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Price
                          {isMeanPrice && (
                            <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1 font-normal">
                              This is the mean price of latest 10 listing
                            </span>
                          )}
                        </h3>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">{productData.price.currency || "USD"}</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editedPrice}
                              onChange={(e) => setEditedPrice(e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl font-bold"
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {productData.price.currency} {productData.price.value}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Condition - Editable */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Condition
                      </h3>
                      {isEditing ? (
                        <div>
                          <select
                            value={editedCondition}
                            onChange={(e) => setEditedCondition(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {conditions.map((condition) => (
                              <option key={condition} value={condition}>
                                {condition}
                              </option>
                            ))}
                          </select>
                          {editedCondition && getConditionDescription(editedCondition) && (
                            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 italic">
                              {getConditionDescription(editedCondition)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="mt-1 text-gray-900 dark:text-white font-semibold">
                            {productData.condition || "Not specified"}
                          </p>
                          {productData.condition && getConditionDescription(productData.condition) && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                              {getConditionDescription(productData.condition)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      {/* List on eBay Button */}
                      <button
                        onClick={() => handleListOnEbay()}
                        disabled={listingLoading || isEditing}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {listingLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Listing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            List on eBay
                          </>
                        )}
                      </button>
                      
                      {/* View on eBay Button */}
                      {productData.itemWebUrl && (
                        <a
                          href={productData.itemWebUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 text-center"
                        >
                          View on eBay
                        </a>
                      )}
                      
                      {/* View Listing Button (if successfully listed) */}
                      {listingSuccess && listingSuccess.startsWith("http") && (
                        <a
                          href={listingSuccess}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 text-center"
                        >
                          View Listing
                        </a>
                      )}
                    </div>
                    
                    {/* Listing Success Message */}
                    {listingSuccess && (
                      <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <div>
                            <p className="font-semibold">Success!</p>
                            {listedSku && (
                              <p className="font-mono text-sm font-semibold my-1">
                                {listedSku}
                              </p>
                            )}
                            <p>{listingSuccess}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Missing Item Specifics Form */}
                    {showAspectForm && missingAspects.length > 0 && (
                      <div className="mt-4 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 rounded-lg">
                        <div className="flex items-start gap-2 mb-4">
                          <svg className="w-5 h-5 mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Please fill in the following item specifics</h3>
                            <div className="space-y-4">
                              {missingAspects.map((aspect) => {
                                const aspectDef = aspectDefinitions.find((a: any) => a.name === aspect)
                                const hasPredefinedValues = aspectDef && aspectDef.values && aspectDef.values.length > 0
                                
                                return (
                                  <div key={aspect} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      {aspect} <span className="text-red-500">*</span>
                                    </label>
                                    {hasPredefinedValues ? (
                                      <select
                                        value={userProvidedAspects[aspect] || ""}
                                        onChange={(e) => setUserProvidedAspects({ ...userProvidedAspects, [aspect]: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                      >
                                        <option value="">Select {aspect}</option>
                                        {aspectDef.values.map((value: string) => (
                                          <option key={value} value={value}>{value}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type="text"
                                        value={userProvidedAspects[aspect] || ""}
                                        onChange={(e) => setUserProvidedAspects({ ...userProvidedAspects, [aspect]: e.target.value })}
                                        placeholder={`Enter ${aspect}`}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>                        
                            
                            <div className="flex gap-3 mt-6">
                              <button
                                onClick={handleSubmitAspects}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
                              >
                                Continue Listing
                              </button>
                              <button
                                onClick={() => {
                                  setShowAspectForm(false)
                                  setMissingAspects([])
                                  setUserProvidedAspects({})
                                }}
                                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Listing Error Message */}
                    {listingError && !showAspectForm && (
                      <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-semibold">Error</p>
                            <p className="mb-3">{listingError}</p>
                            {(listingError.includes("2004") || listingError.includes("sell.inventory") || listingError.includes("reconnect")) && (
                              <Link
                                href="/ebay-connect"
                                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
                              >
                                Go to eBay Connect Page →
                              </Link>
                            )}
                          </div>
                        </div>
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
            </>
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

