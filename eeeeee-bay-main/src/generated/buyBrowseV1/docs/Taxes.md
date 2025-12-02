# BuyBrowseV1.Taxes

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ebayCollectAndRemitTax** | **Boolean** | This field is only returned if &lt;code&gt;true&lt;/code&gt;, and indicates that eBay will collect tax (sales tax, Goods and Services tax, or VAT) for at least one line item in the order, and remit the tax to the taxing authority of the buyer&#39;s residence.  | [optional] 
**includedInPrice** | **Boolean** | This indicates if tax was applied for the cost of the item. | [optional] 
**shippingAndHandlingTaxed** | **Boolean** | This indicates if tax is applied for the shipping cost. | [optional] 
**taxJurisdiction** | [**TaxJurisdiction**](TaxJurisdiction.md) |  | [optional] 
**taxPercentage** | **String** | The percentage of tax. | [optional] 
**taxType** | **String** | This field indicates the type of tax that may be collected for the item. For implementation help, refer to &lt;a href&#x3D;&#39;https://developer.ebay.com/api-docs/buy/browse/types/gct:TaxType&#39;&gt;eBay API documentation&lt;/a&gt; | [optional] 


