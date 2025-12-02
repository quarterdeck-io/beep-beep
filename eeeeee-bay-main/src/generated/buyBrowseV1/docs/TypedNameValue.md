# BuyBrowseV1.TypedNameValue

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | The text representing the name of the aspect for the name/value pair, such as Color. | [optional] 
**type** | **String** | This indicates if the value being returned is a string or an array of values. &lt;br&gt;&lt;br&gt;&lt;b&gt; Valid Values: &lt;/b&gt; &lt;ul&gt;&lt;li&gt;&lt;b&gt; STRING&lt;/b&gt; - Indicates the value returned is a string.&lt;/li&gt;  &lt;li&gt;&lt;b&gt; STRING_ARRAY&lt;/b&gt; - Indicates the value returned is an array of strings.&lt;/li&gt;&lt;/ul&gt;  Code so that your app gracefully handles any future changes to this list. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/buy/browse/types/gct:ValueTypeEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**value** | **String** | The value of the aspect for the name/value pair, such as Red. | [optional] 


