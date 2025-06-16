"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Target, DollarSign, Users, ArrowRight } from "lucide-react"

export function CampaignCreator() {
  const [step, setStep] = useState(1)
  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    budget: "",
    duration: "",
    targetAudience: "",
    platforms: [],
    objectives: [],
  })

  const platforms = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook"]
  const objectives = ["Brand Awareness", "Lead Generation", "Sales", "Engagement", "App Downloads"]

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Campaign</h1>
          <p className="text-gray-400">Let our AI agents help you create the perfect advertising campaign</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepNum
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > stepNum ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              {step === 1 && (
                <>
                  <Target className="w-5 h-5 mr-2" /> Campaign Basics
                </>
              )}
              {step === 2 && (
                <>
                  <Users className="w-5 h-5 mr-2" /> Target Audience
                </>
              )}
              {step === 3 && (
                <>
                  <DollarSign className="w-5 h-5 mr-2" /> Budget & Timeline
                </>
              )}
              {step === 4 && (
                <>
                  <Sparkles className="w-5 h-5 mr-2" /> AI Optimization
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="campaign-name" className="text-white">
                    Campaign Name
                  </Label>
                  <Input
                    id="campaign-name"
                    placeholder="Enter campaign name"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">
                    Campaign Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your campaign goals and message"
                    value={campaignData.description}
                    onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-white mb-3 block">Campaign Objectives</Label>
                  <div className="flex flex-wrap gap-2">
                    {objectives.map((objective) => (
                      <Badge
                        key={objective}
                        variant={campaignData.objectives.includes(objective) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          campaignData.objectives.includes(objective)
                            ? "bg-purple-500 hover:bg-purple-600"
                            : "border-white/20 text-gray-300 hover:bg-white/10"
                        }`}
                        onClick={() => {
                          const newObjectives = campaignData.objectives.includes(objective)
                            ? campaignData.objectives.filter((o) => o !== objective)
                            : [...campaignData.objectives, objective]
                          setCampaignData({ ...campaignData, objectives: newObjectives })
                        }}
                      >
                        {objective}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="target-audience" className="text-white">
                    Target Audience
                  </Label>
                  <Textarea
                    id="target-audience"
                    placeholder="Describe your ideal customer (age, interests, demographics, etc.)"
                    value={campaignData.targetAudience}
                    onChange={(e) => setCampaignData({ ...campaignData, targetAudience: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-white mb-3 block">Target Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => (
                      <Badge
                        key={platform}
                        variant={campaignData.platforms.includes(platform) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          campaignData.platforms.includes(platform)
                            ? "bg-purple-500 hover:bg-purple-600"
                            : "border-white/20 text-gray-300 hover:bg-white/10"
                        }`}
                        onClick={() => {
                          const newPlatforms = campaignData.platforms.includes(platform)
                            ? campaignData.platforms.filter((p) => p !== platform)
                            : [...campaignData.platforms, platform]
                          setCampaignData({ ...campaignData, platforms: newPlatforms })
                        }}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="text-purple-300 font-semibold mb-2">AI Recommendation</h3>
                  <p className="text-gray-300 text-sm">
                    Based on your objectives, we recommend targeting Instagram and TikTok for maximum engagement with
                    your demographic. Our AI has identified 2,847 potential influencers in your niche.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="budget" className="text-white">
                      Campaign Budget
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5000">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10000">$10,000 - $25,000</SelectItem>
                        <SelectItem value="25000">$25,000 - $50,000</SelectItem>
                        <SelectItem value="50000">$50,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-white">
                      Campaign Duration
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1week">1 Week</SelectItem>
                        <SelectItem value="2weeks">2 Weeks</SelectItem>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-green-300 font-semibold mb-2">Budget Optimization</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Our AI suggests allocating your budget as follows for maximum ROI:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Influencer Payments (60%)</span>
                      <span className="text-white">$15,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Content Creation (25%)</span>
                      <span className="text-white">$6,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Platform Ads (15%)</span>
                      <span className="text-white">$3,750</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">AI Campaign Optimization</h3>
                  <p className="text-gray-300">Our AI agents are ready to optimize your campaign</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                    <h4 className="text-purple-300 font-semibold mb-2">Creative Agent</h4>
                    <p className="text-gray-300 text-sm">Will generate compelling ad copy and visuals</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <h4 className="text-blue-300 font-semibold mb-2">Matching Agent</h4>
                    <p className="text-gray-300 text-sm">Will find perfect influencers for your brand</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <h4 className="text-green-300 font-semibold mb-2">Analytics Agent</h4>
                    <p className="text-gray-300 text-sm">Will monitor and optimize performance</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">Campaign Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Campaign Name</span>
                      <span className="text-white">{campaignData.name || "Untitled Campaign"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Objectives</span>
                      <span className="text-white">{campaignData.objectives.join(", ") || "None selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Platforms</span>
                      <span className="text-white">{campaignData.platforms.join(", ") || "None selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Estimated Reach</span>
                      <span className="text-white">2.4M - 3.8M users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Predicted ROI</span>
                      <span className="text-green-400">285% - 340%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                Previous
              </Button>
              <Button
                onClick={step === 4 ? () => alert("Campaign created!") : handleNext}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {step === 4 ? "Launch Campaign" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
