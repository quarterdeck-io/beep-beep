# SellAccountV1.SalesTax

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**countryCode** | **String** | The country code enumeration value identifies the country to which this sales tax rate applies.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;US&lt;/code&gt;&lt;/li&gt;&lt;li&gt;&lt;code&gt;CA&lt;/code&gt;&lt;/li&gt;&lt;/ul&gt;&lt;/span&gt; For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/sell/account/types/ba:CountryCodeEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**salesTaxJurisdictionId** | **String** | A unique ID that identifies the sales tax jurisdiction to which the sales tax rate applies.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; When the returned &lt;code&gt;countryCode&lt;/code&gt; is &lt;code&gt;US&lt;/code&gt;, the only supported return values for &lt;code&gt;salesTaxJurisdictionId&lt;/code&gt; are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;AS&lt;/code&gt; (American Samoa)&lt;/li&gt;&lt;li&gt;&lt;code&gt;GU&lt;/code&gt; (Guam&lt;/li&gt;&lt;li&gt;&lt;code&gt;MP&lt;/code&gt; Northern Mariana Islands&lt;/li&gt;&lt;li&gt;&lt;code&gt;PW (Palau)&lt;/li&gt;&lt;li&gt;&lt;code&gt;VI&lt;/code&gt; (US Virgin Islands)&lt;/li&gt;&lt;/ul&gt;&lt;/span&gt; | [optional] 
**salesTaxPercentage** | **String** | The sales tax rate that will be applied to sales price. The &lt;b&gt;shippingAndHandlingTaxed&lt;/b&gt; value will indicate whether or not sales tax is also applied to shipping and handling charges&lt;br&gt;&lt;br&gt;Although it is a string, a percentage value is returned here, such as &lt;code&gt;7.75&lt;/code&gt; | [optional] 
**shippingAndHandlingTaxed** | **Boolean** | If returned as &lt;code&gt;true&lt;/code&gt;, sales tax is also applied to shipping and handling charges, and not just the total sales price of the order. | [optional] 


