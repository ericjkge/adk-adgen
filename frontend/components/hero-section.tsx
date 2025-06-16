"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles, Zap, Target } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Powered by Advanced AI Agents</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Ad Revolution
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with the world's top influencers through intelligent AI agents that create, optimize, and manage
            your advertising campaigns automatically.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
          >
            Start Creating Ads
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm"
          >
            <Play className="mr-2 w-5 h-5" />
            Watch Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Zap className="w-8 h-8 text-purple-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Generate campaigns in seconds with AI automation</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Target className="w-8 h-8 text-pink-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">Precision Targeting</h3>
            <p className="text-gray-400">AI matches your brand with perfect influencers</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Sparkles className="w-8 h-8 text-purple-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">Smart Optimization</h3>
            <p className="text-gray-400">Continuous learning improves campaign performance</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
