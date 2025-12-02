# SellAccountV1.AdvertisingEligibilityApi

All URIs are relative to *https://api.ebay.com/sell/account/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAdvertisingEligibility**](AdvertisingEligibilityApi.md#getAdvertisingEligibility) | **GET** /advertising_eligibility | 



## getAdvertisingEligibility

> SellerEligibilityMultiProgramResponse getAdvertisingEligibility(X_EBAY_C_MARKETPLACE_ID, opts)



This method allows developers to check the seller eligibility status for eBay advertising programs.

### Example

```javascript
import SellAccountV1 from 'sellAccountV1';
let defaultClient = SellAccountV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellAccountV1.AdvertisingEligibilityApi();
let X_EBAY_C_MARKETPLACE_ID = "X_EBAY_C_MARKETPLACE_ID_example"; // String | The unique identifier of the eBay marketplace for which the seller eligibility status shall be checked. This header is required or the call will fail.<br><br>See the <a href=\"/api-docs/sell/account/types/ba:MarketplaceIdEnum \" target=\"_blank \">MarketplaceIdEnum</a> type for the supported marketplace ID values.
let opts = {
  'programTypes': "programTypes_example" // String | A comma-separated list of eBay advertising programs for which eligibility status will be returned.<br><br> See the <a href=\"/api-docs/sell/account/types/plser:AdvertisingProgramEnum\" target=\"_blank\"> AdvertisingProgramEnum</a> type for a list of supported values.<br><br>If no programs are specified, the results will be returned for all programs.
};
apiInstance.getAdvertisingEligibility(X_EBAY_C_MARKETPLACE_ID, opts, (error, data, response) => {
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
 **X_EBAY_C_MARKETPLACE_ID** | **String**| The unique identifier of the eBay marketplace for which the seller eligibility status shall be checked. This header is required or the call will fail.&lt;br&gt;&lt;br&gt;See the &lt;a href&#x3D;\&quot;/api-docs/sell/account/types/ba:MarketplaceIdEnum \&quot; target&#x3D;\&quot;_blank \&quot;&gt;MarketplaceIdEnum&lt;/a&gt; type for the supported marketplace ID values. | 
 **programTypes** | **String**| A comma-separated list of eBay advertising programs for which eligibility status will be returned.&lt;br&gt;&lt;br&gt; See the &lt;a href&#x3D;\&quot;/api-docs/sell/account/types/plser:AdvertisingProgramEnum\&quot; target&#x3D;\&quot;_blank\&quot;&gt; AdvertisingProgramEnum&lt;/a&gt; type for a list of supported values.&lt;br&gt;&lt;br&gt;If no programs are specified, the results will be returned for all programs. | [optional] 

### Return type

[**SellerEligibilityMultiProgramResponse**](SellerEligibilityMultiProgramResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

