# SellInventoryV1.TimeDuration

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**unit** | **String** | This enumeration value indicates the time unit used to specify the fulfillment time, such as &lt;code&gt;BUSINESS_DAY&lt;/code&gt;. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/sell/inventory/types/slr:TimeDurationUnitEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**value** | **Number** | The integer value in this field, along with the time unit in the &lt;strong&gt;unit&lt;/strong&gt; field, will indicate the fulfillment time.&lt;br&gt;&lt;br&gt;For standard orders that will be shipped, this value will indicate the expected fulfillment time if the inventory item is shipped from the inventory location. If the value of this field is &lt;code&gt;4&lt;/code&gt;, and the value of the &lt;strong&gt;unit&lt;/strong&gt; field is &lt;code&gt;BUSINESS_DAY&lt;/code&gt;, then the estimated delivery date after purchase is 4 business days. | [optional] 


