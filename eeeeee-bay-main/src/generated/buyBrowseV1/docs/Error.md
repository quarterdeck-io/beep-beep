# BuyBrowseV1.Error

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**category** | **String** | This string value indicates the error category. There are three categories of errors: &lt;i&gt;request errors&lt;/i&gt;, &lt;i&gt;application errors&lt;/i&gt;, and &lt;i&gt;system errors&lt;/i&gt;. | [optional] 
**domain** | **String** | The name of the primary system where the error occurred. This is relevant for application errors. | [optional] 
**errorId** | **Number** | A unique code that identifies the particular error or warning that occurred. Your application can use error codes as identifiers in your customized error-handling algorithms. | [optional] 
**inputRefIds** | **[String]** | An array of reference IDs that identify the specific request elements most closely associated to the error or warning, if any. | [optional] 
**longMessage** | **String** | A detailed description of the condition that caused the error or warning, and information on what to do to correct the problem. | [optional] 
**message** | **String** | A description of the condition that caused the error or warning. | [optional] 
**outputRefIds** | **[String]** | An array of reference IDs that identify the specific response elements most closely associated to the error or warning, if any. | [optional] 
**parameters** | [**[ErrorParameter]**](ErrorParameter.md) | An array of warning and error messages that return one or more variables contextual information about the error or warning. This is often the field or value that triggered the error or warning. | [optional] 
**subdomain** | **String** | The name of the subdomain in which the error or warning occurred. | [optional] 


