# BuyBrowseV1.SearchPagedCollection

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**autoCorrections** | [**AutoCorrections**](AutoCorrections.md) |  | [optional] 
**href** | **String** | The URI of the current page of results.&lt;br&gt;&lt;br&gt;The following example of the &lt;b&gt;search&lt;/b&gt; method returns items 1 thru 5 from the list of items found.&lt;pre&gt;https://api.ebay.com/buy/v1/item_summary/search?q&#x3D;shirt&amp;limit&#x3D;5&amp;offset&#x3D;0&lt;/pre&gt; | [optional] 
**itemSummaries** | [**[ItemSummary]**](ItemSummary.md) | An array of the items on this page. The items are sorted according to the sorting method specified in the request. | [optional] 
**limit** | **Number** | The value of the &lt;code&gt;limit&lt;/code&gt; parameter submitted in the request, which is the maximum number of items to return on a page, from the result set. A result set is the complete set of items returned by the method. | [optional] 
**next** | **String** | The URI for the next page of results. This value is returned if there is an additional page of results to return from the result set.&lt;br&gt;&lt;br&gt;The following example of the &lt;b&gt;search&lt;/b&gt; method returns items 5 thru 10 from the list of items found.&lt;pre&gt;https://api.ebay.com/buy/v1/item_summary/search?query&#x3D;t-shirts&amp;limit&#x3D;5&amp;offset&#x3D;10&lt;/pre&gt; | [optional] 
**offset** | **Number** | This value indicates the &lt;code&gt;offset&lt;/code&gt; used for current page of items being returned. Assume the initial request used an &lt;code&gt;offset&lt;/code&gt; of &lt;code&gt;0&lt;/code&gt; and a &lt;code&gt;limit&lt;/code&gt; of &lt;code&gt;3&lt;/code&gt;. Then in the first page of results, this value would be &lt;code&gt;0&lt;/code&gt;, and items 1-3 are returned. For the second page, this value is &lt;code&gt;3&lt;/code&gt; and so on. | [optional] 
**prev** | **String** | The URI for the previous page of results. This is returned if there is a previous page of results from the result set.&lt;br&gt;&lt;br&gt;The following example of the &lt;b&gt;search&lt;/b&gt; method returns items 1 thru 5 from the list of items found, which would be the first set of items returned.&lt;pre&gt;https://api.ebay.com/buy/v1/item_summary/search?query&#x3D;t-shirts&amp;limit&#x3D;5&amp;offset&#x3D;0&lt;/pre&gt; | [optional] 
**refinement** | [**Refinement**](Refinement.md) |  | [optional] 
**total** | **Number** | The total number of items that match the input criteria.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; &lt;code&gt;total&lt;/code&gt; is just an indicator of the number of listings for a given query. It could vary based on the number of listings with variations included in the result. It is strongly recommended that &lt;code&gt;total&lt;/code&gt; not be used in pagination use cases. Instead, use &lt;a href&#x3D;\&quot;/api-docs/buy/browse/resources/item_summary/methods/search#response.next \&quot;&gt;next&lt;/a&gt; to determine the results on the next page.&lt;/span&gt; | [optional] 
**warnings** | [**[Error]**](Error.md) | The container with all the warnings for the request. | [optional] 


