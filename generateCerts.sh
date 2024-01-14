#!/bin/bash

echo "creating certs directories under $HOME"

ROOT=$HOME/solt/certs

ETCD0=$ROOT/etcd/etcd0
ETCD1=$ROOT/etcd/etcd1
ETCD2=$ROOT/etcd/etcd2
HAPROXY=$ROOT/haproxy

mkdir -p $ETCD0
mkdir -p $ETCD1
mkdir -p $ETCD2
mkdir -p $HAPROXY

echo "generating root ca cert"
openssl genrsa -out $ROOT/ca.key 2048
openssl req -x509 -new -nodes -key $ROOT/ca.key -sha256 -days 1024 -out $ROOT/ca.crt

echo "generating etcd0 certs"
openssl genrsa -out $ETCD0/server.key 2048
openssl req -new -key $ETCD0/server.key -out $ETCD0/server.csr
openssl x509 -req -in $ETCD0/server.csr -CA $ROOT/ca.crt -CAkey $ROOT/ca.key -CAcreateserial -out $ETCD0/server.crt -days 365 -sha256

echo "generating etcd1 certs"
openssl genrsa -out $ETCD1/server.key 2048
openssl req -new -key $ETCD1/server.key -out $ETCD1/server.csr
openssl x509 -req -in $ETCD1/server.csr -CA $ROOT/ca.crt -CAkey $ROOT/ca.key -CAcreateserial -out $ETCD1/server.crt -days 365 -sha256

echo "generating etcd2 certs"
openssl genrsa -out $ETCD2/server.key 2048
openssl req -new -key $ETCD2/server.key -out $ETCD2/server.csr
openssl x509 -req -in $ETCD2/server.csr -CA $ROOT/ca.crt -CAkey $ROOT/ca.key -CAcreateserial -out $ETCD2/server.crt -days 365 -sha256

echo "generating haproxy certs"
openssl genrsa -out $HAPROXY/$HOSTNAME.key 2048
openssl req -new -key $HAPROXY/$HOSTNAME.key -out $HAPROXY/$HOSTNAME.csr
openssl x509 -req -in $HAPROXY/$HOSTNAME.csr -CA $ROOT/ca.crt -CAkey $ROOT/ca.key -CAcreateserial -out $HAPROXY/$HOSTNAME.crt -days 365 -sha256
cat $HAPROXY/$HOSTNAME.key $HAPROXY/$HOSTNAME.crt > $HAPROXY/$HOSTNAME.pem