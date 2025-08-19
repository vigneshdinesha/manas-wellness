# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for the Manas Wellness Project donation system.

## Prerequisites

- Stripe account (create one at [stripe.com](https://stripe.com))
- The required Stripe packages are already installed in this project

## Setup Instructions

### 1. Get Your Stripe Keys

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 2. Update Environment Variables

Replace the placeholder values in your `.env.local` file:

```bash
# Replace these with your actual Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Set Up Webhooks (Recommended)

Webhooks allow your application to receive notifications when payments succeed or fail.

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe-webhook`
   - For local development: `https://your-ngrok-url.ngrok.io/api/stripe-webhook`
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Local Development with Webhooks

For local testing of webhooks, you can use the Stripe CLI:

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward events to your local app:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
4. Use the webhook signing secret provided by the CLI in your `.env.local`

## Features Implemented

### ✅ Frontend Components
- **Stripe Donation Form** (`/components/StripeDonation.tsx`)
  - Secure card input with Stripe Elements
  - Predefined donation amounts ($10, $25, $50, $100, $250)
  - Custom amount input
  - Donor information collection
  - Real-time validation
  - Success/error handling

### ✅ Backend API Routes
- **Payment Intent Creation** (`/app/api/create-payment-intent/route.ts`)
  - Creates secure payment intents
  - Validates donation amounts ($1-$1000)
  - Stores donor metadata
  - Handles errors gracefully

- **Webhook Handler** (`/app/api/stripe-webhook/route.ts`)
  - Verifies webhook signatures
  - Processes payment success/failure events
  - Logs donation information
  - Ready for database integration

### ✅ Utilities
- **Stripe Helper Functions** (`/lib/stripe.ts`)
  - Stripe instance management
  - Currency formatting
  - Amount validation
  - Predefined donation amounts

## Page Integration

The Stripe donation component has been integrated into the main donation page, replacing the Venmo section while keeping Venmo as an alternative payment method.

## Security Features

- ✅ Secure card data handling (never touches your server)
- ✅ Webhook signature verification
- ✅ Input validation and sanitization
- ✅ Environment variable protection
- ✅ Error handling and logging

## Testing

### Test Mode
Stripe provides test card numbers for development:

- **Successful payment**: `4242424242424242`
- **Declined payment**: `4000000000000002`
- **Requires authentication**: `4000002500003155`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Production Mode
When ready for production:
1. Replace test keys with live keys (start with `pk_live_` and `sk_live_`)
2. Update webhook endpoint to production URL
3. Test with real (small) amounts

## Troubleshooting

### Common Issues

1. **"Stripe is not ready"**: Check that publishable key is correctly set
2. **"Payment failed"**: Verify secret key and payment amount
3. **Webhook signature verification failed**: Ensure webhook secret is correct

### Debug Mode
Enable debug logging in development by adding to your `.env.local`:
```bash
STRIPE_DEBUG=true
```

## Next Steps

1. **Database Integration**: Store successful donations in your database
2. **Email Notifications**: Send thank you emails to donors
3. **Donor Management**: Create a donor management system
4. **Recurring Donations**: Implement subscription-based donations
5. **Analytics**: Track donation patterns and revenue

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- For this implementation: Contact the development team
