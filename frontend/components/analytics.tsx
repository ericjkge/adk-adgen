"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Eye, MousePointer, ArrowUp, ArrowDown } from "lucide-react"

export function Analytics() {
  const overallStats = [
    {
      title: "Total Revenue",
      value: "$342,567",
      change: "+23.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      title: "Total Impressions",
      value: "8.7M",
      change: "+18.2%",
      trend: "up",
      icon: Eye,
      color: "text-blue-400",
    },
    {
      title: "Click-through Rate",
      value: "4.2%",
      change: "-2.1%",
      trend: "down",
      icon: MousePointer,
      color: "text-purple-400",
    },
    {
      title: "Conversion Rate",
      value: "2.8%",
      change: "+12.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-pink-400",
    },
  ]

  const topPerformers = [
    {
      campaign: "Summer Fashion Collection",
      influencer: "@fashionista_maya",
      platform: "Instagram",
      roi: "285%",
      revenue: "$127,543",
    },
    {
      campaign: "Tech Product Launch",
      influencer: "@tech_reviewer_pro",
      platform: "YouTube",
      roi: "340%",
      revenue: "$89,234",
    },
    {
      campaign: "Fitness Challenge Series",
      influencer: "@fitness_guru_sarah",
      platform: "TikTok",
      roi: "425%",
      revenue: "$156,789",
    },
  ]

  const platformPerformance = [
    { platform: "Instagram", campaigns: 12, revenue: "$234,567", roi: "298%" },
    { platform: "TikTok", campaigns: 8, revenue: "$189,234", roi: "356%" },
    { platform: "YouTube", campaigns: 6, revenue: "$156,789", roi: "278%" },
    { platform: "Twitter", campaigns: 4, revenue: "$67,890", roi: "234%" },
  ]

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Comprehensive insights into your campaign performance</p>
          </div>
          <div className="flex space-x-4">
            <Select defaultValue="30days">
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overallStats.map((stat, index) => (
          <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div className={`flex items-center text-sm ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                  {stat.trend === "up" ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Performing Campaigns */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((campaign, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div>
                    <h3 className="text-white font-medium">{campaign.campaign}</h3>
                    <p className="text-gray-400 text-sm">{campaign.influencer}</p>
                    <Badge className="mt-1 bg-purple-500/20 text-purple-300">{campaign.platform}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">{campaign.roi}</div>
                    <div className="text-white font-medium">{campaign.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformPerformance.map((platform, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div>
                    <h3 className="text-white font-medium">{platform.platform}</h3>
                    <p className="text-gray-400 text-sm">{platform.campaigns} campaigns</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{platform.revenue}</div>
                    <div className="text-green-400 text-sm">ROI: {platform.roi}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Optimization Opportunity</h4>
              <p className="text-gray-300 text-sm mb-3">
                TikTok campaigns show 42% higher engagement rates. Consider reallocating 15% of Instagram budget.
              </p>
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                Apply Suggestion
              </Button>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Trending Content</h4>
              <p className="text-gray-300 text-sm mb-3">
                Video content performs 3x better than static images. Increase video content by 25%.
              </p>
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                Generate Videos
              </Button>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Audience Insight</h4>
              <p className="text-gray-300 text-sm mb-3">
                Peak engagement occurs at 7-9 PM EST. Schedule 60% of posts during this window.
              </p>
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                Auto-Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
