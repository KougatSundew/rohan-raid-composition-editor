"use client"

import { useState, useRef } from "react"
import { ClassSelector } from "@/components/class-selector"
import { RaidRoster } from "@/components/raid-roster"
import { BuffTracker } from "@/components/buff-tracker"
import { type Spec, BUFFS, DEBUFFS, SPECS } from "@/lib/tbc-data"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw, Sword, Download, Upload } from "lucide-react"

export default function RaidCompEditor() {
  const [roster, setRoster] = useState<Spec[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddSpec = (spec: Spec) => {
    if (roster.length < 25) {
      setRoster([...roster, spec])
    }
  }

  const handleRemove = (index: number) => {
    setRoster(roster.filter((_, i) => i !== index))
  }

  const handleClear = () => {
    setRoster([])
  }

  const handleExport = () => {
    const data = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      roster: roster.map(spec => spec.id),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `raid-comp-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        if (data.roster && Array.isArray(data.roster)) {
          // Reconstruct the full Spec objects from spec IDs
          const reconstructedRoster = data.roster
            .map((specId: string) => SPECS.find(s => s.id === specId))
            .filter((spec): spec is Spec => spec !== undefined)
          
          setRoster(reconstructedRoster)
        } else {
          alert("Invalid roster file format")
        }
      } catch (error) {
        alert("Error reading file. Please ensure it's a valid JSON file.")
      }
    }
    reader.readAsText(file)
    
    // Reset input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const coveredBuffs = new Set(roster.flatMap((s) => s.buffs))
  const coveredDebuffs = new Set(roster.flatMap((s) => s.debuffs))
  const buffCoverage = Math.round((coveredBuffs.size / BUFFS.length) * 100)
  const debuffCoverage = Math.round((coveredDebuffs.size / DEBUFFS.length) * 100)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sword className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Rohan TBC Raid Comp Editor
                </h1>
                <p className="text-sm text-muted-foreground">
                  The Burning Crusade Classic
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Buffs:</span>
                  <span className="font-medium text-primary">{buffCoverage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Debuffs:</span>
                  <span className="font-medium text-destructive">{debuffCoverage}%</span>
                </div>
              </div>

              {roster.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="gap-2 bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Left Sidebar */}
          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <ClassSelector onAddSpec={handleAddSpec} />
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <RaidRoster roster={roster} onRemove={handleRemove} />
            </div>

            {/* Import/Export Section */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Save & Load
              </h2>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={roster.length === 0}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Roster
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImportClick}
                  className="w-full gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import Roster
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="bg-card border border-border rounded-lg p-4">
            {roster.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <RotateCcw className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Raid Members Added
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Hover over a class on the left and select a spec to add raid
                  members. Track which buffs and debuffs your composition covers.
                </p>
              </div>
            ) : (
              <BuffTracker roster={roster} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
