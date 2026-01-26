#!/bin/bash

# Image Analysis URL Workflow
WORKFLOW_JSON='{
  "name": "Image Analysis URL Workflow",
  "nodes": [
    {
      "parameters": {
        "path": "image_analyze_url",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "'$(uuidgen)'",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "prompt": "Analyze this image URL and provide a detailed description: {{$json.imageUrl}}",
        "model": "gemini-3-flash-preview"
      },
      "id": "'$(uuidgen)'",
      "name": "Gemini AI",
      "type": "@czlonkowski/n8n-nodes-gemini@latest",
      "typeVersion": 1,
      "position": [460, 300],
      "credentials": {
        "googlePalmApi": "qJ3tJlGTxwiZCORz"
      }
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "response",
              "value": "={{ $json.output }}"
            }
          ]
        },
        "options": {}
      },
      "id": "'$(uuidgen)'",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [680, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Gemini AI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Gemini AI": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "meta": {
    "instanceId": "auto-generated"
  },
  "pinData": {},
  "versionId": "auto-generated"
}'

curl -X POST https://admin.orcadigital.online/rest/workflows \
  -H "X-N8N-API-KEY: $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  --data "$WORKFLOW_JSON"