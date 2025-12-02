# SellInventoryV1.InventoryItems

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**href** | **String** | This is the URL to the current page of inventory items. | [optional] 
**inventoryItems** | [**[InventoryItemWithSkuLocaleGroupid]**](InventoryItemWithSkuLocaleGroupid.md) | This container is an array of one or more inventory items, with detailed information on each inventory item. | [optional] 
**limit** | **Number** | This integer value is the number of inventory items that will be displayed on each results page. | [optional] 
**next** | **String** | This is the URL to the next page of inventory items. This field will only be returned if there are additional inventory items to view. | [optional] 
**prev** | **String** | This is the URL to the previous page of inventory items. This field will only be returned if there are previous inventory items to view. | [optional] 
**size** | **Number** | This integer value indicates the total number of pages of results that are available. This number will depend on the total number of inventory items available for viewing, and on the &lt;strong&gt;limit&lt;/strong&gt; value. | [optional] 
**total** | **Number** | This integer value is the total number of inventory items that exist for the seller&#39;s account. Based on this number and on the &lt;strong&gt;limit&lt;/strong&gt; value, the seller may have to toggle through multiple pages to view all inventory items. | [optional] 


