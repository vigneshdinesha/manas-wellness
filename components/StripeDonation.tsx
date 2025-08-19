"use client"

import React, { useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getStripe, DONATION_AMOUNTS, formatCurrency, isValidDonationAmount } from '@/lib/stripe'
import { Heart, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const stripePromise = getStripe()

interface DonationFormProps {
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

const DonationForm: React.FC<DonationFormProps> = ({ onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  
  const [selectedAmount, setSelectedAmount] = useState<number>(2500) // Default $25
  const [customAmount, setCustomAmount] = useState<string>('')
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const finalAmount = customAmount ? Math.round(parseFloat(customAmount) * 100) : selectedAmount

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage('Stripe is not ready. Please try again.')
      return
    }

    if (!donorInfo.name.trim()) {
      setErrorMessage('Please enter your name.')
      return
    }

    if (!isValidDonationAmount(finalAmount)) {
      setErrorMessage('Please enter a valid donation amount between $1 and $1000.')
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          donorInfo: donorInfo,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: donorInfo.name,
            email: donorInfo.email || undefined,
          },
        },
      })

      if (error) {
        throw new Error(error.message || 'Payment failed')
      }

      if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('success')
        onSuccess?.(paymentIntent.id)
        
        // Reset form after success
        setTimeout(() => {
          setPaymentStatus('idle')
          setDonorInfo({ name: '', email: '', message: '' })
          setCustomAmount('')
          setSelectedAmount(2500)
        }, 3000)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      setErrorMessage(message)
      setPaymentStatus('error')
      onError?.(message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentStatus === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-green-800 mb-2">Thank You!</h3>
          <p className="text-green-700 mb-2">
            Your donation of {formatCurrency(finalAmount)} has been processed successfully.
          </p>
          <p className="text-green-600 text-sm">
            You should receive an email confirmation shortly.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="modern-card glass-effect border-sage/10">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="gradient-bg-primary p-3 rounded-2xl shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Make a Secure Donation</h2>
            <p className="text-sm text-darker-teal">Powered by Stripe - Secure & Trusted</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donation Amount Selection */}
          <div>
            <label className="block text-lg font-semibold text-dark-teal mb-4">Select Donation Amount</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {DONATION_AMOUNTS.map((amount) => (
                <button
                  key={amount.value}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amount.value)
                    setCustomAmount('')
                  }}
                  className={`modern-button px-4 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 relative overflow-hidden ${
                    selectedAmount === amount.value && !customAmount
                      ? 'gradient-bg-primary text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-sage/20 text-dark-teal hover:border-sage hover:bg-sage/5 hover:scale-105'
                  }`}
                >
                  {amount.label}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="modern-input pl-10 py-4 text-lg rounded-2xl border-2"
                min="1"
                max="1000"
                step="0.01"
              />
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              Donation amount: <span className="font-semibold text-dark-teal">
                {formatCurrency(finalAmount)}
              </span>
            </p>
          </div>

          {/* Donor Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-dark-teal mb-3">Full Name *</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={donorInfo.name}
                onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                className="modern-input py-4 text-lg rounded-2xl border-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-dark-teal mb-3">Email Address (Optional)</label>
              <Input
                type="email"
                placeholder="Enter your email for receipt"
                value={donorInfo.email}
                onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                className="modern-input py-4 text-lg rounded-2xl border-2"
              />
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-dark-teal mb-3">Message (Optional)</label>
              <textarea
                placeholder="Share why you support our mission..."
                value={donorInfo.message}
                onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                className="modern-input w-full px-4 py-4 text-lg rounded-2xl border-2 focus:outline-none transition-all duration-300"
                rows={4}
                maxLength={500}
              />
            </div>
          </div>

          {/* Card Element */}
          <div>
            <label className="block text-lg font-semibold text-dark-teal mb-3">Payment Information</label>
            <div className="modern-input p-6 rounded-2xl border-2 bg-white shadow-sm">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '18px',
                      color: '#1a365d',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      '::placeholder': {
                        color: '#a0aec0',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || isProcessing || !donorInfo.name.trim() || !isValidDonationAmount(finalAmount)}
            className="modern-button w-full gradient-bg-primary text-white py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                Processing Payment...
              </span>
            ) : (
              `💝 Donate ${formatCurrency(finalAmount)}`
            )}
          </Button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🔒 Your payment is secured by Stripe. We do not store your payment information.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface StripeDonationProps {
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

const StripeDonation: React.FC<StripeDonationProps> = ({ onSuccess, onError }) => {
  return (
    <Elements stripe={stripePromise}>
      <DonationForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}

export default StripeDonation
