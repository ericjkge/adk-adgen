"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image, Play, Download, Share } from "lucide-react"

export function GalleryView() {
  const demoVideos = [
    { id: 1, title: "EcoSmart Device Ad", thumbnail: "/placeholder.jpg", duration: "0:30", created: "2 days ago" },
    { id: 2, title: "Tech Product Launch", thumbnail: "/placeholder.jpg", duration: "0:45", created: "1 week ago" },
    { id: 3, title: "Green Living Campaign", thumbnail: "/placeholder.jpg", duration: "0:25", created: "2 weeks ago" },
    { id: 4, title: "Smart Home Demo", thumbnail: "/placeholder.jpg", duration: "0:35", created: "3 weeks ago" },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-inter overflow-y-auto antialiased">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">Video Gallery</h1>
          <p className="text-gray-400 text-lg">Your generated video collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {demoVideos.map((video) => (
            <Card key={video.id} className="bg-gray-900/80 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-600/10">
              <CardHeader className="p-0">
                <div className="relative aspect-video bg-gray-800 rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-600" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity cursor-pointer">
                    <Play className="w-12 h-12 text-white" fill="white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-2 truncate">{video.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{video.created}</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {demoVideos.length === 0 && (
          <div className="text-center py-16">
            <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">No videos yet</h3>
            <p className="text-gray-400 mb-6">Create your first video to see it here</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create Video
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 