# SellAccountV1.CustomPolicyRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**description** | **String** | Contains the seller specified policy and policy terms.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Always supply this field. If this field is not specified, any previous value is removed. Call the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicy\&quot;&gt;getCustomPolicy&lt;/a&gt; method to return the present field value for this policy.&lt;/span&gt;&lt;br&gt;&lt;b&gt;Max length:&lt;/b&gt; 15,000 | [optional] 
**label** | **String** | Customer-facing label shown on View Item pages for items to which the policy applies. This seller-defined string is displayed as a system-generated hyperlink pointing to seller specified policy information.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Always supply this field. If this field is not specified, any previous value is removed. Call the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicy\&quot;&gt;getCustomPolicy&lt;/a&gt; method to return the present field value for this policy.&lt;/span&gt;&lt;br&gt;&lt;b&gt;Max length:&lt;/b&gt; 65 | [optional] 
**name** | **String** | The seller-defined name for the custom policy. Names must be unique for policies assigned to the same seller and policy type.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; This field is visible only to the seller. &lt;/span&gt;&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; Always supply this field. If this field is not specified, any previous value is removed. Call the &lt;a href&#x3D;\&quot;/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicy\&quot;&gt;getCustomPolicy&lt;/a&gt; method to return the present field value for this policy.&lt;/span&gt;&lt;br&gt;&lt;b&gt;Max length:&lt;/b&gt; 65 | [optional] 


