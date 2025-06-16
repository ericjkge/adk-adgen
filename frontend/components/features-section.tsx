"use client"

import { motion } from "framer-motion"
import { Brain, Target, BarChart3, Zap, Users, Shield } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI Content Generation",
      description:
        "Advanced neural networks create compelling ad copy, visuals, and video content tailored to your brand voice.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Target,
      title: "Smart Influencer Matching",
      description: "Our AI analyzes millions of data points to find the perfect influencers for your campaign goals.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track performance metrics and ROI with advanced analytics powered by machine learning insights.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Automated Optimization",
      description: "Campaigns self-optimize using reinforcement learning to maximize engagement and conversions.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Users,
      title: "Multi-Platform Management",
      description: "Manage campaigns across Instagram, TikTok, YouTube, and Twitter from a single dashboard.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "Brand Safety AI",
      description: "Advanced content moderation ensures your brand is always represented safely and appropriately.",
      gradient: "from-indigo-500 to-purple-500",
    },
  ]

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powered by{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Next-Gen AI
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our intelligent agents work 24/7 to create, optimize, and manage your advertising campaigns with
            unprecedented precision and efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>

              <p className="text-gray-400 leading-relaxed">{feature.description}</p>

              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
