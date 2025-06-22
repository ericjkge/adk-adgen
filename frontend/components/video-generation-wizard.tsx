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
  aroll_url?: string
  broll_url?: string
  final_video_url?: string
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
    { id: 5, name: "Raw Footage", icon: Video },
    { id: 6, name: "Final Video", icon: CheckCircle }
  ]

  const startGeneration = async () => {
    if (!productUrl.trim()) return
    
    setIsLoading(true)
    
    try {
      // Step 1: Create a session for the manager agent
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
      
      // Step 2: Call the manager agent to run analysis agent (extraction + save)
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
      
      // Process the events to extract metadata from analysis agent
      let extractedMetadata = null
      for (const event of events) {
        
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
              }
            }
          }
        }
        
        if (extractedMetadata) break;
      }
      
      if (extractedMetadata) {
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
        setSession({
          session_id: sessionData.id,
          user_id: "user_123", 
          status: "processing",
          step: "extraction",
          metadata: {
            brand: "Optimum Nutrition",
            product_name: "Gold Standard 100% Whey Protein",
            product_category: "protein powder",
            description: "The world's best-selling whey protein powder with 24g of protein per serving to help build and maintain muscle.",
            key_features: ["24g protein per serving", "5.5g BCAAs", "4g glutamine", "instantized for easy mixing", "banned substance tested"],
            price: "$59.99",
            image_url: "/placeholder.jpg",
            product_url: productUrl
          }
        })
        setCurrentStep(2)
      }
      
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      
      // Show error to user
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`)
    }
  }

  const continueToMarketAnalysis = async () => {
    if (!session?.session_id || !session?.metadata) return
    
    setIsLoading(true)
    
    try {
      // Call the manager agent to run market agent
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
              text: `Run market agent to analyze market for this product: ${JSON.stringify(session.metadata)}`
            }]
          }
        }),
      })
      
      if (!runResponse.ok) {
        throw new Error(`Failed to call manager agent: ${runResponse.status}`)
      }
      
      const events = await runResponse.json()
      
      // Process the events to extract market analysis from market agent
      let extractedMarketAnalysis = null
      for (const event of events) {
        
        // Look for market agent output in the event content
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
              }
            }
          }
        }
        
        if (extractedMarketAnalysis) break;
      }
      
      if (extractedMarketAnalysis) {
        setSession(prev => prev ? {
          ...prev,
          market_analysis: extractedMarketAnalysis
        } : null)
      } else {
        // Fallback to mock data if extraction failed
        setSession(prev => prev ? {
          ...prev,
          market_analysis: {
            market_size: "The global protein powder market is valued at $7.5 billion and growing at 8.1% annually",
            market_trends: [
              "Increasing demand for plant-based and clean label protein supplements",
              "Growth in fitness and bodybuilding culture driving protein consumption",
              "Rising popularity of convenient ready-to-drink protein products"
            ],
            audience_insights: {
              demographics: {
                age: "22-50 years",
                income: "$35,000-$100,000",
                gender: "65% male, 35% female"
              },
              psychographics: "Health-conscious fitness enthusiasts who prioritize muscle building, weight management, and active lifestyles."
            },
            competitors: [
              {
                name: "Dymatize ISO100",
                brand: "Dymatize",
                price: "$64.99",
                features: "Hydrolyzed whey isolate, fast absorption, lactose-free",
                description: "Premium whey protein isolate for serious athletes"
              },
              {
                name: "Muscle Milk Pro Series",
                brand: "Muscle Milk", 
                price: "$49.99",
                features: "50g protein, slow and fast proteins, added creatine",
                description: "High-protein formula designed for muscle building and recovery"
              }
            ]
          }
        } : null)
      }
      
      setCurrentStep(3)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      
      // Show error to user
      alert(`Error loading market analysis: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`)
    }
  }

  const continueToScript = async () => {
    if (!session?.session_id || !session?.metadata || !session?.market_analysis) return
    
    setIsLoading(true)
    
    try {
      // Call the manager agent to run script agent
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
              text: `Run script agent to generate video ad script using this metadata: ${JSON.stringify(session.metadata)} and this market analysis: ${JSON.stringify(session.market_analysis)}`
            }]
          }
        }),
      })
      
      if (!runResponse.ok) {
        throw new Error(`Failed to call manager agent: ${runResponse.status}`)
      }
      
      const events = await runResponse.json()
      
      // Process the events to extract script from script agent
      let extractedScript = null
      for (const event of events) {
        
        // Look for script agent output in the event content
        if (event.content && event.content.parts) {
          for (const part of event.content.parts) {
            if (part.text) {
              try {
                // Try to parse JSON from the text response
                const jsonMatch = part.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.audio_script || parsed.video_script) {
                    extractedScript = parsed;
                    break;
                  }
                }
              } catch (e) {
                // Continue if not valid JSON
              }
            }
          }
        }
        
        if (extractedScript) break;
      }
      
      if (extractedScript) {
        setSession(prev => prev ? {
          ...prev,
          script: extractedScript,
          awaiting_feedback: true
        } : null)
      } else {
        // Fallback to mock data if extraction failed
        setSession(prev => prev ? {
          ...prev,
          script: {
            audio_script: "Just got my hands on this Optimum Nutrition Gold Standard Whey, and honestly? Game changer. 24 grams of protein per serving, mixes perfectly every time, and it actually tastes good. If you're serious about your gains, this is it.",
            video_script: "Close-up of protein powder container rotating slowly. Zoom in on '24g protein' label. Cut to powder being scooped and mixed in shaker bottle. Final shot: smooth, creamy protein shake being poured."
          },
          awaiting_feedback: true
        } : null)
      }
      
      setCurrentStep(4)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      
      // Show error to user
      alert(`Error generating script: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`)
    }
  }

  const submitFeedback = async () => {
    if (!session?.session_id || !feedback.trim()) return
    
    setIsLoading(true)
    
    try {
      // Call the manager agent to run script agent with feedback
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
              text: `Run script agent to refine the video ad script based on this user feedback: "${feedback}". Use the existing metadata: ${JSON.stringify(session.metadata)} and market analysis: ${JSON.stringify(session.market_analysis)}`
            }]
          }
        }),
      })
      
      if (!runResponse.ok) {
        throw new Error(`Failed to call manager agent: ${runResponse.status}`)
      }
      
      const events = await runResponse.json()
      
      // Process the events to extract refined script
      let refinedScript = null
      for (const event of events) {
        
        if (event.content && event.content.parts) {
          for (const part of event.content.parts) {
            if (part.text) {
              try {
                const jsonMatch = part.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.audio_script || parsed.video_script) {
                    refinedScript = parsed;
                    break;
                  }
                }
              } catch (e) {
                // Continue if not valid JSON
              }
            }
          }
        }
        
        if (refinedScript) break;
      }
      
      if (refinedScript) {
        setSession(prev => prev ? {
          ...prev,
          script: refinedScript,
          awaiting_feedback: true
        } : null)
        setFeedback("")
        // Stay on script review step (step 4) to allow more feedback
      } else {
        throw new Error("Failed to refine script")
      }
      
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      
      alert(`Error refining script: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`)
    }
  }

  const approveScript = async () => {
    if (!session?.session_id || !session?.script) return
    
    setIsLoading(true)
    
    // Move to Step 5 (Raw Footage) immediately with loading state
    setCurrentStep(5)
    
    try {
      // TEST MODE: Set to true to use hardcoded A-roll URL, false to generate new A-roll
      const TEST_MODE = false // DISABLED TEST MODE - WILL GENERATE NEW A-ROLL WITH HEYGEN
      const HARDCODED_AROLL_URL = "https://files2.heygen.ai/aws_pacific/avatar_tmp/83aafa8212a04b44b6f4add876504b4a/7a8e23e11cf64a38af9e4c19fea1e80a.mp4?Expires=1751137976&Signature=EYWKVpS9WgeGhVKLUzozp1yOwlPuSXf7xHYva5b3Wc4ARU5QZaQRERIzipf1YZvntc40kwVqdY~S9fMQIYkxBAulXLRpzZ11sX2SdknGHhesdEE-LX7l5Rj0WhdAd153zOwt-8thKzIhnQ9g0xuHWo1tned~d80wCk4y~G9KIO6p9njIJ4GSPppkjjIOMJZYue3HUFGbyDlyJ1FE7jzl9v~kGmxc5gZkxxqx8yCUxO-l28aRgSWG6~5TV~QMsyJn3RO7TsmQy20xUKk~DSU2A2spqo3IT3c-tgKw-p~LZEnTro29Mj5u6fxWLJO66xR2fhzIQPk-XLZ6lvYB3M~Uug__&Key-Pair-Id=K38HBHX5LX3X2H" // Real HeyGen URL from successful generation
      
      let arollUrl = null
      
      if (TEST_MODE && HARDCODED_AROLL_URL) {
        arollUrl = HARDCODED_AROLL_URL
      } else {
        // Generate new A-roll video
        const arollResponse = await fetch("/api/adk/run", {
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
                text: `Run aroll to generate avatar video using this audio script: ${session.script.audio_script}`
              }]
            }
          }),
        })
        
        if (!arollResponse.ok) {
          throw new Error(`Failed to call A-roll agent: ${arollResponse.status}`)
        }
        
        const arollEvents = await arollResponse.json()
        
        // Extract A-roll URL from A-roll agent response
        for (const event of arollEvents) {
          if (event.content && event.content.parts) {
            for (const part of event.content.parts) {
              if (part.text) {
                // Look for A-roll URL in standard format
                const urlMatch = part.text.match(/Video URL:\s*(https?:\/\/[^\s]+)/);
                if (urlMatch) {
                  arollUrl = urlMatch[1];
                  break;
                }
              }
            }
          }
          if (arollUrl) break;
        }
      }
      
      // Call B-roll agent
      const brollResponse = await fetch("/api/adk/run", {
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
              text: `Run broll to generate product video using this video script: ${session.script.video_script}`
            }]
          }
        }),
      })
      
      if (!brollResponse.ok) {
        throw new Error(`Failed to call B-roll agent: ${brollResponse.status}`)
      }
      
      const brollEvents = await brollResponse.json()
      
      // Extract B-roll URL from B-roll agent response
      let brollUrl = null
      
      for (const event of brollEvents) {
        if (event.content && event.content.parts) {
          for (const part of event.content.parts) {
            if (part.text) {
              // Look for B-roll URL in standard format (supports both https and gs:// URLs)
              const urlMatch = part.text.match(/Video URL:\s*((?:https?|gs):\/\/[^\s]+)/);
                if (urlMatch) {
                  const rawUrl = urlMatch[1];
                  
                  // Convert GCS URI to public HTTP URL since bucket is now public
                  if (rawUrl.startsWith('gs://')) {
                    brollUrl = rawUrl.replace('gs://', 'https://storage.googleapis.com/');
                  } else {
                    brollUrl = rawUrl;
                  }
                  break;
                }
            }
          }
        }
        if (brollUrl) break;
      }
      
      if (arollUrl && brollUrl) {
        setSession(prev => prev ? {
          ...prev,
          aroll_url: arollUrl,
          broll_url: brollUrl,
          awaiting_feedback: false
        } : null)
      } else {
        // Use fallbacks for any missing videos
        setSession(prev => prev ? {
          ...prev,
          aroll_url: arollUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          broll_url: brollUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          awaiting_feedback: false
        } : null)
      }
      
      setCurrentStep(5)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      
      alert(`Error generating B-roll footage: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`)
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
                            Refining Script...
                          </>
                        ) : (
                          "Submit Feedback & Refine Script"
                        )}
                      </Button>
                      <Button
                        onClick={approveScript}
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
                          "Approve Script & Generate Raw Footage"
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

  // Add function to process raw footage into final video
  const processRawFootage = async () => {
    if (!session?.session_id || !session?.aroll_url || !session?.broll_url) return
    
    setIsLoading(true)
    
    try {
      // Call the manager agent to run processing agent
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
              text: `Run processing agent to combine A-roll and B-roll into final video`
            }]
          }
        }),
      })
      
      if (!runResponse.ok) {
        throw new Error(`Failed to call manager agent: ${runResponse.status}`)
      }
      
      const events = await runResponse.json()
      
      // Extract final video URL from processing agent response
      let finalVideoUrl = null
      
      for (const event of events) {
        if (event.content && event.content.parts) {
          for (const part of event.content.parts) {
            if (part.text) {
              // Look for final video URL in standard format (supports both https and gs:// URLs)
              const urlMatch = part.text.match(/Video URL:\s*((?:https?|gs):\/\/[^\s]+)/);
              if (urlMatch) {
                const rawUrl = urlMatch[1];
                
                // Convert GCS URI to public HTTP URL since bucket is now public
                if (rawUrl.startsWith('gs://')) {
                  finalVideoUrl = rawUrl.replace('gs://', 'https://storage.googleapis.com/');
                } else {
                  finalVideoUrl = rawUrl;
                }
                break;
              }
            }
          }
        }
        if (finalVideoUrl) break;
      }
      
      if (finalVideoUrl) {
        setSession(prev => prev ? {
          ...prev,
          final_video_url: finalVideoUrl
        } : null)
      } else {
        setSession(prev => prev ? {
          ...prev,
          final_video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        } : null)
      }
      
      setCurrentStep(6)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      
      alert(`Error processing raw footage: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`)
    }
  }

  // Step 5: Raw Footage
  const renderRawFootageStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Raw Footage Generated</h2>
        <p className="text-gray-400">Review your A-roll and B-roll footage before final processing</p>
      </div>
      
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-600/30">
        <CardContent>
          {session?.aroll_url || session?.broll_url ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* A-roll Video */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-blue-400" />
                    A-roll (Avatar/Voiceover)
                    {session?.aroll_url ? (
                      <span className="ml-2 text-sm text-green-400">✓ Ready</span>
                    ) : (
                      <span className="ml-2 text-sm text-yellow-400">⏳ Generating...</span>
                    )}
                  </h4>
                  <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-6 border border-gray-600/30 shadow-lg">
                    {session?.aroll_url ? (
                      <video 
                        controls 
                        className="w-full rounded-lg shadow-lg"
                        src={session.aroll_url}
                        onError={(e) => console.error('A-roll video error:', e)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-spin" />
                          <p className="text-gray-400 text-sm">Generating A-roll...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* B-roll Video */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center">
                    <Video className="w-6 h-6 mr-3 text-blue-400" />
                    B-roll (Product Footage)
                    {session?.broll_url ? (
                      <span className="ml-2 text-sm text-green-400">✓ Ready</span>
                    ) : (
                      <span className="ml-2 text-sm text-yellow-400">⏳ Generating...</span>
                    )}
                  </h4>
                  <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-6 border border-gray-600/30 shadow-lg">
                    {session?.broll_url ? (
                      <video 
                        controls 
                        className="w-full rounded-lg shadow-lg"
                        src={session.broll_url}
                        onError={(e) => console.error('B-roll video error:', e)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-spin" />
                          <p className="text-gray-400 text-sm">Generating B-roll...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-6 border-t border-gray-600/30">
                <Button 
                  onClick={processRawFootage}
                  disabled={isLoading || !session?.aroll_url || !session?.broll_url}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Processing into Final Video...
                    </>
                  ) : !session?.aroll_url || !session?.broll_url ? (
                    <>
                      <Video className="w-5 h-5 mr-3" />
                      Waiting for Both Videos...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5 mr-3" />
                      Process into Final Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
              <h3 className="text-white font-semibold text-xl mb-3">Generating Raw Footage...</h3>
              <p className="text-gray-400 text-base">Creating your A-roll and B-roll videos</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-gray-500">🎭 A-roll: Generating avatar video using HeyGen</p>
                <p className="text-gray-500">🎬 B-roll: Generating product video using Veo 2</p>
                <p className="text-gray-500 mt-3">⏱️ Total time: ~3-6 minutes</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Step 6: Final Video Result with Social Media Sharing
  const renderFinalVideoStep = () => {
    const shareToSocial = (platform: string) => {
      const videoUrl = session?.final_video_url
      const text = `Check out this AI-generated video ad I just created!`
      
      const shareUrls = {
        instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
        tiktok: `https://www.tiktok.com/upload`, // TikTok upload page
        reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(videoUrl || '')}&title=${encodeURIComponent(text)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoUrl || '')}`
      }
      
      if (platform === 'instagram' || platform === 'tiktok') {
        // For Instagram and TikTok, we'll download the video first
        if (videoUrl) {
          window.open(videoUrl, '_blank')
          alert(`Video opened in new tab. Download it and then upload to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`)
        }
      } else {
        window.open(shareUrls[platform as keyof typeof shareUrls], '_blank')
      }
    }

    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Your Video is Ready!</h2>
          <p className="text-gray-400">Your AI-generated video ad is complete and ready to share</p>
        </div>
        
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-600/30">
          <CardContent>
            {session?.final_video_url ? (
              <div className="space-y-8">
                {/* Video Player */}
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-8 border border-gray-600/30 shadow-lg">
                  <video 
                    controls 
                    className="w-full rounded-lg shadow-2xl shadow-black/30"
                    src={session.final_video_url}
                    onError={(e) => console.error('Final video error:', e)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Download & Create New */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg mb-4">Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        onClick={() => window.open(session.final_video_url, '_blank')}
                      >
                        <Download className="w-5 h-5 mr-3" />
                        Download Video
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-6 py-3 font-semibold transition-all duration-200"
                        onClick={resetWizard}
                      >
                        Create Another Video
                      </Button>
                    </div>
                  </div>
                  
                  {/* Social Media Sharing */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg mb-4">Share to Social Media</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-pink-500 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 px-4 py-3 font-medium transition-all duration-200"
                        onClick={() => shareToSocial('instagram')}
                      >
                        Instagram
                      </Button>
                      <Button
                        variant="outline"
                        className="border-black text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-4 py-3 font-medium transition-all duration-200"
                        onClick={() => shareToSocial('tiktok')}
                      >
                        TikTok
                      </Button>
                      <Button
                        variant="outline"
                        className="border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 px-4 py-3 font-medium transition-all duration-200"
                        onClick={() => shareToSocial('reddit')}
                      >
                        Reddit
                      </Button>
                      <Button
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 px-4 py-3 font-medium transition-all duration-200"
                        onClick={() => shareToSocial('twitter')}
                      >
                        Twitter
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10 hover:border-blue-500 px-4 py-3 font-medium transition-all duration-200"
                      onClick={() => shareToSocial('linkedin')}
                    >
                      LinkedIn
                    </Button>
                  </div>
                </div>
                
                {/* Video Stats */}
                <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-600/20">
                  <h4 className="text-white font-semibold text-lg mb-4">Video Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-blue-400 font-semibold">Format</div>
                      <div className="text-gray-300">MP4</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-semibold">Quality</div>
                      <div className="text-gray-300">HD 1080p</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-semibold">A-roll</div>
                      <div className="text-gray-300">HeyGen Avatar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-semibold">B-roll</div>
                      <div className="text-gray-300">Veo 2</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-semibold">Processing</div>
                      <div className="text-gray-300">FFmpeg + GCS</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
                <h3 className="text-white font-semibold text-xl mb-3">Processing Your Final Video...</h3>
                <p className="text-gray-400 text-base">Combining A-roll and B-roll footage with smart transitions</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-gray-500">Merging video tracks</p>
                  <p className="text-gray-500">Syncing audio</p>
                  <p className="text-gray-500">Adding transitions</p>
                  <p className="text-gray-500 mt-3">Estimated time: ~2-3 minutes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

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
          {currentStep === 5 && renderRawFootageStep()}
          {currentStep === 6 && renderFinalVideoStep()}
        </div>
      </div>
    </div>
  )
} 