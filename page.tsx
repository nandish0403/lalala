import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic" // Dynamically import client component

const ThreatVisualization = dynamic(() => import("@/components/threat-visualization"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">Loading Visualization...</div>
  ),
})

export default function SecureWaveDashboard() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-12 lg:p-16 flex flex-col gap-8">
      <header className="flex items-center justify-between pb-6 border-b border-border">
        <h1 className="text-4xl font-bold text-primary font-mono text-balance">SecureWave System</h1>
        <div className="flex items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        {/* Offline Threat Visualization */}
        <Card className="lg:col-span-2 bg-card border-border shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Offline Threat Visualization</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ThreatVisualization />
          </CardContent>
        </Card>

        {/* Feature Controls */}
        <div className="flex flex-col gap-8">
          {/* See-Through Detection */}
          <FeatureControlCard
            title="See-Through Detection"
            description="Advanced mmWave sensors penetrate walls and physical barriers to detect even the slightest human motion or still presence."
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="detection-switch" className="text-muted-foreground">
                Detection Active
              </Label>
              <Switch id="detection-switch" defaultChecked />
            </div>
            <div className="mt-4">
              <Label htmlFor="sensitivity" className="text-muted-foreground">
                Sensitivity Level
              </Label>
              <Input
                id="sensitivity"
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="mt-2 accent-primary"
              />
            </div>
          </FeatureControlCard>

          {/* Multifactor Secure Control */}
          <FeatureControlCard
            title="Multifactor Secure Control"
            description="The base unit's command access is protected by robust three-factor authentication (key, RFID, fingerprint) ensuring tamper-proof system management."
          >
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="key-status" className="text-muted-foreground">
                  Key Status
                </Label>
                <Input
                  id="key-status"
                  value="Connected"
                  readOnly
                  className="mt-1 bg-muted border-border text-primary"
                />
              </div>
              <div>
                <Label htmlFor="rfid-status" className="text-muted-foreground">
                  RFID Reader
                </Label>
                <Input id="rfid-status" value="Active" readOnly className="mt-1 bg-muted border-border text-primary" />
              </div>
              <div>
                <Label htmlFor="fingerprint-status" className="text-muted-foreground">
                  Fingerprint Scanner
                </Label>
                <Input
                  id="fingerprint-status"
                  value="Calibrated"
                  readOnly
                  className="mt-1 bg-muted border-border text-primary"
                />
              </div>
              <Button className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Manage Access
              </Button>
            </div>
          </FeatureControlCard>

          {/* Always-On Resilience */}
          <FeatureControlCard
            title="Always-On Resilience"
            description="Features 12-hour battery backup and automatic wireless failover guaranteeing uninterrupted security even if lines are cut."
          >
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="battery-level" className="text-muted-foreground">
                  Battery Level
                </Label>
                <Input id="battery-level" value="95%" readOnly className="mt-1 bg-muted border-border text-primary" />
              </div>
              <div>
                <Label htmlFor="failover-status" className="text-muted-foreground">
                  Wireless Failover
                </Label>
                <Input
                  id="failover-status"
                  value="Ready"
                  readOnly
                  className="mt-1 bg-muted border-border text-primary"
                />
              </div>
              <Button className="w-full mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                Run Diagnostics
              </Button>
            </div>
          </FeatureControlCard>
        </div>
      </div>
    </main>
  )
}

function FeatureControlCard({
  title,
  description,
  children,
}: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  )
}
