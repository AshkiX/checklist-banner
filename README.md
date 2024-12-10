# Checklist-Banner

## Overview

Checklist-Banner is a dynamic social media header generator that allows users to update their profile headers using Google Sheets, with support for X and Bluesky platforms. Powered by Cloudflare Workers for serverless, global edge computing.

## Features

- Dynamic header generation from Google Sheets
- Support for X and Bluesky platforms
- Serverless deployment with Cloudflare Workers
- Customizable text overlay and background
- Markdown support for checklist formatting
- Global edge computing
- Background image management with Cloudflare KV

## Prerequisites

- Node.js (v16+)
- npm
- Cloudflare account
- Wrangler CLI
- Google Sheets API access
- X and Bluesky API credentials

## Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/checklist-banner.git
cd checklist-banner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Cloudflare Workers

1. Install Wrangler CLI globally:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Create KV Namespace and Configure
```bash
npm run setup
```
This script will:
- Check for existing KV namespaces
- Create a new namespace if needed
- Provide the namespace ID for `wrangler.toml`

### 4. Upload Background Images

Upload background images to Cloudflare KV:
```bash
npm run upload:backgrounds
```

This script will:
- Scan the `backgrounds/` directory
- Upload all image files to the KV namespace
- Support formats: .png, .jpg, .jpeg, .gif, .webp

### 5. Set Environment Variables

Set the following environment variables:
- `X_HANDLE`: Your X username
- `X_APP_PASSWORD`: Your X API password
- `BSKY_HANDLE`: Your Bluesky username
- `BSKY_APP_PASSWORD`: Your Bluesky API password
- `DEFAULT_BACKGROUND`: Default background image key

## Background Image Management

### Uploading Images

- Place background images in the `backgrounds/` directory
- Run `npm run upload:backgrounds` to upload to Cloudflare KV
- Specify a background by its filename (without extension) when making a request

### Request Example

```json
{
  "platform": "x",
  "backgroundKey": "custom-banner", // Optional, defaults to DEFAULT_BACKGROUND
  "checklistData": {
    "header": "Weekly Goals",
    "items": [
      {"text": "Complete milestone", "isChecked": true}
    ]
  }
}
```

## Development and Deployment

### Local Development

```bash
npm run start  # Starts local Cloudflare Worker development server
```

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

### Run Tests

```bash
npm test
```

### Generate Coverage Report

```bash
npm run test:coverage
```

## API Endpoint

The Cloudflare Worker provides a single endpoint that accepts POST requests:

```json
{
  "action": "preview" | "publish",
  "platform": "x" | "bluesky",
  "checklistData": {
    "header": "Weekly Goals",
    "items": [
      {"text": "Complete milestone", "isChecked": true}
    ]
  }
}
```

### Response

```json
{
  "success": true/false,
  "message": "Publication status message"
}
```

## Customization

Edit `wrangler.toml` to customize:
- Worker name
- Deployment route
- Environment-specific configurations

## License

This project is licensed under the MIT License.
