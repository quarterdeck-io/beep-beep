# SellAccountV1.PaymentPolicyApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createPaymentPolicy**](PaymentPolicyApi.md#createPaymentPolicy) | **POST** /payment_policy | 
[**deletePaymentPolicy**](PaymentPolicyApi.md#deletePaymentPolicy) | **DELETE** /payment_policy/{payment_policy_id} | 
[**getPaymentPolicies**](PaymentPolicyApi.md#getPaymentPolicies) | **GET** /payment_policy | 
[**getPaymentPolicy**](PaymentPolicyApi.md#getPaymentPolicy) | **GET** /payment_policy/{payment_policy_id} | 
[**getPaymentPolicyByName**](PaymentPolicyApi.md#getPaymentPolicyByName) | **GET** /payment_policy/get_by_policy_name | 
[**updatePaymentPolicy**](PaymentPolicyApi.md#updatePaymentPolicy) | **PUT** /payment_policy/{payment_policy_id} | 



## createPaymentPolicy

> SetPaymentPolicyResponse createPaymentPolicy(contentType, paymentPolicyRequest)



This method creates a new payment policy where the policy encapsulates seller&#39;s terms for order payments. &lt;br&gt;&lt;br&gt;A successful request returns the &lt;b&gt;getPaymentPolicy&lt;/b&gt; URI to the new policy in the &lt;b&gt;Location&lt;/b&gt; response header and the ID for the new policy is returned in the response payload.  &lt;p class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Tip:&lt;/b&gt; For details on creating and using the business policies supported by the Account API, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/seller-accounts/business-policies.html\&quot;&gt;eBay business policies&lt;/a&gt;.&lt;/p&gt;

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.PaymentPolicyApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br> For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let paymentPolicyRequest = new SellAccountV1.PaymentPolicyRequest(); // PaymentPolicyRequest | Payment policy request
apiInstance.createPaymentPolicy(contentType, paymentPolicyRequest, (error, data, response) => {
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
 **paymentPolicyRequest** | [**PaymentPolicyRequest**](PaymentPolicyRequest.md)| Payment policy request | 

### Return type

[**SetPaymentPolicyResponse**](SetPaymentPolicyResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deletePaymentPolicy

> deletePaymentPolicy(paymentPolicyId)



This method deletes a payment policy. Supply the ID of the policy you want to delete in the &lt;b&gt;paymentPolicyId&lt;/b&gt; path parameter. 

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.PaymentPolicyApi();
let paymentPolicyId = "paymentPolicyId_example"; // String | This path parameter specifies the unique identifier of the payment policy you want to delete.<br><br> This ID can be retrieved for a payment policy by using the <a href=\"/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies\" target=\"_blank \">getPaymentPolices</a> method.
apiInstance.deletePaymentPolicy(paymentPolicyId, (error, data, response) => {
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
 **paymentPolicyId** | **String**| This path parameter specifies the unique identifier of the payment policy you want to delete.&lt;br&gt;&lt;br&gt; This ID can be retrieved for a payment policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getPaymentPolices&lt;/a&gt; method. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## getPaymentPolicies

> PaymentPolicyResponse getPaymentPolicies(marketplaceId, opts)



This method retrieves all the payment business policies configured for the marketplace you specify using the &lt;code&gt;marketplace_id&lt;/code&gt; query parameter.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.PaymentPolicyApi();
let marketplaceId = "marketplaceId_example"; // String | This query parameter specifies the eBay marketplace of the policies you want to retrieve. For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/sell/account/types/ba:MarketplaceIdEnum
let opts = {
  'contentLanguage': "contentLanguage_example" // String | Get the correct policies for a marketplace that supports multiple locales using the <code>Content-Language</code> request header. For example, get the policies for the French locale of the Canadian marketplace by specifying <code>fr-CA</code> for the <code>Content-Language</code> header. Likewise, target the Dutch locale of the Belgium marketplace by setting <code>Content-Language: nl-BE</code>. For details on header values, see <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank\">HTTP request headers</a>.
};
apiInstance.getPaymentPolicies(marketplaceId, opts, (error, data, response) => {
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

[**PaymentPolicyResponse**](PaymentPolicyResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getPaymentPolicy

> PaymentPolicy getPaymentPolicy(paymentPolicyId)



This method retrieves the complete details of a payment policy. Supply the ID of the policy you want to retrieve using the &lt;b&gt;paymentPolicyId&lt;/b&gt; path parameter.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.PaymentPolicyApi();
let paymentPolicyId = "paymentPolicyId_example"; // String | This path parameter specifies the ID of the payment policy you want to retrieve. <br><br> This ID can be retrieved for a payment policy by using the <a href=\"/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies\" target=\"_blank \">getPaymentPolices</a> method.
apiInstance.getPaymentPolicy(paymentPolicyId, (error, data, response) => {
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
 **paymentPolicyId** | **String**| This path parameter specifies the ID of the payment policy you want to retrieve. &lt;br&gt;&lt;br&gt; This ID can be retrieved for a payment policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getPaymentPolices&lt;/a&gt; method. | 

### Return type

[**PaymentPolicy**](PaymentPolicy.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getPaymentPolicyByName

> PaymentPolicy getPaymentPolicyByName(marketplaceId, name, opts)



This method retrieves the details of a specific payment policy. Supply both the policy &lt;code&gt;name&lt;/code&gt; and its associated &lt;code&gt;marketplace_id&lt;/code&gt; in the request query parameters.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.PaymentPolicyApi();
let marketplaceId = "marketplaceId_example"; // String | This query parameter specifies the eBay marketplace of the policy you want to retrieve. For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/sell/account/types/ba:MarketplaceIdEnum
let name = "name_example"; // String | This query parameter specifies the seller-defined name of the payment policy you want to retrieve.<br><br> This value can be retrieved for a payment policy by using the <a href=\"/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies\" target=\"_blank \">getPaymentPolicies</a> method.
let opts = {
  'contentLanguage': "contentLanguage_example" // String | Get the correct policy for a marketplace that supports multiple locales using the <code>Content-Language</code> request header. For example, get a policy for the French locale of the Canadian marketplace by specifying <code>fr-CA</code> for the <code>Content-Language</code> header. Likewise, target the Dutch locale of the Belgium marketplace by setting <code>Content-Language: nl-BE</code>. For details on header values, see <a href=\"/api-docs/static/rest-request-components.html#HTTP\">HTTP request headers</a>.
};
apiInstance.getPaymentPolicyByName(marketplaceId, name, opts, (error, data, response) => {
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
 **name** | **String**| This query parameter specifies the seller-defined name of the payment policy you want to retrieve.&lt;br&gt;&lt;br&gt; This value can be retrieved for a payment policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getPaymentPolicies&lt;/a&gt; method. | 
 **contentLanguage** | **String**| Get the correct policy for a marketplace that supports multiple locales using the &lt;code&gt;Content-Language&lt;/code&gt; request header. For example, get a policy for the French locale of the Canadian marketplace by specifying &lt;code&gt;fr-CA&lt;/code&gt; for the &lt;code&gt;Content-Language&lt;/code&gt; header. Likewise, target the Dutch locale of the Belgium marketplace by setting &lt;code&gt;Content-Language: nl-BE&lt;/code&gt;. For details on header values, see &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot;&gt;HTTP request headers&lt;/a&gt;. | [optional] 

### Return type

[**PaymentPolicy**](PaymentPolicy.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## updatePaymentPolicy

> SetPaymentPolicyResponse updatePaymentPolicy(paymentPolicyId, contentType, paymentPolicyRequest)



This method updates an existing payment policy. Specify the policy you want to update using the &lt;b&gt;payment_policy_id&lt;/b&gt; path parameter. Supply a complete policy payload with the updates you want to make; this call overwrites the existing policy with the new details specified in the payload.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.PaymentPolicyApi();
let paymentPolicyId = "paymentPolicyId_example"; // String | This path parameter specifies the ID of the payment policy you want to update. <br><br> This ID can be retrieved for a payment policy by using the <a href=\"/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies\" target=\"_blank \">getPaymentPolices</a> method.
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br> For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let paymentPolicyRequest = new SellAccountV1.PaymentPolicyRequest(); // PaymentPolicyRequest | Payment policy request
apiInstance.updatePaymentPolicy(paymentPolicyId, contentType, paymentPolicyRequest, (error, data, response) => {
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
 **paymentPolicyId** | **String**| This path parameter specifies the ID of the payment policy you want to update. &lt;br&gt;&lt;br&gt; This ID can be retrieved for a payment policy by using the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies\&quot; target&#x3D;\&quot;_blank \&quot;&gt;getPaymentPolices&lt;/a&gt; method. | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt; For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **paymentPolicyRequest** | [**PaymentPolicyRequest**](PaymentPolicyRequest.md)| Payment policy request | 

### Return type

[**SetPaymentPolicyResponse**](SetPaymentPolicyResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

