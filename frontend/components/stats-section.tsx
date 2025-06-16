"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Zap, DollarSign } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: TrendingUp,
      value: "300%",
      label: "Average ROI Increase",
      color: "text-green-400",
    },
    {
      icon: Users,
      value: "50K+",
      label: "Influencers Connected",
      color: "text-purple-400",
    },
    {
      icon: Zap,
      value: "10M+",
      label: "Ads Generated",
      color: "text-yellow-400",
    },
    {
      icon: DollarSign,
      value: "$2B+",
      label: "Revenue Generated",
      color: "text-pink-400",
    },
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Industry Leaders</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our AI agents have transformed advertising for thousands of brands worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
