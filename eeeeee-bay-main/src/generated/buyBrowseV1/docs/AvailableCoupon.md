# BuyBrowseV1.AvailableCoupon

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**constraint** | [**CouponConstraint**](CouponConstraint.md) |  | [optional] 
**discountAmount** | [**Amount**](Amount.md) |  | [optional] 
**discountType** | **String** | The type of discount that the coupon applies. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/buy/browse/types/gct:CouponDiscountType&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 
**message** | **String** | A description of the coupon.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; The value returned in the &lt;code&gt;termsWebUrl&lt;/code&gt; field should appear for all experiences when displaying coupons. The value in the &lt;code&gt;availableCoupons.message&lt;/code&gt; field must also be included if returned in the API response.&lt;/span&gt; | [optional] 
**redemptionCode** | **String** | The coupon code. | [optional] 
**termsWebUrl** | **String** | The URL to the coupon terms of use.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;b&gt;Note:&lt;/b&gt; The value returned in the &lt;code&gt;termsWebUrl&lt;/code&gt; field should appear for all experiences when displaying coupons. The value in the &lt;code&gt;availableCoupons.message&lt;/code&gt; field must also be included if returned in the API response.&lt;/span&gt; | [optional] 


