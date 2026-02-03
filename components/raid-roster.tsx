"use client"

import { CLASS_COLORS, type Spec } from "@/lib/tbc-data"
import { cn } from "@/lib/utils"
import { X, Shield, Heart, Swords, Crosshair, Users } from "lucide-react"

interface RaidRosterProps {
  roster: Spec[]
  onRemove: (index: number) => void
}

const ROLE_ICONS = {
  tank: Shield,
  healer: Heart,
  melee: Swords,
  ranged: Crosshair,
}

export function RaidRoster({ roster, onRemove }: RaidRosterProps) {
  const tanks = roster.filter((s) => s.role === "tank")
  const healers = roster.filter((s) => s.role === "healer")
  const melee = roster.filter((s) => s.role === "melee")
  const ranged = roster.filter((s) => s.role === "ranged")

  const groups = [
    { name: "Tanks", specs: tanks, icon: Shield },
    { name: "Healers", specs: healers, icon: Heart },
    { name: "Melee DPS", specs: melee, icon: Swords },
    { name: "Ranged DPS", specs: ranged, icon: Crosshair },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Raid Roster
        </h2>
        <span className="text-sm text-muted-foreground">
          {roster.length}/25
        </span>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.name} className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <group.icon className="h-4 w-4" />
              <span>{group.name}</span>
              <span className="text-xs">({group.specs.length})</span>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[36px] p-2 rounded-md bg-muted/30 border border-border/50">
              {group.specs.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  No {group.name.toLowerCase()} added
                </span>
              ) : (
                group.specs.map((spec, i) => {
                  const originalIndex = roster.findIndex(
                    (s, idx) =>
                      s.id === spec.id &&
                      roster.slice(0, idx).filter((r) => r.id === spec.id)
                        .length ===
                        group.specs.slice(0, i).filter((r) => r.id === spec.id)
                          .length
                  )
                  return (
                    <div
                      key={`${spec.id}-${i}`}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
                        "bg-card border border-border/50 group"
                      )}
                      style={{
                        borderColor: `${CLASS_COLORS[spec.class]}60`,
                      }}
                    >
                      <span style={{ color: CLASS_COLORS[spec.class] }}>
                        {spec.name} {spec.class.charAt(0).toUpperCase() + spec.class.slice(1)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemove(originalIndex)}
                        className="opacity-50 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        aria-label={`Remove ${spec.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
