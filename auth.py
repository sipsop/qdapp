import jwt
import time
import base64

client_secret = 'jXtBkWhMD-UEk16iXeS1jLwEw9fCBrPXFasX0EKHSZIhmt-JxeRdyw3ipvxz9I6V'
client_id = 'phA8QFWKknNtcDwVefccBf82sIp4bw6c'

secret = base64.b64decode(client_secret.replace("_","/").replace("-","+"))

def validate_token(user_id, token):
    try:
        payload = jwt.decode(token, secret, audience=client_id)
    except (jwt.ExpiredSignature, jwt.InvalidAudienceError, jwt.DecodeError):
        raise ValueError("Invalid credentials, please try again")

    # Example response:
    #    { 'iat': 1474629433
    #    , 'azp': 'phA8QFWKknNtcDwVefccBf82sIp4bw6c'
    #    , 'exp': 1474665433
    #    , 'iss': 'https://tuppu.eu.auth0.com/'
    #    , 'sub': 'email|57c2d977469d42056d3f7376'
    #    , 'aud': 'phA8QFWKknNtcDwVefccBf82sIp4bw6c'
    #    }

    if time.time() > payload['exp']:
        raise ValueError("Invalid credentials, please try again")
