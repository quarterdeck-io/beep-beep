# BuyBrowseV1.ShippingOption

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**additionalShippingCostPerUnit** | [**ConvertedAmount**](ConvertedAmount.md) |  | [optional] 
**cutOffDateUsedForEstimate** | **String** | The deadline date that the item must be purchased by in order to be received by the buyer within the delivery window (&lt;b&gt; maxEstimatedDeliveryDate&lt;/b&gt; and  &lt;b&gt; minEstimatedDeliveryDate&lt;/b&gt; fields). This field is returned only for items that are eligible for &#39;Same Day Handling&#39;. For these items, the value of this field is what is displayed in the &lt;b&gt; Delivery&lt;/b&gt; line on the View Item page.  &lt;br&gt;&lt;br&gt;This value is returned in UTC format (yyyy-MM-ddThh:mm:ss.sssZ), which you can convert into the local time of the buyer. | [optional] 
**fulfilledThrough** | **String** | If the item is being shipped by the eBay &lt;a href&#x3D;\&quot;https://pages.ebay.com/seller-center/shipping/global-shipping-program.html \&quot;&gt;Global Shipping program&lt;/a&gt;, this field returns &lt;code&gt;GLOBAL_SHIPPING&lt;/code&gt;.&lt;br&gt;&lt;br&gt;If the item is being shipped using the eBay International Shipping program, this field returns &lt;code&gt;INTERNATIONAL_SHIPPING&lt;/code&gt;. &lt;br&gt;&lt;br&gt;Otherwise, this field is null. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/buy/browse/types/gct:FulfilledThroughEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**guaranteedDelivery** | **Boolean** | Although this field is still returned, it can be ignored since eBay Guaranteed Delivery is no longer a supported feature on any marketplace. This field may get removed from the schema in the future. | [optional] 
**importCharges** | [**ConvertedAmount**](ConvertedAmount.md) |  | [optional] 
**maxEstimatedDeliveryDate** | **String** | The end date of the delivery window (latest projected delivery date).  This value is returned in UTC format (yyyy-MM-ddThh:mm:ss.sssZ), which you can convert into the local time of the buyer. &lt;br&gt; &lt;br&gt; &lt;span class&#x3D;\&quot;tablenote\&quot;&gt; &lt;b&gt; Note: &lt;/b&gt; For the best accuracy, always include the location of where the item is be shipped in the &lt;code&gt; contextualLocation&lt;/code&gt; values of the &lt;a href&#x3D;\&quot;/api-docs/buy/static/api-browse.html#Headers\&quot;&gt; &lt;code&gt;X-EBAY-C-ENDUSERCTX&lt;/code&gt;&lt;/a&gt; request header.&lt;/span&gt;  | [optional] 
**minEstimatedDeliveryDate** | **String** | The start date of the delivery window (earliest projected delivery date). This value is returned in UTC format (yyyy-MM-ddThh:mm:ss.sssZ), which you can convert into the local time of the buyer. &lt;br&gt; &lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt; &lt;b&gt; Note: &lt;/b&gt; For the best accuracy, always include the location of where the item is be shipped in the &lt;code&gt; contextualLocation&lt;/code&gt; values of the &lt;a href&#x3D;\&quot;/api-docs/buy/static/api-browse.html#Headers\&quot;&gt; &lt;code&gt;X-EBAY-C-ENDUSERCTX&lt;/code&gt;&lt;/a&gt; request header.&lt;/span&gt; | [optional] 
**quantityUsedForEstimate** | **Number** | The number of items used when calculating the estimation information.&lt;br&gt;&lt;br&gt;This field will reflect the value input in the &lt;b&gt;quantity_for_shipping_estimate&lt;/b&gt; query parameter. | [optional] 
**shippingCarrierCode** | **String** | The name of the shipping provider, such as FedEx, or USPS. | [optional] 
**shippingCost** | [**ConvertedAmount**](ConvertedAmount.md) |  | [optional] 
**shippingCostType** | **String** | Indicates the class of the shipping cost. &lt;br&gt;&lt;br&gt;&lt;b&gt; Valid Values: &lt;/b&gt; FIXED or CALCULATED &lt;br&gt;&lt;br&gt;Code so that your app gracefully handles any future changes to this list.  | [optional] 
**shippingServiceCode** | **String** | The type of shipping service. For example, USPS First Class. | [optional] 
**shipToLocationUsedForEstimate** | [**ShipToLocation**](ShipToLocation.md) |  | [optional] 
**trademarkSymbol** | **String** | Any trademark symbol, such as &amp;#8482; or &amp;reg;, that needs to be shown in superscript next to the shipping service name. | [optional] 
**type** | **String** | The type of a shipping option, such as EXPEDITED, ONE_DAY, STANDARD, ECONOMY, PICKUP, etc. | [optional] 


