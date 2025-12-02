# SellInventoryV1.Compatibility

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**compatibleProducts** | [**[CompatibleProduct]**](CompatibleProduct.md) | This container consists of an array of motor vehicles (make, model, year, trim, engine) that are compatible with the motor vehicle part or accessory specified by the sku value. | [optional] 
**sku** | **String** | The seller-defined SKU value of the inventory item that will be associated with the compatible vehicles.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; This field is not applicable to the &lt;strong&gt;createOrReplaceProductCompatibility&lt;/strong&gt; method, as the SKU value for the inventory item is passed in as part of the call URI and not in the request payload. It is always returned with the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/product_compatibility/methods/getProductCompatibility\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getProductCompatibility&lt;/a&gt; method.&lt;/span&gt; | [optional] 


