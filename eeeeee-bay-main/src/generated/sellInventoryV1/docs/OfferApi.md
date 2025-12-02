# SellInventoryV1.OfferApi

All URIs are relative to *https://api.ebay.com/sell/inventory/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bulkCreateOffer**](OfferApi.md#bulkCreateOffer) | **POST** /bulk_create_offer | 
[**bulkPublishOffer**](OfferApi.md#bulkPublishOffer) | **POST** /bulk_publish_offer | 
[**createOffer**](OfferApi.md#createOffer) | **POST** /offer | 
[**deleteOffer**](OfferApi.md#deleteOffer) | **DELETE** /offer/{offerId} | 
[**getListingFees**](OfferApi.md#getListingFees) | **POST** /offer/get_listing_fees | 
[**getOffer**](OfferApi.md#getOffer) | **GET** /offer/{offerId} | 
[**getOffers**](OfferApi.md#getOffers) | **GET** /offer | 
[**publishOffer**](OfferApi.md#publishOffer) | **POST** /offer/{offerId}/publish | 
[**publishOfferByInventoryItemGroup**](OfferApi.md#publishOfferByInventoryItemGroup) | **POST** /offer/publish_by_inventory_item_group | 
[**updateOffer**](OfferApi.md#updateOffer) | **PUT** /offer/{offerId} | 
[**withdrawOffer**](OfferApi.md#withdrawOffer) | **POST** /offer/{offerId}/withdraw | 
[**withdrawOfferByInventoryItemGroup**](OfferApi.md#withdrawOfferByInventoryItemGroup) | **POST** /offer/withdraw_by_inventory_item_group | 



## bulkCreateOffer

> BulkOfferResponse bulkCreateOffer(contentLanguage, contentType, bulkEbayOfferDetailsWithKeys)



This call creates multiple offers (up to 25) for specific inventory items on a specific eBay marketplace. Although it is not a requirement for the seller to create complete offers (with all necessary details) right from the start, eBay recommends that the seller provide all necessary details with this call since there is currently no bulk operation available to update multiple offers with one call. The following fields are always required in the request payload:  &lt;strong&gt;sku&lt;/strong&gt;, &lt;strong&gt;marketplaceId&lt;/strong&gt;, and (listing) &lt;strong&gt;format&lt;/strong&gt;. &lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active listing. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#offer\&quot; target&#x3D;\&quot;_blank\&quot;&gt;Offer fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;Other information that will be required before a offer can be published are highlighted below: &lt;ul&gt;&lt;li&gt;Inventory location&lt;/li&gt; &lt;li&gt;Offer price&lt;/li&gt; &lt;li&gt;Available quantity&lt;/li&gt; &lt;li&gt;eBay listing category&lt;/li&gt; &lt;li&gt;Referenced listing policy profiles to set payment, return, and fulfillment values/settings&lt;/li&gt; &lt;/ul&gt;&lt;p&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Though the &lt;strong&gt;includeCatalogProductDetails&lt;/strong&gt; parameter is not required to be submitted in the request, the parameter defaults to &lt;code&gt;true&lt;/code&gt; if omitted.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all Inventory API calls, this call also requires the &lt;code&gt;Content-Type&lt;/code&gt; and &lt;code&gt;Content-Language&lt;/code&gt; headers. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/bulkCreateOffer#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information.&lt;/span&gt;&lt;/p&gt; &lt;p&gt;If the call is successful, unique &lt;strong&gt;offerId&lt;/strong&gt; values are returned in the response for each successfully created offer. The &lt;strong&gt;offerId&lt;/strong&gt; value will be required for many other offer-related calls. Note that this call only stages an offer for publishing. The seller must run either the &lt;strong&gt;publishOffer&lt;/strong&gt;, &lt;strong&gt;bulkPublishOffer&lt;/strong&gt;, or &lt;strong&gt;publishOfferByInventoryItemGroup&lt;/strong&gt; call to convert offer(s) into an active single- or multiple-variation listing.&lt;/p&gt;&lt;p&gt;For those who prefer to create a single offer per call, the &lt;strong&gt;createOffer&lt;/strong&gt; method can be used instead.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let contentLanguage = "contentLanguage_example"; // String | This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be <code>en-US</code> for English or <code>de-DE</code> for German.<br><br>For more information on the Content-Language header, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let bulkEbayOfferDetailsWithKeys = new SellInventoryV1.BulkEbayOfferDetailsWithKeys(); // BulkEbayOfferDetailsWithKeys | Details of the offer for the channel
apiInstance.bulkCreateOffer(contentLanguage, contentType, bulkEbayOfferDetailsWithKeys, (error, data, response) => {
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
 **contentLanguage** | **String**| This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be &lt;code&gt;en-US&lt;/code&gt; for English or &lt;code&gt;de-DE&lt;/code&gt; for German.&lt;br&gt;&lt;br&gt;For more information on the Content-Language header, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **bulkEbayOfferDetailsWithKeys** | [**BulkEbayOfferDetailsWithKeys**](BulkEbayOfferDetailsWithKeys.md)| Details of the offer for the channel | 

### Return type

[**BulkOfferResponse**](BulkOfferResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## bulkPublishOffer

> BulkPublishResponse bulkPublishOffer(contentType, bulkOffer)



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day.&lt;/span&gt;&lt;br&gt;This call is used to convert unpublished offers (up to 25) into  published offers, or live eBay listings. The unique identifier (&lt;strong&gt;offerId&lt;/strong&gt;) of each offer to publish is passed into the request payload. It is possible that some unpublished offers will be successfully created into eBay listings, but others may fail. The response payload will show the results for each &lt;strong&gt;offerId&lt;/strong&gt; value that is passed into the request payload. The &lt;strong&gt;errors&lt;/strong&gt; and &lt;strong&gt;warnings&lt;/strong&gt; containers will be returned for an offer that had one or more issues being published. &lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling the create or update methods, but become required when publishing the offer to create active listings. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#offer\&quot; target&#x3D;\&quot;_blank\&quot;&gt;Offer fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;For those who prefer to publish one offer per call, the &lt;strong&gt;publishOffer&lt;/strong&gt; method can be used instead. In the case of a multiple-variation listing, the &lt;strong&gt;publishOfferByInventoryItemGroup&lt;/strong&gt; call should be used instead, as this call will convert all unpublished offers associated with an inventory item group into a multiple-variation listing.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let bulkOffer = new SellInventoryV1.BulkOffer(); // BulkOffer | The base request of the <strong>bulkPublishOffer</strong> method.
apiInstance.bulkPublishOffer(contentType, bulkOffer, (error, data, response) => {
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
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **bulkOffer** | [**BulkOffer**](BulkOffer.md)| The base request of the &lt;strong&gt;bulkPublishOffer&lt;/strong&gt; method. | 

### Return type

[**BulkPublishResponse**](BulkPublishResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createOffer

> OfferResponse createOffer(contentLanguage, contentType, ebayOfferDetailsWithKeys)



This call creates an offer for a specific inventory item on a specific eBay marketplace. It is up to the sellers whether they want to create a complete offer (with all necessary details) right from the start, or sellers can provide only some information with the initial &lt;strong&gt;createOffer&lt;/strong&gt; call, and then make one or more subsequent &lt;strong&gt;updateOffer&lt;/strong&gt; calls to complete the offer and prepare to publish the offer. Upon first creating an offer, the following fields are required in the request payload:  &lt;strong&gt;sku&lt;/strong&gt;, &lt;strong&gt;marketplaceId&lt;/strong&gt;, and (listing) &lt;strong&gt;format&lt;/strong&gt;.&lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active listing. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#offer\&quot; target&#x3D;\&quot;_blank\&quot;&gt;Offer fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;Other information that will be required before an offer can be published are highlighted below. These settings are either set with &lt;strong&gt;createOffer&lt;/strong&gt;, or they can be set with a subsequent &lt;strong&gt;updateOffer&lt;/strong&gt; call: &lt;ul&gt;&lt;li&gt;Inventory location&lt;/li&gt; &lt;li&gt;Offer price&lt;/li&gt; &lt;li&gt;Available quantity&lt;/li&gt; &lt;li&gt;eBay listing category&lt;/li&gt; &lt;li&gt;Referenced listing policy profiles to set payment, return, and fulfillment values/settings&lt;/li&gt; &lt;/ul&gt; &lt;p&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Though the &lt;strong&gt;includeCatalogProductDetails&lt;/strong&gt; parameter is not required to be submitted in the request, the parameter defaults to &lt;code&gt;true&lt;/code&gt; if omitted.&lt;/span&gt;&lt;/p&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all Inventory API calls, this call also requires the &lt;code&gt;Content-Type&lt;/code&gt; and &lt;code&gt;Content-Language&lt;/code&gt; headers. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/createOffer#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information.&lt;/span&gt;&lt;p&gt;If the call is successful, a unique &lt;strong&gt;offerId&lt;/strong&gt; value is returned in the response. This value will be required for many other offer-related calls. Note that this call only stages an offer for publishing. The seller must run the &lt;strong&gt;publishOffer&lt;/strong&gt; call to convert the offer to an active eBay listing.&lt;/p&gt;&lt;p&gt;For those who prefer to create multiple offers (up to 25 at a time) with one call, the &lt;strong&gt;bulkCreateOffer&lt;/strong&gt; method can be used.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let contentLanguage = "contentLanguage_example"; // String | This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be <code>en-US</code> for English or <code>de-DE</code> for German.<br><br>For more information on the Content-Language header, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let ebayOfferDetailsWithKeys = new SellInventoryV1.EbayOfferDetailsWithKeys(); // EbayOfferDetailsWithKeys | Details of the offer for the channel
apiInstance.createOffer(contentLanguage, contentType, ebayOfferDetailsWithKeys, (error, data, response) => {
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
 **contentLanguage** | **String**| This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be &lt;code&gt;en-US&lt;/code&gt; for English or &lt;code&gt;de-DE&lt;/code&gt; for German.&lt;br&gt;&lt;br&gt;For more information on the Content-Language header, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **ebayOfferDetailsWithKeys** | [**EbayOfferDetailsWithKeys**](EbayOfferDetailsWithKeys.md)| Details of the offer for the channel | 

### Return type

[**OfferResponse**](OfferResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteOffer

> deleteOffer(offerId)



If used against an unpublished offer, this call will permanently delete that offer. In the case of a published offer (or live eBay listing), a successful call will either end the single-variation listing associated with the offer, or it will remove that product variation from the eBay listing and also automatically remove that product variation from the inventory item group. In the case of a multiple-variation listing, the &lt;strong&gt;deleteOffer&lt;/strong&gt; will not remove the product variation from the listing if that variation has one or more sales. If that product variation has one or more sales, the seller can alternately just set the available quantity of that product variation to &lt;code&gt;0&lt;/code&gt;, so it is not available in the eBay search or View Item page, and then the seller can remove that product variation from the inventory item group at a later time.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let offerId = "offerId_example"; // String | This path parameter specifies the unique identifier of the offer being deleted.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\">getOffers</a> method to retrieve offer IDs.
apiInstance.deleteOffer(offerId, (error, data, response) => {
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
 **offerId** | **String**| This path parameter specifies the unique identifier of the offer being deleted.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot;&gt;getOffers&lt;/a&gt; method to retrieve offer IDs. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## getListingFees

> FeesSummaryResponse getListingFees(contentType, opts)



This call is used to retrieve the expected listing fees for up to 250 unpublished offers. An array of one or more &lt;strong&gt;offerId&lt;/strong&gt; values are passed in under the &lt;strong&gt;offers&lt;/strong&gt; container.&lt;br&gt;&lt;br&gt;In the response payload, all listing fees are grouped by eBay marketplace, and listing fees per offer are not shown. A &lt;strong&gt;fees&lt;/strong&gt; container will be returned for each eBay marketplace where the seller is selling the products associated with the specified offers. &lt;br&gt;&lt;br&gt;Errors will occur if the seller passes in &lt;strong&gt;offerIds&lt;/strong&gt; that represent published offers, so this call should be made before the seller publishes offers with the &lt;strong&gt;publishOffer&lt;/strong&gt;.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let opts = {
  'offerKeysWithId': new SellInventoryV1.OfferKeysWithId() // OfferKeysWithId | List of offers that needs fee information
};
apiInstance.getListingFees(contentType, opts, (error, data, response) => {
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
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **offerKeysWithId** | [**OfferKeysWithId**](OfferKeysWithId.md)| List of offers that needs fee information | [optional] 

### Return type

[**FeesSummaryResponse**](FeesSummaryResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getOffer

> EbayOfferDetailsWithAll getOffer(offerId)



This call retrieves a specific published or unpublished offer. The unique identifier of the offer (&lt;strong&gt;offerId&lt;/strong&gt;) is passed in at the end of the call URI.&lt;p&gt;The &lt;code&gt;authorization&lt;/code&gt; header is the only required HTTP header for this call. See the &lt;strong&gt;HTTP request headers&lt;/strong&gt; section for more information.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let offerId = "offerId_example"; // String | This path parameter specifies the unique identifier of the offer that is to be retrieved.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\">getOffers</a> method to retrieve offer IDs.
apiInstance.getOffer(offerId, (error, data, response) => {
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
 **offerId** | **String**| This path parameter specifies the unique identifier of the offer that is to be retrieved.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot;&gt;getOffers&lt;/a&gt; method to retrieve offer IDs. | 

### Return type

[**EbayOfferDetailsWithAll**](EbayOfferDetailsWithAll.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getOffers

> Offers getOffers(opts)



This call retrieves all existing offers for the specified SKU value. The seller has the option of limiting the offers that are retrieved to a specific eBay marketplace, or to a listing format.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; At this time, the same SKU value can not be offered across multiple eBay marketplaces, so the &lt;strong&gt;marketplace_id&lt;/strong&gt; query parameter currently does not have any practical use for this call.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; The same SKU can be offered through an auction and a fixed-price listing concurrently. If this is the case, &lt;b&gt;getOffers&lt;/b&gt; will return two offers. Otherwise, only one offer will be returned.&lt;/span&gt;&lt;br&gt;The &lt;code&gt;authorization&lt;/code&gt; header is the only required HTTP header for this call. See the &lt;strong&gt;HTTP request headers&lt;/strong&gt; section for more information.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let opts = {
  'format': "format_example", // String | This enumeration value sets the listing format for the offers being retrieved. This query parameter will be passed in if the seller only wants to see offers in a specified listing format, such as <code>FIXED_PRICE</code>.
  'limit': "limit_example", // String | The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in this field should be a positive integer value. If this query parameter is not set, up to 100 records will be returned on each page of results.
  'marketplaceId': "marketplaceId_example", // String | The unique identifier of the eBay marketplace. This query parameter will be passed in if the seller only wants to see the product's offers on a specific eBay marketplace.<br><br><span class=\"tablenote\"><strong>Note:</strong> At this time, the same SKU value can not be offered across multiple eBay marketplaces, so the <strong>marketplace_id</strong> query parameter currently does not have any practical use for this call.</span>
  'offset': "offset_example", // String | The value passed in this query parameter sets the page number to retrieve. Although this field is a string, the value passed in this field should be a integer value equal to or greater than <code>0</code>. The first page of records has a value of <code>0</code>, the second page of records has a value of <code>1</code>, and so on. If this query parameter is not set, its value defaults to <code>0</code>, and the first page of records is returned.
  'sku': "sku_example" // String | The seller-defined SKU value is passed in as a query parameter. All offers associated with this product are returned in the response. <br><br><span class=\"tablenote\"><strong>Note:</strong> The same SKU can be offered through an auction and a fixed-price listing concurrently. If this is the case, <b>getOffers</b> will return two offers. Otherwise, only one offer will be returned.</span><br>Use the <a href=\"/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\">getInventoryItems</a> method to retrieve SKU values.<br><br><strong>Max length</strong>: 50.
};
apiInstance.getOffers(opts, (error, data, response) => {
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
 **format** | **String**| This enumeration value sets the listing format for the offers being retrieved. This query parameter will be passed in if the seller only wants to see offers in a specified listing format, such as &lt;code&gt;FIXED_PRICE&lt;/code&gt;. | [optional] 
 **limit** | **String**| The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in this field should be a positive integer value. If this query parameter is not set, up to 100 records will be returned on each page of results. | [optional] 
 **marketplaceId** | **String**| The unique identifier of the eBay marketplace. This query parameter will be passed in if the seller only wants to see the product&#39;s offers on a specific eBay marketplace.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; At this time, the same SKU value can not be offered across multiple eBay marketplaces, so the &lt;strong&gt;marketplace_id&lt;/strong&gt; query parameter currently does not have any practical use for this call.&lt;/span&gt; | [optional] 
 **offset** | **String**| The value passed in this query parameter sets the page number to retrieve. Although this field is a string, the value passed in this field should be a integer value equal to or greater than &lt;code&gt;0&lt;/code&gt;. The first page of records has a value of &lt;code&gt;0&lt;/code&gt;, the second page of records has a value of &lt;code&gt;1&lt;/code&gt;, and so on. If this query parameter is not set, its value defaults to &lt;code&gt;0&lt;/code&gt;, and the first page of records is returned. | [optional] 
 **sku** | **String**| The seller-defined SKU value is passed in as a query parameter. All offers associated with this product are returned in the response. &lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; The same SKU can be offered through an auction and a fixed-price listing concurrently. If this is the case, &lt;b&gt;getOffers&lt;/b&gt; will return two offers. Otherwise, only one offer will be returned.&lt;/span&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems\&quot;&gt;getInventoryItems&lt;/a&gt; method to retrieve SKU values.&lt;br&gt;&lt;br&gt;&lt;strong&gt;Max length&lt;/strong&gt;: 50. | [optional] 

### Return type

[**Offers**](Offers.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## publishOffer

> PublishResponse publishOffer(offerId)



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day.&lt;/span&gt;&lt;br&gt;This call is used to convert an unpublished offer into a published offer, or live eBay listing. The unique identifier of the offer (&lt;strong&gt;offerId&lt;/strong&gt;) is passed in at the end of the call URI.&lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling the create or update methods, but become required when publishing the offer to create active listings. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#offer\&quot; target&#x3D;\&quot;_blank\&quot;&gt;Offer fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;For those who prefer to publish multiple offers (up to 25 at a time) with one call, the &lt;strong&gt;bulkPublishOffer&lt;/strong&gt; method can be used. In the case of a multiple-variation listing, the &lt;strong&gt;publishOfferByInventoryItemGroup&lt;/strong&gt; call should be used instead, as this call will convert all unpublished offers associated with an inventory item group into a multiple-variation listing.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let offerId = "offerId_example"; // String | This path parameter specifies the unique identifier of the offer that is to be published.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\">getOffers</a> method to retrieve offer IDs.
apiInstance.publishOffer(offerId, (error, data, response) => {
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
 **offerId** | **String**| This path parameter specifies the unique identifier of the offer that is to be published.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot;&gt;getOffers&lt;/a&gt; method to retrieve offer IDs. | 

### Return type

[**PublishResponse**](PublishResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## publishOfferByInventoryItemGroup

> PublishResponse publishOfferByInventoryItemGroup(contentType, publishByInventoryItemGroupRequest)



&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Please note that any eBay listing created using the Inventory API cannot be revised or relisted using the Trading API calls.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day.&lt;/span&gt;&lt;br&gt;This call is used to convert all unpublished offers associated with an inventory item group into an active, multiple-variation listing.&lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling the create or update methods, but become required when publishing the offer to create active listings. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#offer\&quot; target&#x3D;\&quot;_blank\&quot;&gt;Offer fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;The unique identifier of the inventory item group (&lt;strong&gt;inventoryItemGroupKey&lt;/strong&gt;) is passed in the request payload. All inventory items and their corresponding offers in the inventory item group must be valid (meet all requirements) for the &lt;strong&gt;publishOfferByInventoryItemGroup&lt;/strong&gt; call to be completely successful. For any inventory items in the group that are missing required data or have no corresponding offers, the &lt;strong&gt;publishOfferByInventoryItemGroup&lt;/strong&gt; will create a new multiple-variation listing, but any inventory items with missing required data/offers will not be in the newly-created listing. If any inventory items in the group to be published have invalid data, or one or more of the inventory items have conflicting data with one another, the &lt;strong&gt;publishOfferByInventoryItemGroup&lt;/strong&gt; call will fail. Be sure to check for any error or warning messages in the call response for any applicable information about one or more inventory items/offers having issues.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let publishByInventoryItemGroupRequest = new SellInventoryV1.PublishByInventoryItemGroupRequest(); // PublishByInventoryItemGroupRequest | The identifier of the inventory item group to publish and the eBay marketplace where the listing will be published is needed in the request payload.
apiInstance.publishOfferByInventoryItemGroup(contentType, publishByInventoryItemGroupRequest, (error, data, response) => {
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
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **publishByInventoryItemGroupRequest** | [**PublishByInventoryItemGroupRequest**](PublishByInventoryItemGroupRequest.md)| The identifier of the inventory item group to publish and the eBay marketplace where the listing will be published is needed in the request payload. | 

### Return type

[**PublishResponse**](PublishResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateOffer

> OfferResponse updateOffer(contentLanguage, offerId, contentType, ebayOfferDetailsWithId)



This call updates an existing offer. An existing offer may be in published state (active eBay listing), or in an unpublished state and yet to be published with the &lt;strong&gt;publishOffer&lt;/strong&gt; call. The unique identifier (&lt;strong&gt;offerId&lt;/strong&gt;) for the offer to update is passed in at the end of the call URI. &lt;br&gt;&lt;br&gt;The &lt;strong&gt;updateOffer&lt;/strong&gt; call does a complete replacement of the existing offer object, so all fields that make up the current offer object are required, regardless of whether their values changed. &lt;br&gt;&lt;br&gt;&lt;div class&#x3D;\&quot;msgbox_important\&quot;&gt;&lt;p class&#x3D;\&quot;msgbox_importantInDiv\&quot; data-mc-autonum&#x3D;\&quot;&amp;lt;b&amp;gt;&amp;lt;span style&#x3D;&amp;quot;color: #dd1e31;&amp;quot; class&#x3D;&amp;quot;mcFormatColor&amp;quot;&amp;gt;Important! &amp;lt;/span&amp;gt;&amp;lt;/b&amp;gt;\&quot;&gt;&lt;span class&#x3D;\&quot;autonumber\&quot;&gt;&lt;span&gt;&lt;b&gt;&lt;span style&#x3D;\&quot;color: #dd1e31;\&quot; class&#x3D;\&quot;mcFormatColor\&quot;&gt;Important!&lt;/span&gt;&lt;/b&gt;&lt;/span&gt;&lt;/span&gt;Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active listing. For this method, see &lt;a href&#x3D;\&quot;/api-docs/sell/static/inventory/publishing-offers.html#offer\&quot; target&#x3D;\&quot;_blank\&quot;&gt;Offer fields&lt;/a&gt; for a list of fields required to publish an offer.&lt;/p&gt;&lt;/span&gt;&lt;/div&gt;&lt;br&gt;Other information that is required before an unpublished offer can be published or before a published offer can be revised include: &lt;ul&gt;&lt;li&gt;Inventory location&lt;/li&gt; &lt;li&gt;Offer price&lt;/li&gt; &lt;li&gt;Available quantity&lt;/li&gt; &lt;li&gt;eBay listing category&lt;/li&gt;  &lt;li&gt;Referenced listing policy profiles to set payment, return, and fulfillment values/settings&lt;/li&gt; &lt;/ul&gt; &lt;p&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Though the &lt;strong&gt;includeCatalogProductDetails&lt;/strong&gt; parameter is not required to be submitted in the request, the parameter defaults to &lt;code&gt;true&lt;/code&gt; if omitted from both the &lt;strong&gt;updateOffer&lt;/strong&gt; and the &lt;strong&gt;createOffer&lt;/strong&gt; calls. If a value is specified in the &lt;strong&gt;updateOffer&lt;/strong&gt; call, this value will be used.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; In addition to the &lt;code&gt;authorization&lt;/code&gt; header, which is required for all Inventory API calls, this call also requires the &lt;code&gt;Content-Type&lt;/code&gt; and &lt;code&gt;Content-Language&lt;/code&gt; headers. See the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/updateOffer#h3-request-headers\&quot;&gt;HTTP request headers&lt;/a&gt; for more information.&lt;/span&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day.&lt;/span&gt;&lt;/p&gt; &lt;p&gt;For published offers, the &lt;strong&gt;listingDescription&lt;/strong&gt; field is also required to update the offer/eBay listing. For unpublished offers, this field is not necessarily required unless it is already set for the unpublished offer.&lt;/p&gt;

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let contentLanguage = "contentLanguage_example"; // String | This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be <code>en-US</code> for English or <code>de-DE</code> for German.<br><br>For more information on the Content-Language header, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let offerId = "offerId_example"; // String | This path parameter specifies the unique identifier of the offer being updated.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\">getOffers</a> method to retrieve offer IDs.
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let ebayOfferDetailsWithId = new SellInventoryV1.EbayOfferDetailsWithId(); // EbayOfferDetailsWithId | Details of the offer for the channel
apiInstance.updateOffer(contentLanguage, offerId, contentType, ebayOfferDetailsWithId, (error, data, response) => {
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
 **contentLanguage** | **String**| This header sets the natural language that will be used in the field values of the request payload. For example, the value passed in this header should be &lt;code&gt;en-US&lt;/code&gt; for English or &lt;code&gt;de-DE&lt;/code&gt; for German.&lt;br&gt;&lt;br&gt;For more information on the Content-Language header, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **offerId** | **String**| This path parameter specifies the unique identifier of the offer being updated.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot;&gt;getOffers&lt;/a&gt; method to retrieve offer IDs. | 
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **ebayOfferDetailsWithId** | [**EbayOfferDetailsWithId**](EbayOfferDetailsWithId.md)| Details of the offer for the channel | 

### Return type

[**OfferResponse**](OfferResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## withdrawOffer

> WithdrawResponse withdrawOffer(offerId)



This call is used to end a single-variation listing that is associated with the specified offer. This call is used in place of the &lt;strong&gt;deleteOffer&lt;/strong&gt; call if the seller only wants to end the listing associated with the offer but does not want to delete the offer object. With this call, the offer object remains, but it goes into the unpublished state, and will require a &lt;strong&gt;publishOffer&lt;/strong&gt; call to relist the offer.&lt;br&gt;&lt;br&gt;To end a multiple-variation listing that is associated with an inventory item group, the &lt;strong&gt;withdrawOfferByInventoryItemGroup&lt;/strong&gt; method can be used. This call only ends the multiple-variation listing associated with an inventory item group but does not delete the inventory item group object, nor does it delete any of the offers associated with the inventory item group, but instead all of these offers go into the unpublished state.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let offerId = "offerId_example"; // String | This path parameter specifies the unique identifier of the offer that is to be withdrawn.<br><br>Use the <a href=\"/api-docs/sell/inventory/resources/offer/methods/getOffers\">getOffers</a> method to retrieve offer IDs.
apiInstance.withdrawOffer(offerId, (error, data, response) => {
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
 **offerId** | **String**| This path parameter specifies the unique identifier of the offer that is to be withdrawn.&lt;br&gt;&lt;br&gt;Use the &lt;a href&#x3D;\&quot;/api-docs/sell/inventory/resources/offer/methods/getOffers\&quot;&gt;getOffers&lt;/a&gt; method to retrieve offer IDs. | 

### Return type

[**WithdrawResponse**](WithdrawResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## withdrawOfferByInventoryItemGroup

> withdrawOfferByInventoryItemGroup(contentType, withdrawByInventoryItemGroupRequest)



This call is used to end a multiple-variation eBay listing that is associated with the specified inventory item group. This call only ends multiple-variation eBay listing associated with the inventory item group but does not delete the inventory item group object. Similarly, this call also does not delete any of the offers associated with the inventory item group, but instead all of these offers go into the unpublished state. If the seller wanted to relist the multiple-variation eBay listing, they could use the &lt;strong&gt;publishOfferByInventoryItemGroup&lt;/strong&gt; method.

### Example

```javascript
import SellInventoryV1 from 'sellInventoryV1';
let defaultClient = SellInventoryV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new SellInventoryV1.OfferApi();
let contentType = "contentType_example"; // String | This header indicates the format of the request body provided by the client. Its value should be set to <b>application/json</b>. <br><br>For more information, refer to <a href=\"/api-docs/static/rest-request-components.html#HTTP\" target=\"_blank \">HTTP request headers</a>.
let withdrawByInventoryItemGroupRequest = new SellInventoryV1.WithdrawByInventoryItemGroupRequest(); // WithdrawByInventoryItemGroupRequest | The base request of the <strong>withdrawOfferByInventoryItemGroup</strong> call.
apiInstance.withdrawOfferByInventoryItemGroup(contentType, withdrawByInventoryItemGroupRequest, (error, data, response) => {
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
 **contentType** | **String**| This header indicates the format of the request body provided by the client. Its value should be set to &lt;b&gt;application/json&lt;/b&gt;. &lt;br&gt;&lt;br&gt;For more information, refer to &lt;a href&#x3D;\&quot;/api-docs/static/rest-request-components.html#HTTP\&quot; target&#x3D;\&quot;_blank \&quot;&gt;HTTP request headers&lt;/a&gt;. | 
 **withdrawByInventoryItemGroupRequest** | [**WithdrawByInventoryItemGroupRequest**](WithdrawByInventoryItemGroupRequest.md)| The base request of the &lt;strong&gt;withdrawOfferByInventoryItemGroup&lt;/strong&gt; call. | 

### Return type

null (empty response body)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

