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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  Users,
  BarChart3,
  FileText,
  Video,
  Loader2,
  Download,
  Package,
  Tag,
  DollarSign
} from "lucide-react"

interface VideoGenerationSession {
  session_id: string
  status: string
  step: string
  message: string
  metadata?: any
  market_analysis?: any
  script?: {
    audio_script: string
    video_script: string
  }
  video_url?: string
  awaiting_feedback: boolean
}

export function VideoGenerationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [productUrl, setProductUrl] = useState("")
  const [avatarId, setAvatarId] = useState("Raul_sitting_casualsofawithipad_front")
  const [voiceId, setVoiceId] = useState("beaa640abaa24c32bea33b280d2f5ea3")
  const [session, setSession] = useState<VideoGenerationSession | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [demoMode, setDemoMode] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)

  const steps = [
    { id: 1, name: "Input", icon: Play },
    { id: 2, name: "Product Info", icon: CheckCircle },
    { id: 3, name: "Market Analysis", icon: BarChart3 },
    { id: 4, name: "Script Review", icon: FileText },
    { id: 5, name: "Video Result", icon: Video }
  ]

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connectWebSocket = (sessionId: string) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${sessionId}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      // Move to product info step when metadata is available
      if (data.metadata && currentStep < 2) {
        setSession(prev => prev ? { ...prev, ...data } : null)
        setCurrentStep(2)
        setIsGenerating(false)
      }
      
      // Move to market analysis step when data is available
      if (data.market_analysis && currentStep < 3) {
        setSession(prev => prev ? { ...prev, ...data } : null)
        setCurrentStep(3)
        setIsGenerating(false)
      }
      
      if (data.status === 'awaiting_feedback' && data.script) {
        setSession(prev => prev ? { ...prev, script: data.script, awaiting_feedback: true } : null)
        setCurrentStep(4) // Move to script review step
        setIsGenerating(false)
      }
      
      if (data.status === 'completed' && data.video_url) {
        setSession(prev => prev ? { ...prev, video_url: data.video_url, status: 'completed' } : null)
        setCurrentStep(5) // Move to final video step
        setIsGenerating(false)
      }

      // Update session with any new data
      setSession(prev => prev ? { ...prev, ...data } : null)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    wsRef.current = ws
  }

  const startGeneration = async () => {
    if (!productUrl.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch('http://localhost:8000/api/start-generation', {
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
      setCurrentStep(2) // Move to product info step

    } catch (error) {
      console.error('Error starting generation:', error)
      // Enable demo mode if backend is not available
      setDemoMode(true)
      setIsGenerating(false)
      setTimeout(() => {
        setSession({
          session_id: "demo-session",
          status: "running",
          step: "extraction",
          message: "Demo mode - showing UI flow",
          awaiting_feedback: false,
          metadata: {
            brand: "Apple",
            product_name: "AirPods Pro",
            product_category: "wireless earbuds",
            description: "AirPods Pro are high-end wireless earbuds with active noise cancellation and spatial audio.",
            key_features: ["active noise cancellation", "spatial audio", "wireless charging", "transparency mode", "adaptive EQ"],
            price: "$249",
            image_url: "/placeholder.jpg",
            product_url: productUrl
          }
        })
        setCurrentStep(2)
      }, 1500)


    }
  }

  const submitFeedback = async () => {
    if (!session || !feedback.trim()) return

    if (demoMode) {
      // Demo mode - simulate feedback processing
      setIsGenerating(true)
      setSession(prev => prev ? { ...prev, awaiting_feedback: false } : null)
      setFeedback("")
      
      setTimeout(() => {
        setSession(prev => prev ? { 
          ...prev, 
          script: {
            audio_script: "Discover the EcoSmart Home Device - your gateway to sustainable living! " + feedback + " With cutting-edge technology and eco-conscious design, revolutionize your home experience. Smart automation meets environmental responsibility. Join the green revolution today with EcoSmart!",
            video_script: "Updated script based on feedback: Dynamic product showcase. Environmental benefits highlight. User testimonials. Technology demonstration. Call-to-action with sustainability message."
          },
          awaiting_feedback: true
        } : null)
        setIsGenerating(false)
      }, 2000)
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/script-feedback', {
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
      setIsGenerating(true)

    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const skipFeedback = async () => {
    if (!session) return
    
    if (demoMode) {
      // Demo mode - skip to video result
      setSession(prev => prev ? { 
        ...prev, 
        awaiting_feedback: false,
        status: 'completed',
        video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
      } : null)
      setCurrentStep(4)
      return
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/script-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          feedback: ""
        })
      })

      if (!response.ok) throw new Error('Failed to skip feedback')

      setSession(prev => prev ? { ...prev, awaiting_feedback: false } : null)
      setIsGenerating(true)

    } catch (error) {
      console.error('Error skipping feedback:', error)
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setProductUrl("")
    setSession(null)
    setIsGenerating(false)
    setFeedback("")
    if (wsRef.current) {
      wsRef.current.close()
    }
  }

  // Step 1: URL Input
  const renderInputStep = () => (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Create Video Ad</h1>
        <p className="text-gray-400">Enter your product URL to get started</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Input
            placeholder="Paste your product URL here..."
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="bg-gray-900/50 backdrop-blur-sm border-gray-600/30 text-white placeholder-gray-500 h-16 text-lg px-6 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
            disabled={isGenerating}
          />
        </div>

        <Button
          onClick={startGeneration}
          disabled={isGenerating || !productUrl.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-medium transition-all duration-200 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Generate Video
            </>
          )}
        </Button>
      </div>
    </div>
  )

  // Step 2: Product Information
  const renderProductInfoStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Product Information</h2>
        <p className="text-gray-400">Extracted details about your product</p>
      </div>

      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-600/30">
        <CardContent>
          {isGenerating || !session?.metadata ? (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
              <h3 className="text-white font-semibold text-xl mb-3">Extracting Product Information...</h3>
              <p className="text-gray-400 text-base">Analyzing your product details</p>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                  <img 
                    src={session.metadata.image_url || "/placeholder.jpg"}
                    alt={session.metadata.product_name}
                    className="w-full h-64 object-cover rounded-lg border border-gray-600/30"
                  />
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-blue-400" />
                      <span className="text-sm font-medium text-gray-300">Product Name</span>
                    </div>
                    <p className="text-xl font-bold text-white">{session.metadata.product_name}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-5 w-5 text-blue-400" />
                      <span className="text-sm font-medium text-gray-300">Brand</span>
                    </div>
                    <p className="text-lg text-white">{session.metadata.brand}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                      <span className="text-sm font-medium text-gray-300">Price</span>
                    </div>
                    <p className="text-lg font-semibold text-green-400">{session.metadata.price}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-300 mb-2 block">Category</span>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                      {session.metadata.product_category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-600/30">
                <span className="text-sm font-medium text-gray-300 mb-3 block">Description</span>
                <p className="text-gray-100 leading-relaxed">
                  {session.metadata.description}
                </p>
              </div>

              {session.metadata.key_features && session.metadata.key_features.length > 0 && (
                <div className="mt-6">
                  <span className="text-sm font-medium text-gray-300 mb-3 block">Key Features</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {session.metadata.key_features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-100">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                             <div className="mt-8 flex justify-end">
                 <Button 
                   onClick={() => {
                     if (demoMode) {
                       // Add demo market analysis when continuing
                       setSession(prev => prev ? {
                         ...prev,
                         step: "analysis",
                         market_analysis: {
                           market_trends: [
                             "The wireless audio market is growing at 12% annually",
                             "Consumer preference for premium audio features has increased 35% this year",
                             "Active noise cancellation is becoming a standard feature"
                           ],
                           audience_insights: {
                             demographics: {
                               age: "18-45 years",
                               income: "$40,000-$120,000",
                               gender: "55% male, 45% female",
                               education: "College-educated"
                             },
                             psychographics: "Tech-savvy, music-loving consumers who value premium audio quality and convenience. They're willing to pay premium for advanced features and seamless integration."
                           },
                           competitors: [
                             {
                               name: "Sony WH-1000XM5",
                               brand: "Sony",
                               price: "$399",
                               features: "Industry-leading noise cancellation, 30-hour battery, premium comfort",
                               description: "Premium over-ear headphones with exceptional noise cancellation"
                             },
                             {
                               name: "Bose QuietComfort Earbuds",
                               brand: "Bose",
                               price: "$279",
                               features: "World-class noise cancellation, secure fit, weather resistance",
                               description: "Premium earbuds known for superior noise cancellation"
                             },
                             {
                               name: "Samsung Galaxy Buds Pro",
                               brand: "Samsung",
                               price: "$199",
                               features: "Active noise cancellation, 360 Audio, seamless device switching",
                               description: "Feature-rich earbuds with excellent integration"
                             }
                           ]
                         }
                       } : null)
                       setCurrentStep(3)
                     }
                   }}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                   disabled={!demoMode}
                 >
                   Continue to Market Analysis
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Step 3: Market Analysis
  const renderMarketAnalysisStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Market Analysis</h2>
        <p className="text-gray-400">Understanding your product's market landscape</p>
      </div>
      
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-600/30">
        <CardContent>
          {isGenerating ? (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
              <h3 className="text-white font-semibold text-xl mb-3">Analyzing Market Data...</h3>
              <p className="text-gray-400 text-base">This may take a few moments</p>
            </div>
          ) : session?.market_analysis ? (
            <Tabs defaultValue="trends" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 p-1 rounded-lg">
                <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Market Trends
                </TabsTrigger>
                <TabsTrigger value="audience" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  Audience Insights
                </TabsTrigger>
                <TabsTrigger value="competitors" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Competitor Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="mt-8">
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                  <h4 className="text-white font-bold text-xl mb-6">Market Trends</h4>
                  <div className="space-y-4 text-gray-300">
                    {session?.market_analysis?.market_trends ? (
                      <div>
                        {Array.isArray(session.market_analysis.market_trends) ? (
                          session.market_analysis.market_trends.map((trend: any, idx: number) => (
                            <div key={idx} className="mb-3">
                              <h5 className="text-white font-medium mb-1">{trend.title || `Trend ${idx + 1}`}</h5>
                              <p className="text-gray-300">{trend.description || trend}</p>
                            </div>
                          ))
                        ) : (
                          <p>{session.market_analysis.market_trends}</p>
                        )}
                      </div>
                    ) : (
                      <p>Market size analysis and trending topics will appear here...</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audience" className="mt-8">
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                  <h4 className="text-white font-bold text-xl mb-6">Audience Insights</h4>
                  <div className="space-y-4 text-gray-300">
                    {session?.market_analysis?.audience_insights ? (
                      <div className="space-y-3">
                        {session.market_analysis.audience_insights.demographics && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Demographics</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {Object.entries(session.market_analysis.audience_insights.demographics).map(([key, value]: [string, any]) => (
                                <div key={key}>
                                  <span className="text-gray-400 capitalize">{key}: </span>
                                  <span className="text-gray-300">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {session.market_analysis.audience_insights.psychographics && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Psychographics</h5>
                            <p className="text-gray-300">{session.market_analysis.audience_insights.psychographics}</p>
                          </div>
                        )}
                        {typeof session.market_analysis.audience_insights === 'string' && (
                          <p>{session.market_analysis.audience_insights}</p>
                        )}
                      </div>
                    ) : (
                      <p>Target audience demographics and preferences will appear here...</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="competitors" className="mt-8">
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                  <h4 className="text-white font-bold text-xl mb-6">Competitor Analysis</h4>
                  <div className="space-y-4 text-gray-300">
                    {session?.market_analysis?.competitors ? (
                      <div className="space-y-4">
                        {Array.isArray(session.market_analysis.competitors) ? (
                          session.market_analysis.competitors.map((competitor: any, idx: number) => (
                            <div key={idx} className="border border-white/10 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="text-white font-medium">{competitor.name || competitor.brand}</h5>
                                {competitor.price && (
                                  <Badge variant="outline" className="text-green-400 border-green-400">
                                    {competitor.price}
                                  </Badge>
                                )}
                              </div>
                              {competitor.description && (
                                <p className="text-gray-300 text-sm mb-2">{competitor.description}</p>
                              )}
                              {competitor.features && (
                                <div className="text-sm">
                                  <span className="text-gray-400">Key Features: </span>
                                  <span className="text-gray-300">{competitor.features}</span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p>{session.market_analysis.competitors}</p>
                        )}
                      </div>
                    ) : (
                      <p>Competitor analysis and market positioning will appear here...</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Market analysis will appear here once complete...
            </div>
          )}

          {!isGenerating && session?.market_analysis && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => {
                  if (demoMode) {
                    // Add demo script data
                    setSession(prev => prev ? {
                      ...prev,
                      script: {
                        audio_script: "Introducing the revolutionary EcoSmart Home Device - the perfect blend of sustainability and technology. With advanced smart features and eco-friendly design, transform your home into an intelligent, green sanctuary. Experience the future of home automation while reducing your carbon footprint. EcoSmart - where innovation meets responsibility.",
                        video_script: "Opening shot: Modern smart home exterior. Cut to: Device installation montage. Show: Smart controls on phone app. Highlight: Energy savings dashboard. Close-up: Sleek device design. Final shot: Happy family using the device."
                      },
                      awaiting_feedback: true
                    } : null)
                  }
                  setCurrentStep(4)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue to Script
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Step 4: Script Review
  const renderScriptStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Script Review</h2>
        <p className="text-gray-400">Review and refine your video script</p>
      </div>
      
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-600/30">
        <CardContent className="space-y-8">
          {session?.script ? (
            <>
              {/* Generated Script Display */}
              <div className="space-y-6">
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-blue-400" />
                    Audio Script (A-roll)
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-base">
                    {session.script.audio_script}
                  </p>
                </div>
                
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center">
                    <Video className="w-6 h-6 mr-3 text-blue-400" />
                    Video Script (B-roll)
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-base">
                    {session.script.video_script}
                  </p>
                </div>
              </div>

              {/* Feedback Section */}
              {session.awaiting_feedback && (
                <div className="border-t border-gray-700 pt-8">
                  <h4 className="text-white font-bold text-xl mb-6">Provide Feedback (Optional)</h4>
                  
                  <div className="space-y-6">
                    <Textarea
                      placeholder="Enter your feedback to improve the script, or leave blank to approve as-is..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[140px] focus:border-blue-500 focus:ring-blue-500 text-base"
                      rows={5}
                    />
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={submitFeedback}
                        disabled={!feedback.trim() || isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          "Submit Feedback & Regenerate"
                        )}
                      </Button>
                      <Button
                        onClick={skipFeedback}
                        disabled={isGenerating}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-6 py-3 font-semibold transition-all duration-200"
                      >
                        Approve Script & Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
              <h3 className="text-white font-semibold text-xl mb-3">Generating Script...</h3>
              <p className="text-gray-400 text-base">Creating your personalized video script</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Step 5: Video Result
  const renderVideoStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Your Video is Ready!</h2>
        <p className="text-gray-400">Your AI-generated video ad is complete</p>
      </div>
      
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-600/30">
        <CardContent>
          {session?.video_url ? (
            <div className="space-y-8">
              <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                <video 
                  controls 
                  className="w-full rounded-lg shadow-2xl shadow-black/30"
                  src={session.video_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="flex space-x-6 justify-center">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => window.open(session.video_url, '_blank')}
                >
                  <Download className="w-5 h-5 mr-3" />
                  Download Video
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 py-4 font-semibold transition-all duration-200"
                  onClick={resetWizard}
                >
                  Create Another Video
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
              <h3 className="text-white font-semibold text-xl mb-3">Generating Your Video...</h3>
              <p className="text-gray-400 text-base">This may take a few minutes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white font-inter overflow-y-auto antialiased">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-16">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px ml-6 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[600px]">
          {currentStep === 1 && renderInputStep()}
          {currentStep === 2 && renderProductInfoStep()}
          {currentStep === 3 && renderMarketAnalysisStep()}
          {currentStep === 4 && renderScriptStep()}
          {currentStep === 5 && renderVideoStep()}
        </div>

        {/* Demo Navigation - Only show when in demo mode or when URL is entered */}
        {(demoMode || productUrl.trim()) && (
          <div className="mt-8 border-t border-gray-800 pt-6">
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Step
              </Button>
              
              {demoMode && (
                <Badge variant="outline" className="text-blue-400 border-blue-400 px-3 py-1">
                  Demo Mode - UI Preview
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextStep = Math.min(4, currentStep + 1)
                  if (nextStep === 2 && !session?.market_analysis && demoMode) {
                    // Add market analysis data for demo
                    setSession(prev => prev ? {
                      ...prev,
                      market_analysis: {
                        market_trends: [
                          "The sustainable technology market is growing at 15% annually",
                          "Consumer preference for eco-friendly products has increased 40% this year"
                        ],
                        audience_insights: {
                          demographics: { age: "25-45 years", income: "$50,000-$100,000" },
                          psychographics: "Tech-savvy, environmentally conscious consumers"
                        },
                        competitors: [
                          { name: "EcoTech Pro", price: "$299", features: "Solar powered, smart connectivity" }
                        ]
                      }
                    } : null)
                  }
                  if (nextStep === 3 && !session?.script && demoMode) {
                    // Add script data for demo
                    setSession(prev => prev ? {
                      ...prev,
                      script: {
                        audio_script: "Demo audio script for testing UI...",
                        video_script: "Demo video script for testing UI..."
                      },
                      awaiting_feedback: true
                    } : null)
                  }
                  if (nextStep === 4 && !session?.video_url && demoMode) {
                    // Add video data for demo
                    setSession(prev => prev ? {
                      ...prev,
                      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                      status: 'completed'
                    } : null)
                  }
                  setCurrentStep(nextStep)
                }}
                disabled={currentStep === 4}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 