"use client"

import { useState, useRef } from "react"
import { ClassSelector } from "@/components/class-selector"
import { BuffTracker } from "@/components/buff-tracker"
import { GroupManager } from "@/components/group-manager"
import { type Spec, BUFFS, DEBUFFS, SPECS } from "@/lib/tbc-data"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw, Sword, Download, Upload, Megaphone } from "lucide-react"
import changelogData from "@/lib/changelog.json"

export default function RaidCompEditor() {
  // Groups structure: array of 5 groups, each containing up to 5 players
  const [groups, setGroups] = useState<(Spec | null)[][]>(
    Array(5).fill(null).map(() => Array(5).fill(null))
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Flatten groups to get roster for compatibility
  const roster = groups.flat().filter((spec): spec is Spec => spec !== null)

  const handleAddSpec = (spec: Spec) => {
    if (roster.length < 25) {
      // Find first empty slot in any group
      const newGroups = [...groups]
      for (let groupIndex = 0; groupIndex < 5; groupIndex++) {
        for (let slotIndex = 0; slotIndex < 5; slotIndex++) {
          if (newGroups[groupIndex][slotIndex] === null) {
            newGroups[groupIndex][slotIndex] = spec
            setGroups(newGroups)
            return
          }
        }
      }
    }
  }

  const handleRemove = (groupIndex: number, slotIndex: number) => {
    const newGroups = [...groups]
    newGroups[groupIndex][slotIndex] = null
    setGroups(newGroups)
  }

  const handleClear = () => {
    setGroups(Array(5).fill(null).map(() => Array(5).fill(null)))
  }

  const handleMoveToGroup = (specIndex: number, targetGroupIndex: number, targetSlotIndex: number) => {
    // Find the spec in current groups
    let sourceGroupIndex = -1
    let sourceSlotIndex = -1
    
    for (let gi = 0; gi < groups.length; gi++) {
      const si = groups[gi].findIndex((s, idx) => {
        const currentIndex = gi * 5 + idx
        return currentIndex === specIndex && s !== null
      })
      if (si !== -1) {
        sourceGroupIndex = gi
        sourceSlotIndex = si
        break
      }
    }

    if (sourceGroupIndex === -1) return

    const newGroups = [...groups.map(g => [...g])]
    const spec = newGroups[sourceGroupIndex][sourceSlotIndex]
    
    // Swap if target has a spec, otherwise just move
    const targetSpec = newGroups[targetGroupIndex][targetSlotIndex]
    newGroups[targetGroupIndex][targetSlotIndex] = spec
    newGroups[sourceGroupIndex][sourceSlotIndex] = targetSpec
    
    setGroups(newGroups)
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
          
          // Place specs into groups
          const newGroups = Array(5).fill(null).map(() => Array(5).fill(null))
          reconstructedRoster.forEach((spec: Spec, index: number) => {
            const groupIndex = Math.floor(index / 5)
            const slotIndex = index % 5
            if (groupIndex < 5) {
              newGroups[groupIndex][slotIndex] = spec
            }
          })
          setGroups(newGroups)
        } else {
          alert("Invalid roster file format")
        }
      } catch {
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
    <main className="bg-background">
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

            {/* Latest Changes Section */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Latest Changes</h2>
              </div>
              <div className="space-y-3 text-sm">
                {changelogData.releases.map((release) => (
                  <div
                    key={release.version}
                    className={`border-l-2 pl-3 ${
                      release.isLatest ? "border-primary" : "border-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">v{release.version}</span>
                      <span className="text-xs text-muted-foreground">{release.date}</span>
                    </div>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      {release.changes.map((change, index) => (
                        <li key={index}>• {change}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="space-y-6">
            {roster.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <RotateCcw className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Raid Members Added
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Hover over a class on the left and select a spec to add raid
                    members. Organize them into groups and track buff coverage.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-card border border-border rounded-lg p-4">
                  <GroupManager 
                    groups={groups} 
                    onRemove={handleRemove} 
                    onMoveToGroup={handleMoveToGroup}
                  />
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <BuffTracker roster={roster} groups={groups} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
