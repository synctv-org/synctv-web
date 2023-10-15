#!/bin/bash
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_opt=env=browser,esModuleInterop=true,useOptionals=none --ts_proto_out=. ./src/proto/*.proto