"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plus, Users, Sparkles, BarChart3, Zap, PlayCircle } from "lucide-react"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create", label: "Create Campaign", icon: Plus },
    { id: "influencers", label: "Find Influencers", icon: Users },
    { id: "content", label: "Generate Content", icon: Sparkles },
    { id: "campaigns", label: "Manage Campaigns", icon: PlayCircle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 p-6">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Supernova AI
        </span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? "secondary" : "ghost"}
            className={`w-full justify-start text-left ${
              activeView === item.id
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-white/10">
        <h3 className="text-white font-semibold mb-2">AI Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Creative Agent</span>
            <span className="text-green-400">Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Analytics Agent</span>
            <span className="text-green-400">Learning</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Matching Agent</span>
            <span className="text-green-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
