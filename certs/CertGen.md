# Cert Gen

```bash
openssl req -newkey rsa:2048 -new -x509 -days 365 -nodes -out $HOSTNAME.crt -keyout $HOSTNAME.key
cat $HOSTNAME.key $HOSTNAME.crt > $HOSTNAME.pem
```