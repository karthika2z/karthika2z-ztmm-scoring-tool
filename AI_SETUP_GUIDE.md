# AI Interview Mode Setup Guide

This guide will help you configure the OpenAI API for the AI-powered interview mode feature.

## Prerequisites

- An OpenAI account (sign up at https://platform.openai.com)
- A valid payment method added to your OpenAI account (the API is not free)
- Node.js and the ZTMM Assessment Tool project running

---

## Step-by-Step Setup

### 1. Create an OpenAI Account

1. Go to https://platform.openai.com
2. Click "Sign Up" (or "Log In" if you have an account)
3. Complete the registration process
4. Verify your email address

### 2. Add Payment Method

⚠️ **Important:** The OpenAI API is a paid service. You need to add a payment method.

1. Go to https://platform.openai.com/account/billing
2. Click "Add payment method"
3. Enter your credit card information
4. Set up a spending limit (recommended: $10-20/month for testing)

**Cost Estimates:**
- Whisper (transcription): $0.006 per minute of audio
- GPT-4 (analysis): ~$0.03 per question
- **Full 20-question interview: approximately $1-2**

### 3. Generate API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a name (e.g., "ZTMM Assessment Tool")
4. Click "Create secret key"
5. **IMPORTANT:** Copy the key immediately! You won't be able to see it again.
   - It will look like: `sk-proj-...` or `sk-...`

### 4. Configure Your Project

#### Option A: Using .env File (Recommended)

1. In your project root directory, create a file named `.env`:
   ```bash
   touch .env
   ```

2. Open the `.env` file and add your API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

   Replace `sk-your-actual-api-key-here` with the key you copied from OpenAI.

3. Save the file

#### Option B: Using Terminal (Temporary - for testing)

```bash
export VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Note:** This only works for the current terminal session.

### 5. Restart the Development Server

The environment variables are loaded when the dev server starts, so you need to restart:

1. Stop the current dev server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### 6. Verify Setup

1. Open http://localhost:5173/
2. Click the "🎤 AI Interview Mode" button
3. If configured correctly, you should NOT see a yellow warning about missing API key
4. You should see the setup form with Customer Name and Cloud Providers

---

## Security Best Practices

### ⚠️ NEVER commit your .env file to Git!

The `.gitignore` file should already include `.env`:

```
# .gitignore
.env
.env.local
.env.*.local
```

### For Production Deployment

**DO NOT** use client-side API keys in production. Instead:

1. Create a backend API service
2. Move the OpenAI API calls to the backend
3. Have your frontend call your backend, which then calls OpenAI
4. This keeps your API key secure and prevents abuse

Example architecture:
```
Frontend (React) → Your Backend API → OpenAI API
                   (API key stored here)
```

---

## Troubleshooting

### "API key not configured" error

**Solution:** Make sure:
- The `.env` file is in the project root (same level as `package.json`)
- The variable name is exactly: `VITE_OPENAI_API_KEY`
- You restarted the dev server after creating the `.env` file

### "Invalid API key" error

**Solution:**
- Verify your API key is correct (copy it again from OpenAI)
- Make sure there are no extra spaces or quotes
- Check that your OpenAI account has billing enabled

### "Insufficient quota" error

**Solution:**
- Add a payment method to your OpenAI account
- Add credits or set up auto-recharge
- Check your usage limits at https://platform.openai.com/usage

### Microphone permission denied

**Solution:**
- Grant microphone access when your browser prompts you
- Check browser settings: Settings → Privacy → Microphone
- Make sure you're using HTTPS or localhost (required for microphone access)

---

## Testing the Feature

### Quick Test:

1. Navigate to the AI Interview Mode
2. Enter a test customer name: "Test Corp"
3. Select a cloud provider: AWS
4. Click "Start Interview"
5. Click "Start Recording"
6. Speak for 10-15 seconds answering the question
7. Click "Stop & Submit"
8. Wait 5-10 seconds for processing
9. You should see the transcription and detected maturity level

### Sample Response for Testing:

For the question "How does the customer segment their network?"

Try saying:
> "We use a flat network with basic VLANs for different departments.
> Most of our segmentation is done at the perimeter with firewalls.
> We don't have much micro-segmentation within our cloud environment yet."

Expected result: **Traditional** maturity level

---

## API Usage Monitoring

Monitor your usage and costs:
- View usage: https://platform.openai.com/usage
- Set spending limits: https://platform.openai.com/account/limits
- View billing: https://platform.openai.com/account/billing

---

## Alternative: Manual Mode

If you don't want to use the AI features or can't set up the API:

1. Use the regular assessment flow (skip the AI Interview Mode button)
2. Manually fill out the Setup Screen
3. Go through each dimension and select maturity levels manually
4. This works completely offline without any API keys

---

## Questions or Issues?

If you encounter any issues:
1. Check the browser console (F12) for detailed error messages
2. Verify your API key at https://platform.openai.com/api-keys
3. Check OpenAI's status page: https://status.openai.com

---

## Quick Reference

**Get API Key:** https://platform.openai.com/api-keys
**Monitor Usage:** https://platform.openai.com/usage
**Pricing Info:** https://openai.com/pricing
**Documentation:** https://platform.openai.com/docs

**Environment Variable:**
```
VITE_OPENAI_API_KEY=sk-...
```

**Restart Command:**
```bash
npm run dev
```
