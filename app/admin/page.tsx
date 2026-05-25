"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/apiClient"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((data: { authenticated: boolean }) => {
        if (!cancelled) {
          setIsAdminAuthenticated(!!data.authenticated)
          setSessionChecked(true)
        }
      })
      .catch(() => {
        if (!cancelled) setSessionChecked(true)
      })
    return () => { cancelled = true }
  }, [])

  const AdminDashboard = () => {
    const [adminMessages, setAdminMessages] = useState<{
      id: number
      name: string
      email?: string
      message: string
      isDonating: boolean
      isApproved: boolean
      createdDate: string
    }[]>([])
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [apiHealth, setApiHealth] = useState<'checking' | 'healthy' | 'error'>('checking')

    useEffect(() => {
      checkApiHealth()
      fetchAdminMessages()
    }, [])

    const checkApiHealth = async () => {
      try {
        const response = await apiClient.checkHealth()
        if (response.error) {
          setApiHealth('error')
        } else {
          setApiHealth(response.data?.status === 'Healthy' ? 'healthy' : 'error')
        }
      } catch (error) {
        setApiHealth('error')
      }
    }

    const fetchAdminMessages = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getAllSupportMessages()
        if (response.error) {
          console.error('Error fetching admin messages:', response.error)
        } else {
          setAdminMessages(response.data || [])
        }
      } catch (error) {
        console.error('Error fetching admin messages:', error)
      } finally {
        setLoading(false)
      }
    }

    const approveMessage = async (id: number) => {
      setActionLoading(id)
      try {
        const response = await apiClient.approveSupportMessage(id)
        if (response.error) {
          console.error('Error approving message:', response.error)
        } else {
          await fetchAdminMessages()
        }
      } catch (error) {
        console.error('Error approving message:', error)
      } finally {
        setActionLoading(null)
      }
    }

    const deleteMessage = async (id: number) => {
      if (!confirm('Are you sure you want to delete this message?')) return
      
      setActionLoading(id)
      try {
        const response = await apiClient.deleteSupportMessage(id)
        if (response.error) {
          console.error('Error deleting message:', response.error)
        } else {
          await fetchAdminMessages()
        }
      } catch (error) {
        console.error('Error deleting message:', error)
      } finally {
        setActionLoading(null)
      }
    }

    const filteredMessages = adminMessages.filter(m => {
      if (filter === 'pending') return !m.isApproved
      if (filter === 'approved') return m.isApproved
      return true
    })

    const pendingCount = adminMessages.filter(m => !m.isApproved).length
    const approvedCount = adminMessages.filter(m => m.isApproved).length

    const handleLogout = async () => {
      try {
        await fetch('/api/admin/logout', { method: 'POST' })
      } catch {
        // Ignore network error; clear local state regardless.
      }
      setIsAdminAuthenticated(false)
    }

    return (
      <div className="min-h-screen bg-cream pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-dark-teal mb-4">Admin Dashboard</h1>
            <p className="text-darker-teal">Manage support messages and moderate content</p>
            
            {/* API Health Status */}
            <div className="mt-4 flex justify-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                apiHealth === 'healthy' ? 'bg-green-100 text-green-800' :
                apiHealth === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  apiHealth === 'healthy' ? 'bg-green-500' :
                  apiHealth === 'error' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}></div>
                API Status: {apiHealth === 'healthy' ? 'Connected' : apiHealth === 'error' ? 'Error' : 'Checking...'}
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                filter === 'all' 
                  ? 'bg-dark-teal text-white' 
                  : 'bg-white text-dark-teal border border-dark-teal hover:bg-dark-teal hover:text-white'
              }`}
            >
              All Messages ({adminMessages.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                filter === 'pending' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                filter === 'approved' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-green-500 border border-green-500 hover:bg-green-500 hover:text-white'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>

          {/* Messages List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dark-teal"></div>
              <p className="mt-2 text-darker-teal">Loading messages...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredMessages.map((message) => (
                <Card key={message.id} className={`border-2 ${message.isApproved ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-dark-teal">{message.name}</h3>
                        <p className="text-sm text-gray-600">
                          Email: {message.email || 'Not provided'} • 
                          Donor: {message.isDonating ? 'Yes' : 'No'} • 
                          {new Date(message.createdDate).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        message.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {message.isApproved ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                    
                    <p className="text-darker-teal mb-4 p-4 bg-white rounded-lg border">
                      "{message.message}"
                    </p>
                    
                    <div className="flex gap-3">
                      {!message.isApproved && (
                        <Button
                          onClick={() => approveMessage(message.id)}
                          disabled={actionLoading === message.id}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          {actionLoading === message.id ? 'Approving...' : 'Approve'}
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteMessage(message.id)}
                        disabled={actionLoading === message.id}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        {actionLoading === message.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-darker-teal">No messages found for the selected filter.</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => router.push('/')}
              className="bg-sage hover:bg-sage/90 text-white"
            >
              Back to Main Site
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-sage/30 hover:bg-sage/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const AdminLogin = () => {
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleLogin = async () => {
      setSubmitting(true)
      setError("")
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        if (res.ok) {
          setIsAdminAuthenticated(true)
        } else {
          setError(res.status === 401 ? 'Incorrect password' : 'Login failed')
        }
      } catch {
        setError('Network error')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Card className="w-full max-w-md border-sage/20">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-dark-teal mb-2">Admin Access</h1>
              <p className="text-darker-teal">Enter password to access admin dashboard</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-teal mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="border-sage/30 focus:border-sage"
                />
              </div>
              
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              
              <Button
                onClick={handleLogin}
                className="w-full bg-dark-teal hover:bg-dark-teal/90 text-white"
                disabled={!password || submitting}
              >
                {submitting ? 'Signing in…' : 'Access Admin Dashboard'}
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-sage/30 hover:bg-sage/10"
              >
                Back to Main Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dark-teal" />
      </div>
    )
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin />
  }

  return <AdminDashboard />
}
