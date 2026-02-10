/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client"

import { type Spec, CLASS_COLORS, BUFFS } from "@/lib/tbc-data"
import { cn } from "@/lib/utils"
import { X, Users, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface GroupManagerProps {
  groups: (Spec | null)[][]
  onRemove: (groupIndex: number, slotIndex: number) => void
  onMoveToGroup: (specIndex: number, targetGroupIndex: number, targetSlotIndex: number) => void
}

export function GroupManager({ groups, onRemove, onMoveToGroup }: GroupManagerProps) {
  const [showSuggestions, setShowSuggestions] = useState(true)
  
  // Get party buffs for a specific group
  const getGroupBuffs = (groupIndex: number) => {
    const groupSpecs = groups[groupIndex].filter((s): s is Spec => s !== null)
    const partyBuffs = new Set<string>()
    
    groupSpecs.forEach(spec => {
      spec.buffs.forEach(buffId => {
        const buff = BUFFS.find(b => b.id === buffId)
        if (buff?.scope === "party") {
          partyBuffs.add(buffId)
        }
      })
    })
    
    return partyBuffs
  }

  // Get important missing buffs for a group
  const getMissingBuffs = (groupIndex: number) => {
    const groupSpecs = groups[groupIndex].filter((s): s is Spec => s !== null)
    if (groupSpecs.length === 0) return []
    
    const groupBuffs = getGroupBuffs(groupIndex)
    const hasPhysical = groupSpecs.some(s => s.role === "melee" || s.role === "tank")
    const hasCasters = groupSpecs.some(s => s.role === "ranged" || s.role === "healer")
    
    const missing: string[] = []
    
    // Check for important party buffs based on group composition
    if (hasPhysical && !groupBuffs.has("windfury-totem")) {
      missing.push("Windfury Totem")
    }
    if (hasCasters && !groupBuffs.has("wrath-of-air-totem")) {
      missing.push("Wrath of Air")
    }
    if (hasCasters && !groupBuffs.has("moonkin-aura")) {
      missing.push("Moonkin Aura")
    }
    if (hasPhysical && !groupBuffs.has("leader-of-the-pack")) {
      missing.push("Leader of Pack")
    }
    
    return missing
  }

  // Generate optimization suggestions
  const getOptimizationSuggestions = () => {
    const suggestions: string[] = []
    
    groups.forEach((group, index) => {
      const groupSpecs = group.filter((s): s is Spec => s !== null)
      if (groupSpecs.length === 0) return
      
      const hasPhysical = groupSpecs.some(s => s.role === "melee" || s.role === "tank")
      const hasCasters = groupSpecs.some(s => s.role === "ranged" || s.role === "healer")
      const hasEnhanceShaman = groupSpecs.some(s => s.id === "enhance-shaman")
      const hasElementalShaman = groupSpecs.some(s => s.id === "elemental-shaman")
      const hasRestoShaman = groupSpecs.some(s => s.id === "resto-shaman")
      const hasMoonkin = groupSpecs.some(s => s.id === "balance-druid")
      const hasFeral = groupSpecs.some(s => s.id === "feral-druid")
      
      // Melee group suggestions
      if (hasPhysical && !hasEnhanceShaman && groupSpecs.length >= 3) {
        suggestions.push(`Group ${index + 1}: Add Enhancement Shaman for Windfury Totem (huge melee DPS boost)`)
      }
      
      // Caster group suggestions
      if (hasCasters && !hasElementalShaman && !hasRestoShaman && groupSpecs.length >= 3) {
        suggestions.push(`Group ${index + 1}: Add Elemental/Resto Shaman for Wrath of Air Totem (+101 spell power)`)
      }
      
      if (hasCasters && !hasMoonkin && groupSpecs.length >= 3) {
        suggestions.push(`Group ${index + 1}: Add Balance Druid for +5% spell crit aura`)
      }
      
      if (hasPhysical && !hasFeral && groupSpecs.length >= 3) {
        suggestions.push(`Group ${index + 1}: Add Feral Druid for +5% crit aura`)
      }
      
      // Mixed group warning
      if (hasPhysical && hasCasters && groupSpecs.length >= 4) {
        suggestions.push(`Group ${index + 1}: Consider separating melee and casters for better buff optimization`)
      }
    })
    
    return suggestions
  }

  const suggestions = getOptimizationSuggestions()

  const getGroupComposition = (groupIndex: number) => {
    const groupSpecs = groups[groupIndex].filter((s): s is Spec => s !== null)
    const tanks = groupSpecs.filter(s => s.role === "tank").length
    const healers = groupSpecs.filter(s => s.role === "healer").length
    const melee = groupSpecs.filter(s => s.role === "melee").length
    const ranged = groupSpecs.filter(s => s.role === "ranged").length
    
    return { tanks, healers, melee, ranged, total: groupSpecs.length }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Group Assignments</h2>
        </div>
        {suggestions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {showSuggestions ? "Hide" : "Show"} Suggestions
          </Button>
        )}
      </div>
      
      {/* Optimization Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
            <Lightbulb className="h-4 w-4" />
            <span>Optimization Suggestions</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-normal">
              WIP
            </span>
          </div>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid gap-4">
        {groups.map((group, groupIndex) => {
          const composition = getGroupComposition(groupIndex)
          const missingBuffs = getMissingBuffs(groupIndex)

          const key = `group-${groupIndex}`
          
          return (
            <div
              key={key}
              className="bg-card/50 border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground">
                    Group {groupIndex + 1}
                  </h3>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {composition.tanks > 0 && <span>{composition.tanks}T</span>}
                    {composition.healers > 0 && <span>{composition.healers}H</span>}
                    {composition.melee > 0 && <span>{composition.melee}M</span>}
                    {composition.ranged > 0 && <span>{composition.ranged}R</span>}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {composition.total}/5
                </span>
              </div>

              {/* Missing Buffs Warning */}
              {missingBuffs.length > 0 && composition.total > 0 && (
                <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-600 dark:text-amber-400">
                  Missing: {missingBuffs.join(", ")}
                </div>
              )}

              {/* Group Slots */}
              <div className="grid grid-cols-5 gap-2">
                {group.map((spec, slotIndex) => {
                  const flatIndex = groupIndex * 5 + slotIndex
                  
                  if (spec) {
                    return (
                      <div
                        key={`${key}-slot-${slotIndex}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("specIndex", flatIndex.toString())
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const sourceIndex = parseInt(e.dataTransfer.getData("specIndex"))
                          onMoveToGroup(sourceIndex, groupIndex, slotIndex)
                        }}
                        className={cn(
                          "relative group/slot p-2 rounded border border-border/50",
                          "bg-background/50 hover:bg-background transition-colors cursor-move"
                        )}
                        style={{
                          borderColor: `${CLASS_COLORS[spec.class]}40`,
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemove(groupIndex, slotIndex)}
                          className="absolute -top-1 -right-1 h-5 w-5 opacity-0 group-hover/slot:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="text-xs font-medium" style={{ color: CLASS_COLORS[spec.class] }}>
                          {spec.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground capitalize">
                          {spec.role}
                        </div>
                      </div>
                    )
                  }

                  // Empty slot
                  return (
                    <div
                      key={`${key}-slot-${slotIndex}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const sourceIndex = parseInt(e.dataTransfer.getData("specIndex"))
                        onMoveToGroup(sourceIndex, groupIndex, slotIndex)
                      }}
                      className="p-2 rounded border border-dashed border-border/30 bg-background/20 hover:bg-background/30 transition-colors min-h-[48px]"
                    >
                      <div className="text-[10px] text-muted-foreground/50 text-center">
                        Empty
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
