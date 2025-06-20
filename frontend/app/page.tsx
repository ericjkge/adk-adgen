"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { CampaignCreator } from "@/components/campaign-creator"
import { InfluencerDiscovery } from "@/components/influencer-discovery"
import { ContentGenerator } from "@/components/content-generator"
import { VideoGenerator } from "@/components/video-generator"
import { Analytics } from "@/components/analytics"
import { CampaignManager } from "@/components/campaign-manager"

export default function SupernovaApp() {
  const [activeView, setActiveView] = useState("dashboard")

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />
      case "create":
        return <CampaignCreator />
      case "influencers":
        return <InfluencerDiscovery />
      case "content":
        return <ContentGenerator />
      case "video":
        return <VideoGenerator />
      case "campaigns":
        return <CampaignManager />
      case "analytics":
        return <Analytics />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-hidden">{renderView()}</main>
    </div>
  )
}
