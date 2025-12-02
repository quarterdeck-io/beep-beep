# SellInventoryV1.InventoryItemGroupApi

All URIs are relative to *https://api.ebay.com/sell/inventory/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createOrReplaceInventoryItemGroup**](InventoryItemGroupApi.md#createOrReplaceInventoryItemGroup) | **PUT** /inventory_item_group/{inventoryItemGroupKey} | 
[**deleteInventoryItemGroup**](InventoryItemGroupApi.md#deleteInventoryItemGroup) | **DELETE** /inventory_item_group/{inventoryItemGroupKey} | 
[**getInventoryItemGroup**](InventoryItemGroupApi.md#getInventoryItemGroup) | **GET** /inventory_item_group/{inventoryItemGroupKey} | 



## createOrReplaceInventoryItemGroup

> BaseResponse createOrReplaceInventoryItemGroup(contentLanguage, inventoryItemGroupKey, contentType, inventoryItemGroup)



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day.&lt;/span&gt;&lt;br&gt;This call creates a new inventory item group or updates an existing inventory item group. It is up to sellers whether they want to create a complete inventory item group record right from the start, or sellers can provide only some information with the initial &lt;strong&gt;createOrReplaceInventoryItemGroup&lt;/strong&gt; call, and then make one or more additional &lt;strong&gt;createOrReplaceInventoryItemGroup&lt;/strong&gt; calls to complete the inventory item group record. Upon first creating an inventory item group record, the only required elements are  the &lt;strong&gt;inventoryItemGroupKey&lt;/strong&gt; identifier in the call URI, and the members of the inventory item group specified through the &lt;strong&gt;variantSKUs&lt;/strong&gt; array in the request payload.&lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active listing. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#inventory_item_group \&quot; target&#x3D;\&quot;_blank\&quot;&gt;Inventory item group fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all Inventory API calls, this call also requires the &lt;code&gt;Content-Type&lt;/code&gt; and &lt;code&gt;Content-Language&lt;/code&gt; headers. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item_group/methods/createOrReplaceInventoryItemGroup#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information.&lt;/span&gt;&lt;br&gt;In the case of updating/replacing an existing inventory item group, this call does a complete replacement of the existing inventory item group record, so all fields (including the member SKUs) that make up the inventory item group are required, regardless of whether their values changed. So, when replacing/updating an inventory item group record, it is advised that the seller run a &lt;strong&gt;getInventoryItemGroup&lt;/strong&gt; call for that inventory item group to see all of its current values/settings/members before attempting to update the record. And if changes are made to an inventory item group that is part of a live, multiple-variation eBay listing, these changes automatically update the eBay listing. For example, if a SKU value is removed from the inventory item group, the corresponding product variation will be removed from the eBay listing as well.&lt;br&gt;&lt;br&gt;In addition to the required inventory item group identifier and member SKUs, other key information that is set with this call include: &lt;ul&gt; &lt;li&gt;Title and description of the inventory item group. The string values provided in these fields will actually become the listing title and listing description of the listing once the first SKU of the inventory item group is published successfully&lt;/li&gt; &lt;li&gt;Common aspects that inventory items in the group share&lt;/li&gt; &lt;li&gt;Product aspects that vary within each product variation&lt;/li&gt; &lt;li&gt;Links to images demonstrating the variations of the product, and these images should correspond to the product aspect that is set with the &lt;strong&gt;variesBy.aspectsImageVariesBy&lt;/strong&gt; field&lt;/li&gt; &lt;/ul&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; For more information, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/inventory-item-groups.html\&quot; target&#x3D;\&quot;_blank\&quot;&gt;Creating and managing inventory item groups&lt;/a&gt;.&lt;/span&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemGroupApi();
let contentLanguage = "contentLanguage_example"; // String | This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be <code>en-US</code> for English or <code>de-DE</code> for German.<br><br>For more information on the Content-Language header, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let inventoryItemGroupKey = "inventoryItemGroupKey_example"; // String | This path parameter specifies the unique identifier of the inventory item group being created or updated. This identifier is defined by the seller.<br><br>This value cannot be changed once it is set.<br><br><b>Max Length:</b> 50
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let inventoryItemGroup = new SellInventoryV1.InventoryItemGroup(); // InventoryItemGroup | Details of the inventory Item Group
apiInstance.createOrReplaceInventoryItemGroup(contentLanguage, inventoryItemGroupKey, contentType, inventoryItemGroup, (error, data, response) => {
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
 **inventoryItemGroupKey** | **String**| This path parameter specifies the unique identifier of the inventory item group being created or updated. This identifier is defined by the seller.&lt;br&gt;&lt;br&gt;This value cannot be changed once it is set.&lt;br&gt;&lt;br&gt;&lt;b&gt;Max Length:&lt;/b&gt; 50 | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **inventoryItemGroup** | [**InventoryItemGroup**](InventoryItemGroup.md)| Details of the inventory Item Group | 

### Return type

[**BaseResponse**](BaseResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteInventoryItemGroup

> deleteInventoryItemGroup(inventoryItemGroupKey)



This call deletes the inventory item group for a given &lt;strong&gt;inventoryItemGroupKey&lt;/strong&gt; value.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemGroupApi();
let inventoryItemGroupKey = "inventoryItemGroupKey_example"; // String | This path parameter specifies the unique identifier of the inventory item group being deleted. This value is assigned by the seller when an inventory item group is created.
apiInstance.deleteInventoryItemGroup(inventoryItemGroupKey, (error, data, response) => {
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
 **inventoryItemGroupKey** | **String**| This path parameter specifies the unique identifier of the inventory item group being deleted. This value is assigned by the seller when an inventory item group is created. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## getInventoryItemGroup

> InventoryItemGroup getInventoryItemGroup(inventoryItemGroupKey)



This call retrieves the inventory item group for a given &lt;strong&gt;inventoryItemGroupKey&lt;/strong&gt; value. The &lt;strong&gt;inventoryItemGroupKey&lt;/strong&gt; value is passed in at the end of the call URI.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.InventoryItemGroupApi();
let inventoryItemGroupKey = "inventoryItemGroupKey_example"; // String | This path parameter specifies the unique identifier of the inventory item group being retrieved. This value is assigned by the seller when an inventory item group is created.
apiInstance.getInventoryItemGroup(inventoryItemGroupKey, (error, data, response) => {
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
 **inventoryItemGroupKey** | **String**| This path parameter specifies the unique identifier of the inventory item group being retrieved. This value is assigned by the seller when an inventory item group is created. | 

### Return type

[**InventoryItemGroup**](InventoryItemGroup.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

