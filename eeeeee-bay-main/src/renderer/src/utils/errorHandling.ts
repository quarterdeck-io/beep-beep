// Error types and user-friendly messaging utilities

export interface ErrorDetails {
  code?: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  details?: string
  action?: {
    label: string
    handler: () => void
  }
  timestamp: Date
}

export interface EbayApiError {
  errorId?: number
  domain?: string
  subdomain?: string
  category?: string
  message?: string
  parameters?: Array<{
    name: string
    value: string
  }>
}

interface ParsedError {
  message?: string
  status?: number
  stack?: string
  response?: {
    body?: {
      errors?: EbayApiError[]
    }
  }
}

/**
 * Parses eBay API errors and returns user-friendly error details
 */
export function parseEbayError(error: unknown): ErrorDetails {
  const timestamp = new Date()
  const err = error as ParsedError // Type assertion for easier property access

  // Handle eBay API specific errors
  if (err?.response?.body?.errors?.[0]) {
    const ebayError: EbayApiError = err.response.body.errors[0]

    switch (ebayError.errorId) {
      case 25019:
        return {
          type: 'error',
          title: 'Account Verification Required',
          message:
            'Your eBay account needs additional verification before you can create listings.',
          details:
            'Please complete identity verification and add payment information in your eBay account settings.',
          action: {
            label: 'Open eBay Account Settings',
            handler: () => window.open('https://www.ebay.com/mye/myebay/summary', '_blank')
          },
          timestamp
        }

      case 25002: {
        const offerId = ebayError.parameters?.find((p) => p.name === 'offerId')?.value
        return {
          type: 'warning',
          title: 'Listing Already Exists',
          message: 'An offer for this item already exists in your inventory.',
          details: offerId
            ? `Existing offer ID: ${offerId}`
            : 'The system will attempt to use the existing offer.',
          timestamp
        }
      }

      case 21916:
        return {
          type: 'error',
          title: 'Authentication Required',
          message: 'Your eBay authentication has expired.',
          details: 'Please log out and log back in to refresh your authentication.',
          action: {
            label: 'Log Out',
            handler: () => window.location.reload()
          },
          timestamp
        }

      case 21917:
        return {
          type: 'error',
          title: 'Insufficient Permissions',
          message: "Your eBay application doesn't have the required permissions.",
          details: 'Please ensure your eBay application has selling permissions enabled.',
          timestamp
        }

      default:
        return {
          type: 'error',
          title: 'eBay API Error',
          message: ebayError.message || 'An unknown eBay API error occurred.',
          details: `Error ID: ${ebayError.errorId}${ebayError.domain ? ` | Domain: ${ebayError.domain}` : ''}`,
          timestamp
        }
    }
  }

  // Handle network and authentication errors
  if (err?.message?.includes('timeout')) {
    return {
      type: 'error',
      title: 'Request Timeout',
      message: 'The request took too long to complete.',
      details: 'Please check your internet connection and try again.',
      timestamp
    }
  }

  if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
    return {
      type: 'error',
      title: 'Network Error',
      message: 'Unable to connect to eBay services.',
      details: 'Please check your internet connection and try again.',
      timestamp
    }
  }

  if (err?.status === 401 || err?.message?.includes('401')) {
    return {
      type: 'error',
      title: 'Authentication Error',
      message: 'Your login session has expired.',
      details: 'Please log out and log back in.',
      action: {
        label: 'Log Out',
        handler: () => window.location.reload()
      },
      timestamp
    }
  }

  if (err?.status === 403 || err?.message?.includes('403')) {
    return {
      type: 'error',
      title: 'Access Denied',
      message: "You don't have permission to perform this action.",
      details: 'Please check your eBay account permissions and try again.',
      timestamp
    }
  }

  if (err?.status === 429 || err?.message?.includes('429')) {
    return {
      type: 'warning',
      title: 'Rate Limit Reached',
      message: 'Too many requests have been made.',
      details: 'Please wait a few minutes before trying again.',
      timestamp
    }
  }

  // Handle validation errors
  if (err?.message?.includes('Missing eBay Client Secret')) {
    return {
      type: 'error',
      title: 'Configuration Error',
      message: 'eBay Client Secret is missing.',
      details:
        'Please check your environment configuration and ensure VITE_EBAY_CLIENT_SECRET is set.',
      timestamp
    }
  }

  if (err?.message?.includes('Missing required eBay policies')) {
    return {
      type: 'error',
      title: 'eBay Policies Required',
      message: 'eBay selling policies need to be configured.',
      details: 'Please set up your payment, return, and fulfillment policies in eBay Seller Hub.',
      action: {
        label: 'Open eBay Seller Hub',
        handler: () => window.open('https://www.ebay.com/sh/policies', '_blank')
      },
      timestamp
    }
  }

  if (err?.message?.includes('Duplicate item found')) {
    const upc = err.message.match(/UPC: (\d+)/)?.[1]
    return {
      type: 'warning',
      title: 'Duplicate Product',
      message: 'This product is already in your inventory.',
      details: upc
        ? `UPC: ${upc} already exists in your listings.`
        : 'Please check your existing inventory.',
      timestamp
    }
  }

  // Generic error fallback
  return {
    type: 'error',
    title: 'Unexpected Error',
    message: err?.message || 'An unexpected error occurred.',
    details: err?.stack ? 'Check console for technical details.' : undefined,
    timestamp
  }
}

/**
 * Creates success messages for various operations
 */
export function createSuccessMessage(operation: string, details?: string): ErrorDetails {
  const messages = {
    product_search: {
      title: 'Product Found',
      message: 'Successfully found product information.'
    },
    listing_created: {
      title: 'Listing Published',
      message: 'Your listing has been successfully created and published on eBay.'
    },
    login_success: {
      title: 'Login Successful',
      message: 'Successfully authenticated with eBay.'
    },
    policies_configured: {
      title: 'Policies Configured',
      message: 'eBay selling policies have been set up successfully.'
    },
    sku_configured: {
      title: 'SKU Setup Complete',
      message: 'Initial SKU number has been configured.'
    }
  }

  const config = messages[operation as keyof typeof messages] || {
    title: 'Success',
    message: 'Operation completed successfully.'
  }

  return {
    type: 'success',
    title: config.title,
    message: config.message,
    details,
    timestamp: new Date()
  }
}

/**
 * Creates info messages for user guidance
 */
export function createInfoMessage(message: string, details?: string): ErrorDetails {
  return {
    type: 'info',
    title: 'Information',
    message,
    details,
    timestamp: new Date()
  }
}
