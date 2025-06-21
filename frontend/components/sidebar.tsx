"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, Video, Image, Mic } from "lucide-react"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "avatars", label: "Avatars & Voices", icon: Mic },
  ]

  return (
    <div 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 p-6 transition-all duration-300 ease-in-out group hover:w-64`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className={`flex items-center mb-8 transition-all duration-300 ${isCollapsed ? 'justify-center space-x-0' : 'space-x-2'}`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/25">
          <Video className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-xl font-bold text-white transition-all duration-300">
            Vibe
          </span>
        )}
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={`w-full transition-all duration-300 ${
              isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-start h-11 px-4'
            } ${
              activeView === item.id
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-400 hover:text-white hover:bg-gray-800/30"
            }`}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </Button>
        ))}
      </nav>
    </div>
  )
}
