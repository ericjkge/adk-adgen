"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Video,
  FileText,
  Settings,
  Loader2
} from "lucide-react"

interface GenerationStep {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  message?: string
}

interface VideoGenerationSession {
  session_id: string
  status: string
  step: string
  message: string
  script?: {
    audio_script: string
    video_script: string
  }
  video_url?: string
  awaiting_feedback: boolean
}

export function VideoGenerator() {
  const [productUrl, setProductUrl] = useState("")
  const [avatarId, setAvatarId] = useState("Raul_sitting_casualsofawithipad_front")
  const [voiceId, setVoiceId] = useState("beaa640abaa24c32bea33b280d2f5ea3")
  const [session, setSession] = useState<VideoGenerationSession | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [statusLogs, setStatusLogs] = useState<string[]>([])
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'extraction', name: 'Extract Product Data', status: 'pending' },
    { id: 'market_analysis', name: 'Market Research', status: 'pending' },
    { id: 'script_generation', name: 'Generate Script', status: 'pending' },
    { id: 'script_review', name: 'Script Review', status: 'pending' },
    { id: 'video_generation', name: 'Generate Video', status: 'pending' },
    { id: 'processing', name: 'Final Processing', status: 'pending' },
  ])
  
  const wsRef = useRef<WebSocket | null>(null)
  const statusLogRef = useRef<HTMLDivElement>(null)

  const addStatusLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setStatusLogs(prev => {
      const newLogs = [...prev, `${timestamp}: ${message}`]
      // Auto-scroll to bottom
      setTimeout(() => {
        if (statusLogRef.current) {
          statusLogRef.current.scrollTop = statusLogRef.current.scrollHeight
        }
      }, 100)
      return newLogs
    })
  }

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connectWebSocket = (sessionId: string) => {
    const ws = new WebSocket(`ws://localhost:8002/ws/${sessionId}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      // Add status message to logs
      addStatusLog(`[${data.step || 'system'}] ${data.message}`)
      
      updateStepStatus(data.step, data.status === 'completed' ? 'completed' : 'processing', data.message)
      
      if (data.status === 'awaiting_feedback' && data.script) {
        setSession(prev => prev ? { ...prev, script: data.script, awaiting_feedback: true } : null)
        addStatusLog("📄 Script generated! Review and provide feedback.")
      }
      
      if (data.status === 'completed' && data.video_url) {
        setSession(prev => prev ? { ...prev, video_url: data.video_url, status: 'completed' } : null)
        setIsGenerating(false)
        addStatusLog("✅ Video generation completed!")
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      addStatusLog("❌ WebSocket connection error")
    }
    
    ws.onopen = () => {
      addStatusLog("🔗 Connected to backend")
    }
    
    ws.onclose = () => {
      addStatusLog("🔌 Disconnected from backend")
    }
    
    wsRef.current = ws
  }

  const updateStepStatus = (stepId: string, status: 'processing' | 'completed' | 'error', message?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ))
  }

  const startGeneration = async () => {
    if (!productUrl.trim()) return

    setIsGenerating(true)
    setStatusLogs([]) // Clear previous logs
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))
    
    addStatusLog("🚀 Starting video generation...")

    try {
      const response = await fetch('http://localhost:8002/api/start-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_url: productUrl,
          avatar_id: avatarId,
          voice_id: voiceId,
          width: 1280,
          height: 720
        })
      })

      if (!response.ok) throw new Error('Failed to start generation')

      const data = await response.json()
      setSession({
        session_id: data.session_id,
        status: data.status,
        step: 'extraction',
        message: data.message,
        awaiting_feedback: false
      })

      connectWebSocket(data.session_id)
      updateStepStatus('extraction', 'processing', 'Starting extraction...')

    } catch (error) {
      console.error('Error starting generation:', error)
      setIsGenerating(false)
    }
  }

  const submitFeedback = async () => {
    if (!session || !feedback.trim()) return

    try {
      const response = await fetch('http://localhost:8002/api/script-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          feedback: feedback
        })
      })

      if (!response.ok) throw new Error('Failed to submit feedback')

      setSession(prev => prev ? { ...prev, awaiting_feedback: false } : null)
      setFeedback("")
      updateStepStatus('script_review', 'completed', 'Feedback submitted')
      updateStepStatus('video_generation', 'processing', 'Generating video with feedback...')

    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const skipFeedback = async () => {
    if (!session) return
    
    try {
      const response = await fetch('http://localhost:8002/api/script-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          feedback: ""
        })
      })

      if (!response.ok) throw new Error('Failed to skip feedback')

      setSession(prev => prev ? { ...prev, awaiting_feedback: false } : null)
      updateStepStatus('script_review', 'completed', 'Script approved')
      updateStepStatus('video_generation', 'processing', 'Generating video...')

    } catch (error) {
      console.error('Error skipping feedback:', error)
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'processing': return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
    }
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length
  const progressPercentage = (completedSteps / steps.length) * 100

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Video Generator</h1>
        <p className="text-gray-400">Create professional video ads from product URLs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="product-url" className="text-white">
                  Product URL *
                </Label>
                <Input
                  id="product-url"
                  placeholder="https://example.com/product"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <Label htmlFor="avatar" className="text-white">
                  Avatar
                </Label>
                <Select value={avatarId} onValueChange={setAvatarId} disabled={isGenerating}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raul_sitting_casualsofawithipad_front">Raul (Casual)</SelectItem>
                    <SelectItem value="other_avatar_id">Other Avatar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="voice" className="text-white">
                  Voice
                </Label>
                <Select value={voiceId} onValueChange={setVoiceId} disabled={isGenerating}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beaa640abaa24c32bea33b280d2f5ea3">Default Voice</SelectItem>
                    <SelectItem value="other_voice_id">Other Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startGeneration}
                disabled={isGenerating || !productUrl.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Generation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Generation Progress</CardTitle>
              <Progress value={progressPercentage} className="w-full" />
            </CardHeader>
            <CardContent>
              {session ? (
                <Tabs defaultValue="progress" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/10">
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="logs">Status Log</TabsTrigger>
                    <TabsTrigger value="script" disabled={!session.script}>Script</TabsTrigger>
                    <TabsTrigger value="result" disabled={!session.video_url}>Result</TabsTrigger>
                  </TabsList>

                  <TabsContent value="progress" className="mt-6">
                    <div className="space-y-4">
                      {steps.map((step) => (
                        <div key={step.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                          {getStepIcon(step.status)}
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{step.name}</h4>
                            {step.message && (
                              <p className="text-gray-400 text-sm">{step.message}</p>
                            )}
                          </div>
                          <Badge 
                            variant={step.status === 'completed' ? 'default' : 'secondary'}
                            className={
                              step.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              step.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                              step.status === 'error' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }
                          >
                            {step.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="logs" className="mt-6">
                    <div 
                      ref={statusLogRef}
                      className="bg-black/20 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm border border-green-500/20"
                    >
                      <div className="text-green-400 mb-2 sticky top-0 bg-black/80 pb-1">
                        🔍 Real-time Backend Status:
                      </div>
                      {statusLogs.length === 0 ? (
                        <div className="text-gray-500">Waiting for status updates...</div>
                      ) : (
                        <div className="space-y-1">
                          {statusLogs.map((log, index) => (
                            <div key={index} className="text-gray-300 break-words leading-relaxed">
                              {log}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
                      <span>💡 This shows real-time messages from the ADK agents on the backend</span>
                      <span className="text-green-400">🟢 Live</span>
                    </div>
                  </TabsContent>

                  <TabsContent value="script" className="mt-6">
                    {session.script ? (
                      <div className="space-y-6">
                        <div className="bg-white/10 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Audio Script (A-roll)
                          </h4>
                          <p className="text-gray-300 leading-relaxed">{session.script.audio_script}</p>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2 flex items-center">
                            <Video className="w-4 h-4 mr-2" />
                            Video Script (B-roll)
                          </h4>
                          <p className="text-gray-300 leading-relaxed">{session.script.video_script}</p>
                        </div>

                        {session.awaiting_feedback && (
                          <div className="space-y-4">
                            <Alert className="border-yellow-500/30 bg-yellow-500/10">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-yellow-200">
                                Review the script and provide feedback, or approve to continue.
                              </AlertDescription>
                            </Alert>
                            
                            <div>
                              <Label htmlFor="feedback" className="text-white">
                                Feedback (optional)
                              </Label>
                              <Textarea
                                id="feedback"
                                placeholder="Enter your feedback for script improvements..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                rows={4}
                              />
                            </div>
                            
                            <div className="flex space-x-3">
                              <Button
                                onClick={submitFeedback}
                                disabled={!feedback.trim()}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Submit Feedback
                              </Button>
                              <Button
                                onClick={skipFeedback}
                                variant="outline"
                                className="border-white/20 text-gray-300 hover:bg-white/10"
                              >
                                Approve Script
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        Script will appear here once generated...
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="result" className="mt-6">
                    {session.video_url ? (
                      <div className="space-y-4">
                        <div className="bg-white/10 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-4">Your Generated Video</h4>
                          <video 
                            controls 
                            className="w-full rounded-lg"
                            src={session.video_url}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          <Download className="w-4 h-4 mr-2" />
                          Download Video
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        Video will appear here once generated...
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Enter a product URL and click "Start Generation" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 