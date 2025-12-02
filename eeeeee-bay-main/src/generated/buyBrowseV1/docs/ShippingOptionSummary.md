# BuyBrowseV1.ShippingOptionSummary

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**guaranteedDelivery** | **Boolean** | Although this field is still returned, it can be ignored since eBay Guaranteed Delivery is no longer a supported feature on any marketplace. This field may get removed from the schema in the future. | [optional] 
**maxEstimatedDeliveryDate** | **String** | The end date of the delivery window (latest projected delivery date). This value is returned in UTC format (yyyy-MM-ddThh:mm:ss.sssZ), which you can convert into the local time of the buyer.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt; &lt;b&gt;Note: &lt;/b&gt; For the best accuracy, always include the &lt;code&gt;contextualLocation&lt;/code&gt; values in the &lt;a href&#x3D;\&quot;/api-docs/buy/static/api-browse.html#Headers\&quot; target&#x3D;\&quot;_blank\&quot;&gt;&lt;code&gt;X-EBAY-C-ENDUSERCTX&lt;/code&gt;&lt;/a&gt; request header.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt; &lt;b&gt;Note: &lt;/b&gt; Estimated delivery dates are not returned for CBT items.&lt;/span&gt; | [optional] 
**minEstimatedDeliveryDate** | **String** | The start date of the delivery window (earliest projected delivery date). This value is returned in UTC format (yyyy-MM-ddThh:mm:ss.sssZ), which you can convert into the local time of the buyer.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; For the best accuracy, always include the &lt;code&gt;contextualLocation&lt;/code&gt; values in the &lt;a href&#x3D;\&quot;/api-docs/buy/static/api-browse.html#Headers\&quot; target&#x3D;\&quot;_blank\&quot;&gt;&lt;code&gt;X-EBAY-C-ENDUSERCTX&lt;/code&gt;&lt;/a&gt; request header.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt; &lt;b&gt;Note: &lt;/b&gt; Estimated delivery dates are not returned for CBT items.&lt;/span&gt; | [optional] 
**shippingCost** | [**ConvertedAmount**](ConvertedAmount.md) |  | [optional] 
**shippingCostType** | **String** | Indicates the type of shipping used to ship the item. Possible values are &lt;code&gt;FIXED&lt;/code&gt; (flat-rate shipping) and &lt;code&gt;CALCULATED&lt;/code&gt; (shipping cost calculated based on item and buyer location). | [optional] 


