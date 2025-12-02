# BuyBrowseV1.ItemLocationImpl

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**addressLine1** | **String** | The first line of the street address. | [optional] 
**addressLine2** | **String** | The second line of the street address. This field may contain such values as an apartment or suite number. | [optional] 
**city** | **String** | The city in which the item is located.&lt;br&gt;&lt;br&gt;&lt;b&gt;Restriction:&lt;/b&gt; This field is populated in the &lt;code&gt;search&lt;/code&gt; method response &lt;i&gt;only&lt;/i&gt; when &lt;code&gt;fieldgroups&lt;/code&gt; &#x3D; &lt;code&gt;EXTENDED&lt;/code&gt;. | [optional] 
**country** | **String** | The two-letter &lt;a href&#x3D;\&quot;https://www.iso.org/iso-3166-country-codes.html \&quot; target&#x3D;\&quot;_blank\&quot;&gt;ISO 3166&lt;/a&gt; standard code that indicates the country in which the item is located. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/buy/browse/types/ba:CountryCodeEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**county** | **String** | The county in which the item is located. | [optional] 
**postalCode** | **String** | The postal code (or zip code in US) where the item is located. Sellers set a postal code for items when they are listed. The postal code is used for calculating proximity searches. It is anonymized when returned in &lt;code&gt;itemLocation.postalCode&lt;/code&gt; via the API. | [optional] 
**stateOrProvince** | **String** | The state or province in which the item is located. | [optional] 


