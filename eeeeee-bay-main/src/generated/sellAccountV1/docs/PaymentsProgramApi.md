# SellAccountV1.PaymentsProgramApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getPaymentsProgram**](PaymentsProgramApi.md#getPaymentsProgram) | **GET** /payments_program/{marketplace_id}/{payments_program_type} | 



## getPaymentsProgram

> PaymentsProgramResponse getPaymentsProgram(marketplaceId, paymentsProgramType)



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; This method is no longer applicable, as all seller accounts globally have been enabled for the new eBay payment and checkout flow.&lt;/span&gt;&lt;br&gt;This method returns whether or not the user is opted-in to the specified payments program. Sellers opt-in to payments programs by marketplace and you use the &lt;b&gt;marketplace_id&lt;/b&gt; path parameter to specify the marketplace of the status flag you want returned.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.PaymentsProgramApi();
let marketplaceId = "marketplaceId_example"; // String | This path parameter specifies the eBay marketplace of the payments program for which you want to retrieve the seller's status.
let paymentsProgramType = "paymentsProgramType_example"; // String | This path parameter specifies the payments program whose status is returned by the call.
apiInstance.getPaymentsProgram(marketplaceId, paymentsProgramType, (error, data, response) => {
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
 **marketplaceId** | **String**| This path parameter specifies the eBay marketplace of the payments program for which you want to retrieve the seller&#39;s status. | 
 **paymentsProgramType** | **String**| This path parameter specifies the payments program whose status is returned by the call. | 

### Return type

[**PaymentsProgramResponse**](PaymentsProgramResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

