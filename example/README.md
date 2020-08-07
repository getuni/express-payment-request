## Enabling HTTPS

You can create an SSL certificate for your localhost [**here**](https://github.com/fraigo/https-localhost-ssl-certificate).

Add the **merchant_id** certificate to `./certs`:

Generate a new CSR, make sure we can grab all the dependencies (ca, crt, key), only then push to server?


Upload a CSR to Apple:
  CertificateSigningRequest.certSigningRequest
    (Apple Pay ECC 256 (Private).p12)
    (Apple Pay ECC 256 (Public).pem)

Apple Returns:
  (payment_processing_certificate.cer)

Providing a CSR  gives you the signed certificate from the CA!


Convert payment_processing_certificate.cer to payment_processing_certificate.crt:

```
openssl x509 -inform DER -in payment_processing_certificate.cer -out payment_processing_certificate.crt
```

Convert  Apple Pay ECC 256 (Private).p12 to .crt (Remember export password from KeyChain!):

```
openssl pkcs12 -in Apple\ Pay\ ECC\ 256\ \(Private\).p12 -nodes -out private.key -nocerts
```

How it works:
https://webkit.org/blog/8182/introducing-the-payment-request-api-for-apple-pay/


Apple's Merchant Identity (required for web)

```
openssl x509 -inform der -in merchant_id.cer -out merchant_id.pem
```

The address has certificate of SHA 256 (RSA) Public Key 256 Bytes


```
https://stackoverflow.com/questions/15144046/converting-pkcs12-certificate-into-pem-using-openssl

https://stackoverflow.com/questions/15144046/converting-pkcs12-certificate-into-pem-using-openssl (generate .pem completely unlocked)
```

without private key (?) unencrypted

openssl pkcs12 -in path.p12 -out newfile.pem -nodes


https://gist.github.com/jagdeepsingh/c538e21f3839f65732a5932e35809d60


Convert p12 to a .key

https://stackoverflow.com/questions/16075846/how-to-change-a-p12-file-to-key-file
openssl pkcs12 -in out.p12 -nodes -out private.key -nocerts


generate an new .cert using the key

openssl req -new -x509 -nodes -sha256 -days 365 -key host.key -out host.cert

