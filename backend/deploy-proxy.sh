#!/bin/bash

# Script to prepare and deploy the CORS proxy

# Copy the proxy-specific package.json to the main package.json
cp package-proxy.json package.json

# Install dependencies
npm install

# Start the proxy server
node render-cors-proxy.js
