#!/bin/bash

echo "creating images for docker build stage"
docker build -t buildapi -f Dockerfile.buildapi .