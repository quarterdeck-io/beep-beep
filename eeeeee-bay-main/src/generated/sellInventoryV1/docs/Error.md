# SellInventoryV1.Error

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**category** | **String** | This string value indicates the error category. There are three categories of errors: request errors, application errors, and system errors.  | [optional] 
**domain** | **String** | The name of the domain in which the error or warning occurred. | [optional] 
**errorId** | **Number** | A unique code that identifies the particular error or warning that occurred. Your application can use error codes as identifiers in your customized error-handling algorithms. | [optional] 
**inputRefIds** | **[String]** | An array of one or more reference IDs which identify the specific request element(s) most closely associated to the error or warning, if any. | [optional] 
**longMessage** | **String** | A detailed description of the condition that caused the error or warning, and information on what to do to correct the problem. | [optional] 
**message** | **String** | A description of the condition that caused the error or warning. | [optional] 
**outputRefIds** | **[String]** | An array of one or more reference IDs which identify the specific response element(s) most closely associated to the error or warning, if any. | [optional] 
**parameters** | [**[ErrorParameter]**](ErrorParameter.md) | Various warning and error messages return one or more variables that contain contextual information about the error or waring. This is often the field or value that triggered the error or warning. | [optional] 
**subdomain** | **String** | The name of the subdomain in which the error or warning occurred. | [optional] 


