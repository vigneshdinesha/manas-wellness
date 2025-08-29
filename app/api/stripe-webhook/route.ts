import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Log initialization
console.log('🚀 Stripe webhook route initializing...')
console.log('🔑 Stripe secret key present:', !!process.env.STRIPE_SECRET_KEY)
console.log('🔐 Webhook secret present:', !!process.env.STRIPE_WEBHOOK_SECRET)

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook endpoint hit!')
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request method:', request.method)
  
  // Set headers to prevent redirects
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  }
  
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!
    console.log('📝 Webhook body length:', body.length)
    console.log('🔐 Signature present:', !!signature)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed.', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Log successful payment
        console.log('✅ Payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          donor_name: paymentIntent.metadata.donor_name,
          donor_email: paymentIntent.metadata.donor_email,
        })
        
        // Here you could:
        // 1. Save donation to your database
        // 2. Send thank you email
        // 3. Add donor to newsletter list
        // 4. Create a support message in your system
        
        // Example: Create a support message for the donation
        try {
          // You could integrate with your existing API here
          // await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/SupportMessages`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     name: paymentIntent.metadata.donor_name,
          //     email: paymentIntent.metadata.donor_email,
          //     message: `Thank you for your donation of $${(paymentIntent.amount / 100).toFixed(2)}! ${paymentIntent.metadata.donor_message}`,
          //     isDonating: true
          //   })
          // })
        } catch (error) {
          console.error('Error creating support message:', error)
        }
        
        break
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        
        console.log('❌ Payment failed:', {
          id: failedPayment.id,
          amount: failedPayment.amount,
          donor_name: failedPayment.metadata.donor_name,
          last_payment_error: failedPayment.last_payment_error?.message,
        })
        
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      }
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
