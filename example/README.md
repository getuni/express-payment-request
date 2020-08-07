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

