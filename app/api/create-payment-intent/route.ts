import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { amount, donorInfo } = await request.json()

    // Validate the request
    if (!amount || amount < 100 || amount > 100000) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be between $1 and $1000.' },
        { status: 400 }
      )
    }

    if (!donorInfo?.name?.trim()) {
      return NextResponse.json(
        { error: 'Donor name is required.' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure it's an integer
      currency: 'usd',
      metadata: {
        donor_name: donorInfo.name,
        donor_email: donorInfo.email || '',
        donor_message: donorInfo.message || '',
        organization: 'Manas Wellness Project',
      },
      description: `Donation to Manas Wellness Project from ${donorInfo.name}`,
      receipt_email: donorInfo.email || undefined,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    )
  }
}
