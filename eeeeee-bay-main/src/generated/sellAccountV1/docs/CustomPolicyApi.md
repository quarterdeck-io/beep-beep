# SellAccountV1.CustomPolicyApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createCustomPolicy**](CustomPolicyApi.md#createCustomPolicy) | **POST** /custom_policy/ | 
[**getCustomPolicies**](CustomPolicyApi.md#getCustomPolicies) | **GET** /custom_policy/ | 
[**getCustomPolicy**](CustomPolicyApi.md#getCustomPolicy) | **GET** /custom_policy/{custom_policy_id} | 
[**updateCustomPolicy**](CustomPolicyApi.md#updateCustomPolicy) | **PUT** /custom_policy/{custom_policy_id} | 



## createCustomPolicy

> Object createCustomPolicy(contentType, customPolicyCreateRequest)



This method creates a new custom policy that specifies the seller&#39;s terms for complying with local governmental regulations. Each Custom Policy targets a &lt;b&gt;policyType&lt;/b&gt;. Multiple policies may be created as using the following custom policy types:&lt;ul&gt;&lt;li&gt;PRODUCT_COMPLIANCE: Product Compliance policies disclose product information as required for regulatory compliance. &lt;br/&gt;&lt;br/&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; A maximum of 60 Product Compliance policies per seller may be created.&lt;/span&gt;&lt;/li&gt;&lt;li&gt;TAKE_BACK: Takeback policies describe the seller&#39;s legal obligation to take back a previously purchased item when the buyer purchases a new one. &lt;br/&gt;&lt;br/&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; A maximum of 18 Takeback policies per seller may be created.&lt;/span&gt;&lt;/li&gt;&lt;/ul&gt;A successful create policy call returns an HTTP status code of &lt;b&gt;201 Created&lt;/b&gt; with the system-generated policy ID included in the Location response header.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.CustomPolicyApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br> For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let customPolicyCreateRequest = new SellAccountV1.CustomPolicyCreateRequest(); // CustomPolicyCreateRequest | Request to create a new Custom Policy.
apiInstance.createCustomPolicy(contentType, customPolicyCreateRequest, (error, data, response) => {
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
 **customPolicyCreateRequest** | [**CustomPolicyCreateRequest**](CustomPolicyCreateRequest.md)| Request to create a new Custom Policy. | 

### Return type

**Object**

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getCustomPolicies

> CustomPolicyResponse getCustomPolicies(opts)



This method retrieves the list of custom policies defined for a seller&#39;s account. To limit the returned custom policies, specify the &lt;b&gt;policy_types&lt;/b&gt; query parameter.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.CustomPolicyApi();
let opts = {
  'policyTypes': "policyTypes_example" // String | This query parameter specifies the type of custom policies to be returned.<br><br>Multiple policy types may be requested in a single call by providing a comma-delimited set of all policy types to be returned.<br><br><span class=\"tablenote\"><strong>Note:</strong> Omitting this query parameter from a request will also return policies of all policy types.</span><br> See the <a href=\"/api-docs/sell/account/types/api:CustomPolicyTypeEnum\" target=\"_blank \">CustomPolicyTypeEnum</a> type for a list of supported values.
};
apiInstance.getCustomPolicies(opts, (error, data, response) => {
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
 **policyTypes** | **String**| This query parameter specifies the type of custom policies to be returned.&lt;br&gt;&lt;br&gt;Multiple policy types may be requested in a single call by providing a comma-delimited set of all policy types to be returned.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Omitting this query parameter from a request will also return policies of all policy types.&lt;/span&gt;&lt;br&gt; See the &lt;a href&#x3D;\&quot;/api-docs/sell/account/types/api:CustomPolicyTypeEnum\&quot; target&#x3D;\&quot;_blank \&quot;&gt;CustomPolicyTypeEnum&lt;/a&gt; type for a list of supported values. | [optional] 

### Return type

[**CustomPolicyResponse**](CustomPolicyResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getCustomPolicy

> CustomPolicy getCustomPolicy(customPolicyId)



This method retrieves the custom policy specified by the &lt;b&gt;custom_policy_id&lt;/b&gt; path parameter.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.CustomPolicyApi();
let customPolicyId = "customPolicyId_example"; // String | This path parameter is the unique identifier of the custom policy to retrieve.<br><br> This ID can be retrieved for a custom policy by using the <a href=\"/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicies\" target=\"_blank \">getCustomPolicies</a> method.
apiInstance.getCustomPolicy(customPolicyId, (error, data, response) => {
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
 **customPolicyId** | **String**| This path parameter is the unique identifier of the custom policy to retrieve.&lt;br&gt;&lt;br&gt; This ID can be retrieved for a custom policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getCustomPolicies&lt;/a&gt; method. | 

### Return type

[**CustomPolicy**](CustomPolicy.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## updateCustomPolicy

> updateCustomPolicy(customPolicyId, contentType, customPolicyRequest)



This method updates an existing custom policy specified by the &lt;b&gt;custom_policy_id&lt;/b&gt; path parameter. Since this method overwrites the policy&#39;s &lt;b&gt;name&lt;/b&gt;, &lt;b&gt;label&lt;/b&gt;, and &lt;b&gt;description&lt;/b&gt; fields, always include the complete and current text of all three policy fields in the request payload, even if they are not being updated.&lt;br/&gt; &lt;br/&gt;For example, the value for the &lt;b&gt;label&lt;/b&gt; field is to be updated, but the &lt;b&gt;name&lt;/b&gt; and &lt;b&gt;description&lt;/b&gt; values will remain unchanged. The existing &lt;b&gt;name&lt;/b&gt; and &lt;b&gt;description&lt;/b&gt; values, as they are defined in the current policy, must also be passed in. &lt;br/&gt;&lt;br/&gt;A successful policy update call returns an HTTP status code of &lt;b&gt;204 No Content&lt;/b&gt;.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.CustomPolicyApi();
let customPolicyId = "customPolicyId_example"; // String | This path parameter is the unique identifier of the custom policy to update.<br><br><span class=\"tablenote\"><b>Note:</b> A list of custom policies defined for a seller's account that includes this ID can be retrieved by calling the <a href=\"/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicies\" target=\"_blank \">getCustomPolicies</a> method.</span>
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br> For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let customPolicyRequest = new SellAccountV1.CustomPolicyRequest(); // CustomPolicyRequest | Request to update a current custom policy.
apiInstance.updateCustomPolicy(customPolicyId, contentType, customPolicyRequest, (error, data, response) => {
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
 **customPolicyId** | **String**| This path parameter is the unique identifier of the custom policy to update.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; A list of custom policies defined for a seller&#39;s account that includes this ID can be retrieved by calling the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getCustomPolicies&lt;/a&gt; method.&lt;/span&gt; | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt; For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **customPolicyRequest** | [**CustomPolicyRequest**](CustomPolicyRequest.md)| Request to update a current custom policy. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

