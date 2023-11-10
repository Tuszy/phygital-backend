# Phygital Backend

Backend is used by the [Phygital App](https://github.com/Tuszy/phygital-app) to create, mint, transfer and verify ownership of phygitals in a user-friendly way by utilizing an app specific key manager controller. This way the user does not have to sign every transaction manually on the browser. But before the backend can execute the transactions for the requesting universal profile, the necessary permissions must be set through the [Frontend](https://github.com/Tuszy/phygital-frontend)

# Controller

**0xAc11803507C05A21daAF9D354F7100B1dC9CD590**

# Endpoints

## /api/mint
#### HTTP POST REQUEST
```javascript
{ 
    "universal_profile_address": string,
    "phygital_asset_contract_address": string,
    "phygital_id": string,
    "phygital_signature": string,
}
```
#### HTTP RESPONSE
##### Success
HTTP STATUS CODE 200 <br>
Content-Type: application/json
```javascript
{ 
    "transactionHash": string
}
```
##### Fail 
HTTP STATUS CODE 400 <br>
Content-Type: application/json
```javascript
{ 
    "error": string | array
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
    "phygital_id": string,
    "phygital_signature": string
}
```
#### HTTP RESPONSE
##### Success
HTTP STATUS CODE 200 <br>
Content-Type: application/json
```javascript
{ 
    "transactionHash": string
}
```
##### Fail 
HTTP STATUS CODE 400 <br>
Content-Type: application/json
```javascript
{ 
    "error": string | array
}
```

---
## /api/verify-ownership-after-transfer
#### HTTP POST REQUEST
```javascript
{ 
    "universal_profile_address": string,
    "phygital_asset_contract_address": string,
    "phygital_id": string,
    "phygital_signature": string,
}
```
#### HTTP RESPONSE
##### Success
HTTP STATUS CODE 200 <br>
Content-Type: application/json
```javascript
{ 
    "transactionHash": string
}
```
##### Fail 
HTTP STATUS CODE 400 <br>
Content-Type: application/json
```javascript
{ 
    "error": string | array
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
    "metadata": LSP2JSONURL
}
```
#### HTTP RESPONSE
##### Success
HTTP STATUS CODE 200 <br>
Content-Type: application/json
```javascript
{ 
    "transactionHash": string
}
```
##### Fail 
HTTP STATUS CODE 400 <br>
Content-Type: application/json
```javascript
{ 
    "error": string | array
}
```