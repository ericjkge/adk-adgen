"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, DollarSign, Eye, ArrowUp, ArrowDown } from "lucide-react"

export function Dashboard() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$127,543",
      change: "+23.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      title: "Active Campaigns",
      value: "24",
      change: "+12.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      title: "Total Impressions",
      value: "2.4M",
      change: "+18.7%",
      trend: "up",
      icon: Eye,
      color: "text-purple-400",
    },
    {
      title: "Influencers Connected",
      value: "156",
      change: "-2.1%",
      trend: "down",
      icon: Users,
      color: "text-pink-400",
    },
  ]

  const recentCampaigns = [
    { name: "Summer Fashion Collection", status: "Live", performance: "Excellent", budget: "$15,000" },
    { name: "Tech Product Launch", status: "Optimizing", performance: "Good", budget: "$25,000" },
    { name: "Fitness Challenge Series", status: "Live", performance: "Excellent", budget: "$18,000" },
    { name: "Beauty Brand Collab", status: "Pending", performance: "N/A", budget: "$12,000" },
  ]

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your campaigns.</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          Create New Campaign
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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

      {/* Recent Campaigns */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCampaigns.map((campaign, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div>
                  <h3 className="text-white font-medium">{campaign.name}</h3>
                  <p className="text-gray-400 text-sm">Budget: {campaign.budget}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === "Live"
                          ? "bg-green-500/20 text-green-400"
                          : campaign.status === "Optimizing"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {campaign.status}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-medium">{campaign.performance}</div>
                    <div className="text-gray-400 text-xs">Performance</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Agents Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Creative Agent</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Tasks Completed</span>
                <span className="text-white">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Success Rate</span>
                <span className="text-green-400">94.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Analytics Agent</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className="text-yellow-400">Learning</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Data Points</span>
                <span className="text-white">2.3M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Accuracy</span>
                <span className="text-green-400">96.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Matching Agent</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Matches Found</span>
                <span className="text-white">1,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Match Quality</span>
                <span className="text-green-400">92.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
