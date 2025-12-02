# SellAccountV1.SubscriptionApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getSubscription**](SubscriptionApi.md#getSubscription) | **GET** /subscription | 



## getSubscription

> SubscriptionResponse getSubscription(opts)



This method retrieves a list of subscriptions associated with the seller account.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.SubscriptionApi();
let opts = {
  'limit': "limit_example", // String | This field is for future use.
  'continuationToken': "continuationToken_example" // String | This field is for future use.
};
apiInstance.getSubscription(opts, (error, data, response) => {
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
 **limit** | **String**| This field is for future use. | [optional] 
 **continuationToken** | **String**| This field is for future use. | [optional] 

### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

