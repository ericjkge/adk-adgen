"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  ArrowRight,
  CheckCircle,
  BarChart3,
  FileText,
  Video,
  Loader2,
  Download,
  Package,
  Tag,
  DollarSign,
  TrendingUp,
  Users
} from "lucide-react"

interface VideoSession {
  session_id: string
  user_id: string
  status: string
  step: string
  metadata?: any
  market_analysis?: any
  script?: any
  video_url?: string
  awaiting_feedback?: boolean
}

export function VideoGenerationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [productUrl, setProductUrl] = useState("")
  const [session, setSession] = useState<VideoSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState("")

  const steps = [
    { id: 1, name: "Input", icon: Play },
    { id: 2, name: "Product Info", icon: CheckCircle },
    { id: 3, name: "Market Analysis", icon: BarChart3 },
    { id: 4, name: "Script Review", icon: FileText },
    { id: 5, name: "Video Result", icon: Video }
  ]

  const startGeneration = async () => {
    if (!productUrl.trim()) return
    
    setIsLoading(true)
    console.log("Starting video generation for:", productUrl)
    
    try {
      // Step 1: Create a session for the manager agent
      console.log("Creating session...")
      const sessionResponse = await fetch("/api/adk/apps/manager/users/user_123/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
      
      if (!sessionResponse.ok) {
        throw new Error(`Failed to create session: ${sessionResponse.status}`)
      }
      
      const sessionData = await sessionResponse.json()
      console.log("Session created:", sessionData.id)
      
      // Step 2: Call the manager agent to run analysis agent (extraction + save)
      console.log("Calling manager agent to run analysis agent...")
      const runResponse = await fetch("/api/adk/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: "user_123", 
          sessionId: sessionData.id,
          newMessage: {
            role: "user",
            parts: [{
              text: `Run analysis agent to extract product metadata from this URL: ${productUrl}`
            }]
          }
        }),
      })
      
      if (!runResponse.ok) {
        throw new Error(`Failed to call manager agent: ${runResponse.status}`)
      }
      
      const events = await runResponse.json()
      console.log("Manager agent response events:", events)
      
      // Process the events to extract metadata from analysis agent
      let extractedMetadata = null
      for (const event of events) {
        console.log("Processing event:", event)
        
        // Look for extraction agent output in the event content
        if (event.content && event.content.parts) {
          for (const part of event.content.parts) {
            if (part.text) {
              try {
                // Try to parse JSON from the text response
                const jsonMatch = part.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.brand || parsed.product_name) {
                    extractedMetadata = parsed;
                    break;
                  }
                }
              } catch (e) {
                // Continue if not valid JSON
                console.log("Failed to parse JSON from extraction response:", e)
              }
            }
          }
        }
        
        if (extractedMetadata) break;
      }
      
      if (extractedMetadata) {
        console.log("Extracted metadata:", extractedMetadata)
        setSession({
          session_id: sessionData.id,
          user_id: "user_123",
          status: "processing",
          step: "extraction_complete",
          metadata: extractedMetadata
        })
        setCurrentStep(2)
      } else {
        // Fallback to mock data if extraction failed
        console.log("Using fallback metadata - extraction may have failed")
        setSession({
          session_id: sessionData.id,
          user_id: "user_123", 
          status: "processing",
          step: "extraction",
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
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error("Error starting generation:", error)
      setIsLoading(false)
      
      // Show error to user
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`)
    }
  }

  const continueToMarketAnalysis = async () => {
    if (!session?.session_id || !session?.metadata) return
    
    setIsLoading(true)
    console.log("Loading market analysis...")
    
    try {
      // Call the manager agent to perform market analysis
      console.log("Calling manager agent for market analysis...")
      const runResponse = await fetch("/api/adk/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: "user_123", 
          sessionId: session.session_id,
          newMessage: {
            role: "user",
            parts: [{
              text: `Perform market analysis for this product: ${JSON.stringify(session.metadata)}`
            }]
          }
        }),
      })
      
      if (!runResponse.ok) {
        throw new Error(`Failed to call market agent: ${runResponse.status}`)
      }
      
      const events = await runResponse.json()
      console.log("Market analysis events:", events)
      
      // Process the events to extract market analysis
      let extractedMarketAnalysis = null
      for (const event of events) {
        console.log("Processing market event:", event)
        
        // Look for market analysis in the event content
        if (event.content && event.content.parts) {
          for (const part of event.content.parts) {
            if (part.text) {
              try {
                // Try to parse JSON from the text response
                const jsonMatch = part.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.market_size || parsed.market_trends || parsed.audience_insights) {
                    extractedMarketAnalysis = parsed;
                    break;
                  }
                }
              } catch (e) {
                // Continue if not valid JSON
                console.log("Failed to parse JSON from market response:", e)
              }
            }
          }
        }
        
        if (extractedMarketAnalysis) break;
      }
      
      if (extractedMarketAnalysis) {
        console.log("Extracted market analysis:", extractedMarketAnalysis)
        setSession(prev => prev ? {
          ...prev,
          market_analysis: extractedMarketAnalysis
        } : null)
      } else {
        // Fallback to mock data if extraction failed
        console.log("Using fallback market analysis data")
        setSession(prev => prev ? {
          ...prev,
          market_analysis: {
            market_size: "The wireless audio market is growing at 12% annually",
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
              psychographics: "Tech-savvy, music-loving consumers who value premium audio quality and convenience."
            },
            competitors: [
              {
                name: "Sony WH-1000XM5",
                brand: "Sony",
                price: "$399",
                features: "Industry-leading noise cancellation, 30-hour battery",
                description: "Premium over-ear headphones with exceptional noise cancellation"
              },
              {
                name: "Bose QuietComfort Earbuds",
                brand: "Bose", 
                price: "$279",
                features: "World-class noise cancellation, secure fit",
                description: "Premium earbuds known for superior noise cancellation"
              }
            ]
          }
        } : null)
      }
      
      setCurrentStep(3)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading market analysis:", error)
      setIsLoading(false)
      
      // Show error to user
      alert(`Error loading market analysis: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`)
    }
  }

  const continueToScript = async () => {
    setIsLoading(true)
    console.log("Generating script...")
    
    try {
      // TODO: Replace with actual ADK API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSession(prev => prev ? {
        ...prev,
        script: {
          audio_script: "Introducing the revolutionary AirPods Pro - the perfect blend of premium audio and cutting-edge technology. With industry-leading active noise cancellation and spatial audio, transform your listening experience. Experience the future of wireless audio with AirPods Pro.",
          video_script: "Opening shot: Sleek AirPods Pro in case. Cut to: Person wearing them in busy environment. Show: Noise cancellation visualization. Highlight: Spatial audio demonstration. Close-up: Premium design details. Final shot: Happy user enjoying music."
        },
        awaiting_feedback: true
      } : null)
      
      setCurrentStep(4)
      setIsLoading(false)
    } catch (error) {
      console.error("Error generating script:", error)
      setIsLoading(false)
    }
  }

  const submitFeedback = async () => {
    setIsLoading(true)
    console.log("Submitting feedback:", feedback)
    
    try {
      // TODO: Replace with actual ADK API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setSession(prev => prev ? {
        ...prev,
        video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        status: "completed",
        awaiting_feedback: false
      } : null)
      
      setCurrentStep(5)
      setIsLoading(false)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setIsLoading(false)
    }
  }

  const skipFeedback = async () => {
    setIsLoading(true)
    console.log("Skipping feedback, generating video...")
    
    try {
      // TODO: Replace with actual ADK API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setSession(prev => prev ? {
        ...prev,
        video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        status: "completed",
        awaiting_feedback: false
      } : null)
      
      setCurrentStep(5)
      setIsLoading(false)
    } catch (error) {
      console.error("Error generating video:", error)
      setIsLoading(false)
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setProductUrl("")
    setSession(null)
    setIsLoading(false)
    setFeedback("")
  }

  // Step 1: URL Input
  const renderInputStep = () => (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Create Video Ad</h1>
        <p className="text-gray-400">Enter your product URL to get started</p>
      </div>

      <div className="space-y-6">
        <Input
          placeholder="Paste your product URL here..."
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          className="bg-gray-900/50 backdrop-blur-sm border-gray-600/30 text-white placeholder-gray-500 h-16 text-lg px-6 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
          disabled={isLoading}
        />

        <Button
          onClick={startGeneration}
          disabled={isLoading || !productUrl.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-medium transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
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
        <CardContent className="p-8">
          {session?.metadata ? (
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
          ) : (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
              <h3 className="text-white font-semibold text-xl mb-3">Extracting Product Information...</h3>
              <p className="text-gray-400 text-base">Analyzing your product details</p>
            </div>
          )}

          {session?.metadata && (
            <>
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
                  onClick={continueToMarketAnalysis}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Continue to Market Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
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
          {isLoading ? (
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
                  <div className="space-y-6 text-gray-300">
                    {session.market_analysis.market_size && (
                      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                        <h5 className="text-blue-300 font-semibold mb-2">Market Size</h5>
                        <p className="text-gray-300">{session.market_analysis.market_size}</p>
                      </div>
                    )}
                    <div>
                      <h5 className="text-white font-semibold mb-4">Key Trends</h5>
                      {session.market_analysis.market_trends.map((trend: string, idx: number) => (
                        <div key={idx} className="mb-3 flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-300">{trend}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audience" className="mt-8">
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                  <h4 className="text-white font-bold text-xl mb-6">Audience Insights</h4>
                  <div className="space-y-4 text-gray-300">
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
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="competitors" className="mt-8">
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                  <h4 className="text-white font-bold text-xl mb-6">Competitor Analysis</h4>
                  <div className="space-y-4 text-gray-300">
                    {session.market_analysis.competitors.map((competitor: any, idx: number) => (
                      <div key={idx} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-white font-medium">{competitor.name}</h5>
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
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Market analysis will appear here once complete...
            </div>
          )}

          {!isLoading && session?.market_analysis && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={continueToScript}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue to Script
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
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
                        disabled={!feedback.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Video...
                          </>
                        ) : (
                          "Submit Feedback & Generate Video"
                        )}
                      </Button>
                      <Button
                        onClick={skipFeedback}
                        disabled={isLoading}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-6 py-3 font-semibold transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Video...
                          </>
                        ) : (
                          "Approve Script & Generate Video"
                        )}
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
      </div>
    </div>
  )
} 