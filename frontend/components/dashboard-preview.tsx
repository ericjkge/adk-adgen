"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, DollarSign, Eye, Play, MoreHorizontal } from "lucide-react"

export function DashboardPreview() {
  return (
    <section id="dashboard" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Command Center{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Monitor, manage, and optimize all your AI-powered campaigns from a single, intuitive interface designed for
            maximum efficiency.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
        >
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Campaign Overview</h3>
              <p className="text-gray-400">Real-time performance across all active campaigns</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 mt-4 md:mt-0">
              Create New Campaign
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: DollarSign, label: "Revenue", value: "$127.5K", change: "+23.5%", color: "text-green-400" },
              { icon: Eye, label: "Impressions", value: "2.4M", change: "+18.2%", color: "text-blue-400" },
              { icon: Users, label: "Engagement", value: "89.3K", change: "+31.7%", color: "text-purple-400" },
              { icon: TrendingUp, label: "ROI", value: "340%", change: "+12.8%", color: "text-pink-400" },
            ].map((stat, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Campaign List */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Summer Fashion Collection",
                    influencer: "@fashionista_maya",
                    status: "Live",
                    performance: "Excellent",
                    budget: "$15K",
                  },
                  {
                    name: "Tech Product Launch",
                    influencer: "@tech_reviewer_pro",
                    status: "Optimizing",
                    performance: "Good",
                    budget: "$25K",
                  },
                  {
                    name: "Fitness Challenge Series",
                    influencer: "@fitness_guru_alex",
                    status: "Live",
                    performance: "Excellent",
                    budget: "$18K",
                  },
                ].map((campaign, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{campaign.name}</h4>
                        <p className="text-gray-400 text-sm">{campaign.influencer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            campaign.status === "Live"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {campaign.status}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{campaign.performance}</div>
                        <div className="text-gray-400 text-sm">Performance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{campaign.budget}</div>
                        <div className="text-gray-400 text-sm">Budget</div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
