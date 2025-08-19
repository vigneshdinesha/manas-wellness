import { loadStripe, Stripe } from '@stripe/stripe-js'

// Store the Stripe promise to avoid creating multiple instances
let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.error('Missing Stripe publishable key')
      return Promise.resolve(null)
    }
    
    stripePromise = loadStripe(publishableKey)
  }
  
  return stripePromise
}

// Utility function to format currency amounts
export const formatCurrency = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100) // Stripe amounts are in cents
}

// Common donation amounts in cents
export const DONATION_AMOUNTS = [
  { value: 1000, label: '$10' },  // $10
  { value: 2500, label: '$25' },  // $25
  { value: 5000, label: '$50' },  // $50
  { value: 10000, label: '$100' }, // $100
  { value: 25000, label: '$250' }, // $250
] as const

// Validate donation amount
export const isValidDonationAmount = (amount: number): boolean => {
  return amount >= 100 && amount <= 100000 // $1 to $1000 in cents
}
