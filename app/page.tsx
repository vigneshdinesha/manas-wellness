"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/apiClient"
import StripeDonation from "@/components/StripeDonation"
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/use-scroll-animation"
import { 
  Mail, 
  Phone, 
  Heart, 
  Users, 
  Target, 
  HandHeart, 
  Facebook, 
  Instagram,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function ManasWellnessWebsite() {
  const [activeSection, setActiveSection] = useState("about")
  const [scrollY, setScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<"home" | "donate">("home")

  // Scroll animation hooks
  const heroAnimation = useScrollAnimation()
  const missionHeaderAnimation = useScrollAnimation()
  const { containerRef: missionCardsRef, visibleItems: missionCardsVisible } = useStaggerAnimation(3)
  const partnersHeaderAnimation = useScrollAnimation()
  const { containerRef: partnersCardsRef, visibleItems: partnersCardsVisible } = useStaggerAnimation(2)
  const helpAnimation = useScrollAnimation()
  const donateCardAnimation = useScrollAnimation()

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      const sections = ["about", "mission", "partners", "help"]
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Health check on mount
  useEffect(() => {
    apiClient.checkHealth()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { id: "about", label: "About" },
    { id: "mission", label: "Mission" },
    { id: "partners", label: "Partners" },
    { id: "help", label: "Get Involved" },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 
            ? "py-3 glass-effect shadow-lg" 
            : "py-4 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => {
                setCurrentPage("home")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-sage/30 group-hover:ring-sage transition-all">
                <Image
                  src="/mwplogo.png.jpg"
                  alt="Manas Wellness Project Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-serif text-lg font-semibold text-dark-teal hidden sm:block">
                Manas Wellness
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-1 p-1.5 rounded-full glass-effect">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage("home")
                      scrollToSection(item.id)
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeSection === item.id && currentPage === "home"
                        ? "bg-sage text-white shadow-md"
                        : "text-darker-teal hover:bg-sage/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => setCurrentPage("donate")}
                  className={`ml-2 rounded-full font-medium transition-all ${
                    currentPage === "donate"
                      ? "bg-dark-teal text-white"
                      : "bg-sage hover:bg-dark-teal text-white"
                  }`}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Donate
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-sage/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-dark-teal" />
              ) : (
                <Menu className="w-6 h-6 text-dark-teal" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 glass-effect border-t border-sage/10 shadow-lg animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage("home")
                    scrollToSection(item.id)
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${
                    activeSection === item.id && currentPage === "home"
                      ? "bg-sage text-white"
                      : "text-darker-teal hover:bg-sage/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => {
                  setCurrentPage("donate")
                  setIsMobileMenuOpen(false)
                }}
                className="w-full rounded-xl bg-sage hover:bg-dark-teal text-white font-medium py-3"
              >
                <Heart className="w-4 h-4 mr-2" />
                Donate
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      {currentPage === "home" ? (
        <main>
          {/* Hero / About Section */}
          <section id="about" className="relative min-h-screen pt-24 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-sage/10 organic-blob animate-float-slow opacity-60" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-lavender/10 organic-blob-2 animate-float-slower opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-sage/5 to-transparent rounded-full" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Text Content */}
                <div 
                  ref={heroAnimation.ref}
                  className={`space-y-8 scroll-fade-up ${heroAnimation.isVisible ? 'is-visible' : ''}`}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 border border-sage/20 hover:bg-sage/20 transition-colors cursor-default">
                    <Sparkles className="w-4 h-4 text-sage" />
                    <span className="text-sm font-medium text-dark-teal">Mental Health Advocacy</span>
                  </div>
                  
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-teal leading-tight text-balance">
                    Breaking Barriers,{" "}
                    <span className="text-gradient">Building Bridges</span>
                  </h1>
                  
                  <p className="text-lg text-darker-teal leading-relaxed max-w-xl">
                    The Manas Wellness Project is a <strong>youth-led nonprofit</strong> dedicated to destigmatizing mental health in Indian and South Asian communities. We aim to break cultural barriers through education, advocacy, and open conversations. By creating safe, culturally aware spaces, we empower individuals to seek support without fear or shame — because <strong>every mind matters</strong>.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      onClick={() => setCurrentPage("donate")}
                      size="lg"
                      className="group rounded-full bg-sage hover:bg-dark-teal text-white font-medium px-8 shadow-lg hover:shadow-xl transition-all btn-ripple"
                    >
                      Support Our Cause
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button 
                      onClick={() => scrollToSection("mission")}
                      variant="outline"
                      size="lg"
                      className="group rounded-full border-sage/30 text-dark-teal hover:bg-sage/10 font-medium px-8"
                    >
                      Learn More
                      <ChevronDown className="w-4 h-4 ml-2 transition-transform group-hover:translate-y-1" />
                    </Button>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="relative lg:order-last">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl hover-tilt hover-glow">
                    <div className="absolute inset-0 bg-gradient-to-tr from-sage/20 to-transparent z-10" />
                    <Image
                      src="/no mental health no health.jpg"
                      alt="Youth holding a sign that says No Health Without Mental Health"
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      priority
                    />
                  </div>
                  
                  {/* Floating stat chip */}
                  <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:-left-8 glass-effect rounded-2xl p-4 shadow-xl animate-float z-20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-sage/20">
                        <Target className="w-5 h-5 text-sage" />
                      </div>
                      <div>
                        <p className="text-xs text-darker-teal/70">Powered by</p>
                        <p className="font-serif font-semibold text-dark-teal">Youth-Led Initiative</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section id="mission" className="relative py-24 section-gradient-1">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sage/5 organic-blob animate-float-slower" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div 
                ref={missionHeaderAnimation.ref}
                className={`text-center max-w-3xl mx-auto mb-16 scroll-fade-up ${missionHeaderAnimation.isVisible ? 'is-visible' : ''}`}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 border border-sage/20 mb-6 hover:bg-sage/20 transition-colors cursor-default">
                  <Heart className="w-4 h-4 text-sage" />
                  <span className="text-sm font-medium text-dark-teal">Our Mission</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-teal mb-6 text-balance">
                  Enhancing Mental Health Support
                </h2>
                <p className="text-lg text-darker-teal">
                  We enhance mental health support through innovative initiatives tailored for Indian and South Asian communities.
                </p>
              </div>

              {/* Mission Pillars */}
              <div 
                ref={missionCardsRef as React.RefObject<HTMLDivElement>}
                className="grid md:grid-cols-3 gap-8"
              >
                {[
                  {
                    icon: Heart,
                    title: "Education",
                    description: "Providing culturally sensitive mental health education and resources to break down stigma and misconceptions."
                  },
                  {
                    icon: Users,
                    title: "Advocacy",
                    description: "Advocating for mental health awareness and policy changes that benefit South Asian communities."
                  },
                  {
                    icon: HandHeart,
                    title: "Support",
                    description: "Creating safe spaces for open conversations and peer support within our communities."
                  }
                ].map((pillar, index) => (
                  <Card 
                    key={pillar.title}
                    className={`group relative bg-white/80 backdrop-blur-sm border-sage/10 hover:border-sage/30 transition-all duration-300 hover-lift hover-glow hover-shine overflow-hidden scroll-scale-in ${missionCardsVisible[index] ? 'is-visible' : ''}`}
                  >
                    {/* Gradient border effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-transparent to-lavender/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardContent className="relative p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sage/20 to-sage/10 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <pillar.icon className="w-8 h-8 text-sage icon-bounce" />
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-dark-teal mb-3 group-hover:text-sage transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-darker-teal leading-relaxed">
                        {pillar.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Button
                  onClick={() => setCurrentPage("donate")}
                  size="lg"
                  className="group rounded-full bg-sage hover:bg-dark-teal text-white font-medium px-8 shadow-lg hover:shadow-xl transition-all btn-ripple"
                >
                  Join Our Mission
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </section>

          {/* Partners Section */}
          <section id="partners" className="relative py-24 section-gradient-2">
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-lavender/5 organic-blob-2 animate-float" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div 
                ref={partnersHeaderAnimation.ref}
                className={`text-center max-w-3xl mx-auto mb-16 scroll-fade-up ${partnersHeaderAnimation.isVisible ? 'is-visible' : ''}`}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 border border-sage/20 mb-6 hover:bg-sage/20 transition-colors cursor-default">
                  <Users className="w-4 h-4 text-sage" />
                  <span className="text-sm font-medium text-dark-teal">Our Partners</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-teal mb-6 text-balance">
                  Working Together for Change
                </h2>
                <p className="text-lg text-darker-teal">
                  We collaborate with organizations that share our vision for mental health advocacy.
                </p>
              </div>

              <div 
                ref={partnersCardsRef as React.RefObject<HTMLDivElement>}
                className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
              >
                {[
                  {
                    name: "MannMukti",
                    logo: "/mannmukti.png.jpg",
                    description: "Mental health advocacy organization working to break stigma and provide support"
                  },
                  {
                    name: "SAMHIN",
                    logo: "/samhin.png",
                    description: "South Asian Mental Health Initiative & Network promoting community wellness"
                  }
                ].map((partner, index) => (
                  <Card 
                    key={partner.name}
                    className={`group bg-white/80 backdrop-blur-sm border-sage/10 hover:border-sage/30 transition-all duration-300 hover-lift hover-glow scroll-slide-${index === 0 ? 'left' : 'right'} ${partnersCardsVisible[index] ? 'is-visible' : ''}`}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-cream flex-shrink-0 ring-2 ring-sage/10 group-hover:ring-sage/30 group-hover:scale-105 transition-all duration-300">
                          <Image
                            src={partner.logo}
                            alt={`${partner.name} logo`}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-dark-teal mb-2 group-hover:text-sage transition-colors">
                            {partner.name}
                          </h3>
                          <p className="text-darker-teal leading-relaxed">
                            {partner.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How to Help Section */}
          <section id="help" className="relative py-24 section-gradient-3">
            <div className="absolute top-20 right-20 w-48 h-48 bg-sage/10 organic-blob animate-float-slow" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Contact Info */}
                <div 
                  ref={helpAnimation.ref}
                  className={`space-y-8 scroll-slide-left ${helpAnimation.isVisible ? 'is-visible' : ''}`}
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 border border-sage/20 mb-6 hover:bg-sage/20 transition-colors cursor-default">
                      <HandHeart className="w-4 h-4 text-sage" />
                      <span className="text-sm font-medium text-dark-teal">Get Involved</span>
                    </div>
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-teal mb-6 text-balance">
                      How You Can Help
                    </h2>
                    <p className="text-lg text-darker-teal leading-relaxed">
                      Reach out to learn more about volunteer opportunities, partnerships, or how you can contribute to our mission.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <a 
                      href="mailto:manaswellnessproject@gmail.com"
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/10 hover:border-sage/30 transition-all hover-lift hover-glow"
                    >
                      <div className="p-3 rounded-xl bg-sage/10 group-hover:bg-sage group-hover:scale-110 transition-all duration-300">
                        <Mail className="w-6 h-6 text-sage group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-darker-teal/70">Email us</p>
                        <p className="font-medium text-dark-teal group-hover:text-sage transition-colors">manaswellnessproject@gmail.com</p>
                      </div>
                    </a>

                    <a 
                      href="tel:+16099010874"
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/10 hover:border-sage/30 transition-all hover-lift hover-glow"
                    >
                      <div className="p-3 rounded-xl bg-sage/10 group-hover:bg-sage group-hover:scale-110 transition-all duration-300">
                        <Phone className="w-6 h-6 text-sage group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-darker-teal/70">Call us</p>
                        <p className="font-medium text-dark-teal group-hover:text-sage transition-colors">+1 (609) 901-0874</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Donate CTA Card */}
                <Card 
                  ref={donateCardAnimation.ref as React.RefObject<HTMLDivElement>}
                  className={`bg-gradient-to-br from-sage via-dark-teal to-sage overflow-hidden shadow-2xl hover-tilt scroll-slide-right ${donateCardAnimation.isVisible ? 'is-visible' : ''}`}
                >
                  <CardContent className="p-8 sm:p-12 text-center text-white">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6 group-hover:scale-110 transition-transform">
                      <Heart className="w-10 h-10 animate-pulse" />
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                      Make a Donation
                    </h3>
                    <p className="text-white/80 mb-8 max-w-sm mx-auto">
                      Your contribution helps us continue breaking barriers and building bridges for mental health in our communities.
                    </p>
                    <Button
                      onClick={() => setCurrentPage("donate")}
                      size="lg"
                      className="group rounded-full bg-white text-dark-teal hover:bg-cream font-semibold px-8 shadow-lg hover:shadow-xl transition-all btn-ripple"
                    >
                      Donate Now
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <DonationPage 
          setCurrentPage={setCurrentPage} 
          scrollToSection={scrollToSection}
        />
      )}

      {/* Footer */}
      <footer className="bg-dark-teal/5 border-t border-sage/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-sage/30">
                <Image
                  src="/mwplogo.png.jpg"
                  alt="Manas Wellness Project Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-serif font-semibold text-dark-teal">
                Manas Wellness Project
              </span>
            </div>
            <p className="text-sm text-darker-teal/70">
              © 2024 Manas Wellness Project. Every mind matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Donation Page Component
function DonationPage({ 
  setCurrentPage, 
  scrollToSection 
}: { 
  setCurrentPage: (page: "home" | "donate") => void
  scrollToSection: (id: string) => void
}) {
  const [messageForm, setMessageForm] = useState({ 
    name: "", 
    email: "", 
    message: "", 
    isDonating: false 
  })
  const [submittedMessages, setSubmittedMessages] = useState<{ 
    name: string
    message: string
    isDonor: boolean
    createdDate?: string 
  }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [validationErrors, setValidationErrors] = useState<{ 
    name?: string[]
    email?: string[]
    message?: string[] 
  }>({})

  // Fetch approved messages on mount
  useEffect(() => {
    const fetchSupportMessages = async () => {
      const response = await apiClient.getSupportMessages()
      if (response.data) {
        setSubmittedMessages(
          response.data.map(msg => ({
            name: msg.name,
            message: msg.message,
            isDonor: msg.isDonating,
            createdDate: msg.createdDate
          }))
        )
      }
    }
    fetchSupportMessages()
  }, [])

  const fetchSupportMessages = async () => {
    const response = await apiClient.getSupportMessages()
    if (response.data) {
      setSubmittedMessages(
        response.data.map(msg => ({
          name: msg.name,
          message: msg.message,
          isDonor: msg.isDonating,
          createdDate: msg.createdDate
        }))
      )
    }
  }

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    setValidationErrors({})

    const response = await apiClient.createSupportMessage({
      name: messageForm.name,
      email: messageForm.email,
      message: messageForm.message,
      isDonating: messageForm.isDonating,
    })

    if (response.status === 400 && response.errors) {
      setValidationErrors(response.errors)
      setIsSubmitting(false)
      return
    }

    if (response.error) {
      setSubmitError(response.error)
      setIsSubmitting(false)
      return
    }

    setSubmitSuccess(true)
    setMessageForm({ name: "", email: "", message: "", isDonating: false })
    setIsSubmitting(false)

    // Hide success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000)
  }

  const isFormValid = messageForm.name.trim() && messageForm.message.trim() && messageForm.message.length >= 10

  return (
    <main className="pt-24 pb-16">
      {/* Decorative elements */}
      <div className="fixed top-40 left-10 w-64 h-64 bg-sage/5 organic-blob animate-float-slow opacity-50 pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-lavender/5 organic-blob-2 animate-float-slower opacity-30 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 border border-sage/20 mb-6">
            <Heart className="w-4 h-4 text-sage" />
            <span className="text-sm font-medium text-dark-teal">Support Our Mission</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-teal mb-6 text-balance">
            Make a Difference Today
          </h1>
          <p className="text-lg text-darker-teal">
            Your support helps us continue our work in destigmatizing mental health and providing support to South Asian communities. Every contribution and message of support makes a difference.
          </p>
        </div>

        {/* Main Grid: Stripe + Message Form */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Stripe Donation */}
          <div>
            <StripeDonation
              onSuccess={(paymentIntentId) => {
                console.log("Payment successful:", paymentIntentId)
                fetchSupportMessages()
              }}
              onError={(error) => {
                console.error("Payment error:", error)
              }}
            />
          </div>

          {/* Message Form */}
          <Card className="border-sage/20 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-lavender/20">
                  <Send className="w-5 h-5 text-lavender" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-dark-teal">Share Your Support</h3>
                  <p className="text-sm text-darker-teal/70">Leave a message of encouragement</p>
                </div>
              </div>

              {/* Success Banner */}
              {submitSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-sage/10 border border-sage/30 flex items-center gap-3 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-sage flex-shrink-0" />
                  <p className="text-sm text-dark-teal">Thank you! Your message has been submitted for review.</p>
                </div>
              )}

              {/* Error Banner */}
              {submitError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmitMessage} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-dark-teal mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    value={messageForm.name}
                    onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                    placeholder="Your name"
                    maxLength={100}
                    className={`border-sage/30 focus:border-sage focus:ring-sage/20 ${
                      validationErrors.name ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.name[0]}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark-teal mb-1.5">
                    Email <span className="text-darker-teal/50">(optional)</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={messageForm.email}
                    onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                    placeholder="your@email.com"
                    maxLength={255}
                    className={`border-sage/30 focus:border-sage focus:ring-sage/20 ${
                      validationErrors.email ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.email[0]}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-dark-teal mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    placeholder="Share your words of support..."
                    maxLength={1000}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-md border bg-white text-dark-teal placeholder:text-darker-teal/40 focus:outline-none focus:ring-2 transition-all resize-none ${
                      validationErrors.message 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                        : "border-sage/30 focus:border-sage focus:ring-sage/20"
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-darker-teal/50">
                      {messageForm.message.length < 10 && "Minimum 10 characters required"}
                    </p>
                    <p className="text-xs text-darker-teal/50">
                      {messageForm.message.length}/1000
                    </p>
                  </div>
                  {validationErrors.message && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.message[0]}</p>
                  )}
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={messageForm.isDonating}
                    onChange={(e) => setMessageForm({ ...messageForm, isDonating: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-sage/30 text-sage focus:ring-sage/20"
                  />
                  <span className="text-sm text-darker-teal group-hover:text-dark-teal transition-colors">
                    I am also making a donation via Venmo
                  </span>
                </label>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-sage hover:bg-dark-teal text-white font-medium py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Community Support Blog */}
        {submittedMessages.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-dark-teal mb-3">
                Community Support
              </h2>
              <p className="text-darker-teal">Messages of encouragement from our supporters</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {submittedMessages.map((msg, index) => (
                <Card 
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border-sage/10 hover:border-sage/20 transition-all duration-300 hover-lift hover-glow"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-dark-teal flex items-center justify-center text-white font-semibold transition-transform hover:scale-110">
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-dark-teal">{msg.name}</p>
                        {msg.isDonor && (
                          <span className="inline-flex items-center gap-1 text-xs text-lavender">
                            <Heart className="w-3 h-3" />
                            Donor
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-darker-teal italic leading-relaxed">
                      {`"${msg.message}"`}
                    </p>
                    {msg.createdDate && (
                      <p className="mt-4 text-xs text-darker-teal/50">
                        {new Date(msg.createdDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Ways to Help */}
        <Card className="bg-gradient-to-br from-cream via-white to-sage/10 border-sage/20 overflow-hidden hover-glow transition-all duration-300">
          <CardContent className="p-8 sm:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-serif text-2xl font-bold text-dark-teal mb-4">
                  Other Ways to Help
                </h3>
                <p className="text-darker-teal mb-6">
                  {"Can't"} donate right now? There are many other ways to support our mission and make a difference in the community.
                </p>
                <Button
                  onClick={() => {
                    setCurrentPage("home")
                    setTimeout(() => scrollToSection("help"), 100)
                  }}
                  variant="outline"
                  className="group rounded-full border-sage text-dark-teal hover:bg-sage hover:text-white font-medium px-6 transition-all"
                >
                  Volunteer / Partner with Us
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-sm text-darker-teal/70 mb-4">Share our mission</p>
                <div className="flex gap-3 justify-center md:justify-end">
                  <a
                    href="https://www.facebook.com/share/1Ga3hKqTkZ/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-sage/30 text-dark-teal hover:bg-sage hover:text-white hover:border-sage transition-all duration-300 hover:scale-105"
                  >
                    <Facebook className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/manas_wellness_project?igsh=azRvOWFsZzJzeWhu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-sage/30 text-dark-teal hover:bg-sage hover:text-white hover:border-sage transition-all duration-300 hover:scale-105"
                  >
                    <Instagram className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
