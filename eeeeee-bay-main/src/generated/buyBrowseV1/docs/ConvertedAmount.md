# BuyBrowseV1.ConvertedAmount

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**convertedFromCurrency** | **String** | The three-letter &lt;a href&#x3D;\&quot;https://www.iso.org/iso-4217-currency-codes.html \&quot; target&#x3D;\&quot;_blank\&quot;&gt;ISO 4217&lt;/a&gt; code representing the currency of the amount in the &lt;code&gt;convertedFromValue&lt;/code&gt; field. This value is required or returned only if currency conversion/localization is required, and represents the pre-conversion currency. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/buy/browse/types/ba:CurrencyCodeEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**convertedFromValue** | **String** | The monetary amount before any conversion is performed, in the currency specified by the &lt;code&gt;convertedFromCurrency&lt;/code&gt; field. This value is required or returned only if currency conversion/localization is required. The &lt;code&gt;value&lt;/code&gt; field contains the converted amount of this value, in the currency specified by the &lt;code&gt;currency&lt;/code&gt; field. | [optional] 
**currency** | **String** | The three-letter &lt;a href&#x3D;\&quot;https://www.iso.org/iso-4217-currency-codes.html \&quot; target&#x3D;\&quot;_blank\&quot;&gt;ISO 4217&lt;/a&gt; code representing the currency of the amount in the &lt;code&gt;value&lt;/code&gt; field. If currency conversion/localization is required, this is the post-conversion currency of the amount in the &lt;code&gt;value&lt;/code&gt; field.&lt;br&gt;&lt;br&gt;&lt;b&gt;Default:&lt;/b&gt; The currency of the authenticated user&#39;s country. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/buy/browse/types/ba:CurrencyCodeEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**value** | **String** | The monetary amount in the currency specified by the &lt;code&gt;currency&lt;/code&gt; field. If currency conversion/localization is required, this value is the converted amount, and the &lt;code&gt;convertedFromValue&lt;/code&gt; field contains the amount in the original currency. | [optional] 


