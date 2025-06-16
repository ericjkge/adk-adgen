"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Play,
  Pause,
  Edit,
  MoreHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MessageSquare,
  Eye,
} from "lucide-react"

export function CampaignManager() {
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  const campaigns = [
    {
      id: 1,
      name: "Summer Fashion Collection",
      status: "Live",
      influencer: {
        name: "Maya Rodriguez",
        handle: "@fashionista_maya",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      platform: "Instagram",
      budget: "$15,000",
      spent: "$8,500",
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      metrics: {
        impressions: "2.4M",
        engagement: "4.8%",
        clicks: "45.2K",
        conversions: "1,247",
        roi: "285%",
      },
      posts: [
        { id: 1, type: "Image", likes: "125K", comments: "3.2K", shares: "890" },
        { id: 2, type: "Reel", likes: "89K", comments: "2.1K", shares: "1.2K" },
        { id: 3, type: "Story", views: "156K", replies: "450", shares: "234" },
      ],
    },
    {
      id: 2,
      name: "Tech Product Launch",
      status: "Optimizing",
      influencer: {
        name: "Alex Chen",
        handle: "@tech_reviewer_pro",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      platform: "YouTube",
      budget: "$25,000",
      spent: "$12,300",
      startDate: "2024-06-15",
      endDate: "2024-07-15",
      metrics: {
        impressions: "1.8M",
        engagement: "6.2%",
        clicks: "67.8K",
        conversions: "2,156",
        roi: "340%",
      },
      posts: [
        { id: 1, type: "Review Video", likes: "45K", comments: "1.8K", shares: "567" },
        { id: 2, type: "Unboxing", likes: "32K", comments: "890", shares: "234" },
      ],
    },
    {
      id: 3,
      name: "Fitness Challenge Series",
      status: "Paused",
      influencer: {
        name: "Sarah Johnson",
        handle: "@fitness_guru_sarah",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      platform: "TikTok",
      budget: "$18,000",
      spent: "$5,400",
      startDate: "2024-05-20",
      endDate: "2024-06-20",
      metrics: {
        impressions: "3.1M",
        engagement: "7.1%",
        clicks: "89.3K",
        conversions: "3,421",
        roi: "425%",
      },
      posts: [
        { id: 1, type: "Challenge Video", likes: "234K", comments: "5.6K", shares: "2.1K" },
        { id: 2, type: "Tutorial", likes: "156K", comments: "3.2K", shares: "890" },
        { id: 3, type: "Results", likes: "189K", comments: "4.1K", shares: "1.5K" },
      ],
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Live":
        return "bg-green-500/20 text-green-400"
      case "Optimizing":
        return "bg-yellow-500/20 text-yellow-400"
      case "Paused":
        return "bg-gray-500/20 text-gray-400"
      case "Completed":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Campaign Manager</h1>
        <p className="text-gray-400">Monitor and manage all your active campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign List */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    selectedCampaign?.id === campaign.id
                      ? "bg-purple-500/20 border-purple-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">{campaign.name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={campaign.influencer.avatar || "/placeholder.svg"}
                        alt={campaign.influencer.name}
                      />
                      <AvatarFallback>
                        {campaign.influencer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white text-sm">{campaign.influencer.name}</p>
                      <p className="text-gray-400 text-xs">{campaign.influencer.handle}</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Budget</span>
                    <span className="text-white">{campaign.budget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">ROI</span>
                    <span className="text-green-400">{campaign.metrics.roi}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Campaign Details */}
        <div className="lg:col-span-2">
          {selectedCampaign ? (
            <div className="space-y-6">
              {/* Campaign Header */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{selectedCampaign.name}</CardTitle>
                      <p className="text-gray-400 mt-1">
                        {selectedCampaign.startDate} - {selectedCampaign.endDate}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                        {selectedCampaign.status === "Live" ? (
                          <Pause className="w-4 h-4 mr-2" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        {selectedCampaign.status === "Live" ? "Pause" : "Resume"}
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="w-4 h-4 text-purple-400 mr-1" />
                        <span className="text-white font-semibold">{selectedCampaign.metrics.impressions}</span>
                      </div>
                      <p className="text-gray-400 text-xs">Impressions</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-white font-semibold">{selectedCampaign.metrics.engagement}</span>
                      </div>
                      <p className="text-gray-400 text-xs">Engagement</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-blue-400 mr-1" />
                        <span className="text-white font-semibold">{selectedCampaign.metrics.clicks}</span>
                      </div>
                      <p className="text-gray-400 text-xs">Clicks</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-white font-semibold">{selectedCampaign.metrics.conversions}</span>
                      </div>
                      <p className="text-gray-400 text-xs">Conversions</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 font-semibold">{selectedCampaign.metrics.roi}</span>
                      </div>
                      <p className="text-gray-400 text-xs">ROI</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Content */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Campaign Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCampaign.posts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{post.type}</h4>
                            <p className="text-gray-400 text-sm">Published 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="text-white font-medium">{post.likes}</div>
                            <div className="text-gray-400">Likes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-medium">{post.comments}</div>
                            <div className="text-gray-400">Comments</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-medium">{post.shares}</div>
                            <div className="text-gray-400">Shares</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Budget Tracking */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Budget Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Budget</span>
                      <span className="text-white font-semibold">{selectedCampaign.budget}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Spent</span>
                      <span className="text-white font-semibold">{selectedCampaign.spent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Remaining</span>
                      <span className="text-green-400 font-semibold">
                        $
                        {Number.parseInt(selectedCampaign.budget.replace("$", "").replace(",", "")) -
                          Number.parseInt(selectedCampaign.spent.replace("$", "").replace(",", ""))}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{
                          width: `${(Number.parseInt(selectedCampaign.spent.replace("$", "").replace(",", "")) / Number.parseInt(selectedCampaign.budget.replace("$", "").replace(",", ""))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-96 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Select a Campaign</h3>
                <p className="text-gray-400">
                  Choose a campaign from the list to view detailed analytics and management options
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
