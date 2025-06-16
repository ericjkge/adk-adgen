"use client"

import { motion } from "framer-motion"
import { Bot, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function AIAgentShowcase() {
  const agents = [
    {
      name: "Creative Agent",
      role: "Content Generation",
      status: "Active",
      tasks: "Generating ad copy for 12 campaigns",
      efficiency: "98%",
      color: "purple",
    },
    {
      name: "Analytics Agent",
      role: "Performance Optimization",
      status: "Learning",
      tasks: "Analyzing 2.3M data points",
      efficiency: "94%",
      color: "blue",
    },
    {
      name: "Matching Agent",
      role: "Influencer Discovery",
      status: "Active",
      tasks: "Screening 847 influencers",
      efficiency: "96%",
      color: "green",
    },
  ]

  return (
    <section id="agents" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Meet Your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Workforce
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Specialized AI agents work collaboratively to handle every aspect of your advertising campaigns, from
            creation to optimization.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {agents.map((agent, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                          agent.color === "purple"
                            ? "from-purple-500 to-pink-500"
                            : agent.color === "blue"
                              ? "from-blue-500 to-cyan-500"
                              : "from-green-500 to-emerald-500"
                        } flex items-center justify-center`}
                      >
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{agent.name}</h3>
                        <p className="text-gray-400 text-sm">{agent.role}</p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agent.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {agent.status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Task:</span>
                      <span className="text-white">{agent.tasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Efficiency:</span>
                      <span className="text-green-400">{agent.efficiency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Agent Collaboration Network</h3>
                <p className="text-gray-300">Real-time communication between AI agents</p>
              </div>

              <div className="relative h-64 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>

                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`absolute w-16 h-16 rounded-full bg-gradient-to-r ${
                      i === 0
                        ? "from-purple-500 to-pink-500 top-4 left-1/2 transform -translate-x-1/2"
                        : i === 1
                          ? "from-blue-500 to-cyan-500 bottom-4 left-8"
                          : "from-green-500 to-emerald-500 bottom-4 right-8"
                    } flex items-center justify-center animate-bounce`}
                    style={{ animationDelay: `${i * 0.5}s` }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                ))}

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <line
                    x1="50%"
                    y1="20%"
                    x2="25%"
                    y2="80%"
                    stroke="url(#line-gradient)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <line
                    x1="50%"
                    y1="20%"
                    x2="75%"
                    y2="80%"
                    stroke="url(#line-gradient)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <line
                    x1="25%"
                    y1="80%"
                    x2="75%"
                    y2="80%"
                    stroke="url(#line-gradient)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
