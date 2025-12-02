# SellInventoryV1.LocationApi

All URIs are relative to *https://api.ebay.com/sell/inventory/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createInventoryLocation**](LocationApi.md#createInventoryLocation) | **POST** /location/{merchantLocationKey} | 
[**deleteInventoryLocation**](LocationApi.md#deleteInventoryLocation) | **DELETE** /location/{merchantLocationKey} | 
[**disableInventoryLocation**](LocationApi.md#disableInventoryLocation) | **POST** /location/{merchantLocationKey}/disable | 
[**enableInventoryLocation**](LocationApi.md#enableInventoryLocation) | **POST** /location/{merchantLocationKey}/enable | 
[**getInventoryLocation**](LocationApi.md#getInventoryLocation) | **GET** /location/{merchantLocationKey} | 
[**getInventoryLocations**](LocationApi.md#getInventoryLocations) | **GET** /location | 
[**updateInventoryLocation**](LocationApi.md#updateInventoryLocation) | **POST** /location/{merchantLocationKey}/update_location_details | 



## createInventoryLocation

> createInventoryLocation(merchantLocationKey, contentType, inventoryLocationFull)



&lt;p&gt;Use this call to create a new inventory location. In order to create and publish an offer (and create an eBay listing), a seller must have at least one location, as every offer must be associated with at least one location.&lt;/p&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active listing. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#location \&quot; target&#x3D;\&quot;_blank\&quot;&gt;Location fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;p&gt;Upon first creating an inventory location, only a seller-defined location identifier and a physical location is required, and once set, these values can not be changed. The unique identifier value (&lt;i&gt;merchantLocationKey&lt;/i&gt;) is passed in at the end of the call URI. This &lt;i&gt;merchantLocationKey&lt;/i&gt; value will be used in other Inventory Location calls to identify the location to perform an action against.&lt;/p&gt;&lt;p&gt;When creating an inventory location, the &lt;b&gt;locationTypes&lt;/b&gt; can be specified to define the function of a location. At this time, the following &lt;b&gt;locationTypes&lt;/b&gt; are supported:&lt;ul&gt;&lt;li&gt;&lt;b&gt;Fulfillment center&lt;/b&gt; locations are used by sellers selling products through the Multi-warehouse program to get improved estimated delivery dates on their listings. A full address is required when creating a fulfillment center location, as well as the &lt;b&gt;fulfillmentCenterSpecifications&lt;/b&gt; of the location. For more information on using the fulfillment center location type to get improved delivery dates, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/multi-warehouse-program.html\&quot; target&#x3D;\&quot;_blank \&quot;&gt;Multi-warehouse program&lt;/a&gt;.&lt;/li&gt;&lt;li&gt;&lt;b&gt;Warehouse&lt;/b&gt; locations are used for traditional shipping. A full street address is not needed, but the &lt;b&gt;postalCode&lt;/b&gt; and &lt;b&gt;country&lt;/b&gt; OR &lt;b&gt;city&lt;/b&gt;, &lt;b&gt;stateOrProvince&lt;/b&gt;, and &lt;b&gt;country&lt;/b&gt; of the location must be provided.&lt;/li&gt;&lt;li&gt;&lt;b&gt;Store&lt;/b&gt; locations are generally used by merchants selling product through the In-Store Pickup program. A full address is required when creating a store location.&lt;/li&gt;&lt;/ul&gt;&lt;/p&gt;&lt;p&gt;Note that all inventory locations are \&quot;enabled\&quot; by default when they are created, and you must specifically disable them (by passing in a value of &lt;code&gt;DISABLED&lt;/code&gt; in the &lt;strong&gt;merchantLocationStatus&lt;/strong&gt; field) if you want them to be set to the disabled state. The seller&#39;s inventory cannot be loaded to inventory locations in the disabled state.&lt;/p&gt;&lt;p&gt;Unless one or more errors and/or warnings occur with the call, there is no response payload for this call. A successful call will return an HTTP status value of &lt;i&gt;204 No Content&lt;/i&gt;.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.LocationApi();
let merchantLocationKey = "merchantLocationKey_example"; // String | This path parameter specifies the unique, seller-defined key (ID) for an inventory location.<br><br><b>Max length</b>: 36
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br> For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let inventoryLocationFull = new SellInventoryV1.InventoryLocationFull(); // InventoryLocationFull | Inventory Location details
apiInstance.createInventoryLocation(merchantLocationKey, contentType, inventoryLocationFull, (error, data, response) => {
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
 **merchantLocationKey** | **String**| This path parameter specifies the unique, seller-defined key (ID) for an inventory location.&lt;br&gt;&lt;br&gt;&lt;b&gt;Max length&lt;/b&gt;: 36 | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt; For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **inventoryLocationFull** | [**InventoryLocationFull**](InventoryLocationFull.md)| Inventory Location details | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## deleteInventoryLocation

> deleteInventoryLocation(merchantLocationKey)



&lt;p&gt;This call deletes the inventory location that is specified in the &lt;code&gt;merchantLocationKey&lt;/code&gt; path parameter. Note that deleting a location will not affect any active eBay listings associated with the deleted location, but the seller will not be able modify the offers associated with the location once it is deleted.&lt;/p&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Deletion is not currently supported for fulfillment center locations, as location mappings will still be retained despite the location being deleted. Instead, fulfillment center locations should be disabled using the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/location/methods/disableInventoryLocation\&quot; target&#x3D;\&quot;_blank\&quot;&gt;disableInventoryLocation&lt;/a&gt; method.&lt;/span&gt;&lt;p&gt;Unless one or more errors and/or warnings occur with the call, there is no response payload for this call. A successful call will return an HTTP status value of &lt;i&gt;200 OK&lt;/i&gt;.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.LocationApi();
let merchantLocationKey = "merchantLocationKey_example"; // String | This path parameter specifies the unique merchant-defined key (ID) for the inventory location that is to be deleted.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\">getInventoryLocations</a> method to retrieve merchant location keys.<br><br><b>Max length</b>: 36
apiInstance.deleteInventoryLocation(merchantLocationKey, (error, data, response) => {
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
 **merchantLocationKey** | **String**| This path parameter specifies the unique merchant-defined key (ID) for the inventory location that is to be deleted.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\&quot;&gt;getInventoryLocations&lt;/a&gt; method to retrieve merchant location keys.&lt;br&gt;&lt;br&gt;&lt;b&gt;Max length&lt;/b&gt;: 36 | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## disableInventoryLocation

> Object disableInventoryLocation(merchantLocationKey)



&lt;p&gt;This call disables the inventory location that is specified in the &lt;code&gt;merchantLocationKey&lt;/code&gt; path parameter. Sellers can not load/modify inventory to disabled locations. Note that disabling a location will not affect any active eBay listings associated with the disabled location, but the seller will not be able modify the offers associated with a disabled location.&lt;/p&gt;&lt;p&gt;A successful call will return an HTTP status value of &lt;i&gt;200 OK&lt;/i&gt;.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.LocationApi();
let merchantLocationKey = "merchantLocationKey_example"; // String | This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is to be disabled. <br><br>Use the <a href=\"/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\">getInventoryLocations</a> method to retrieve merchant location keys.<br><br><b>Max length</b>: 36
apiInstance.disableInventoryLocation(merchantLocationKey, (error, data, response) => {
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
 **merchantLocationKey** | **String**| This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is to be disabled. &lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\&quot;&gt;getInventoryLocations&lt;/a&gt; method to retrieve merchant location keys.&lt;br&gt;&lt;br&gt;&lt;b&gt;Max length&lt;/b&gt;: 36 | 

### Return type

**Object**

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## enableInventoryLocation

> Object enableInventoryLocation(merchantLocationKey)



&lt;p&gt;This call enables a disabled inventory location that is specified in the &lt;code&gt;merchantLocationKey&lt;/code&gt; path parameter. Once a disabled location is enabled, sellers can start loading/modifying inventory to that location. &lt;/p&gt;&lt;p&gt;A successful call will return an HTTP status value of &lt;i&gt;200 OK&lt;/i&gt;.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.LocationApi();
let merchantLocationKey = "merchantLocationKey_example"; // String | This path parameter specifies unique merchant-defined key (ID) for a <code>disabled</code> inventory location that is to be enabled.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\">getInventoryLocations</a> method to retrieve merchant location keys.<br><br><b>Max length</b>: 36
apiInstance.enableInventoryLocation(merchantLocationKey, (error, data, response) => {
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
 **merchantLocationKey** | **String**| This path parameter specifies unique merchant-defined key (ID) for a &lt;code&gt;disabled&lt;/code&gt; inventory location that is to be enabled.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\&quot;&gt;getInventoryLocations&lt;/a&gt; method to retrieve merchant location keys.&lt;br&gt;&lt;br&gt;&lt;b&gt;Max length&lt;/b&gt;: 36 | 

### Return type

**Object**

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getInventoryLocation

> InventoryLocationResponse getInventoryLocation(merchantLocationKey)



This call retrieves all defined details of the inventory location that is specified by the &lt;b&gt;merchantLocationKey&lt;/b&gt; path parameter.&lt;p&gt;A successful call will return an HTTP status value of &lt;i&gt;200 OK&lt;/i&gt;.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.LocationApi();
let merchantLocationKey = "merchantLocationKey_example"; // String | This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is being retrieved. <br><br>Use the <a href=\"/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\">getInventoryLocations</a> method to retrieve merchant location keys. <br><br><b>Max length</b>: 36
apiInstance.getInventoryLocation(merchantLocationKey, (error, data, response) => {
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
 **merchantLocationKey** | **String**| This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is being retrieved. &lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\&quot;&gt;getInventoryLocations&lt;/a&gt; method to retrieve merchant location keys. &lt;br&gt;&lt;br&gt;&lt;b&gt;Max length&lt;/b&gt;: 36 | 

### Return type

[**InventoryLocationResponse**](InventoryLocationResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getInventoryLocations

> LocationResponse getInventoryLocations(opts)



This call retrieves all defined details for every inventory location associated with the seller&#39;s account. There are no required parameters for this call and no request payload. However, there are two optional query parameters, &lt;strong&gt;limit&lt;/strong&gt; and &lt;strong&gt;offset&lt;/strong&gt;. The &lt;strong&gt;limit&lt;/strong&gt; query parameter sets the maximum number of locations returned on one page of data, and the &lt;strong&gt;offset&lt;/strong&gt; query parameter specifies the page of data to return. These query parameters are discussed more in the &lt;strong&gt;URI parameters&lt;/strong&gt; table below. &lt;p&gt;The &lt;code&gt;authorization&lt;/code&gt; HTTP header is the only required request header for this call. &lt;/p&gt;&lt;p&gt;A successful call will return an HTTP status value of &lt;i&gt;200 OK&lt;/i&gt;.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.LocationApi();
let opts = {
  'limit': "limit_example", // String | The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in this field should be a positive integer value. If this query parameter is not set, up to 100 records will be returned on each page of results. <br><br> <strong>Min</strong>: 1
  'offset': "offset_example" // String | Specifies the number of locations to skip in the result set before returning the first location in the paginated response.  <p>Combine <b>offset</b> with the <b>limit</b> query parameter to control the items returned in the response. For example, if you supply an <b>offset</b> of <code>0</code> and a <b>limit</b> of <code>10</code>, the first page of the response contains the first 10 items from the complete list of items retrieved by the call. If <b>offset</b> is <code>10</code> and <b>limit</b> is <code>20</code>, the first page of the response contains items 11-30 from the complete result set.</p> <p><b>Default:</b> 0</p>
};
apiInstance.getInventoryLocations(opts, (error, data, response) => {
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
 **limit** | **String**| The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in this field should be a positive integer value. If this query parameter is not set, up to 100 records will be returned on each page of results. &lt;br&gt;&lt;br&gt; &lt;strong&gt;Min&lt;/strong&gt;: 1 | [optional] 
 **offset** | **String**| Specifies the number of locations to skip in the result set before returning the first location in the paginated response.  &lt;p&gt;Combine &lt;b&gt;offset&lt;/b&gt; with the &lt;b&gt;limit&lt;/b&gt; query parameter to control the items returned in the response. For example, if you supply an &lt;b&gt;offset&lt;/b&gt; of &lt;code&gt;0&lt;/code&gt; and a &lt;b&gt;limit&lt;/b&gt; of &lt;code&gt;10&lt;/code&gt;, the first page of the response contains the first 10 items from the complete list of items retrieved by the call. If &lt;b&gt;offset&lt;/b&gt; is &lt;code&gt;10&lt;/code&gt; and &lt;b&gt;limit&lt;/b&gt; is &lt;code&gt;20&lt;/code&gt;, the first page of the response contains items 11-30 from the complete result set.&lt;/p&gt; &lt;p&gt;&lt;b&gt;Default:&lt;/b&gt; 0&lt;/p&gt; | [optional] 

### Return type

[**LocationResponse**](LocationResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## updateInventoryLocation

> updateInventoryLocation(merchantLocationKey, contentType, inventoryLocation)



&lt;p&gt;Use this call to update location details for an existing inventory location. Specify the inventory location you want to update using the &lt;b&gt;merchantLocationKey&lt;/b&gt; path parameter. &lt;p&gt;You can update the following text-based fields: &lt;strong&gt;name&lt;/strong&gt;, &lt;strong&gt;phone&lt;/strong&gt;, &lt;strong&gt;timeZoneId&lt;/strong&gt;, &lt;strong&gt;geoCoordinates&lt;/strong&gt;, &lt;strong&gt;fulfillmentCenterSpecifications&lt;/strong&gt;, &lt;strong&gt;locationTypes&lt;/strong&gt;, &lt;strong&gt;locationWebUrl&lt;/strong&gt;, &lt;strong&gt;locationInstructions&lt;/strong&gt; and &lt;strong&gt;locationAdditionalInformation&lt;/strong&gt; any number of times for any location type.&lt;/p&gt; &lt;p&gt;For warehouse and store inventory locations, address fields can be updated any number of times. Address fields &lt;b&gt;cannot&lt;/b&gt; be updated for fulfillment center locations. However, if any address fields were omitted during the &lt;b&gt;createInventoryLocation&lt;/b&gt; call, they can be added through this method.&lt;/p&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; When updating a warehouse location to a fulfillment center, sellers can update any of the address fields a single time during the same call used to make this update. After this, they can no longer be updated.&lt;/span&gt;&lt;p&gt;For store locations, the operating hours and/or the special hours can also be updated.&lt;/p&gt;&lt;p&gt;Whatever text is passed in for these fields in an &lt;strong&gt;updateInventoryLocation&lt;/strong&gt; call will replace the current text strings defined for these fields.&lt;/p&gt;&lt;p&gt;Unless one or more errors and/or warnings occurs with the call, there is no response payload for this call. A successful call will return an HTTP status value of &lt;i&gt;204 No Content&lt;/i&gt;.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.LocationApi();
let merchantLocationKey = "merchantLocationKey_example"; // String | This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is to be updated. <br><br>Use the <a href=\"/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\">getInventoryLocations</a> method to retrieve merchant location keys. <br><br><b>Max length</b>: 36
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br> For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let inventoryLocation = new SellInventoryV1.InventoryLocation(); // InventoryLocation | The inventory location details to be updated.
apiInstance.updateInventoryLocation(merchantLocationKey, contentType, inventoryLocation, (error, data, response) => {
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
 **merchantLocationKey** | **String**| This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is to be updated. &lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/location/methods/getInventoryLocations\&quot;&gt;getInventoryLocations&lt;/a&gt; method to retrieve merchant location keys. &lt;br&gt;&lt;br&gt;&lt;b&gt;Max length&lt;/b&gt;: 36 | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt; For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **inventoryLocation** | [**InventoryLocation**](InventoryLocation.md)| The inventory location details to be updated. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

