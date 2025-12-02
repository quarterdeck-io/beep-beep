# SellInventoryV1.InventoryItemListing

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**offerId** | **String** | Upon a successful migration of a listing, eBay auto-generates this unique identifier, and this offer ID value will be used to retrieve and manage the newly-created offer object. This value will only be generated and returned if the eBay listing is migrated successfully. | [optional] 
**sku** | **String** | This is the seller-defined SKU value associated with the item(s) in a listing. This same SKU value will be used to retrieve and manage the newly-created inventory item object if the listing migration is successful. This SKU value will get returned even if the migration is not successful. | [optional] 


