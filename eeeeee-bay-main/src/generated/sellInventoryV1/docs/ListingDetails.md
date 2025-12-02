# SellInventoryV1.ListingDetails

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**listingId** | **String** | The unique identifier of the eBay listing that is associated with the published offer.  | [optional] 
**listingOnHold** | **Boolean** | Indicates if a listing is on hold due to an eBay policy violation.&lt;br&gt;&lt;p&gt;If a listing is put on hold, users are unable to view the listing details, the listing is hidden from search, and all attempted purchases, offers, and bids for the listing are blocked. eBay, however, gives sellers the opportunity to address violations and get listings fully reinstated. A listing will be ended if a seller does not address a violation, or if the violation can not be rectified.&lt;/p&gt;&lt;br&gt;&lt;p&gt;If a listing is fixable, the seller should be able to view the listing details and this boolean will be returned as true.&lt;/p&gt;&lt;br&gt;&lt;p&gt;Once a listing is fixed, this boolean will no longer be returned.&lt;/p&gt; | [optional] 
**listingStatus** | **String** | The enumeration value returned in this field indicates the status of the listing that is associated with the published offer. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/sell/inventory/types/slr:ListingStatusEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**soldQuantity** | **Number** | This integer value indicates the quantity of the product that has been sold for the published offer. | [optional] 


