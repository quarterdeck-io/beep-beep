# SellInventoryV1.ListingApi

All URIs are relative to *https://api.ebay.com/sell/inventory/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bulkMigrateListing**](ListingApi.md#bulkMigrateListing) | **POST** /bulk_migrate_listing | 
[**createOrReplaceSkuLocationMapping**](ListingApi.md#createOrReplaceSkuLocationMapping) | **PUT** /listing/{listingId}/sku/{sku}/locations | 
[**deleteSkuLocationMapping**](ListingApi.md#deleteSkuLocationMapping) | **DELETE** /listing/{listingId}/sku/{sku}/locations | 
[**getSkuLocationMapping**](ListingApi.md#getSkuLocationMapping) | **GET** /listing/{listingId}/sku/{sku}/locations | 



## bulkMigrateListing

> BulkMigrateListingResponse bulkMigrateListing(contentType, bulkMigrateListing)



This call is used to convert existing eBay Listings to the corresponding Inventory API objects. If an eBay listing is successfully migrated to the Inventory API model, new Inventory Location, Inventory Item, and Offer objects are created. For a multiple-variation listing that is successfully migrated, in addition to the three new Inventory API objects just mentioned, an Inventory Item Group object will also be created. If the eBay listing is a motor vehicle part or accessory listing with a compatible vehicle list (&lt;strong&gt;ItemCompatibilityList&lt;/strong&gt; container in Trading API&#39;s Add/Revise/Relist/Verify calls), a Product Compatibility object will be created.&lt;br&gt;&lt;br&gt;&lt;h3&gt;Migration Requirements&lt;/h3&gt;&lt;br&gt;To be eligible for migration, the active eBay listings must meet the following requirements:&lt;ul&gt;&lt;li&gt;Listing type is Fixed-Price&lt;p&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Auction listings are supported by the Inventory API, but the &lt;b&gt;bulkMigrateListing&lt;/b&gt; method cannot be used to migrate auction listings.&lt;/span&gt;&lt;/p&gt;&lt;/li&gt;&lt;li&gt;The item(s) in the listings must have seller-defined SKU values associated with them, and in the case of a multiple-variation listing, each product variation must also have its own SKU value&lt;/li&gt;&lt;li&gt;Business Polices (Payment, Return Policy, and Shipping) must be used on the listing, as legacy payment, return policy, and shipping fields will not be accepted. With the Payment Policy associated with a listing, the immediate payment requirement must be enabled.&lt;/li&gt;&lt;li&gt;The postal/zip code (&lt;strong&gt;PostalCode&lt;/strong&gt; field in Trading&#39;s &lt;strong&gt;ItemType&lt;/strong&gt;) or city (&lt;strong&gt;Location&lt;/strong&gt; field in Trading&#39;s &lt;strong&gt;ItemType&lt;/strong&gt;) must be set in the listing; the country is also needed, but this value is required in Trading API, so it will always be set for every listing&lt;/li&gt;&lt;/ul&gt;&lt;br&gt;&lt;h3&gt;Unsupported Listing Features&lt;/h3&gt;&lt;br&gt;The following features are not yet available to be set or modified through the Inventory API, but they will remain on the active eBay listing, even after a successful migration to the Inventory model. The downside to this is that the seller will be completely blocked (in APIs or My eBay) from revising these features/settings once the migration takes place:&lt;ul&gt;&lt;li&gt;Any listing-level Buyer Requirements&lt;/li&gt;&lt;li&gt;Listing enhancements like a bold listing title or Gallery Plus&lt;/li&gt;&lt;/ul&gt;&lt;br&gt;&lt;h3&gt;Making the Call&lt;/h3&gt;&lt;br&gt;In the request payload of the &lt;strong&gt;bulkMigrateListings&lt;/strong&gt; call, the seller will pass in an array of one to five eBay listing IDs (aka Item IDs). To save time and hassle, that seller should do a pre-check on each listing to make sure those listings meet the requirements to be migrated to the new Inventory model. This method also requires the &lt;code&gt;Content-Type&lt;/code&gt; request header. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/listing/methods/bulkMigrateListing#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information. There are no path or query parameters for this call.&lt;br&gt;&lt;br&gt;&lt;h3&gt;Call Response&lt;/h3&gt;&lt;br&gt;If an eBay listing is migrated successfully to the new Inventory model, the following will occur:&lt;ul&gt;&lt;li&gt;An Inventory Item object will be created for the item(s) in the listing, and this object will be accessible through the Inventory API&lt;/li&gt;&lt;li&gt;An Offer object will be created for the listing, and this object will be accessible through the Inventory API&lt;/li&gt;&lt;li&gt;An Inventory Location object will be created and associated with the Offer object, as an Inventory Location must be associated with a published Offer&lt;/li&gt;&lt;/ul&gt;The response payload of the Bulk Migrate Listings call will show the results of each listing migration. These results include an HTTP status code to indicate the success or failure of each listing migration, the SKU value associated with each item, and if the migration is successful, an Offer ID value. The SKU value will be used in the Inventory API to manage the Inventory Item object, and the Offer ID value will be used in the Inventory API to manage the Offer object. Errors and/or warnings containers will be returned for each listing where an error and/or warning occurred with the attempted migration.&lt;br&gt;&lt;br&gt;If a multiple-variation listing is successfully migrated, along with the Offer and Inventory Location objects, an Inventory Item object will be created for each product variation within the listing, and an Inventory Item Group object will also be created, grouping those variations together in the Inventory API platform. For a motor vehicle part or accessory listing that has a specified list of compatible vehicles, in addition to the Inventory Item, Inventory Location, and Offer objects that are created, a Product Compatibility object will also be created in the Inventory API platform.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.ListingApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let bulkMigrateListing = new SellInventoryV1.BulkMigrateListing(); // BulkMigrateListing | Details of the listings that needs to be migrated into Inventory
apiInstance.bulkMigrateListing(contentType, bulkMigrateListing, (error, data, response) => {
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
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **bulkMigrateListing** | [**BulkMigrateListing**](BulkMigrateListing.md)| Details of the listings that needs to be migrated into Inventory | 

### Return type

[**BulkMigrateListingResponse**](BulkMigrateListingResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createOrReplaceSkuLocationMapping

> createOrReplaceSkuLocationMapping(listingId, sku, contentType, locationMapping)



This method allows sellers to map multiple fulfillment center locations to single-SKU listing, or to a single SKU within a multiple-variation listing. This allows eBay to leverage the location metadata associated with a seller’s fulfillment centers to calculate more accurate estimated delivery dates on their listing.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; While location mappings can be created for listings on any eBay marketplace, the improved delivery date estimate feature is currently only supported for US-based fulfillment centers shipping domestically within the US.&lt;/span&gt;&lt;br&gt;The listing for which the locations will be mapped is specified through the &lt;b&gt;listingId&lt;/b&gt; and &lt;b&gt;sku&lt;/b&gt; values associated with the item. Note that only a single SKU value can be identified; if the seller wishes to map locations to multiple/all SKU values in a multiple-variation listing, this method must be called for each of those SKUs within the listing.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Sellers should keep track of &lt;b&gt;listingId&lt;/b&gt;/&lt;b&gt;sku&lt;/b&gt; pairs that have been used for location mapping, as there is no programmatic way to retrieve or delete these pairs at this time.&lt;/span&gt;&lt;br&gt;In the case of replacing/updating existing location mappings, this method will do a complete replacement of the location mappings associated with a SKU. This means that each existing location mappings that the seller wants to continue to associate with the SKU are required in the update call, regardless of if they are affected by the update.&lt;br&gt;&lt;br&gt;This method is only supported for inventory locations that have &lt;code&gt;FULFILLMENT_CENTER&lt;/code&gt; as one of their &lt;b&gt;locationTypes&lt;/b&gt;. For more information on fulfillment center locations, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/multi-warehouse-program.html#create-location\&quot; target&#x3D;\&quot;_blank \&quot;&gt;Create a fulfillment center location&lt;/a&gt;.&lt;br&gt;&lt;br&gt;For more information on location mapping features, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/multi-warehouse-program.html\&quot; target&#x3D;\&quot;_blank \&quot;&gt;Multi-warehouse program&lt;/a&gt; in the Selling Integration Guide.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Only listings with SKU values are supported. Sellers using listings creating through the Trading API can add a SKU value to their single variation listing through the &lt;a href&#x3D;\&quot;/Devzone/XML/docs/Reference/eBay/AddFixedPriceItem.html#Request.Item.SKU\&quot; target&#x3D;\&quot;_blank \&quot;&gt;Item.SKU&lt;/a&gt; field during listing creation or by using the &lt;b&gt;ReviseItem&lt;/b&gt; family of calls.&lt;/span&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.ListingApi();
let listingId = "listingId_example"; // String | This path parameter specifies the unique identifier of the listing for which multiple fulfillment center locations will be mapped to a SKU within that listing.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\" target=\"_blank \">getOffers</a> method of the Inventory API or the <a href=\"/devzone/xml/docs/reference/ebay/getmyebayselling.html\" target=\"_blank \">GetMyEbaySelling</a> method of the Trading API to retrieve all listing IDs for all active listings.
let sku = "sku_example"; // String | This path parameter specifies the seller-defined SKU value of the item/variation for which multiple fulfillment center locations will be mapped. This SKU value must be defined in the listing specified in <b>listingId</b> parameter.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\" target=\"_blank \">getOffers</a> method of the Inventory API or the <a href=\"/devzone/xml/docs/reference/ebay/getmyebayselling.html\" target=\"_blank \">GetMyEbaySelling</a> method of the Trading API to retrieve all listing IDs for all active listings.<br><br><span class=\"tablenote\"><b>Note:</b> SKU values can be updated by a seller at any time. If a seller updates a SKU value that is being used for location mapping, this change will not be reflected until the mapping is updated through the <b>createOrReplaceSkuLocationMapping</b> method.</span>
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let locationMapping = new SellInventoryV1.LocationMapping(); // LocationMapping | 
apiInstance.createOrReplaceSkuLocationMapping(listingId, sku, contentType, locationMapping, (error, data, response) => {
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
 **listingId** | **String**| This path parameter specifies the unique identifier of the listing for which multiple fulfillment center locations will be mapped to a SKU within that listing.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getOffers&lt;/a&gt; method of the Inventory API or the &lt;a href&#x3D;\&quot;/devzone/xml/docs/reference/ebay/getmyebayselling.html\&quot; target&#x3D;\&quot;_blank \&quot;&gt;GetMyEbaySelling&lt;/a&gt; method of the Trading API to retrieve all listing IDs for all active listings. | 
 **sku** | **String**| This path parameter specifies the seller-defined SKU value of the item/variation for which multiple fulfillment center locations will be mapped. This SKU value must be defined in the listing specified in &lt;b&gt;listingId&lt;/b&gt; parameter.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getOffers&lt;/a&gt; method of the Inventory API or the &lt;a href&#x3D;\&quot;/devzone/xml/docs/reference/ebay/getmyebayselling.html\&quot; target&#x3D;\&quot;_blank \&quot;&gt;GetMyEbaySelling&lt;/a&gt; method of the Trading API to retrieve all listing IDs for all active listings.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; SKU values can be updated by a seller at any time. If a seller updates a SKU value that is being used for location mapping, this change will not be reflected until the mapping is updated through the &lt;b&gt;createOrReplaceSkuLocationMapping&lt;/b&gt; method.&lt;/span&gt; | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **locationMapping** | [**LocationMapping**](LocationMapping.md)|  | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## deleteSkuLocationMapping

> deleteSkuLocationMapping(listingId, sku)



This method allows sellers to remove all location mappings associated with a specific SKU within a listing.&lt;br&gt;&lt;br&gt;The &lt;b&gt;listingId&lt;/b&gt; and &lt;b&gt;sku&lt;/b&gt; of the listing are passed in as path parameters.&lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt; To remove all location mappings from a multiple-variation listing, this method must be used for each individual SKU in the listing.&lt;/p&gt;&lt;/div&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.ListingApi();
let listingId = "listingId_example"; // String | This path parameter specifies the unique identifier of the listing that the SKU belongs to for which all mapped locations will be removed.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\" target=\"_blank \">getOffers</a> method of the <b>Inventory API</b> or the <a href=\"/devzone/xml/docs/reference/ebay/getmyebayselling.html\" target=\"_blank \">GetMyEbaySelling</a> method of the <b>Trading API</b> to retrieve all listing IDs for all active listings.
let sku = "sku_example"; // String | This path parameter specifies the seller-defined SKU value of the item/variation for which location mappings will be removed. This SKU value must be defined in the listing specified in <b>listingId</b> parameter<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\" target=\"_blank \">getOffers</a> method of the <b>Inventory API</b> or the <a href=\"/devzone/xml/docs/reference/ebay/getmyebayselling.html\" target=\"_blank \">GetMyEbaySelling</a> method of the <b>Trading API</b> to retrieve all SKUs for all active listings.
apiInstance.deleteSkuLocationMapping(listingId, sku, (error, data, response) => {
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
 **listingId** | **String**| This path parameter specifies the unique identifier of the listing that the SKU belongs to for which all mapped locations will be removed.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getOffers&lt;/a&gt; method of the &lt;b&gt;Inventory API&lt;/b&gt; or the &lt;a href&#x3D;\&quot;/devzone/xml/docs/reference/ebay/getmyebayselling.html\&quot; target&#x3D;\&quot;_blank \&quot;&gt;GetMyEbaySelling&lt;/a&gt; method of the &lt;b&gt;Trading API&lt;/b&gt; to retrieve all listing IDs for all active listings. | 
 **sku** | **String**| This path parameter specifies the seller-defined SKU value of the item/variation for which location mappings will be removed. This SKU value must be defined in the listing specified in &lt;b&gt;listingId&lt;/b&gt; parameter&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getOffers&lt;/a&gt; method of the &lt;b&gt;Inventory API&lt;/b&gt; or the &lt;a href&#x3D;\&quot;/devzone/xml/docs/reference/ebay/getmyebayselling.html\&quot; target&#x3D;\&quot;_blank \&quot;&gt;GetMyEbaySelling&lt;/a&gt; method of the &lt;b&gt;Trading API&lt;/b&gt; to retrieve all SKUs for all active listings. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## getSkuLocationMapping

> LocationMapping getSkuLocationMapping(listingId, sku)



This method allows sellers to retrieve the locations mapped to a specific SKU within a listing.&lt;br&gt;&lt;br&gt;The &lt;b&gt;listingId&lt;/b&gt; and &lt;b&gt;sku&lt;/b&gt; of the listing are passed in as path parameters. This method only retrieves location mappings for a single SKU value; if a seller wishes to retrieve the location mappings for all items in a multiple-variation listing, this method must be called for each variation in the listing.&lt;br&gt;&lt;br&gt;If there are fulfillment center locations mapped to the SKU, they will be returned in the &lt;b&gt;locations&lt;/b&gt; array. If no locations are mapped to the SKU, status code &lt;b&gt;404 Not Found&lt;/b&gt; will be returned.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.ListingApi();
let listingId = "listingId_example"; // String | This path parameter specifies the unique identifier of the listing that the SKU belongs to for which all mapped locations will be retrieved.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\" target=\"_blank \">getOffers</a> method of the <b>Inventory API</b> or the <a href=\"/devzone/xml/docs/reference/ebay/getmyebayselling.html\" target=\"_blank \">GetMyEbaySelling</a> method of the <b>Trading API</b> to retrieve all listing IDs for all active listings.
let sku = "sku_example"; // String | This path parameter specifies the seller-defined SKU value of the item/variation for which location mappings will be retrieved. This SKU value must be defined in the listing specified in <b>listingId</b> parameter<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\" target=\"_blank \">getOffers</a> method of the <b>Inventory API</b> or the <a href=\"/devzone/xml/docs/reference/ebay/getmyebayselling.html\" target=\"_blank \">GetMyEbaySelling</a> method of the <b>Trading API</b> to retrieve all SKUs for all active listings.
apiInstance.getSkuLocationMapping(listingId, sku, (error, data, response) => {
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
 **listingId** | **String**| This path parameter specifies the unique identifier of the listing that the SKU belongs to for which all mapped locations will be retrieved.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getOffers&lt;/a&gt; method of the &lt;b&gt;Inventory API&lt;/b&gt; or the &lt;a href&#x3D;\&quot;/devzone/xml/docs/reference/ebay/getmyebayselling.html\&quot; target&#x3D;\&quot;_blank \&quot;&gt;GetMyEbaySelling&lt;/a&gt; method of the &lt;b&gt;Trading API&lt;/b&gt; to retrieve all listing IDs for all active listings. | 
 **sku** | **String**| This path parameter specifies the seller-defined SKU value of the item/variation for which location mappings will be retrieved. This SKU value must be defined in the listing specified in &lt;b&gt;listingId&lt;/b&gt; parameter&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getOffers&lt;/a&gt; method of the &lt;b&gt;Inventory API&lt;/b&gt; or the &lt;a href&#x3D;\&quot;/devzone/xml/docs/reference/ebay/getmyebayselling.html\&quot; target&#x3D;\&quot;_blank \&quot;&gt;GetMyEbaySelling&lt;/a&gt; method of the &lt;b&gt;Trading API&lt;/b&gt; to retrieve all SKUs for all active listings. | 

### Return type

[**LocationMapping**](LocationMapping.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

