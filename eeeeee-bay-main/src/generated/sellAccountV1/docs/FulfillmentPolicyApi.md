# SellAccountV1.FulfillmentPolicyApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createFulfillmentPolicy**](FulfillmentPolicyApi.md#createFulfillmentPolicy) | **POST** /fulfillment_policy/ | 
[**deleteFulfillmentPolicy**](FulfillmentPolicyApi.md#deleteFulfillmentPolicy) | **DELETE** /fulfillment_policy/{fulfillmentPolicyId} | 
[**getFulfillmentPolicies**](FulfillmentPolicyApi.md#getFulfillmentPolicies) | **GET** /fulfillment_policy | 
[**getFulfillmentPolicy**](FulfillmentPolicyApi.md#getFulfillmentPolicy) | **GET** /fulfillment_policy/{fulfillmentPolicyId} | 
[**getFulfillmentPolicyByName**](FulfillmentPolicyApi.md#getFulfillmentPolicyByName) | **GET** /fulfillment_policy/get_by_policy_name | 
[**updateFulfillmentPolicy**](FulfillmentPolicyApi.md#updateFulfillmentPolicy) | **PUT** /fulfillment_policy/{fulfillmentPolicyId} | 



## createFulfillmentPolicy

> SetFulfillmentPolicyResponse createFulfillmentPolicy(contentType, fulfillmentPolicyRequest)



This method creates a new fulfillment policy for an eBay marketplace where the policy encapsulates seller&#39;s terms for fulfilling item purchases. Fulfillment policies include the shipment options that the seller offers to buyers.  &lt;br&gt;&lt;br&gt;A successful request returns the &lt;b&gt;getFulfillmentPolicy&lt;/b&gt; URI to the new policy in the &lt;b&gt;Location&lt;/b&gt; response header and the ID for the new policy is returned in the response payload.  &lt;p class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Tip:&lt;/b&gt; For details on creating and using the business policies supported by the Account API, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/seller-accounts/business-policies.html\&quot;&gt;eBay business policies&lt;/a&gt;.&lt;/p&gt;

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.FulfillmentPolicyApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br> For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let fulfillmentPolicyRequest = new SellAccountV1.FulfillmentPolicyRequest(); // FulfillmentPolicyRequest | Request to create a seller account fulfillment policy.
apiInstance.createFulfillmentPolicy(contentType, fulfillmentPolicyRequest, (error, data, response) => {
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
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt; For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **fulfillmentPolicyRequest** | [**FulfillmentPolicyRequest**](FulfillmentPolicyRequest.md)| Request to create a seller account fulfillment policy. | 

### Return type

[**SetFulfillmentPolicyResponse**](SetFulfillmentPolicyResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteFulfillmentPolicy

> deleteFulfillmentPolicy(fulfillmentPolicyId)



This method deletes a fulfillment policy. Supply the ID of the policy you want to delete in the &lt;b&gt;fulfillmentPolicyId&lt;/b&gt; path parameter.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.FulfillmentPolicyApi();
let fulfillmentPolicyId = "fulfillmentPolicyId_example"; // String | This path parameter specifies the ID of the fulfillment policy to delete.<br><br> This ID can be retrieved for a fulfillment policy by using the <a href=\"/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies\" target=\"_blank \">getFulfillmentPolicies</a> method.
apiInstance.deleteFulfillmentPolicy(fulfillmentPolicyId, (error, data, response) => {
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
 **fulfillmentPolicyId** | **String**| This path parameter specifies the ID of the fulfillment policy to delete.&lt;br&gt;&lt;br&gt; This ID can be retrieved for a fulfillment policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getFulfillmentPolicies&lt;/a&gt; method. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## getFulfillmentPolicies

> FulfillmentPolicyResponse getFulfillmentPolicies(marketplaceId, opts)



This method retrieves all the fulfillment policies configured for the marketplace you specify using the &lt;code&gt;marketplace_id&lt;/code&gt; query parameter.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.FulfillmentPolicyApi();
let marketplaceId = "marketplaceId_example"; // String | This query parameter specifies the eBay marketplace of the policies you want to retrieve. For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/sell/account/types/ba:MarketplaceIdEnum
let opts = {
  'contentLanguage': "contentLanguage_example" // String | Get the correct policies for a marketplace that supports multiple locales using the <code>Content-Language</code> request header. For example, get the policies for the French locale of the Canadian marketplace by specifying <code>fr-CA</code> for the <code>Content-Language</code> header. Likewise, target the Dutch locale of the Belgium marketplace by setting <code>Content-Language: nl-BE</code>. For details on header values, see <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank\">HTTP request headers</a>.
};
apiInstance.getFulfillmentPolicies(marketplaceId, opts, (error, data, response) => {
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
 **marketplaceId** | **String**| This query parameter specifies the eBay marketplace of the policies you want to retrieve. For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/sell/account/types/ba:MarketplaceIdEnum | 
 **contentLanguage** | **String**| Get the correct policies for a marketplace that supports multiple locales using the &lt;code&gt;Content-Language&lt;/code&gt; request header. For example, get the policies for the French locale of the Canadian marketplace by specifying &lt;code&gt;fr-CA&lt;/code&gt; for the &lt;code&gt;Content-Language&lt;/code&gt; header. Likewise, target the Dutch locale of the Belgium marketplace by setting &lt;code&gt;Content-Language: nl-BE&lt;/code&gt;. For details on header values, see &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank\&quot;&gt;HTTP request headers&lt;/a&gt;. | [optional] 

### Return type

[**FulfillmentPolicyResponse**](FulfillmentPolicyResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getFulfillmentPolicy

> FulfillmentPolicy getFulfillmentPolicy(fulfillmentPolicyId)



This method retrieves the complete details of a fulfillment policy. Supply the ID of the policy you want to retrieve using the &lt;b&gt;fulfillmentPolicyId&lt;/b&gt; path parameter.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.FulfillmentPolicyApi();
let fulfillmentPolicyId = "fulfillmentPolicyId_example"; // String | This path parameter specifies the ID of the fulfillment policy you want to retrieve.<br><br> This ID can be retrieved for a fulfillment policy by using the <a href=\"/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies\" target=\"_blank \">getFulfillmentPolicies</a> method.
apiInstance.getFulfillmentPolicy(fulfillmentPolicyId, (error, data, response) => {
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
 **fulfillmentPolicyId** | **String**| This path parameter specifies the ID of the fulfillment policy you want to retrieve.&lt;br&gt;&lt;br&gt; This ID can be retrieved for a fulfillment policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getFulfillmentPolicies&lt;/a&gt; method. | 

### Return type

[**FulfillmentPolicy**](FulfillmentPolicy.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getFulfillmentPolicyByName

> FulfillmentPolicy getFulfillmentPolicyByName(marketplaceId, name, opts)



This method retrieves the details for a specific fulfillment policy. In the request, supply both the policy &lt;code&gt;name&lt;/code&gt; and its associated &lt;code&gt;marketplace_id&lt;/code&gt; as query parameters.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.FulfillmentPolicyApi();
let marketplaceId = "marketplaceId_example"; // String | This query parameter specifies the eBay marketplace of the policy you want to retrieve. For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/sell/account/types/ba:MarketplaceIdEnum
let name = "name_example"; // String | This query parameter specifies the seller-defined name of the fulfillment policy you want to retrieve.<br><br>This value can be retrieved for a fulfillment policy by using the <a href=\"/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies\" target=\"_blank \">getFulfillmentPolicies</a> method.
let opts = {
  'contentLanguage': "contentLanguage_example" // String | Get the correct policies for a marketplace that supports multiple locales using the <code>Content-Language</code> request header. For example, get the policies for the French locale of the Canadian marketplace by specifying <code>fr-CA</code> for the <code>Content-Language</code> header. Likewise, target the Dutch locale of the Belgium marketplace by setting <code>Content-Language: nl-BE</code>. For details on header values, see <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank\">HTTP request headers</a>.
};
apiInstance.getFulfillmentPolicyByName(marketplaceId, name, opts, (error, data, response) => {
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
 **marketplaceId** | **String**| This query parameter specifies the eBay marketplace of the policy you want to retrieve. For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/sell/account/types/ba:MarketplaceIdEnum | 
 **name** | **String**| This query parameter specifies the seller-defined name of the fulfillment policy you want to retrieve.&lt;br&gt;&lt;br&gt;This value can be retrieved for a fulfillment policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getFulfillmentPolicies&lt;/a&gt; method. | 
 **contentLanguage** | **String**| Get the correct policies for a marketplace that supports multiple locales using the &lt;code&gt;Content-Language&lt;/code&gt; request header. For example, get the policies for the French locale of the Canadian marketplace by specifying &lt;code&gt;fr-CA&lt;/code&gt; for the &lt;code&gt;Content-Language&lt;/code&gt; header. Likewise, target the Dutch locale of the Belgium marketplace by setting &lt;code&gt;Content-Language: nl-BE&lt;/code&gt;. For details on header values, see &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank\&quot;&gt;HTTP request headers&lt;/a&gt;. | [optional] 

### Return type

[**FulfillmentPolicy**](FulfillmentPolicy.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## updateFulfillmentPolicy

> SetFulfillmentPolicyResponse updateFulfillmentPolicy(fulfillmentPolicyId, contentType, fulfillmentPolicyRequest)



This method updates an existing fulfillment policy. Specify the policy you want to update using the &lt;b&gt;fulfillment_policy_id&lt;/b&gt; path parameter. Supply a complete policy payload with the updates you want to make; this call overwrites the existing policy with the new details specified in the payload.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.FulfillmentPolicyApi();
let fulfillmentPolicyId = "fulfillmentPolicyId_example"; // String | This path parameter specifies the ID of the fulfillment policy you want to update.<br><br>This ID can be retrieved for a specific fulfillment policy by using the <a href=\"/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies\" target=\"_blank \">getFulfillmentPolicies</a> method.
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br> For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let fulfillmentPolicyRequest = new SellAccountV1.FulfillmentPolicyRequest(); // FulfillmentPolicyRequest | Fulfillment policy request
apiInstance.updateFulfillmentPolicy(fulfillmentPolicyId, contentType, fulfillmentPolicyRequest, (error, data, response) => {
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
 **fulfillmentPolicyId** | **String**| This path parameter specifies the ID of the fulfillment policy you want to update.&lt;br&gt;&lt;br&gt;This ID can be retrieved for a specific fulfillment policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getFulfillmentPolicies&lt;/a&gt; method. | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt; For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **fulfillmentPolicyRequest** | [**FulfillmentPolicyRequest**](FulfillmentPolicyRequest.md)| Fulfillment policy request | 

### Return type

[**SetFulfillmentPolicyResponse**](SetFulfillmentPolicyResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

