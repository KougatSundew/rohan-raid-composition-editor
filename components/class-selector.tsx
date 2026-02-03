"use client"

import { CLASS_COLORS, SPECS, type Spec, type WowClass } from "@/lib/tbc-data"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

const CLASSES: WowClass[] = [
  "warrior",
  "paladin",
  "hunter",
  "rogue",
  "priest",
  "shaman",
  "mage",
  "warlock",
  "druid",
]

interface ClassSelectorProps {
  onAddSpec: (spec: Spec) => void
}

export function ClassSelector({ onAddSpec }: ClassSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Add Raid Members</h2>
      <div className="grid grid-cols-3 gap-2">
        {CLASSES.map((wowClass) => {
          const classSpecs = SPECS.filter((s) => s.class === wowClass)
          return (
            <div key={wowClass} className="relative group">
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 rounded-md text-sm font-medium transition-all",
                  "border border-border/50 hover:border-border",
                  "bg-card/50 hover:bg-card"
                )}
                style={{
                  borderColor: `${CLASS_COLORS[wowClass]}40`,
                  color: CLASS_COLORS[wowClass],
                }}
              >
                {wowClass.charAt(0).toUpperCase() + wowClass.slice(1)}
              </button>
              <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block w-48">
                <div className="bg-popover border border-border rounded-md shadow-lg p-1">
                  {classSpecs.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => onAddSpec(spec)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded text-sm",
                        "hover:bg-muted transition-colors text-left"
                      )}
                    >
                      <Plus className="h-3 w-3 text-muted-foreground" />
                      <span style={{ color: CLASS_COLORS[wowClass] }}>
                        {spec.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto capitalize">
                        {spec.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
