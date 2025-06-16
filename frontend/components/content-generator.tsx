"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, ImageIcon, Video, FileText, Download, RefreshCw, Wand2 } from "lucide-react"

export function ContentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState({
    copy: "",
    hashtags: [],
    images: [],
    videos: [],
  })

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent({
        copy: "🌟 Transform your style with our latest summer collection! ✨ Discover pieces that make you feel confident and radiant. From flowing dresses to chic accessories, we've got everything you need to shine this season. 💫 #SummerVibes #Fashion #Style",
        hashtags: ["#SummerFashion", "#StyleInspo", "#OOTD", "#FashionTrends", "#SummerStyle"],
        images: [
          { id: 1, url: "/placeholder.svg?height=300&width=300", type: "Product Shot" },
          { id: 2, url: "/placeholder.svg?height=300&width=300", type: "Lifestyle" },
          { id: 3, url: "/placeholder.svg?height=300&width=300", type: "Flat Lay" },
        ],
        videos: [
          { id: 1, url: "/placeholder.svg?height=200&width=300", type: "Product Demo", duration: "0:30" },
          { id: 2, url: "/placeholder.svg?height=200&width=300", type: "Behind Scenes", duration: "0:45" },
        ],
      })
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Content Generator</h1>
        <p className="text-gray-400">Create compelling ad content with our advanced AI agents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                Content Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="product" className="text-white">
                  Product/Service
                </Label>
                <Input
                  id="product"
                  placeholder="e.g., Summer Fashion Collection"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="tone" className="text-white">
                  Tone of Voice
                </Label>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual & Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="playful">Playful & Fun</SelectItem>
                    <SelectItem value="luxury">Luxury & Elegant</SelectItem>
                    <SelectItem value="edgy">Edgy & Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform" className="text-white">
                  Target Platform
                </Label>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="audience" className="text-white">
                  Target Audience
                </Label>
                <Textarea
                  id="audience"
                  placeholder="Describe your target audience..."
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="key-message" className="text-white">
                  Key Message
                </Label>
                <Textarea
                  id="key-message"
                  placeholder="What's the main message you want to convey?"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Generated Content</CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-white font-semibold mb-2">AI is creating your content...</h3>
                  <p className="text-gray-400">This may take a few moments</p>
                </div>
              ) : generatedContent.copy ? (
                <Tabs defaultValue="copy" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/10">
                    <TabsTrigger value="copy" className="data-[state=active]:bg-purple-500">
                      <FileText className="w-4 h-4 mr-2" />
                      Copy
                    </TabsTrigger>
                    <TabsTrigger value="images" className="data-[state=active]:bg-purple-500">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Images
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="data-[state=active]:bg-purple-500">
                      <Video className="w-4 h-4 mr-2" />
                      Videos
                    </TabsTrigger>
                    <TabsTrigger value="hashtags" className="data-[state=active]:bg-purple-500">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Hashtags
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="copy" className="mt-6">
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Generated Ad Copy</h4>
                        <p className="text-gray-300 leading-relaxed">{generatedContent.copy}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                          <Download className="w-4 h-4 mr-2" />
                          Copy Text
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {generatedContent.images.map((image) => (
                        <div key={image.id} className="bg-white/10 rounded-lg p-4">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.type}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                          <h4 className="text-white font-medium mb-2">{image.type}</h4>
                          <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="videos" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedContent.videos.map((video) => (
                        <div key={video.id} className="bg-white/10 rounded-lg p-4">
                          <div className="w-full h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-white font-medium mb-1">{video.type}</h4>
                          <p className="text-gray-400 text-sm mb-3">Duration: {video.duration}</p>
                          <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="hashtags" className="mt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-semibold mb-3">Recommended Hashtags</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.hashtags.map((hashtag, index) => (
                            <Badge
                              key={index}
                              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 cursor-pointer"
                            >
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                        <Download className="w-4 h-4 mr-2" />
                        Copy All Hashtags
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Ready to create amazing content?</h3>
                  <p className="text-gray-400">
                    Fill out the brief and let our AI generate compelling ad content for you
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
