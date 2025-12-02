# SellInventoryV1.AvailabilityDistribution

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**fulfillmentTime** | [**TimeDuration**](TimeDuration.md) |  | [optional] 
**merchantLocationKey** | **String** | The unique identifier of an inventory location where quantity is available for the inventory item. This field is conditionally required to identify the inventory location that has quantity of the inventory item.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\&quot; target&#x3D;\&quot;_blank\&quot;&gt;getInventoryLocations&lt;/a&gt; method to retrieve merchant location keys. | [optional] 
**quantity** | **Number** | The integer value passed into this field indicates the quantity of the inventory item that is available at this inventory location. This field is conditionally required. | [optional] 


