"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mic, Play, Star } from "lucide-react"

export function AvatarsView() {
  const avatars = [
    { id: 1, name: "Raul", style: "Casual", gender: "Male", language: "English", rating: 4.8, preview: "/placeholder-user.jpg" },
    { id: 2, name: "Sarah", style: "Professional", gender: "Female", language: "English", rating: 4.9, preview: "/placeholder-user.jpg" },
    { id: 3, name: "Miguel", style: "Friendly", gender: "Male", language: "Spanish", rating: 4.7, preview: "/placeholder-user.jpg" },
    { id: 4, name: "Emma", style: "Corporate", gender: "Female", language: "English", rating: 4.9, preview: "/placeholder-user.jpg" },
  ]

  const voices = [
    { id: 1, name: "Alex", gender: "Male", accent: "American", tone: "Professional", language: "English", rating: 4.8 },
    { id: 2, name: "Sophia", gender: "Female", accent: "British", tone: "Warm", language: "English", rating: 4.9 },
    { id: 3, name: "Marcus", gender: "Male", accent: "Australian", tone: "Friendly", language: "English", rating: 4.7 },
    { id: 4, name: "Isabella", gender: "Female", accent: "American", tone: "Energetic", language: "English", rating: 4.8 },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-inter overflow-y-auto antialiased">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">Avatars & Voices</h1>
          <p className="text-gray-400 text-lg">Choose from our collection of AI avatars and voices</p>
        </div>

        <Tabs defaultValue="avatars" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 p-1 rounded-lg mb-8">
            <TabsTrigger value="avatars" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">
              <User className="w-4 h-4 mr-2" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="voices" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">
              <Mic className="w-4 h-4 mr-2" />
              Voices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatars">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {avatars.map((avatar) => (
                <Card key={avatar.id} className="bg-gray-900/80 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-600/10">
                  <CardHeader className="p-0">
                    <div className="relative aspect-square bg-gray-800 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-600" />
                      </div>
                      <div className="absolute top-2 right-2 flex items-center bg-black/80 text-white text-xs px-2 py-1 rounded">
                        <Star className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" />
                        {avatar.rating}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{avatar.name}</h3>
                      <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                        {avatar.style}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400 mb-4">
                      <p>Gender: {avatar.gender}</p>
                      <p>Language: {avatar.language}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                        <Play className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="voices">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voices.map((voice) => (
                <Card key={voice.id} className="bg-gray-900/80 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-600/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Mic className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{voice.name}</h3>
                          <p className="text-gray-400 text-sm">{voice.gender} • {voice.accent}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-400 text-sm">
                        <Star className="w-4 h-4 mr-1" fill="currentColor" />
                        {voice.rating}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tone:</span>
                        <span className="text-white">{voice.tone}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Language:</span>
                        <span className="text-white">{voice.language}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                        <Play className="w-4 h-4 mr-1" />
                        Listen
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 