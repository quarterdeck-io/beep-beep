# SellAccountV1.KycApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getKYC**](KycApi.md#getKYC) | **GET** /kyc | 



## getKYC

> KycResponse getKYC()



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; This method was originally created to see which onboarding requirements were still pending for sellers being onboarded for eBay managed payments, but now that all seller accounts are onboarded globally, this method should now just return an empty payload with a &lt;code&gt;204 No Content&lt;/code&gt; HTTP status code. &lt;/span&gt;

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.KycApi();
apiInstance.getKYC((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**KycResponse**](KycResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

