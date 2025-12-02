# SellAccountV1.PrivilegeApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getPrivileges**](PrivilegeApi.md#getPrivileges) | **GET** /privilege | 



## getPrivileges

> SellingPrivileges getPrivileges()



This method retrieves the seller&#39;s current set of privileges, including whether or not the seller&#39;s eBay registration has been completed, as well as the details of their site-wide &lt;b&gt;sellingLimit&lt;/b&gt; (the amount and quantity they can sell on a given day).

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.PrivilegeApi();
apiInstance.getPrivileges((error, data, response) => {
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

[**SellingPrivileges**](SellingPrivileges.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

