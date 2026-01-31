# 🚀 iApp Deployment Guide

You have successfully imported the wallet! 
Address: `0x9b1ad9199E1a97aC35d5e3F4CB0Fca8f9062D247`
Wallet Password: `deinherit123`

## Step 1: Build & Push Docker Image

Since I cannot access your Docker Hub credentials, you need to run these commands in your terminal:

```bash
cd iapp

# 1. Login to Docker Hub
docker login

# 2. Build the image (replace 'your-username' with your Docker Hub username)
docker build -t your-username/de-inherit-reaper:1.0.0 .

# 3. Push the image
docker push your-username/de-inherit-reaper:1.0.0
```

## Step 2: Update Configuration

1. Open `iapp/iexec.json`
2. Replace `docker.io/replace-me-user/de-inherit-reaper:1.0.0` with your actual image name (e.g., `docker.io/sanatan/de-inherit-reaper:1.0.0`).

## Step 3: Deploy to iExec

Run this command to deploy the app to Arbitrum Sepolia:

```bash
# Deploy app
npx iexec app deploy --chain arbitrum-sepolia --wallet-password deinherit123
```

## Step 4: Update Frontend

After deployment, you'll see an output like:
`Deployed app at address 0x123...`

1. Copy that address.
2. Open `.env.local` in the root directory.
3. Update `NEXT_PUBLIC_IAPP_ADDRESS` with the new address.
