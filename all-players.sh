#!/bin/bash
curl \
 -X POST \
 -H "Content-Type: application-json" \
 --data '{ "query": "{ players(first: 1000) { id balance } }" }' \
https://api.thegraph.com/subgraphs/name/asselstine/pooltogether
