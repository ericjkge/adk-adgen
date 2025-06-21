"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { VideoGenerationWizard } from "@/components/video-generation-wizard"
import { GalleryView } from "@/components/gallery-view"
import { AvatarsView } from "@/components/avatars-view"

export default function VibeApp() {
  const [activeView, setActiveView] = useState("home")

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <VideoGenerationWizard />
      case "gallery":
        return <GalleryView />
      case "avatars":
        return <AvatarsView />
      default:
        return <VideoGenerationWizard />
    }
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto">{renderView()}</main>
    </div>
  )
}
