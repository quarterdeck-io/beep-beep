# BuyMarketingV1.MerchandisedProductApi

All URIs are relative to *https://api.ebay.com/buy/marketing/v1_beta*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getMerchandisedProducts**](MerchandisedProductApi.md#getMerchandisedProducts) | **GET** /merchandised_product | 



## getMerchandisedProducts

> BestSellingProductResponse getMerchandisedProducts(categoryId, metricName, opts)



This method returns an array of products based on the category and metric specified. This includes details of the product, such as the eBay product ID (EPID), title, and user reviews and ratings for the product. You can use the &lt;code&gt;epid&lt;/code&gt; returned by this method in the Browse API &lt;b&gt;search&lt;/b&gt; method to retrieve items for this product. &lt;h3&gt;&lt;b&gt;Restrictions &lt;/b&gt;&lt;/h3&gt; &lt;ul&gt;&lt;li&gt;To test &lt;b&gt; getMerchandisedProducts&lt;/b&gt; in Sandbox, you must use category ID 9355 and the response will be mock data.  &lt;/li&gt;   &lt;li&gt;For a list of supported sites and other restrictions, see &lt;a href&#x3D;\&quot;/api-docs/buy/marketing/overview.html#API\&quot;&gt;API Restrictions&lt;/a&gt;.&lt;/li&gt;  &lt;/ul&gt;

### Example

