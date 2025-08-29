"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Heart, Users, Target, HandHeart, Facebook, Instagram } from "lucide-react"
import { apiClient } from "@/lib/apiClient"
import StripeDonation from "@/components/StripeDonation"

export default function ManasWellnessWebsite() {
  const [activeSection, setActiveSection] = useState("about")
  const [scrollY, setScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("home")

  // Test API connection on app load
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await apiClient.checkHealth()
        if (response.error) {
          console.warn('API Health Check Failed:', response.error)
        } else {
          console.log('✅ API Connected Successfully:', response.data)
        }
      } catch (error) {
        console.error('❌ API Connection Failed:', error)
      }
    }
    
    testConnection()
  }, [])

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth"

    const handleScroll = () => {
      const sections = ["about", "mission", "partners", "help"]
      const scrollPosition = window.scrollY + 100
      setScrollY(window.scrollY)

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    // Throttled scroll handler for better performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    if (currentPage === "home") {
      window.addEventListener("scroll", throttledScroll, { passive: true })
    }

    return () => {
      window.removeEventListener("scroll", throttledScroll)
    }
  }, [currentPage])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const DonationPage = () => {
    const [messageForm, setMessageForm] = useState({
      name: "",
      email: "",
      message: "",
      isDonating: false,
    })
    const [submittedMessages, setSubmittedMessages] = useState<{
      name: string
      message: string
      isDonor: boolean
      createdDate?: string
    }[]>([
      {
        name: "Sarah K.",
        message: "Mental health awareness in our community is so important. Thank you for breaking the stigma!",
        isDonor: true,
      },
      {
        name: "Raj P.",
        message: "As a South Asian student, I appreciate having a safe space to talk about mental wellness.",
        isDonor: false,
      },
      {
        name: "Priya M.",
        message: "Your work is making a real difference. Keep advocating for our communities!",
        isDonor: true,
      },
    ])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [validationErrors, setValidationErrors] = useState<{
      name?: string[]
      email?: string[]
      message?: string[]
    }>({})

    // Fetch approved messages on component mount
    useEffect(() => {
      fetchSupportMessages()
    }, [])

    const fetchSupportMessages = async () => {
      try {
        const response = await apiClient.getSupportMessages()
        if (response.error) {
          console.error('Error fetching support messages:', response.error)
        } else {
          setSubmittedMessages((response.data || []).map((msg: any) => ({
            name: msg.name,
            message: msg.message,
            isDonor: msg.isDonating,
            createdDate: msg.createdDate
          })))
        }
      } catch (error) {
        console.error('Error fetching support messages:', error)
      }
    }

    const handleSubmitMessage = async () => {
      if (!messageForm.name || !messageForm.message) return

      setIsSubmitting(true)
      setSubmitError("")
      setValidationErrors({})
      setSubmitSuccess(false)

      try {
        const response = await apiClient.createSupportMessage({
          name: messageForm.name,
          email: messageForm.email,
          message: messageForm.message,
          isDonating: messageForm.isDonating
        })

        if (response.error) {
          if (response.status === 400 && response.data) {
            // Handle ASP.NET Core validation errors
            const errorData = response.data as any
            if (errorData.errors) {
              setValidationErrors(errorData.errors)
            } else {
              setSubmitError(response.error)
            }
          } else {
            setSubmitError(response.error)
          }
        } else {
          setSubmitSuccess(true)
          setMessageForm({ name: "", email: "", message: "", isDonating: false })
          // Show success message for 5 seconds
          setTimeout(() => setSubmitSuccess(false), 5000)
        }
      } catch (error) {
        console.error('Submission error:', error)
        setSubmitError("Network error. Please check your connection and try again.")
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <div className="min-h-screen bg-cream pt-20">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-flex items-center space-x-2 bg-lavender/10 px-4 py-2 rounded-full mb-4">
              <Heart className="h-4 w-4 text-lavender" />
              <span className="text-sm font-medium text-dark-teal">Support Our Mission</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-dark-teal mb-4">Make a Difference Today</h1>
            <p className="text-xl text-darker-teal max-w-3xl mx-auto">
              Your support helps us continue our work in destigmatizing mental health and providing support to South
              Asian communities. Every contribution and message of support makes a difference.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Stripe Donation Section */}
            <div className="scroll-reveal">
              <StripeDonation 
                onSuccess={(paymentIntentId) => {
                  console.log('Donation successful:', paymentIntentId)
                  // Optionally refresh support messages
                  fetchSupportMessages()
                }}
                onError={(error) => {
                  console.error('Donation error:', error)
                }}
              />
            </div>

            {/* Message Section */}
            <Card className="border-lavender/20 scroll-reveal">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-dark-teal mb-6">Share Your Support</h2>
                <p className="text-darker-teal mb-4">
                  Whether you're donating or just want to show support, share why you believe in our mission. Your
                  message helps inspire others!
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> All messages are reviewed before being published to ensure a safe and supportive community environment.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                      <p className="font-medium">✅ Thank you!</p>
                      <p className="text-sm">Your message has been submitted for review and will appear once approved.</p>
                    </div>
                  )}

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                      <p className="font-medium">❌ Error</p>
                      <p className="text-sm">{submitError}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-dark-teal mb-2">Your Name *</label>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={messageForm.name}
                      onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                      className={`border-sage/30 focus:border-sage ${validationErrors.name ? 'border-red-500' : ''}`}
                      maxLength={100}
                    />
                    {validationErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.name[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-teal mb-2">Email (Optional)</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={messageForm.email}
                      onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                      className={`border-sage/30 focus:border-sage ${validationErrors.email ? 'border-red-500' : ''}`}
                      maxLength={255}
                    />
                    {validationErrors.email && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.email[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-teal mb-2">Your Message *</label>
                    <textarea
                      placeholder="Share why you support our mission..."
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                      className={`w-full px-3 py-2 border border-sage/30 rounded-md focus:border-sage focus:outline-none transition-all duration-300 ${validationErrors.message ? 'border-red-500' : ''}`}
                      rows={4}
                      minLength={10}
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{messageForm.message.length}/1000 characters</span>
                      {messageForm.message.length < 10 && messageForm.message.length > 0 && (
                        <span className="text-orange-600 text-xs">Minimum 10 characters required</span>
                      )}
                    </div>
                    {validationErrors.message && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.message[0]}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDonating"
                      checked={messageForm.isDonating}
                      onChange={(e) => setMessageForm({ ...messageForm, isDonating: e.target.checked })}
                      className="rounded border-sage/30"
                    />
                    <label htmlFor="isDonating" className="text-sm text-darker-teal">
                      I am also making a donation via Venmo
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitMessage}
                  className="w-full bg-lavender hover:bg-lavender/90 text-white py-3 text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!messageForm.name || !messageForm.message || isSubmitting || messageForm.message.length < 10}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Share Your Message"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Community Messages */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-dark-teal text-center mb-8 scroll-reveal">Community Support Blog</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submittedMessages.map((msg, index) => (
                <Card key={index} className="border-sage/20 scroll-reveal hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-dark-teal">{msg.name}</h3>
                      {msg.isDonor && (
                        <span className="bg-lavender/10 text-lavender text-xs px-2 py-1 rounded-full">Donor</span>
                      )}
                    </div>
                    <p className="text-darker-teal text-sm italic mb-3">"{msg.message}"</p>
                    {msg.createdDate && (
                      <p className="text-xs text-gray-500">
                        {new Date(msg.createdDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Other Ways to Help */}
          <div className="mt-16">
            <Card className="border-sage/20 scroll-reveal">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-dark-teal mb-6 text-center">Other Ways to Help</h3>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-sage/30 hover:bg-sage/10 bg-transparent text-left h-auto py-4"
                    onClick={() => setCurrentPage("home")}
                  >
                    <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="text-base">Volunteer / Partner with us</span>
                  </Button>

                  <div className="border border-lavender/30 rounded-lg p-4 hover:bg-lavender/5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3 text-lavender" />
                        <span className="text-base font-medium text-dark-teal">Share our mission</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 ml-8">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-blue-500/30 hover:bg-blue-50 text-blue-600 bg-transparent"
                        onClick={() => window.open('https://www.facebook.com/share/1Ga3hKqTkZ/?mibextid=wwXIfr', '_blank')}
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-pink-500/30 hover:bg-pink-50 text-pink-600 bg-transparent"
                        onClick={() => window.open('https://www.instagram.com/manas_wellness_project?igsh=azRvOWFsZzJzeWhu', '_blank')}
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (currentPage === "donate") {
    return (
      <div className="min-h-screen bg-cream overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-effect-dark border-b border-sage/10 transition-all duration-300">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src="/mwplogo.png.jpg"
                    alt="Manas Wellness Project Logo"
                    className="h-12 w-12 rounded-full shadow-lg object-cover object-center bg-white transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sage/20 to-lavender/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Manas Wellness Project</h1>
                  <p className="text-xs text-dark-teal/70 font-medium">Mental Health Advocacy</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1 bg-white/50 backdrop-blur-sm rounded-full p-1 border border-sage/10">
                <button
                  onClick={() => setCurrentPage("home")}
                  className="px-4 py-2 text-sm font-medium rounded-full text-dark-teal hover:bg-sage/10 hover:text-sage transition-all duration-300"
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentPage("donate")}
                  className="px-6 py-2 text-sm font-medium rounded-full bg-sage text-white shadow-md transition-all duration-300"
                >
                  Donate
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1 transition-all duration-300 hover:scale-110"
                aria-label="Toggle mobile menu"
              >
                <span
                  className={`block w-6 h-0.5 bg-dark-teal transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-dark-teal transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-dark-teal transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Mobile Menu */}
            <div
              className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pt-4 pb-2 space-y-2">
                <button
                  onClick={() => {
                    setCurrentPage("home")
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-sage/10 hover:text-sage rounded-lg text-dark-teal"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("donate")
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-sage/10 hover:text-sage rounded-lg text-sage bg-sage/5"
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
        </nav>

        <DonationPage />

        {/* Footer */}
        <footer className="bg-dark-teal text-cream py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <img
                  src="/mwplogo.png.jpg"
                  alt="Manas Wellness Project Logo"
                  className="h-8 w-8 object-cover object-center bg-white hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="text-lg font-semibold">Manas Wellness Project</span>
              </div>
              <p className="text-cream/80 text-center md:text-right">
                © 2024 Manas Wellness Project. Every mind matters.
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-sage/5 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-lavender/5 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-sage/3 rounded-full blur-2xl animate-float-slow" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect-dark border-b border-sage/10 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 scroll-reveal">
              <div className="relative">
                  <img
                    src="/mwplogo.png.jpg"
                    alt="Manas Wellness Project Logo"
                    className="h-12 w-12 rounded-full shadow-lg object-cover object-center bg-white transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sage/20 to-lavender/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Manas Wellness Project</h1>
                <p className="text-xs text-dark-teal/70 font-medium">Mental Health Advocacy</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1 bg-white/50 backdrop-blur-sm rounded-full p-1 border border-sage/10">
              {[
                { id: "about", label: "About Us" },
                { id: "mission", label: "Our Mission" },
                { id: "partners", label: "Partners" },
                { id: "help", label: "How to Help" },
              ].map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 scroll-reveal relative overflow-hidden ${
                    activeSection === item.id 
                      ? "bg-sage text-white shadow-md" 
                      : "text-dark-teal hover:bg-sage/10 hover:text-sage"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage("donate")}
                className="px-6 py-2 text-sm font-medium rounded-full modern-button gradient-bg-primary text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                Donate
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1 transition-all duration-300 hover:scale-110"
              aria-label="Toggle mobile menu"
            >
              <span
                className={`block w-6 h-0.5 bg-dark-teal transition-all duration-300 ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-dark-teal transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-dark-teal transition-all duration-300 ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-4 pb-2 space-y-2">
              {[
                { id: "about", label: "About Us" },
                { id: "mission", label: "Our Mission" },
                { id: "partners", label: "Partners" },
                { id: "help", label: "How to Help" },
              ].map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToSection(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-sage/10 hover:text-sage rounded-lg ${
                    activeSection === item.id ? "text-sage bg-sage/5" : "text-dark-teal"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setCurrentPage("donate")
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-sage/10 hover:text-sage rounded-lg text-dark-teal"
              >
                Donate
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* About Us Section */}
      <section id="about" className="pt-24 pb-20 relative overflow-hidden">
        {/* Modern gradient background */}
        <div className="absolute inset-0 gradient-bg-subtle"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-lavender/10"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-sage/10 rounded-full blur-3xl animate-float opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-lavender/10 rounded-full blur-2xl animate-float-delayed opacity-40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-3 glass-effect px-6 py-3 rounded-full scroll-reveal slide-in-left border border-sage/20">
                <div className="w-2 h-2 bg-sage rounded-full animate-pulse"></div>
                <Heart className="h-5 w-5 text-sage" />
                <span className="text-sm font-semibold text-dark-teal">Mental Health Advocacy</span>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-5xl lg:text-7xl font-bold leading-tight scroll-reveal slide-in-left">
                  <span className="text-gradient">Breaking Barriers,</span>
                  <br />
                  <span className="text-dark-teal">Building Bridges</span>
                </h2>
                
                <div className="w-24 h-1 gradient-bg-primary rounded-full scroll-reveal slide-in-left"></div>
              </div>
              
              <div className="space-y-6 text-lg leading-relaxed">
                <p className="text-darker-teal scroll-reveal slide-in-left">
                  The Manas Wellness Project is a <span className="font-semibold text-dark-teal">youth-led nonprofit</span> dedicated to destigmatizing mental health in Indian and South Asian communities. We aim to break cultural barriers through education, advocacy, and open conversations.
                </p>
                <p className="text-darker-teal scroll-reveal slide-in-left">
                  By creating safe, culturally aware spaces, we empower individuals to seek support without fear or shame — because <span className="font-semibold text-gradient">every mind matters</span>.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 scroll-reveal slide-in-left">
                <Button
                  onClick={() => setCurrentPage("donate")}
                  className="modern-button gradient-bg-primary text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  Support Our Cause
                </Button>
                <Button
                  onClick={() => scrollToSection("mission")}
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-sage text-sage hover:bg-sage hover:text-white transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative scroll-reveal slide-in-right">
              <div className="relative group">
                {/* Image with enhanced styling */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src="/no mental health no health.jpg"
                    alt="Mental Health Advocacy - No Health Without Mental Health"
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Floating stats card */}
                <div className="absolute -bottom-8 -left-8 glass-effect p-6 rounded-2xl shadow-xl border border-white/20 animate-bounce-subtle">
                  <div className="flex items-center space-x-4">
                    <div className="gradient-bg-primary p-3 rounded-full">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-dark-teal">Youth-Led</p>
                      <p className="text-sm text-darker-teal">Initiative</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 gradient-bg-secondary rounded-full opacity-20 animate-float"></div>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-sage/20 rounded-full animate-float-delayed"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <g fill="#7BA89D" fillOpacity="0.1">
                <circle cx="30" cy="30" r="1.5"/>
              </g>
            </g>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 glass-effect px-6 py-3 rounded-full mb-6 scroll-reveal slide-in-up border border-lavender/20">
              <Target className="h-5 w-5 text-lavender" />
              <span className="text-sm font-semibold text-dark-teal">Our Mission</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 scroll-reveal slide-in-up">
              <span className="text-gradient">Enhancing Mental Health</span>
              <br />
              <span className="text-dark-teal">Support</span>
            </h2>
            <div className="w-32 h-1 gradient-bg-secondary mx-auto mb-6 scroll-reveal slide-in-up"></div>
            <p className="text-xl text-darker-teal max-w-4xl mx-auto leading-relaxed scroll-reveal slide-in-up">
              We enhance mental health support through innovative initiatives tailored for Indian and South Asian communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Heart,
                title: "Education",
                description: "Providing culturally sensitive mental health education and resources to break down stigma and misconceptions.",
                color: "sage",
                gradient: "from-sage/10 to-sage/5",
              },
              {
                icon: Users,
                title: "Advocacy",
                description: "Advocating for mental health awareness and policy changes that benefit South Asian communities.",
                color: "lavender",
                gradient: "from-lavender/10 to-lavender/5",
              },
              {
                icon: HandHeart,
                title: "Support",
                description: "Creating safe spaces for open conversations and peer support within our communities.",
                color: "sage",
                gradient: "from-sage/10 to-sage/5",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="group modern-card glass-effect p-8 rounded-3xl scroll-reveal slide-in-up relative overflow-hidden"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  {/* Icon with modern styling */}
                  <div className={`w-16 h-16 gradient-bg-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-dark-teal mb-4 group-hover:text-gradient transition-all duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="text-darker-teal leading-relaxed group-hover:text-dark-teal transition-colors duration-300">
                    {item.description}
                  </p>
                  
                  {/* Decorative element */}
                  <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-sage/30 to-transparent group-hover:via-sage transition-all duration-500"></div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-16 scroll-reveal slide-in-up">
            <Button
              onClick={() => setCurrentPage("donate")}
              className="modern-button gradient-bg-secondary text-white px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join Our Mission
            </Button>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-16 bg-gradient-to-br from-sage/5 to-lavender/5 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark-teal mb-4 scroll-reveal">Our Partners</h2>
            <p className="text-xl text-darker-teal scroll-reveal">
              Working together to create meaningful change in mental health advocacy
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
            {[
              {
                src: "/mannmukti.png.jpg",
                alt: "MannMukti Logo",
                title: "MannMukti",
                description: "Mental health advocacy organization working to break stigma and provide support",
              },
              {
                src: "/samhin.png",
                alt: "SAMHIN Logo",
                title: "SAMHIN",
                description: "South Asian Mental Health Initiative & Network promoting community wellness",
              },
            ].map((partner, index) => (
              <Card
                key={partner.title}
                className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 scroll-reveal group"
              >
                <CardContent className="p-8 text-center">
                  <img
                    src={partner.src || "/placeholder.svg"}
                    alt={partner.alt}
                    className="h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <h3 className="text-xl font-semibold text-dark-teal mb-2">{partner.title}</h3>
                  <p className="text-darker-teal">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Help Section */}
      <section id="help" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark-teal mb-4 scroll-reveal">How to Help</h2>
            <p className="text-xl text-darker-teal scroll-reveal">
              Join us in making mental health support accessible to everyone
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Contact Section */}
            <Card className="border-sage/20 scroll-reveal hover:shadow-lg transition-all duration-500">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-dark-teal mb-6 text-center">Join Our Cause</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
                    <div className="bg-sage/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-sage" />
                    </div>
                    <div>
                      <p className="font-medium text-dark-teal">Email us</p>
                      <a href="mailto:manaswellnessproject@gmail.com" className="text-sage hover:underline">
                        manaswellnessproject@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
                    <div className="bg-lavender/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-lavender" />
                    </div>
                    <div>
                      <p className="font-medium text-dark-teal">Call us</p>
                      <a href="tel:+16099010874" className="text-lavender hover:underline">
                        +1 (609) 901 0874
                      </a>
                    </div>
                  </div>
                </div>
                <p className="text-darker-teal mt-6 text-center">
                  Reach out to learn more about volunteer opportunities, partnerships, or how you can contribute to our
                  mission.
                </p>
                <div className="text-center mt-6">
                  <Button
                    onClick={() => setCurrentPage("donate")}
                    className="bg-lavender hover:bg-lavender/90 text-white px-8 py-3 text-lg hover:scale-105 transition-all duration-300"
                  >
                    Make a Donation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-teal text-cream py-12 relative z-10 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src="/mwplogo.png.jpg"
                alt="Manas Wellness Project Logo"
                className="h-8 w-8 object-cover object-center bg-white hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <span className="text-lg font-semibold">Manas Wellness Project</span>
            </div>
            <p className="text-cream/80 text-center md:text-right">
              © 2024 Manas Wellness Project. Every mind matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
