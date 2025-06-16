"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Zap } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Supernova AI
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#agents" className="text-gray-300 hover:text-white transition-colors">
              AI Agents
            </a>
            <a href="#dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <Button
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
            >
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Get Started
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-4 space-y-4">
            <a href="#features" className="block text-gray-300 hover:text-white">
              Features
            </a>
            <a href="#agents" className="block text-gray-300 hover:text-white">
              AI Agents
            </a>
            <a href="#dashboard" className="block text-gray-300 hover:text-white">
              Dashboard
            </a>
            <a href="#pricing" className="block text-gray-300 hover:text-white">
              Pricing
            </a>
            <div className="flex flex-col space-y-2 pt-4">
              <Button variant="outline" className="border-purple-500 text-purple-400">
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
