# SellAccountV1.CustomPolicy

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**customPolicyId** | **String** | The unique custom policy identifier for a policy. | [optional] 
**description** | **String** | Contains the seller&#39;s policy and policy terms. Buyers access this information from the View Item page for items to which the policy has been applied.&lt;br&gt;&lt;br&gt;&lt;b&gt;Max length:&lt;/b&gt; 15,000 | [optional] 
**label** | **String** | Customer-facing label shown on View Item pages for items to which the policy applies. This seller-defined string is displayed as a system-generated hyperlink pointing to the seller&#39;s policy information.&lt;br&gt;&lt;br&gt;&lt;b&gt;Max length:&lt;/b&gt; 65 | [optional] 
**name** | **String** | The seller-defined name for the custom policy. Names must be unique for policies assigned to the same seller and policy type.&lt;br&gt;&lt;br&gt;&lt;span class&#x3D;\&quot;tablenote\&quot;&gt;&lt;strong&gt;Note:&lt;/strong&gt; This field is visible only to the seller. &lt;/span&gt;&lt;br&gt;&lt;b&gt;Max length:&lt;/b&gt; 65 | [optional] 
**policyType** | **String** | Specifies the type of Custom Policy being returned. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/sell/account/types/api:CustomPolicyTypeEnum&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 


