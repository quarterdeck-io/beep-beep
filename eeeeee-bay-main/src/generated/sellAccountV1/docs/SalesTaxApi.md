# SellAccountV1.SalesTaxApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createOrReplaceSalesTax**](SalesTaxApi.md#createOrReplaceSalesTax) | **PUT** /sales_tax/{countryCode}/{jurisdictionId} | 
[**deleteSalesTax**](SalesTaxApi.md#deleteSalesTax) | **DELETE** /sales_tax/{countryCode}/{jurisdictionId} | 
[**getSalesTax**](SalesTaxApi.md#getSalesTax) | **GET** /sales_tax/{countryCode}/{jurisdictionId} | 
[**getSalesTaxes**](SalesTaxApi.md#getSalesTaxes) | **GET** /sales_tax | 



## createOrReplaceSalesTax

> createOrReplaceSalesTax(countryCode, jurisdictionId, contentType, salesTaxBase)



This method creates or updates a sales-tax table entry for a jurisdiction. Specify the tax table entry you want to configure using the two path parameters: &lt;b&gt;countryCode&lt;/b&gt; and &lt;b&gt;jurisdictionId&lt;/b&gt;.  &lt;br&gt;&lt;br&gt;A tax table entry for a jurisdiction is comprised of two fields: one for the jurisdiction&#39;s sales-tax rate and another that&#39;s a boolean value indicating whether or not shipping and handling are taxed in the jurisdiction.&lt;br&gt;&lt;br&gt;You can set up &lt;i&gt;sales-tax tables&lt;/i&gt; for countries that support different &lt;i&gt;tax jurisdictions&lt;/i&gt;.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are only available for the US (EBAY_US) and Canada (EBAY_CA) marketplaces.&lt;/span&gt;&lt;br&gt;Retrieve valid jurisdiction IDs using &lt;b&gt;&lt;a href&#x3D;\&quot;/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions\&quot; target&#x3D;\&quot;_blank\&quot;&gt;getSalesTaxJurisdictions&lt;/a&gt;&lt;/b&gt; in the Metadata API.&lt;br&gt;&lt;br&gt;For details about using this call, refer to &lt;a href&#x3D;\&quot;/api-docs/sell/static/seller-accounts/tax-tables.html\&quot;&gt;Establishing sales-tax tables&lt;/a&gt;.&lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt; In the US, eBay now calculates, collects, and remits sales tax to the proper taxing authorities in all 50 states and Washington, DC. Sellers can no longer specify sales-tax rates for these jurisdictions using a tax table.&lt;br&gt;&lt;br&gt;However, sellers may continue to use a sales-tax table to set rates for the following US territories:&lt;ul&gt;&lt;li&gt;American Samoa (AS)&lt;/li&gt;&lt;li&gt;Guam (GU)&lt;/li&gt;&lt;li&gt;Northern Mariana Islands (MP)&lt;/li&gt;&lt;li&gt;Palau (PW)&lt;/li&gt;&lt;li&gt;US Virgin Islands (VI)&lt;/li&gt;&lt;/ul&gt;For additional information, refer to &lt;a href&#x3D;\&quot;https://www.ebay.com/help/selling/fees-credits-invoices/taxes-import-charges?id&#x3D;4121 \&quot; target&#x3D;\&quot;_blank\&quot;&gt;Taxes and import charges&lt;/a&gt;.&lt;/p&gt;&lt;/div&gt;

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.SalesTaxApi();
let countryCode = "countryCode_example"; // String | This path parameter specifies the two-letter <a href=\"https://www.iso.org/iso-3166-country-codes.html \" title=\"https://www.iso.org \" target=\"_blank\">ISO 3166</a> code for the country for which you want to create a sales tax table entry.<br><br><span class=\"tablenote\"><b>Note:</b> Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:<ul><li><code>US</code></li><li><code>CA</code></li></ul>
let jurisdictionId = "jurisdictionId_example"; // String | This path parameter specifies the ID of the tax jurisdiction for the table entry to be created.<br><br>Valid jurisdiction IDs can be retrieved using the <a href=\"/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions\" target=\"_blank \">getSalesTaxJurisdiction</a> method of the Metadata API.<br><br><span class=\"tablenote\"><b>Note:</b> When <code>countryCode</code> is set to <code>US</code>, the only supported values for <code>jurisdictionId</code> are:<ul><li><code>AS</code> (American Samoa)</li><li><code>GU</code> (Guam)</li><li><code>MP</code> (Northern Mariana Islands)</li><li><code>PW</code> (Palau)</li><li><code>VI</code> (US Virgin Islands)</li></ul></span>
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>.<br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let salesTaxBase = new SellAccountV1.SalesTaxBase(); // SalesTaxBase | A container that describes the how the sales tax is calculated.
apiInstance.createOrReplaceSalesTax(countryCode, jurisdictionId, contentType, salesTaxBase, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **countryCode** | **String**| This path parameter specifies the two-letter &lt;a href&#x3D;\&quot;https://www.iso.org/iso-3166-country-codes.html \&quot; title&#x3D;\&quot;https://www.iso.org \&quot; target&#x3D;\&quot;_blank\&quot;&gt;ISO 3166&lt;/a&gt; code for the country for which you want to create a sales tax table entry.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;US&lt;/code&gt;&lt;/li&gt;&lt;li&gt;&lt;code&gt;CA&lt;/code&gt;&lt;/li&gt;&lt;/ul&gt; | 
 **jurisdictionId** | **String**| This path parameter specifies the ID of the tax jurisdiction for the table entry to be created.&lt;br&gt;&lt;br&gt;Valid jurisdiction IDs can be retrieved using the &lt;a href&#x3D;\&quot;/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getSalesTaxJurisdiction&lt;/a&gt; method of the Metadata API.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; When &lt;code&gt;countryCode&lt;/code&gt; is set to &lt;code&gt;US&lt;/code&gt;, the only supported values for &lt;code&gt;jurisdictionId&lt;/code&gt; are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;AS&lt;/code&gt; (American Samoa)&lt;/li&gt;&lt;li&gt;&lt;code&gt;GU&lt;/code&gt; (Guam)&lt;/li&gt;&lt;li&gt;&lt;code&gt;MP&lt;/code&gt; (Northern Mariana Islands)&lt;/li&gt;&lt;li&gt;&lt;code&gt;PW&lt;/code&gt; (Palau)&lt;/li&gt;&lt;li&gt;&lt;code&gt;VI&lt;/code&gt; (US Virgin Islands)&lt;/li&gt;&lt;/ul&gt;&lt;/span&gt; | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;.&lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **salesTaxBase** | [**SalesTaxBase**](SalesTaxBase.md)| A container that describes the how the sales tax is calculated. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## deleteSalesTax

> deleteSalesTax(countryCode, jurisdictionId)



This call deletes a sales-tax table entry for a jurisdiction. Specify the jurisdiction to delete using the &lt;b&gt;countryCode&lt;/b&gt; and &lt;b&gt;jurisdictionId&lt;/b&gt; path parameters.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are only available for the US (EBAY_US) and Canada (EBAY_CA) marketplaces.&lt;/span&gt;

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.SalesTaxApi();
let countryCode = "countryCode_example"; // String | This path parameter specifies the two-letter <a href=\"https://www.iso.org/iso-3166-country-codes.html \" title=\"https://www.iso.org \" target=\"_blank\">ISO 3166</a> code for the country whose sales tax table entry you want to delete.<br><br><span class=\"tablenote\"><b>Note:</b> Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:<ul><li><code>US</code></li><li><code>CA</code></li></ul></span>
let jurisdictionId = "jurisdictionId_example"; // String | This path parameter specifies the ID of the sales tax jurisdiction whose table entry you want to delete.<br><br>Valid jurisdiction IDs can be retrieved using the <a href=\"/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions\" target=\"_blank \">getSalesTaxJurisdiction</a> method of the Metadata API.<br><br><span class=\"tablenote\"><b>Note:</b> When <code>countryCode</code> is set to <code>US</code>, the only supported values for <code>jurisdictionId</code> are:<ul><li><code>AS</code> (American Samoa)</li><li><code>GU</code> (Guam)</li><li><code>MP</code> (Northern Mariana Islands)</li><li><code>PW</code> (Palau)</li><li><code>VI</code> (US Virgin Islands)</li></ul></span>
apiInstance.deleteSalesTax(countryCode, jurisdictionId, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **countryCode** | **String**| This path parameter specifies the two-letter &lt;a href&#x3D;\&quot;https://www.iso.org/iso-3166-country-codes.html \&quot; title&#x3D;\&quot;https://www.iso.org \&quot; target&#x3D;\&quot;_blank\&quot;&gt;ISO 3166&lt;/a&gt; code for the country whose sales tax table entry you want to delete.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;US&lt;/code&gt;&lt;/li&gt;&lt;li&gt;&lt;code&gt;CA&lt;/code&gt;&lt;/li&gt;&lt;/ul&gt;&lt;/span&gt; | 
 **jurisdictionId** | **String**| This path parameter specifies the ID of the sales tax jurisdiction whose table entry you want to delete.&lt;br&gt;&lt;br&gt;Valid jurisdiction IDs can be retrieved using the &lt;a href&#x3D;\&quot;/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getSalesTaxJurisdiction&lt;/a&gt; method of the Metadata API.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; When &lt;code&gt;countryCode&lt;/code&gt; is set to &lt;code&gt;US&lt;/code&gt;, the only supported values for &lt;code&gt;jurisdictionId&lt;/code&gt; are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;AS&lt;/code&gt; (American Samoa)&lt;/li&gt;&lt;li&gt;&lt;code&gt;GU&lt;/code&gt; (Guam)&lt;/li&gt;&lt;li&gt;&lt;code&gt;MP&lt;/code&gt; (Northern Mariana Islands)&lt;/li&gt;&lt;li&gt;&lt;code&gt;PW&lt;/code&gt; (Palau)&lt;/li&gt;&lt;li&gt;&lt;code&gt;VI&lt;/code&gt; (US Virgin Islands)&lt;/li&gt;&lt;/ul&gt;&lt;/span&gt; | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## getSalesTax

> SalesTax getSalesTax(countryCode, jurisdictionId)



This call retrieves the current sales-tax table entry for a specific tax jurisdiction. Specify the jurisdiction to retrieve using the &lt;b&gt;countryCode&lt;/b&gt; and &lt;b&gt;jurisdictionId&lt;/b&gt; path parameters. All four response fields will be returned if a sales-tax entry exists for the tax jurisdiction. Otherwise, the response will be returned as empty.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are only available for the US (EBAY_US) and Canada (EBAY_CA) marketplaces.&lt;/span&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt; In the US, eBay now calculates, collects, and remits sales tax to the proper taxing authorities in all 50 states and Washington, DC. Sellers can no longer specify sales-tax rates for these jurisdictions using a tax table.&lt;br&gt;&lt;br&gt;However, sellers may continue to use a sales-tax table to set rates for the following US territories:&lt;ul&gt;&lt;li&gt;American Samoa (AS)&lt;/li&gt;&lt;li&gt;Guam (GU)&lt;/li&gt;&lt;li&gt;Northern Mariana Islands (MP)&lt;/li&gt;&lt;li&gt;Palau (PW)&lt;/li&gt;&lt;li&gt;US Virgin Islands (VI)&lt;/li&gt;&lt;/ul&gt;For additional information, refer to &lt;a href&#x3D;\&quot;https://www.ebay.com/help/selling/fees-credits-invoices/taxes-import-charges?id&#x3D;4121 \&quot; target&#x3D;\&quot;_blank\&quot;&gt;Taxes and import charges&lt;/a&gt;.&lt;/p&gt;&lt;/div&gt;

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.SalesTaxApi();
let countryCode = "countryCode_example"; // String | This path parameter specifies the two-letter <a href=\"https://www.iso.org/iso-3166-country-codes.html \" title=\"https://www.iso.org \" target=\"_blank\">ISO 3166</a> code for the country whose sales tax table you want to retrieve.<br><br><span class=\"tablenote\"><b>Note:</b> Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:<ul><li><code>US</code></li><li><code>CA</code></li></ul></span>
let jurisdictionId = "jurisdictionId_example"; // String | This path parameter specifies the ID of the sales tax jurisdiction for the tax table entry to be retrieved.<br><br>Valid jurisdiction IDs can be retrieved using the <a href=\"/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions\" target=\"_blank \">getSalesTaxJurisdiction</a> method of the Metadata API.<br><br><span class=\"tablenote\"><b>Note:</b> When <code>countryCode</code> is set to <code>US</code>, the only supported values for <code>jurisdictionId</code> are:<ul><li><code>AS</code> (American Samoa)</li><li><code>GU</code> (Guam</li><li><code>MP</code> Northern Mariana Islands</li><li><code>PW (Palau)</li><li><code>VI</code> (US Virgin Islands)</li></ul></span>
apiInstance.getSalesTax(countryCode, jurisdictionId, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **countryCode** | **String**| This path parameter specifies the two-letter &lt;a href&#x3D;\&quot;https://www.iso.org/iso-3166-country-codes.html \&quot; title&#x3D;\&quot;https://www.iso.org \&quot; target&#x3D;\&quot;_blank\&quot;&gt;ISO 3166&lt;/a&gt; code for the country whose sales tax table you want to retrieve.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;US&lt;/code&gt;&lt;/li&gt;&lt;li&gt;&lt;code&gt;CA&lt;/code&gt;&lt;/li&gt;&lt;/ul&gt;&lt;/span&gt; | 
 **jurisdictionId** | **String**| This path parameter specifies the ID of the sales tax jurisdiction for the tax table entry to be retrieved.&lt;br&gt;&lt;br&gt;Valid jurisdiction IDs can be retrieved using the &lt;a href&#x3D;\&quot;/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getSalesTaxJurisdiction&lt;/a&gt; method of the Metadata API.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; When &lt;code&gt;countryCode&lt;/code&gt; is set to &lt;code&gt;US&lt;/code&gt;, the only supported values for &lt;code&gt;jurisdictionId&lt;/code&gt; are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;AS&lt;/code&gt; (American Samoa)&lt;/li&gt;&lt;li&gt;&lt;code&gt;GU&lt;/code&gt; (Guam&lt;/li&gt;&lt;li&gt;&lt;code&gt;MP&lt;/code&gt; Northern Mariana Islands&lt;/li&gt;&lt;li&gt;&lt;code&gt;PW (Palau)&lt;/li&gt;&lt;li&gt;&lt;code&gt;VI&lt;/code&gt; (US Virgin Islands)&lt;/li&gt;&lt;/ul&gt;&lt;/span&gt; | 

### Return type

[**SalesTax**](SalesTax.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getSalesTaxes

> SalesTaxes getSalesTaxes(countryCode)



Use this call to retrieve all sales tax table entries that the seller has defined for a specific country. All four response fields will be returned for each tax jurisdiction that matches the search criteria. If no sales tax rates are defined for the specified, a &lt;code&gt;204 No Content&lt;/code&gt; status code is returned with no response payload.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are only available for the US (EBAY_US) and Canada (EBAY_CA) marketplaces.&lt;/span&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt; In the US, eBay now calculates, collects, and remits sales tax to the proper taxing authorities in all 50 states and Washington, DC. Sellers can no longer specify sales-tax rates for these jurisdictions using a tax table.&lt;br&gt;&lt;br&gt;However, sellers may continue to use a sales-tax table to set rates for the following US territories:&lt;ul&gt;&lt;li&gt;American Samoa (AS)&lt;/li&gt;&lt;li&gt;Guam (GU)&lt;/li&gt;&lt;li&gt;Northern Mariana Islands (MP)&lt;/li&gt;&lt;li&gt;Palau (PW)&lt;/li&gt;&lt;li&gt;US Virgin Islands (VI)&lt;/li&gt;&lt;/ul&gt;For additional information, refer to &lt;a href&#x3D;\&quot;https://www.ebay.com/help/selling/fees-credits-invoices/taxes-import-charges?id&#x3D;4121 \&quot; target&#x3D;\&quot;_blank\&quot;&gt;Taxes and import charges&lt;/a&gt;.&lt;/p&gt;&lt;/div&gt;

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.SalesTaxApi();
let countryCode = "countryCode_example"; // String | This path parameter specifies the two-letter <a href=\"https://www.iso.org/iso-3166-country-codes.html \" title=\"https://www.iso.org \" target=\"_blank\">ISO 3166</a> code for the country whose tax table you want to retrieve.<br><br><span class=\"tablenote\"><b>Note:</b> Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:<ul><li><code>US</code></li><li><code>CA</code></li></ul></span> For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/sell/account/types/ba:CountryCodeEnum
apiInstance.getSalesTaxes(countryCode, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **countryCode** | **String**| This path parameter specifies the two-letter &lt;a href&#x3D;\&quot;https://www.iso.org/iso-3166-country-codes.html \&quot; title&#x3D;\&quot;https://www.iso.org \&quot; target&#x3D;\&quot;_blank\&quot;&gt;ISO 3166&lt;/a&gt; code for the country whose tax table you want to retrieve.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sales-tax tables are available only for the US and Canada marketplaces. Therefore, the only supported values are:&lt;ul&gt;&lt;li&gt;&lt;code&gt;US&lt;/code&gt;&lt;/li&gt;&lt;li&gt;&lt;code&gt;CA&lt;/code&gt;&lt;/li&gt;&lt;/ul&gt;&lt;/span&gt; For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/sell/account/types/ba:CountryCodeEnum | 

### Return type

[**SalesTaxes**](SalesTaxes.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

