# SellInventoryV1.ProductCompatibilityApi

All URIs are relative to *https://api.ebay.com/sell/inventory/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createOrReplaceProductCompatibility**](ProductCompatibilityApi.md#createOrReplaceProductCompatibility) | **PUT** /inventory_item/{sku}/product_compatibility | 
[**deleteProductCompatibility**](ProductCompatibilityApi.md#deleteProductCompatibility) | **DELETE** /inventory_item/{sku}/product_compatibility | 
[**getProductCompatibility**](ProductCompatibilityApi.md#getProductCompatibility) | **GET** /inventory_item/{sku}/product_compatibility | 



## createOrReplaceProductCompatibility

> BaseResponse createOrReplaceProductCompatibility(contentLanguage, sku, contentType, compatibility)



This call is used by the seller to create or replace a list of products that are compatible with the inventory item. The inventory item is identified with a SKU value in the URI. Product compatibility is currently only applicable to motor vehicle parts and accessory categories, but more categories may be supported in the future.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all Inventory API calls, this call also requires the &lt;code&gt;Content-Type&lt;/code&gt; and &lt;code&gt;Content-Language&lt;/code&gt; headers. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/product_compatibility/methods/createOrReplaceProductCompatibility#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information.&lt;/span&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.ProductCompatibilityApi();
let contentLanguage = "contentLanguage_example"; // String | This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be <code>en-US</code> for English or <code>de-DE</code> for German.<br><br>For more information on the Content-Language header, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let sku = "sku_example"; // String | This path parameter specifies the SKU (stock keeping unit) of the inventory item associated with the compatibility list being created.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\" target=\"_blank \">getInventoryItems</a> method to retrieve SKU values.
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let compatibility = new SellInventoryV1.Compatibility(); // Compatibility | Details of the compatibility
apiInstance.createOrReplaceProductCompatibility(contentLanguage, sku, contentType, compatibility, (error, data, response) => {
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
 **sku** | **String**| This path parameter specifies the SKU (stock keeping unit) of the inventory item associated with the compatibility list being created.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getInventoryItems&lt;/a&gt; method to retrieve SKU values. | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **compatibility** | [**Compatibility**](Compatibility.md)| Details of the compatibility | 

### Return type

[**BaseResponse**](BaseResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteProductCompatibility

> deleteProductCompatibility(sku)



This call is used by the seller to delete the list of products that are compatible with the inventory item that is associated with the compatible product list. The inventory item is identified with a SKU value in the URI. Product compatibility is currently only applicable to motor vehicle parts and accessory categories, but more categories may be supported in the future.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.ProductCompatibilityApi();
let sku = "sku_example"; // String | This path parameter specifies the SKU (stock keeping unit) of the inventory item that is associated with the product compatibility list that is being deleted.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\" target=\"_blank \">getInventoryItems</a> method to retrieve SKU values.
apiInstance.deleteProductCompatibility(sku, (error, data, response) => {
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
 **sku** | **String**| This path parameter specifies the SKU (stock keeping unit) of the inventory item that is associated with the product compatibility list that is being deleted.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getInventoryItems&lt;/a&gt; method to retrieve SKU values. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## getProductCompatibility

> Compatibility getProductCompatibility(sku)



This call is used by the seller to retrieve the list of products that are compatible with the inventory item. The SKU value for the inventory item is passed into the call URI, and a successful call with return the compatible vehicle list associated with this inventory item. Product compatibility is currently only applicable to motor vehicle parts and accessory categories, but more categories may be supported in the future.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.ProductCompatibilityApi();
let sku = "sku_example"; // String | This path parameter specifies the SKU (stock keeping unit) of the inventory item associated with the product compatibility list being retrieved.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\" target=\"_blank \">getInventoryItems</a> method to retrieve SKU values.
apiInstance.getProductCompatibility(sku, (error, data, response) => {
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
 **sku** | **String**| This path parameter specifies the SKU (stock keeping unit) of the inventory item associated with the product compatibility list being retrieved.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getInventoryItems&lt;/a&gt; method to retrieve SKU values. | 

### Return type

[**Compatibility**](Compatibility.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

