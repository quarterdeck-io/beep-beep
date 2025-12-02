# SellInventoryV1.InventoryItemApi

All URIs are relative to *https://api.ebay.com/sell/inventory/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bulkCreateOrReplaceInventoryItem**](InventoryItemApi.md#bulkCreateOrReplaceInventoryItem) | **POST** /bulk_create_or_replace_inventory_item | 
[**bulkGetInventoryItem**](InventoryItemApi.md#bulkGetInventoryItem) | **POST** /bulk_get_inventory_item | 
[**bulkUpdatePriceQuantity**](InventoryItemApi.md#bulkUpdatePriceQuantity) | **POST** /bulk_update_price_quantity | 
[**createOrReplaceInventoryItem**](InventoryItemApi.md#createOrReplaceInventoryItem) | **PUT** /inventory_item/{sku} | 
[**deleteInventoryItem**](InventoryItemApi.md#deleteInventoryItem) | **DELETE** /inventory_item/{sku} | 
[**getInventoryItem**](InventoryItemApi.md#getInventoryItem) | **GET** /inventory_item/{sku} | 
[**getInventoryItems**](InventoryItemApi.md#getInventoryItems) | **GET** /inventory_item | 



## bulkCreateOrReplaceInventoryItem

> BulkInventoryItemResponse bulkCreateOrReplaceInventoryItem(contentType, contentLanguage, bulkInventoryItem)



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Please note that any eBay listing created using the Inventory API cannot be revised or relisted using the Trading API calls.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day.&lt;/span&gt;&lt;br&gt;This call can be used to create and/or update up to 25 new inventory item records. It is up to sellers whether they want to create a complete inventory item records right from the start, or sellers can provide only some information with the initial &lt;strong&gt;bulkCreateOrReplaceInventoryItem&lt;/strong&gt; call, and then make one or more additional &lt;strong&gt;bulkCreateOrReplaceInventoryItem&lt;/strong&gt; calls to complete all required fields for the inventory item records and prepare for publishing. Upon first creating inventory item records, only the SKU values are required.&lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active listing. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#inventory_item \&quot; target&#x3D;\&quot;_blank\&quot;&gt;Inventory item fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all eBay REST API calls, this call also requires the &lt;code&gt;Content-Language&lt;/code&gt; and &lt;code&gt;Content-Type&lt;/code&gt; headers. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/bulkCreateOrReplaceInventoryItem#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; section for more information.&lt;/span&gt;&lt;br&gt; In the case of updating existing inventory item records, the &lt;strong&gt;bulkCreateOrReplaceInventoryItem&lt;/strong&gt; call will do a complete replacement of the existing inventory item records, so all fields that are currently defined for the inventory item record are required in that update action, regardless of whether their values changed. So, when replacing/updating an inventory item record, it is advised that the seller run a &#39;Get&#39; call to retrieve the full details of the inventory item records and see all of its current values/settings before attempting to update the records. Any changes that are made to inventory item records that are part of one or more active eBay listings, a successful call will automatically update these active listings. &lt;br&gt;&lt;br&gt;The key information that is set with the &lt;strong&gt;bulkCreateOrReplaceInventoryItem&lt;/strong&gt; call include: &lt;ul&gt; &lt;li&gt;Seller-defined SKU value for the product. Each seller product, including products within an item inventory group, must have their own SKU value. &lt;/li&gt; &lt;li&gt;Condition of the item&lt;/li&gt; &lt;li&gt;Product details, including any product identifier(s), such as a UPC, ISBN, EAN, or Brand/Manufacturer Part Number pair, a product description, a product title, product/item aspects, and links to images. eBay will use any supplied eBay Product ID (ePID) or a GTIN (UPC, ISBN, or EAN) and attempt to match those identifiers to a product in the eBay Catalog, and if a product match is found, the product details for the inventory item will automatically be populated.&lt;/li&gt; &lt;li&gt;Quantity of the inventory item that is available for purchase&lt;/li&gt; &lt;li&gt;Package weight and dimensions, which is required if the seller will be offering calculated shipping options. The package weight will also be required if the seller will be providing flat-rate shipping services, but charging a weight surcharge.&lt;/li&gt; &lt;/ul&gt;&lt;p&gt;For those who prefer to create or update a single inventory item record, the &lt;strong&gt;createOrReplaceInventoryItem&lt;/strong&gt; method can be used.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let contentLanguage = "contentLanguage_example"; // String | This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be <code>en-US</code> for English or <code>de-DE</code> for German.<br><br>For more information on the Content-Language header, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let bulkInventoryItem = new SellInventoryV1.BulkInventoryItem(); // BulkInventoryItem | Details of the inventories with sku and locale
apiInstance.bulkCreateOrReplaceInventoryItem(contentType, contentLanguage, bulkInventoryItem, (error, data, response) => {
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
 **contentLanguage** | **String**| This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be &lt;code&gt;en-US&lt;/code&gt; for English or &lt;code&gt;de-DE&lt;/code&gt; for German.&lt;br&gt;&lt;br&gt;For more information on the Content-Language header, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **bulkInventoryItem** | [**BulkInventoryItem**](BulkInventoryItem.md)| Details of the inventories with sku and locale | 

### Return type

[**BulkInventoryItemResponse**](BulkInventoryItemResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## bulkGetInventoryItem

> BulkGetInventoryItemResponse bulkGetInventoryItem(contentType, bulkGetInventoryItem)



This call retrieves up to 25 inventory item records. The SKU value of each inventory item record to retrieve is specified in the request payload.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all Inventory API calls, this call also requires the &lt;code&gt;Content-Type&lt;/code&gt; header. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/bulkGetInventoryItem#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information.&lt;/span&gt;&lt;br&gt;For those who prefer to retrieve only one inventory item record by SKU value, the &lt;strong&gt;getInventoryItem&lt;/strong&gt; method can be used. To retrieve all inventory item records defined on the seller&#39;s account, the &lt;strong&gt;getInventoryItems&lt;/strong&gt; method can be used (with pagination control if desired).

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let bulkGetInventoryItem = new SellInventoryV1.BulkGetInventoryItem(); // BulkGetInventoryItem | Details of the inventories with sku and locale
apiInstance.bulkGetInventoryItem(contentType, bulkGetInventoryItem, (error, data, response) => {
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
 **bulkGetInventoryItem** | [**BulkGetInventoryItem**](BulkGetInventoryItem.md)| Details of the inventories with sku and locale | 

### Return type

[**BulkGetInventoryItemResponse**](BulkGetInventoryItemResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## bulkUpdatePriceQuantity

> BulkPriceQuantityResponse bulkUpdatePriceQuantity(contentType, bulkPriceQuantity)



This call is used by the seller to update the total ship-to-home quantity of one inventory item, and/or to update the price and/or quantity of one or more offers associated with one inventory item. Up to 25 offers associated with an inventory item may be updated with one &lt;strong&gt;bulkUpdatePriceQuantity&lt;/strong&gt; call. Only one SKU (one product) can be updated per call.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all Inventory API calls, this call also requires the &lt;code&gt;Content-Type&lt;/code&gt; header. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/bulkUpdatePriceQuantity#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information.&lt;/span&gt;&lt;br&gt;The &lt;strong&gt;getOffers&lt;/strong&gt; call can be used to retrieve all offers associated with a SKU. The seller will just pass in the correct SKU value through the &lt;strong&gt;sku&lt;/strong&gt; query parameter. To update an offer, the &lt;strong&gt;offerId&lt;/strong&gt; value is required, and this value is returned in the &lt;strong&gt;getOffers&lt;/strong&gt; call response. It is also useful to know which offers are unpublished and which ones are published. To get this status, look for the &lt;strong&gt;status&lt;/strong&gt; value in the &lt;strong&gt;getOffers&lt;/strong&gt; call response. Offers in the published state are live eBay listings, and these listings will be revised with a successful &lt;strong&gt;bulkUpdatePriceQuantity&lt;/strong&gt; call.&lt;br&gt;&lt;br&gt;An issue will occur if duplicate &lt;strong&gt;offerId&lt;/strong&gt; values are passed through the same &lt;strong&gt;offers&lt;/strong&gt; container, or if one or more of the specified offers are associated with different products/SKUs.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; For multiple-variation listings, it is recommended that the &lt;strong&gt;bulkUpdatePriceQuantity&lt;/strong&gt; call be used to update price and quantity information for each SKU within that multiple-variation listing instead of using &lt;strong&gt;createOrReplaceInventoryItem&lt;/strong&gt; calls to update the price and quantity for each SKU. Just remember that only one SKU (one product variation) can be updated per call.&lt;/span&gt;&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let bulkPriceQuantity = new SellInventoryV1.BulkPriceQuantity(); // BulkPriceQuantity | Price and allocation details for the given SKU and Marketplace
apiInstance.bulkUpdatePriceQuantity(contentType, bulkPriceQuantity, (error, data, response) => {
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
 **bulkPriceQuantity** | [**BulkPriceQuantity**](BulkPriceQuantity.md)| Price and allocation details for the given SKU and Marketplace | 

### Return type

[**BulkPriceQuantityResponse**](BulkPriceQuantityResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createOrReplaceInventoryItem

> BaseResponse createOrReplaceInventoryItem(contentLanguage, sku, contentType, inventoryItem)



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Please note that any eBay listing created using the Inventory API cannot be revised or relisted using the Trading API calls.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day.&lt;/span&gt;&lt;br&gt;This call creates a new inventory item record or replaces an existing inventory item record. It is up to sellers whether they want to create a complete inventory item record right from the start, or sellers can provide only some information with the initial &lt;strong&gt;createOrReplaceInventoryItem&lt;/strong&gt; call, and then make one or more additional &lt;strong&gt;createOrReplaceInventoryItem&lt;/strong&gt; calls to complete all required fields for the inventory item record and prepare it for publishing. Upon first creating an inventory item record, only the SKU value in the call path is required.&lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active listing. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#inventory_item \&quot; target&#x3D;\&quot;_blank\&quot;&gt;Inventory item fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all Inventory API calls, this call also requires the &lt;code&gt;Content-Type&lt;/code&gt; and &lt;code&gt;Content-Language&lt;/code&gt; headers. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information.&lt;/span&gt;&lt;br&gt; In the case of replacing an existing inventory item record, the &lt;strong&gt;createOrReplaceInventoryItem&lt;/strong&gt; call will do a complete replacement of the existing inventory item record, so all fields that are currently defined for the inventory item record are required in that update action, regardless of whether their values changed. So, when replacing/updating an inventory item record, it is advised that the seller run a &lt;strong&gt;getInventoryItem&lt;/strong&gt; call to retrieve the full inventory item record and see all of its current values/settings before attempting to update the record. And if changes are made to an inventory item that is part of one or more active eBay listings, a successful call will automatically update these eBay listings. &lt;br&gt;&lt;br&gt;The key information that is set with the &lt;strong&gt;createOrReplaceInventoryItem&lt;/strong&gt; call include: &lt;ul&gt; &lt;li&gt;Seller-defined SKU value for the product. Each seller product, including products within an item inventory group, must have their own SKU value. This SKU value is passed in at the end of the call URI&lt;/li&gt; &lt;li&gt;Condition of the item&lt;/li&gt; &lt;li&gt;Product details, including any product identifier(s), such as a UPC, ISBN, EAN, or Brand/Manufacturer Part Number pair, a product description, a product title, product/item aspects, and links to images. eBay will use any supplied eBay Product ID (ePID) or a GTIN (UPC, ISBN, or EAN) and attempt to match those identifiers to a product in the eBay Catalog, and if a product match is found, the product details for the inventory item will automatically be populated.&lt;/li&gt; &lt;li&gt;Quantity of the inventory item that is available for purchase&lt;/li&gt; &lt;li&gt;Package weight and dimensions, which is required if the seller will be offering calculated shipping options. The package weight will also be required if the seller will be providing flat-rate shipping services, but charging a weight surcharge.&lt;/li&gt; &lt;/ul&gt; &lt;p&gt;In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all eBay REST API calls, the &lt;strong&gt;createOrReplaceInventoryItem&lt;/strong&gt; call also requires the &lt;code&gt;Content-Language&lt;/code&gt; header, that sets the natural language that will be used in the field values of the request payload. For US English, the code value passed in this header should be &lt;code&gt;en-US&lt;/code&gt;. To view other supported &lt;code&gt;Content-Language&lt;/code&gt; values, and to read more about all supported HTTP headers for eBay REST API calls, see the &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank\&quot;&gt;HTTP request headers&lt;/a&gt; topic in the &lt;strong&gt;Using eBay RESTful APIs&lt;/strong&gt; document.&lt;/p&gt;&lt;p&gt;For those who prefer to create or update numerous inventory item records with one call (up to 25 at a time), the &lt;strong&gt;bulkCreateOrReplaceInventoryItem&lt;/strong&gt; method can be used.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemApi();
let contentLanguage = "contentLanguage_example"; // String | This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be <code>en-US</code> for English or <code>de-DE</code> for German.<br><br>For more information on the Content-Language header, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let sku = "sku_example"; // String | This path parameter specifies the seller-defined SKU value for the inventory item being created or updated. SKU values must be unique across the seller's inventory. <br><br><strong>Max length</strong>: 50
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let inventoryItem = new SellInventoryV1.InventoryItem(); // InventoryItem | Details of the inventory item record.
apiInstance.createOrReplaceInventoryItem(contentLanguage, sku, contentType, inventoryItem, (error, data, response) => {
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
 **contentLanguage** | **String**| This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be &lt;code&gt;en-US&lt;/code&gt; for English or &lt;code&gt;de-DE&lt;/code&gt; for German.&lt;br&gt;&lt;br&gt;For more information on the Content-Language header, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **sku** | **String**| This path parameter specifies the seller-defined SKU value for the inventory item being created or updated. SKU values must be unique across the seller&#39;s inventory. &lt;br&gt;&lt;br&gt;&lt;strong&gt;Max length&lt;/strong&gt;: 50 | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **inventoryItem** | [**InventoryItem**](InventoryItem.md)| Details of the inventory item record. | 

### Return type

[**BaseResponse**](BaseResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteInventoryItem

> deleteInventoryItem(sku)



This call is used to delete an inventory item record associated with a specified SKU. A successful call will not only delete that inventory item record, but will also have the following effects:&lt;ul&gt;&lt;li&gt;Delete any and all unpublished offers associated with that SKU;&lt;/li&gt;&lt;li&gt;Delete any and all single-variation eBay listings associated with that SKU;&lt;/li&gt;&lt;li&gt;Automatically remove that SKU from a multiple-variation listing and remove that SKU from any and all inventory item groups in which that SKU was a member.&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;The &lt;code&gt;authorization&lt;/code&gt; header is the only required HTTP header for this call. See the &lt;strong&gt;HTTP request headers&lt;/strong&gt; section for more information.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemApi();
let sku = "sku_example"; // String | This path parameter specifies the seller-defined SKU value of the product whose inventory item record you wish to delete.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\" target=\"_blank \">getInventoryItems</a> method to retrieve SKU values.<br><br><strong>Max length</strong>: 50
apiInstance.deleteInventoryItem(sku, (error, data, response) => {
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
 **sku** | **String**| This path parameter specifies the seller-defined SKU value of the product whose inventory item record you wish to delete.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getInventoryItems&lt;/a&gt; method to retrieve SKU values.&lt;br&gt;&lt;br&gt;&lt;strong&gt;Max length&lt;/strong&gt;: 50 | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## getInventoryItem

> InventoryItemWithSkuLocaleGroupid getInventoryItem(sku)



This call retrieves the inventory item record for a given SKU. The SKU value is passed in at the end of the call URI. There is no request payload for this call.&lt;br&gt;&lt;br&gt;The &lt;code&gt;authorization&lt;/code&gt; header is the only required HTTP header for this call, and it is required for all Inventory API calls. See the &lt;strong&gt;HTTP request headers&lt;/strong&gt; section for more information.&lt;br&gt;&lt;br&gt;For those who prefer to retrieve numerous inventory item records by SKU value with one call (up to 25 at a time), the &lt;strong&gt;bulkGetInventoryItem&lt;/strong&gt; method can be used. To retrieve all inventory item records defined on the seller&#39;s account, the &lt;strong&gt;getInventoryItems&lt;/strong&gt; method can be used (with pagination control if desired).

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemApi();
let sku = "sku_example"; // String | This path parameter specifies the seller-defined SKU value of the product whose inventory item record you wish to retrieve.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\" target=\"_blank \">getInventoryItems</a> method to retrieve SKU values.<br><br><strong>Max length</strong>: 50
apiInstance.getInventoryItem(sku, (error, data, response) => {
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
 **sku** | **String**| This path parameter specifies the seller-defined SKU value of the product whose inventory item record you wish to retrieve.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getInventoryItems&lt;/a&gt; method to retrieve SKU values.&lt;br&gt;&lt;br&gt;&lt;strong&gt;Max length&lt;/strong&gt;: 50 | 

### Return type

[**InventoryItemWithSkuLocaleGroupid**](InventoryItemWithSkuLocaleGroupid.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getInventoryItems

> InventoryItems getInventoryItems(opts)



This call retrieves all inventory item records defined for the seller&#39;s account. The &lt;strong&gt;limit&lt;/strong&gt; query parameter allows the seller to control how many records are returned per page, and the &lt;strong&gt;offset&lt;/strong&gt; query parameter is used to retrieve a specific page of records. The seller can make multiple calls to scan through multiple pages of records. There is no request payload for this call.&lt;br&gt;&lt;br&gt;The &lt;code&gt;authorization&lt;/code&gt; header is the only required HTTP header for this call, and it is required for all Inventory API calls. See the &lt;strong&gt;HTTP request headers&lt;/strong&gt; section for more information.&lt;br&gt;&lt;br&gt;For those who prefer to retrieve numerous inventory item records by SKU value with one call (up to 25 at a time), the &lt;strong&gt;bulkGetInventoryItem&lt;/strong&gt; method can be used.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemApi();
let opts = {
  'limit': "limit_example", // String | The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in this field should be an integer from <code>1</code> to <code>200</code>.<br><br><strong>Min:</strong> 1<br><br><strong>Max:</strong> 200<br><br><b>Default:</b> 25
  'offset': "offset_example" // String | The value passed in this query parameter sets the page number to retrieve. The first page of records has a value of <code>0</code>, the second page of records has a value of <code>1</code>, and so on. If this query parameter is not set, its value defaults to <code>0</code>, and the first page of records is returned. 
};
apiInstance.getInventoryItems(opts, (error, data, response) => {
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
 **limit** | **String**| The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in this field should be an integer from &lt;code&gt;1&lt;/code&gt; to &lt;code&gt;200&lt;/code&gt;.&lt;br&gt;&lt;br&gt;&lt;strong&gt;Min:&lt;/strong&gt; 1&lt;br&gt;&lt;br&gt;&lt;strong&gt;Max:&lt;/strong&gt; 200&lt;br&gt;&lt;br&gt;&lt;b&gt;Default:&lt;/b&gt; 25 | [optional] 
 **offset** | **String**| The value passed in this query parameter sets the page number to retrieve. The first page of records has a value of &lt;code&gt;0&lt;/code&gt;, the second page of records has a value of &lt;code&gt;1&lt;/code&gt;, and so on. If this query parameter is not set, its value defaults to &lt;code&gt;0&lt;/code&gt;, and the first page of records is returned.  | [optional] 

### Return type

[**InventoryItems**](InventoryItems.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

