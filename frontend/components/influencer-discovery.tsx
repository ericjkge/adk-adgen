"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Users, Heart, MessageCircle, Star, TrendingUp } from "lucide-react"

export function InfluencerDiscovery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState([])

  const influencers = [
    {
      id: 1,
      name: "Maya Rodriguez",
      handle: "@fashionista_maya",
      platform: "Instagram",
      followers: "2.4M",
      engagement: "4.8%",
      niche: "Fashion",
      rating: 4.9,
      avgLikes: "120K",
      avgComments: "3.2K",
      price: "$5,000",
      avatar: "/placeholder.svg?height=60&width=60",
      verified: true,
      recentPosts: 3,
    },
    {
      id: 2,
      name: "Alex Chen",
      handle: "@tech_reviewer_pro",
      platform: "YouTube",
      followers: "1.8M",
      engagement: "6.2%",
      niche: "Technology",
      rating: 4.7,
      avgLikes: "85K",
      avgComments: "2.8K",
      price: "$8,000",
      avatar: "/placeholder.svg?height=60&width=60",
      verified: true,
      recentPosts: 5,
    },
    {
      id: 3,
      name: "Sarah Johnson",
      handle: "@fitness_guru_sarah",
      platform: "TikTok",
      followers: "3.1M",
      engagement: "7.1%",
      niche: "Fitness",
      rating: 4.8,
      avgLikes: "200K",
      avgComments: "5.1K",
      price: "$6,500",
      avatar: "/placeholder.svg?height=60&width=60",
      verified: true,
      recentPosts: 8,
    },
    {
      id: 4,
      name: "David Kim",
      handle: "@foodie_adventures",
      platform: "Instagram",
      followers: "890K",
      engagement: "5.4%",
      niche: "Food",
      rating: 4.6,
      avgLikes: "45K",
      avgComments: "1.8K",
      price: "$3,200",
      avatar: "/placeholder.svg?height=60&width=60",
      verified: false,
      recentPosts: 4,
    },
  ]

  const filters = ["Fashion", "Technology", "Fitness", "Food", "Travel", "Beauty", "Gaming", "Lifestyle"]

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Discover Influencers</h1>
        <p className="text-gray-400">Find the perfect influencers for your campaign using AI-powered matching</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search influencers by name, niche, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant={selectedFilters.includes(filter) ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedFilters.includes(filter)
                  ? "bg-purple-500 hover:bg-purple-600"
                  : "border-white/20 text-gray-300 hover:bg-white/10"
              }`}
              onClick={() => {
                const newFilters = selectedFilters.includes(filter)
                  ? selectedFilters.filter((f) => f !== filter)
                  : [...selectedFilters, filter]
                setSelectedFilters(newFilters)
              }}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <Card className="mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            Based on your campaign objectives and target audience, our AI has identified the top matches:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold">Best Match</h4>
              <p className="text-purple-300">Maya Rodriguez</p>
              <p className="text-gray-400 text-sm">98% compatibility score</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold">Highest Engagement</h4>
              <p className="text-purple-300">Sarah Johnson</p>
              <p className="text-gray-400 text-sm">7.1% engagement rate</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold">Best Value</h4>
              <p className="text-purple-300">David Kim</p>
              <p className="text-gray-400 text-sm">$3,200 per campaign</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Influencer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {influencers.map((influencer) => (
          <Card
            key={influencer.id}
            className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={influencer.avatar || "/placeholder.svg"} alt={influencer.name} />
                    <AvatarFallback>
                      {influencer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">{influencer.name}</h3>
                      {influencer.verified && <Badge className="bg-blue-500/20 text-blue-400 text-xs">Verified</Badge>}
                    </div>
                    <p className="text-gray-400">{influencer.handle}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                        {influencer.platform}
                      </Badge>
                      <Badge variant="outline" className="border-pink-500/30 text-pink-300 text-xs">
                        {influencer.niche}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">{influencer.rating}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{influencer.price}</p>
                  <p className="text-gray-400 text-sm">per campaign</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-purple-400 mr-1" />
                    <span className="text-white font-semibold">{influencer.followers}</span>
                  </div>
                  <p className="text-gray-400 text-xs">Followers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-4 h-4 text-pink-400 mr-1" />
                    <span className="text-white font-semibold">{influencer.avgLikes}</span>
                  </div>
                  <p className="text-gray-400 text-xs">Avg Likes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="text-white font-semibold">{influencer.engagement}</span>
                  </div>
                  <p className="text-gray-400 text-xs">Engagement</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">{influencer.recentPosts} posts this week</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
          Load More Influencers
        </Button>
      </div>
    </div>
  )
}
