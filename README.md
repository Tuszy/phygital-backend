# Phygital Backend

Backend is used by the [Phygital App](https://github.com/Tuszy/phygital-app) to create, mint, transfer and verify ownership of phygitals in a user-friendly way by utilizing an app specific key manager controller. This way the user does not have to sign every transaction manually on the browser. But before the backend can execute the transactions for the requesting universal profile, the necessary permissions must be set through the [Frontend](https://github.com/Tuszy/phygital-frontend). 
Furthermore the [Frontend](https://github.com/Tuszy/phygital-frontend) must login the Universal Profile with [**Log-In With UP**](https://docs.lukso.tech/learn/dapp-developer/siwe/) to retrieve a [JWT](https://jwt.io/) (valid for 24 hours) to send authenticated universal profile bound requests to the backend.

# Deployment
1. Testnet: https://phygital-backend.tuszy.com

# Controller

**0xAc11803507C05A21daAF9D354F7100B1dC9CD590**

# Endpoints

## /api/mint
#### HTTP POST REQUEST
```javascript
{ 
    "universal_profile_address": string,
    "phygital_asset_contract_address": string,
    "phygital_address": string,
    "phygital_signature": string,
}
```
#### HTTP RESPONSE
##### Success
###### HTTP STATUS CODE 200 - Content-Type: application/json
```javascript
{
   <transaction receipt>
}
```
##### Fail 
###### HTTP STATUS CODE 400 - Content-Type: application/json
```javascript
{ 
    "error": string | array
}
```
##### Unauthenticated / Session expired 
###### HTTP STATUS CODE 401 - Content-Type: application/json
```javascript
{ 
    "error": "Authentication session expired"
}
```

---
## /api/transfer
#### HTTP POST REQUEST
```javascript
{ 
    "universal_profile_address": string,
    "to_universal_profile_address": string,
    "phygital_asset_contract_address": string,
    "phygital_address": string,
    "phygital_signature": string
}
```
#### HTTP RESPONSE
##### Success
###### HTTP STATUS CODE 200 - Content-Type: application/json
```javascript
{
   <transaction receipt>
}
```
##### Fail 
###### HTTP STATUS CODE 400 - Content-Type: application/json
```javascript
{ 
    "error": string | array
}
```
##### Unauthenticated / Session expired 
###### HTTP STATUS CODE 401 - Content-Type: application/json
```javascript
{ 
    "error": "Authentication session expired"
}
```

---
## /api/verify-ownership-after-transfer
#### HTTP POST REQUEST
```javascript
{ 
    "universal_profile_address": string,
    "phygital_asset_contract_address": string,
    "phygital_address": string,
    "phygital_signature": string,
}
```
#### HTTP RESPONSE
##### Success
###### HTTP STATUS CODE 200 - Content-Type: application/json
```javascript
{
   <transaction receipt>
}
```
##### Fail 
###### HTTP STATUS CODE 400 - Content-Type: application/json
```javascript
{ 
    "error": string | array
}
```
##### Unauthenticated / Session expired 
###### HTTP STATUS CODE 401 - Content-Type: application/json
```javascript
{ 
    "error": "Authentication session expired"
}
```

---
## /api/create
#### HTTP POST REQUEST
```javascript
{ 
    "universal_profile_address": string,
    "name": string,
    "symbol": string,
    "phygital_collection": string[],
    "metadata": LSP2JSONURL,
    "base_uri": string
}
```
#### HTTP RESPONSE
##### Success
###### HTTP STATUS CODE 200 - Content-Type: application/json
```javascript
{ 
    "contractAddress": string
}
```
##### Fail 
###### HTTP STATUS CODE 400 - Content-Type: application/json
```javascript
{ 
    "error": string | array
}
```
##### Unauthenticated / Session expired 
###### HTTP STATUS CODE 401 - Content-Type: application/json
```javascript
{ 
    "error": "Authentication session expired"
}
```





---
## /api/login
#### HTTP POST REQUEST
```javascript
{ 
    "universal_profile_address": string,
    "signature": string,
    "hash": string
}
```
#### HTTP RESPONSE
##### Success
###### HTTP STATUS CODE 200 - Content-Type: application/json
```javascript
{
   "token": string
}
```
##### Fail 
###### HTTP STATUS CODE 400 - Content-Type: application/json
```javascript
{ 
    "error": string | array
}
```
---
## /api/verify-token
#### HTTP POST REQUEST
```javascript
{ 
    "universal_profile_address": string
}
```
#### HTTP RESPONSE
##### Success
###### HTTP STATUS CODE 200 - Content-Type: application/json
```javascript
{
   "message": "success"
}
```
##### Fail 
###### HTTP STATUS CODE 400 - Content-Type: application/json
```javascript
{ 
    "error": string | array
}
```
##### Unauthenticated / Session expired 
###### HTTP STATUS CODE 401 - Content-Type: application/json
```javascript
{ 
    "error": "Authentication session expired"
}
```