```javascript
import BuyMarketingV1 from 'buyMarketingV1';
let defaultClient = BuyMarketingV1.ApiClient.instance;
// Configure OAuth2 access token for authorization: api_auth
let api_auth = defaultClient.authentications['api_auth'];
api_auth.accessToken = 'YOUR ACCESS TOKEN';

let apiInstance = new BuyMarketingV1.MerchandisedProductApi();
let categoryId = "categoryId_example"; // String | This query parameter limits the products returned to a specific eBay category.  <br /> <br />The list of eBay category IDs is not published and category IDs are not all the same across all the eBay maketplace. You can use the following techniques to find a category by site: <ul> <li>Use the <a href=\"https://pages.ebay.com/sellerinformation/news/categorychanges.html\" target=\"_blank\">Category Changes page</a>.</li> <li>Use the Taxonomy API. For details see <a href=\"/api-docs/buy/buy-categories.html\">Get Categories for Buy APIs</a>. </li>  <li>Use the Browse API and submit the following method to get the <b> dominantCategoryId</b> for an item. <br /><code>/buy/browse/v1/item_summary/search?q=<em>keyword</em>&fieldgroups=ASPECT_REFINEMENTS  </code></li></ul> <br><b> Maximum: </b> 1 <br /><br><b> Required: </b> 1 
let metricName = "metricName_example"; // String | This value filters the result set by the specified metric. Only products in this metric are returned.<br><br><span class=\"tablenote\"><b>Note:</b> Currently, the only metric supported is <code> BEST_SELLING</code>.</span><br /><b> Default: </b>BEST_SELLING <br /><br> <b> Maximum: </b> 1 <br /><br> <b> Required: </b> 1
let opts = {
  'aspectFilter': "aspectFilter_example", // String | This value specifies the aspect name/value pairs used to further refine product results. <br /><br /> For example: <br />&nbsp;&nbsp;&nbsp;<code>/buy/marketing/v1_beta/merchandised_product?category_id=31388&metric_name=BEST_SELLING&aspect_filter=Brand:Canon</code>  <br /><br />You can use the Browse API <a href=\"/api-docs/buy/browse/resources/item_summary/methods/search\" target=\"_blank\">search</a> method with the <code>fieldgroups=ASPECT_REFINEMENTS</code> field to return the aspects of a product. For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/buy/marketing/types/gct:MarketingAspectFilter
  'limit': "limit_example" // String | This value specifies the maximum number of products to return in a result set. <br /> <br /><span class=\"tablenote\"> <b>Note:</b> Maximum value means the method will return up <em>to</em> that many products per set, but it can be less than this value. If the number of products found is less than this value, the method will return all of the products matching the criteria.</span> <br /><b> Default:</b> 8<br /><br><b> Maximum: </b>100
};
apiInstance.getMerchandisedProducts(categoryId, metricName, opts, (error, data, response) => {
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
 **categoryId** | **String**| This query parameter limits the products returned to a specific eBay category.  &lt;br /&gt; &lt;br /&gt;The list of eBay category IDs is not published and category IDs are not all the same across all the eBay maketplace. You can use the following techniques to find a category by site: &lt;ul&gt; &lt;li&gt;Use the &lt;a href&#x3D;\&quot;https://pages.ebay.com/sellerinformation/news/categorychanges.html\&quot; target&#x3D;\&quot;_blank\&quot;&gt;Category Changes page&lt;/a&gt;.&lt;/li&gt; &lt;li&gt;Use the Taxonomy API. For details see &lt;a href&#x3D;\&quot;/api-docs/buy/buy-categories.html\&quot;&gt;Get Categories for Buy APIs&lt;/a&gt;. &lt;/li&gt;  &lt;li&gt;Use the Browse API and submit the following method to get the &lt;b&gt; dominantCategoryId&lt;/b&gt; for an item. &lt;br /&gt;&lt;code&gt;/buy/browse/v1/item_summary/search?q&#x3D;&lt;em&gt;keyword&lt;/em&gt;&amp;fieldgroups&#x3D;ASPECT_REFINEMENTS  &lt;/code&gt;&lt;/li&gt;&lt;/ul&gt; &lt;br&gt;&lt;b&gt; Maximum: &lt;/b&gt; 1 &lt;br /&gt;&lt;br&gt;&lt;b&gt; Required: &lt;/b&gt; 1  | 
 **metricName** | **String**| This value filters the result set by the specified metric. Only products in this metric are returned.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; Currently, the only metric supported is &lt;code&gt; BEST_SELLING&lt;/code&gt;.&lt;/span&gt;&lt;br /&gt;&lt;b&gt; Default: &lt;/b&gt;BEST_SELLING &lt;br /&gt;&lt;br&gt; &lt;b&gt; Maximum: &lt;/b&gt; 1 &lt;br /&gt;&lt;br&gt; &lt;b&gt; Required: &lt;/b&gt; 1 | 
 **aspectFilter** | **String**| This value specifies the aspect name/value pairs used to further refine product results. &lt;br /&gt;&lt;br /&gt; For example: &lt;br /&gt;&amp;nbsp;&amp;nbsp;&amp;nbsp;&lt;code&gt;/buy/marketing/v1_beta/merchandised_product?category_id&#x3D;31388&amp;metric_name&#x3D;BEST_SELLING&amp;aspect_filter&#x3D;Brand:Canon&lt;/code&gt;  &lt;br /&gt;&lt;br /&gt;You can use the Browse API &lt;a href&#x3D;\&quot;/api-docs/buy/browse/resources/item_summary/methods/search\&quot; target&#x3D;\&quot;_blank\&quot;&gt;search&lt;/a&gt; method with the &lt;code&gt;fieldgroups&#x3D;ASPECT_REFINEMENTS&lt;/code&gt; field to return the aspects of a product. For implementation help, refer to eBay API documentation at https://developer.ebay.com/api-docs/buy/marketing/types/gct:MarketingAspectFilter | [optional] 
 **limit** | **String**| This value specifies the maximum number of products to return in a result set. &lt;br /&gt; &lt;br /&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt; &lt;b&gt;Note:&lt;/b&gt; Maximum value means the method will return up &lt;em&gt;to&lt;/em&gt; that many products per set, but it can be less than this value. If the number of products found is less than this value, the method will return all of the products matching the criteria.&lt;/span&gt; &lt;br /&gt;&lt;b&gt; Default:&lt;/b&gt; 8&lt;br /&gt;&lt;br&gt;&lt;b&gt; Maximum: &lt;/b&gt;100 | [optional] 

### Return type

[**BestSellingProductResponse**](BestSellingProductResponse.md)

### Authorization

[api_auth](../README.md#api_auth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

