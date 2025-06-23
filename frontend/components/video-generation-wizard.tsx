"use client"

import { useEffect, useState } from "react"
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
import { FaReddit, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa"

import { fallbackMetadata, fallbackMarketAnalysis, fallbackScript } from "@/lib/fallback-data"

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
  const USER_ID = "user_123" // Static user ID for demo purposes
  
  const [currentStep, setCurrentStep] = useState(1)
  const [productUrl, setProductUrl] = useState("")
  const [session, setSession] = useState<VideoSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState("")

  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const phrases = ["Create Video Ads", "Gain Market Insights", "Launch Successful Campaigns"]

  useEffect(() => {
    if (currentStep === 1) {
      let currentIndex = 0
      const currentPhrase = phrases[currentPhraseIndex]

      const typingInterval = setInterval(() => {
        if (currentIndex <= currentPhrase.length) {
          setDisplayedText(currentPhrase.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          // Pause before starting next phrase
          setTimeout(() => {
            setDisplayedText("")
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
          }, 2000) // 2 second pause between phrases
        }
      }, 100) // Slightly faster typing speed

      return () => clearInterval(typingInterval)
    }
  }, [currentStep, currentPhraseIndex])

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500) // Cursor blink speed

    return () => clearInterval(cursorInterval)
  }, [])
  
  const steps = [
    { id: 1, name: "Input", icon: Play },
    { id: 2, name: "Product Info", icon: CheckCircle },
    { id: 3, name: "Market Analysis", icon: BarChart3 },
    { id: 4, name: "Script Review", icon: FileText },
    { id: 5, name: "Raw Footage", icon: Video },
    { id: 6, name: "Final Video", icon: CheckCircle }
  ]

  // STEP 1: Product URL Analysis & Metadata Extraction
  const startGeneration = async () => {
    if (!productUrl.trim()) return
    
    setIsLoading(true)
    
    try {
      // Step 1: Create a session for the manager agent
      const sessionResponse = await fetch(`/api/adk/apps/manager/users/${USER_ID}/sessions`, {
      // DOCKER: const sessionResponse = await fetch(`http://localhost:8080/apps/manager/users/${USER_ID}/sessions`, {
      // CLOUD: const sessionResponse = await fetch(`https://vibe-backend-75799208947.us-central1.run.app/apps/manager/users/${USER_ID}/sessions`, {
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
      // DOCKER: const runResponse = await fetch("http://localhost:8080/run", {
      // CLOUD: const runResponse = await fetch("https://vibe-backend-75799208947.us-central1.run.app/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: USER_ID, 
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
          user_id: USER_ID,
          status: "processing",
          step: "extraction_complete",
          metadata: extractedMetadata
        })
        setCurrentStep(2)
      } else {
        // Fallback to mock data if extraction failed
        setSession({
          session_id: sessionData.id,
          user_id: USER_ID, 
          status: "processing",
          step: "extraction",
          metadata: {
            ...fallbackMetadata,
            product_url: productUrl
          }
        })
        setCurrentStep(2)
      }
      
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      
      // Show error to user
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}.`)
    }
  }

  // STEP 2: Market Research & Competitor Analysis
  const continueToMarketAnalysis = async () => {
    if (!session?.session_id || !session?.metadata) return
    
    setIsLoading(true)
    
    try {
      // Call the manager agent to run market agent
      const runResponse = await fetch("/api/adk/run", {
      // DOCKER: const runResponse = await fetch("http://localhost:8080/run", {
      // CLOUD: const runResponse = await fetch("https://vibe-backend-75799208947.us-central1.run.app/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: USER_ID, 
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
          market_analysis: fallbackMarketAnalysis
        } : null)
      }
      
      setCurrentStep(3)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading market analysis:", error)
      setIsLoading(false)
      
      // Show error to user
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}.`)
    }
  }

  // STEP 3: AI Script Generation
  const continueToScript = async () => {
    if (!session?.session_id || !session?.metadata || !session?.market_analysis) return
    
    setIsLoading(true)
    
    try {
      // Call the manager agent to run script agent
      const runResponse = await fetch("/api/adk/run", {
      // DOCKER: const runResponse = await fetch("http://localhost:8080/run", {
      // CLOUD: const runResponse = await fetch("https://vibe-backend-75799208947.us-central1.run.app/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: USER_ID, 
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
          script: fallbackScript,
          awaiting_feedback: true
        } : null)
      }
      
      setCurrentStep(4)
      setIsLoading(false)
    } catch (error) {
      console.error("Error generating script:", error)
      setIsLoading(false)
      
      // Show error to user
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}.`)
    }
  }

  // STEP 3B: Script Refinement Based on User Feedback
  const submitFeedback = async () => {
    if (!session?.session_id || !feedback.trim()) return
    
    setIsLoading(true)
    
    try {
      // Call the manager agent to run script agent with feedback
      const runResponse = await fetch("/api/adk/run", {
      // DOCKER: const runResponse = await fetch("http://localhost:8080/run", {
      // CLOUD: const runResponse = await fetch("https://vibe-backend-75799208947.us-central1.run.app/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: USER_ID, 
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
      
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}.`)
    }
  }

  // STEP 4: A-roll & B-roll Video Generation
  const approveScript = async () => {
    if (!session?.session_id || !session?.script) return
    
    setIsLoading(true)
    
    // Move to Step 5 (Raw Footage) immediately with loading state
    setCurrentStep(5)
    
    try {
      let arollUrl = null
      
      // Step 4A: Generate A-roll (Avatar/Voiceover) video
      const arollResponse = await fetch("/api/adk/run", {
      // DOCKER: const arollResponse = await fetch("http://localhost:8080/run", {
      // CLOUD: const arollResponse = await fetch("https://vibe-backend-75799208947.us-central1.run.app/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: USER_ID, 
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
                              const urlMatch = part.text.match(/A-roll Video URL:\s*(https?:\/\/[^\s]+)/);
              if (urlMatch) {
                arollUrl = urlMatch[1];
                break;
              }
            }
          }
        }
        if (arollUrl) break;
      }
      
      // Step 4B: Generate B-roll (Product Footage) video
      const brollResponse = await fetch("/api/adk/run", {
      // DOCKER: const brollResponse = await fetch("http://localhost:8080/run", {
      // CLOUD: const brollResponse = await fetch("https://vibe-backend-75799208947.us-central1.run.app/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: USER_ID, 
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
                              const urlMatch = part.text.match(/B-roll Video URL:\s*((?:https?|gs):\/\/[^\s]+)/);
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
      
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}.`)
    }
  }

  // STEP 5: Final Video Processing & Combination
  const processRawFootage = async () => {
    if (!session?.session_id || !session?.aroll_url || !session?.broll_url) return
    
    setIsLoading(true)
    
    try {
      // Call the manager agent to run processing agent
      const runResponse = await fetch("/api/adk/run", {
      // DOCKER: const runResponse = await fetch("http://localhost:8080/run", {
      // CLOUD: const runResponse = await fetch("https://vibe-backend-75799208947.us-central1.run.app/run", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "manager",
          userId: USER_ID, 
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
                              const urlMatch = part.text.match(/Final Video URL:\s*((?:https?|gs):\/\/[^\s]+)/);
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
      
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}.`)
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setProductUrl("")
    setSession(null)
    setIsLoading(false)
    setFeedback("")
    setDisplayedText("")
    setCurrentPhraseIndex(0)
  }





  // Step 1 UI: URL Input
  const renderInputStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-7xl font-bold text-white mb-8 tracking-tight min-h-[120px] whitespace-nowrap flex items-center justify-center" style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}>
          {displayedText}
          <span className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100 ml-2 text-8xl`} style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}>|</span>
        </h1>
        <p className="text-xl text-purple-300 font-light" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 'bold' }}>ENTER YOUR PRODUCT URL TO GET STARTED</p>
      </div>


  
      <div className="space-y-10">
        <Input
          placeholder="Paste your product URL here..."
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          className="bg-white/10 backdrop-blur-xl border-purple-400/30 text-white h-20 text-xl px-10 rounded-3xl focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 shadow-2xl purple-placeholder"
          style={{ 
            fontFamily: 'Rubik, sans-serif', 
            fontWeight: 'bold',
            '--tw-placeholder-opacity': '1'
          } as React.CSSProperties}
          disabled={isLoading}
        />
  
        <Button
          onClick={startGeneration}
          disabled={isLoading || !productUrl.trim()}
          className="w-full bg-purple-600/90 hover:bg-purple-500 text-white h-16 text-lg font-medium rounded-3xl transition-all duration-300 disabled:opacity-50 shadow-2xl shadow-purple-600/25 hover:shadow-purple-500/40 hover:scale-[1.02]"
          style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 mr-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-6 h-6 mr-4" />
              Generate Video
            </>
          )}
        </Button>
        
        {/* Supported Sites - Logo Banner */}
        <div className="mt-8">
          <p className="text-center text-purple-300/60 text-sm mb-4" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            Supported Sites:
          </p>
          <div className="flex justify-center items-center gap-8 opacity-70 hover:opacity-100 transition-opacity duration-300">
            {/* eBay Logo */}
            <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-200">
              <img 
                src="/ebay.svg" 
                alt="eBay" 
                className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
            </div>
            
            {/* Shopify Logo */}
            <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-200">
              <img 
                src="/shopify.png" 
                alt="Shopify" 
                className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200 scale-[2.5]"
              />
            </div>
            
            {/* Target Logo */}
            <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-200">
              <img 
                src="/target.png" 
                alt="Target" 
                className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200 scale-[1.5]"
              />
            </div>
            
            {/* Most Brand Sites */}
            <div className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors duration-200 hover:scale-105 transform duration-200">
              <div className="w-6 h-6 bg-purple-500/60 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">+</span>
              </div>
              <span className="text-sm font-medium">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Step 2 UI: Product Information
  const renderProductInfoStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-7xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}>Product Information</h2>
        <p className="text-lg text-purple-300 font-light" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 'bold' }}>EXTRACTED DETAILS ABOUT YOUR PRODUCT</p>
      </div>

      <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl shadow-2xl">
        <CardContent className="p-12">
          {session?.metadata ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="space-y-6">
                <img
                  src={session.metadata.image_url || "/placeholder.jpg"}
                  alt={session.metadata.product_name}
                  className="w-full h-80 object-cover rounded-2xl border border-white/20 shadow-xl"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="h-6 w-6 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>PRODUCT NAME</span>
                  </div>
                  <p className="text-xl text-white font-inter">{session.metadata.product_name}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Tag className="h-6 w-6 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>BRAND</span>
                  </div>
                  <p className="text-xl text-white font-inter">{session.metadata.brand}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="h-6 w-6 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>PRICE</span>
                  </div>
                  <p className="text-xl font-medium text-green-400 font-inter">{session.metadata.price}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-purple-300 cursor-pointer" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>CATEGORY</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-purple-600/30 text-purple-300 border-purple-600/40 px-4 py-2 text-sm rounded-xl transition-all duration-200 hover:bg-purple-500/40 hover:border-purple-400/60 hover:scale-105"
                    style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                  >
                    {session.metadata.product_category}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24">
              <Loader2 className="w-20 h-20 text-purple-400 mx-auto mb-8 animate-spin" />
              <h3 className="text-white font-medium text-xl mb-4 font-inter">Extracting Product Information...</h3>
              <p className="text-gray-400 text-base font-inter">Analyzing your product details</p>
            </div>
          )}

          {session?.metadata && (
            <>
              <div className="mt-12 pt-8 border-t border-purple-300/30">
                <span className="text-sm font-medium text-gray-300 mb-4 block" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>DESCRIPTION</span>
                <p className="text-gray-100 leading-relaxed text-base font-inter">{session.metadata.description}</p>
              </div>

              {session.metadata.key_features && session.metadata.key_features.length > 0 && (
                <div className="mt-8">
                  <span className="text-sm font-medium text-gray-300 mb-4 block" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>KEY FEATURES</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {session.metadata.key_features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-100 text-sm font-inter">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 flex justify-end">
                <Button
                  onClick={continueToMarketAnalysis}
                  disabled={isLoading}
                  className="bg-purple-600/90 hover:bg-purple-500 text-white px-8 py-3 text-base font-medium rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] font-inter"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Continue to Market Analysis
                      <ArrowRight className="ml-3 h-5 w-5" />
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

 // Step 3 UI: Market Analysis
 const renderMarketAnalysisStep = () => (
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-7xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}>Market Analysis</h2>
      <p className="text-lg text-purple-300 font-light" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 'bold' }}>UNDERSTANDING YOUR PRODUCT'S MARKET LANDSCAPE</p>
    </div>

    <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl shadow-2xl">
      <CardContent className="p-12">
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-spin" />
            <h3 className="text-white font-semibold text-xl mb-3">Analyzing Market Data...</h3>
            <p className="text-gray-400 text-base">This may take a few moments</p>
          </div>
        ) : session?.market_analysis ? (
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/80 p-1 rounded-lg">
              <TabsTrigger
                value="trends"
                className="data-[state=active]:bg-purple-600/90 data-[state=active]:text-white font-semibold hover:bg-purple-500/50"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                MARKET TRENDS
              </TabsTrigger>
              <TabsTrigger
                value="audience"
                className="data-[state=active]:bg-purple-600/90 data-[state=active]:text-white font-semibold hover:bg-purple-500/50"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                <Users className="w-4 h-4 mr-2" />
                AUDIENCE INSIGHTS
              </TabsTrigger>
              <TabsTrigger
                value="competitors"
                className="data-[state=active]:bg-purple-600/90 data-[state=active]:text-white font-semibold hover:bg-purple-500/50"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                COMPETITOR ANALYSIS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="mt-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 shadow-xl">
                <h4 className="text-white font-bold text-xl mb-6" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>MARKET TRENDS</h4>
                <div className="space-y-6 text-white">
                  {session.market_analysis.market_size && (
                    <div>
                      <h5 className="text-purple-300 font-semibold mb-2" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>MARKET SIZE</h5>
                      <p className="text-white">{session.market_analysis.market_size}</p>
                    </div>
                  )}
                  <div>
                    <h5 className="text-white font-semibold mb-4" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>KEY TRENDS</h5>
                    {session.market_analysis.market_trends.map((trend: string, idx: number) => (
                      <div key={idx} className="mb-3 flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-white">{trend}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audience" className="mt-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 shadow-xl">
                <h4 className="text-white font-bold text-xl mb-6" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>AUDIENCE INSIGHTS</h4>
                <div className="space-y-4 text-white">
                  {session.market_analysis.audience_insights.demographics && (
                    <div>
                      <h5 className="text-purple-300 font-semibold mb-2" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>DEMOGRAPHICS</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(session.market_analysis.audience_insights.demographics).map(
                          ([key, value]: [string, any]) => (
                            <div key={key}>
                              <span className="text-white italic capitalize" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{key.toUpperCase()}: </span>
                              <span className="text-white">{value}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                  {session.market_analysis.audience_insights.psychographics && (
                    <div>
                      <h5 className="text-purple-300 font-semibold mb-4" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>PSYCHOGRAPHICS</h5>
                      <p className="text-white">{session.market_analysis.audience_insights.psychographics}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="mt-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 shadow-xl">
                <h4 className="text-white font-bold text-xl mb-6" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>COMPETITOR ANALYSIS</h4>
                <div className="space-y-4 text-white">
                  {session.market_analysis.competitors.map((competitor: any, idx: number) => (
                    <div key={idx} className="border border-white/20 rounded-lg p-4 transition-all duration-300 hover:bg-purple-900/20 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer group">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-purple-300 font-semibold group-hover:text-purple-200 transition-colors duration-300" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{competitor.name.toUpperCase()}</h5>
                        {competitor.price && (
                          <Badge variant="outline" className="text-green-400 border-green-400/60 group-hover:bg-green-400/10 group-hover:border-green-300 transition-all duration-300" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                            {competitor.price}
                          </Badge>
                        )}
                      </div>
                      {competitor.description && (
                        <p className="text-white text-sm mb-2 group-hover:text-gray-100 transition-colors duration-300">{competitor.description}</p>
                      )}
                      {competitor.features && (
                        <div className="text-sm">
                          <span className="text-purple-300 italic group-hover:text-purple-200 transition-colors duration-300" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>KEY FEATURES: </span>
                          <span className="text-white italic group-hover:text-gray-100 transition-colors duration-300">{competitor.features}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-gray-400 py-8">Market analysis will appear here once complete...</div>
        )}

        {!isLoading && session?.market_analysis && (
          <div className="mt-8 flex justify-end">
            <Button
              onClick={continueToScript}
              disabled={isLoading}
              className="bg-purple-600/90 hover:bg-purple-500 text-white px-8 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Continue to Script
                  <ArrowRight className="ml-3 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)


  // Step 4 UI: Script Review
  const renderScriptStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-7xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}>Script Review</h2>
        <p className="text-lg text-purple-300 font-light" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 'bold' }}>REVIEW AND REFINE YOUR VIDEO SCRIPT</p>
      </div>

      <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl shadow-2xl">
        <CardContent className="p-12 space-y-8">
          {session?.script ? (
            <>
              {/* Generated Script Display */}
              <div className="space-y-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 shadow-xl transition-all duration-300 hover:bg-purple-900/20 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer group">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center group-hover:text-purple-200 transition-colors duration-300" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    <FileText className="w-6 h-6 mr-3 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                    AUDIO SCRIPT (A-ROLL)
                  </h4>
                  <p className="text-white leading-relaxed text-base group-hover:text-gray-100 transition-colors duration-300">{session.script.audio_script}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 shadow-xl transition-all duration-300 hover:bg-purple-900/20 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer group">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center group-hover:text-purple-200 transition-colors duration-300" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    <Video className="w-6 h-6 mr-3 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                    VIDEO SCRIPT (B-ROLL)
                  </h4>
                  <p className="text-white leading-relaxed text-base group-hover:text-gray-100 transition-colors duration-300">{session.script.video_script}</p>
                </div>
              </div>

              {/* Feedback Section */}
              {session.awaiting_feedback && (
                <div className="border-t border-gray-700/50 pt-8">
                  <h4 className="text-white font-bold text-xl mb-6" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>PROVIDE FEEDBACK (OPTIONAL)</h4>

                  <div className="space-y-6">
                    <Textarea
                      placeholder="Enter your feedback to improve the script, or leave blank to approve as-is..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-white/10 backdrop-blur-xl border-purple-400/30 text-white h-32 text-xl px-10 py-6 rounded-3xl focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 shadow-2xl purple-placeholder resize-none"
                      style={{ 
                        fontFamily: 'Rubik, sans-serif', 
                        fontWeight: 'bold',
                        '--tw-placeholder-opacity': '1'
                      } as React.CSSProperties}
                      rows={5}
                    />

                    <div className="flex space-x-4">
                      <Button
                        onClick={submitFeedback}
                        disabled={!feedback.trim() || isLoading}
                        className="bg-purple-600/90 hover:bg-purple-500 text-white px-6 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
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
                        className="border-purple-400/60 text-purple-300 hover:bg-purple-900/20 hover:border-purple-400 px-6 py-3 font-semibold transition-all duration-200"
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
              <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-spin" />
              <h3 className="text-white font-semibold text-xl mb-3">Generating Script...</h3>
              <p className="text-gray-400 text-base">Creating your personalized video script</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
  
  // STEP 5 UI: Raw Footage Display
  const renderRawFootageStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-7xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}>Raw Footage Generated</h2>
        <p className="text-lg text-purple-300 font-light" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 'bold' }}>REVIEW YOUR A-ROLL AND B-ROLL FOOTAGE BEFORE FINAL PROCESSING</p>
      </div>
      
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-600/30">
        <CardContent>
          {session?.aroll_url || session?.broll_url ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* A-roll Video */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    <FileText className="w-6 h-6 mr-3 text-purple-400" />
                    A-ROLL (AVATAR/VOICEOVER)
                    {session?.aroll_url ? (
                      <span className="ml-2 text-sm text-green-400" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>✓ READY</span>
                    ) : (
                      <span className="ml-2 text-sm text-yellow-400" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>⏳ GENERATING...</span>
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
                          <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" />
                          <p className="text-gray-400 text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>GENERATING A-ROLL...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* B-roll Video */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    <Video className="w-6 h-6 mr-3 text-purple-400" />
                    B-ROLL (PRODUCT FOOTAGE)
                    {session?.broll_url ? (
                      <span className="ml-2 text-sm text-green-400" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>✓ READY</span>
                    ) : (
                      <span className="ml-2 text-sm text-yellow-400" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>⏳ GENERATING...</span>
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
                          <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" />
                          <p className="text-gray-400 text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>GENERATING B-ROLL...</p>
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
                  className="bg-purple-600/90 hover:bg-purple-500 text-white px-8 py-4 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-spin" />
              <h3 className="text-white font-semibold text-xl mb-3">Generating Raw Footage...</h3>
              <p className="text-gray-400 text-base">Creating your A-roll and B-roll videos</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-gray-500">A-roll: Generating avatar video using HeyGen</p>
                <p className="text-gray-500">B-roll: Generating product video using Veo 2</p>
                <p className="text-gray-500 mt-3">Total time: ~3-6 minutes</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // STEP 6 UI: Final Video Result with Social Media Sharing
  const renderFinalVideoStep = () => {
    const shareToSocial = (platform: string) => {
      const videoUrl = session?.final_video_url
      const text = `Check out this AI-generated video ad I just created!`
      
      const shareUrls = {
        reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(videoUrl || '')}&title=${encodeURIComponent(text)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoUrl || '')}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl || '')}`,
        youtube: `https://www.youtube.com/upload?title=${encodeURIComponent(text)}&description=${encodeURIComponent(`Check out this AI-generated video ad! ${videoUrl || ''}`)}`
      }
      
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank')
    }

    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-7xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}>Your Video is Ready!</h2>
          <p className="text-lg text-purple-300 font-light" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 'bold' }}>YOUR AI-GENERATED VIDEO AD IS COMPLETE AND READY TO SHARE</p>
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
                    <h3 className="text-white font-semibold text-lg mb-4" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>ACTIONS</h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-purple-600/90 hover:bg-purple-500 text-white px-6 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        onClick={() => window.open(session.final_video_url, '_blank')}
                      >
                        <Download className="w-5 h-5 mr-3" />
                        Download Video
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full border-purple-400/60 text-purple-300 px-6 py-3 font-semibold transition-all duration-200"
                        onClick={resetWizard}
                      >
                        Create Another Video
                      </Button>
                    </div>
                  </div>
                  
                  {/* Social Media Sharing */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg mb-4" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>SHARE TO SOCIAL MEDIA</h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => shareToSocial('reddit')}
                        className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                        title="Share to Reddit"
                      >
                        <FaReddit className="w-6 h-6 text-white" />
                      </button>
                      <button
                        onClick={() => shareToSocial('twitter')}
                        className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                        title="Share to Twitter"
                      >
                        <FaTwitter className="w-6 h-6 text-white" />
                      </button>
                      <button
                        onClick={() => shareToSocial('linkedin')}
                        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                        title="Share to LinkedIn"
                      >
                        <FaLinkedin className="w-6 h-6 text-white" />
                      </button>
                      <button
                        onClick={() => shareToSocial('youtube')}
                        className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                        title="Share to YouTube"
                      >
                        <FaYoutube className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Video Stats */}
                <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-600/20">
                  <h4 className="text-white font-semibold text-lg mb-4" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>VIDEO DETAILS</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-purple-300 font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>FORMAT</div>
                      <div className="text-gray-300">MP4</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-300 font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>QUALITY</div>
                      <div className="text-gray-300">HD 1080p</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-300 font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>A-ROLL</div>
                      <div className="text-gray-300">HeyGen Avatar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-300 font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>B-ROLL</div>
                      <div className="text-gray-300">Veo 2</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-300 font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>PROCESSING</div>
                      <div className="text-gray-300">FFmpeg + GCS</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-spin" />
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
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-purple-900 text-white font-sans antialiased flex flex-col relative" style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 'bold' }}>
        
        {/* VIBE Logo - Upper Left */}
        <div className="absolute top-6 left-6 z-50">
          <h1 
            className="text-2xl font-bold text-white tracking-wider"
            style={{ 
              fontFamily: 'Rubik, sans-serif', 
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)'
            }}
          >
            VIBE
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-16">
          <div className="flex items-center justify-center space-x-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg ${
                  currentStep >= step.id 
                    ? 'bg-purple-600 text-white shadow-purple-600/30' 
                    : 'bg-gray-800/60 text-gray-400 border border-gray-700/60'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <step.icon className="w-8 h-8" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 ml-8 transition-all duration-300 rounded-full ${
                    currentStep > step.id ? 'bg-gradient-to-r from-purple-600 to-purple-500' : 'bg-gray-700/60'
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