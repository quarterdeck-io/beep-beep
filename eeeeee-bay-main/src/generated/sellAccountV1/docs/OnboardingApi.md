# SellAccountV1.OnboardingApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getPaymentsProgramOnboarding**](OnboardingApi.md#getPaymentsProgramOnboarding) | **GET** /payments_program/{marketplace_id}/{payments_program_type}/onboarding | 



## getPaymentsProgramOnboarding

> PaymentsProgramOnboardingResponse getPaymentsProgramOnboarding(marketplaceId, paymentsProgramType)



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; This method is no longer applicable, as all seller accounts globally have been enabled for the new eBay payment and checkout flow.&lt;/span&gt;&lt;br&gt;This method retrieves a seller&#39;s onboarding status for a payments program for a specified marketplace. The overall onboarding status of the seller and the status of each onboarding step is returned.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.OnboardingApi();
let marketplaceId = "marketplaceId_example"; // String | The eBay marketplace ID associated with the onboarding status to retrieve.
let paymentsProgramType = "paymentsProgramType_example"; // String | The type of payments program whose status is returned by the method.
apiInstance.getPaymentsProgramOnboarding(marketplaceId, paymentsProgramType, (error, data, response) => {
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
 **marketplaceId** | **String**| The eBay marketplace ID associated with the onboarding status to retrieve. | 
 **paymentsProgramType** | **String**| The type of payments program whose status is returned by the method. | 

### Return type

[**PaymentsProgramOnboardingResponse**](PaymentsProgramOnboardingResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

