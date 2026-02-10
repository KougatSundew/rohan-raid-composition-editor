"use client"

import {
  BUFFS,
  DEBUFFS,
  CLASS_COLORS,
  type Spec,
  type BuffOrDebuff,
} from "@/lib/tbc-data"
import { cn } from "@/lib/utils"
import { Check, X, Sparkles, Target, Info } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BuffTrackerProps {
  roster: Spec[]
  groups: (Spec | null)[][]
}

function BuffCard({
  buff,
  isCovered,
  providers,
  isDebuff = false,
}: {
  buff: BuffOrDebuff
  isCovered: boolean
  providers: Spec[]
  isDebuff?: boolean
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "p-3 rounded-lg border transition-all cursor-help group",
              isCovered
                ? isDebuff
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-primary/10 border-primary/30"
                : "bg-card/30 border-border/50 opacity-60"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {isCovered ? (
                    <Check className={cn("h-4 w-4 shrink-0", isDebuff ? "text-destructive" : "text-primary")} />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isCovered ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {buff.name}
                  </span>
                  <Info className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground pl-6">{buff.description}</p>
              </div>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full shrink-0",
                  isCovered
                    ? isDebuff
                      ? "bg-destructive/20 text-destructive"
                      : "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {buff.category}
              </span>
            </div>
            {isCovered && providers.length > 0 && (
              <div className="mt-2 pl-6 flex flex-wrap gap-1">
                {providers.slice(0, 3).map((spec, i) => (
                  <span
                    key={`${spec.id}-${i}`}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50"
                    style={{ color: CLASS_COLORS[spec.class] }}
                  >
                    {spec.name} {spec.class.charAt(0).toUpperCase() + spec.class.slice(1)}
                  </span>
                ))}
                {providers.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{providers.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className={cn(
            "max-w-xs p-4 text-sm bg-popover/95 backdrop-blur-sm shadow-lg",
            isDebuff ? "border-destructive/50" : "border-primary/50"
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-bold text-base",
                isDebuff ? "text-destructive" : "text-primary"
              )}>
                {buff.name}
              </span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                isDebuff ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
              )}>
                {buff.category}
              </span>
            </div>
            <p className="text-foreground leading-relaxed">
              {buff.effect}
            </p>
            {!isCovered && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs">
                  <span className="font-semibold text-foreground">Provided by:</span>{" "}
                  <span className="text-foreground/90">
                    {buff.providedBy.map((specId) => {
                      const spec = SPECS_MAP[specId]
                      return spec ? `${spec.name} ${spec.class.charAt(0).toUpperCase() + spec.class.slice(1)}` : specId
                    }).join(", ")}
                  </span>
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

import { SPECS } from "@/lib/tbc-data"
const SPECS_MAP = Object.fromEntries(SPECS.map(s => [s.id, s]))

export function BuffTracker({ roster, groups }: BuffTrackerProps) {
  const [selectedView, setSelectedView] = useState<"raid" | "groups">("raid")
  
  const { coveredBuffs, coveredDebuffs, buffProviders, debuffProviders, raidBuffs, partyBuffs } =
    useMemo(() => {
      const buffSet = new Set<string>()
      const debuffSet = new Set<string>()
      const buffProv: Record<string, Spec[]> = {}
      const debuffProv: Record<string, Spec[]> = {}
      const raid = new Set<string>()
      const party = new Set<string>()

      for (const spec of roster) {
        for (const buffId of spec.buffs) {
          buffSet.add(buffId)
          const buff = BUFFS.find(b => b.id === buffId)
          if (buff?.scope === "raid") raid.add(buffId)
          if (buff?.scope === "party") party.add(buffId)
          if (!buffProv[buffId]) buffProv[buffId] = []
          buffProv[buffId].push(spec)
        }
        for (const debuffId of spec.debuffs) {
          debuffSet.add(debuffId)
          if (!debuffProv[debuffId]) debuffProv[debuffId] = []
          debuffProv[debuffId].push(spec)
        }
      }

      return {
        coveredBuffs: buffSet,
        coveredDebuffs: debuffSet,
        buffProviders: buffProv,
        debuffProviders: debuffProv,
        raidBuffs: raid,
        partyBuffs: party,
      }
    }, [roster])

  // Calculate per-group buff coverage
  const groupBuffCoverage = useMemo(() => {
    return groups.map((group) => {
      const groupSpecs = group.filter((s): s is Spec => s !== null)
      const partyBuffSet = new Set<string>()
      
      groupSpecs.forEach(spec => {
        spec.buffs.forEach(buffId => {
          const buff = BUFFS.find(b => b.id === buffId)
          if (buff?.scope === "party") {
            partyBuffSet.add(buffId)
          }
        })
      })
      
      return {
        specs: groupSpecs,
        partyBuffs: partyBuffSet,
        coverage: partyBuffs.size > 0 ? Math.round((partyBuffSet.size / partyBuffs.size) * 100) : 100
      }
    })
  }, [groups, partyBuffs.size])

  const buffCoverage = Math.round((coveredBuffs.size / BUFFS.length) * 100)
  const debuffCoverage = Math.round((coveredDebuffs.size / DEBUFFS.length) * 100)
  const raidBuffsList = BUFFS.filter(b => b.scope === "raid")
  const partyBuffsList = BUFFS.filter(b => b.scope === "party")

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <button
        type="button"
          onClick={() => setSelectedView("raid")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            selectedView === "raid"
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Raid-Wide Buffs
        </button>
        <button
          type="button"
          onClick={() => setSelectedView("groups")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            selectedView === "groups"
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Group Buffs
        </button>
      </div>

      {selectedView === "raid" ? (
        <>
          {/* Raid Buffs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Raid-Wide Buffs
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.round((raidBuffs.size / raidBuffsList.length) * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {raidBuffs.size}/{raidBuffsList.length}
                </span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {raidBuffsList.map((buff) => (
                <BuffCard
                  key={buff.id}
                  buff={buff}
                  isCovered={coveredBuffs.has(buff.id)}
                  providers={buffProviders[buff.id] || []}
                />
              ))}
            </div>
          </div>

          {/* Debuffs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-destructive" />
                Debuffs on Boss
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive transition-all duration-300"
                    style={{ width: `${debuffCoverage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {coveredDebuffs.size}/{DEBUFFS.length}
                </span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEBUFFS.map((debuff) => (
                <BuffCard
                  key={debuff.id}
                  buff={debuff}
                  isCovered={coveredDebuffs.has(debuff.id)}
                  providers={debuffProviders[debuff.id] || []}
                  isDebuff
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Group-Specific Buffs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Party-Wide Buffs (Group-Specific)
              </h2>
            </div>
            
            {groups.map((group, groupIndex) => {
              const groupSpecs = group.filter((s): s is Spec => s !== null)
              if (groupSpecs.length === 0) return null
              
              const groupPartyBuffs = new Set<string>()
              groupSpecs.forEach(spec => {
                spec.buffs.forEach(buffId => {
                  const buff = BUFFS.find(b => b.id === buffId)
                  if (buff?.scope === "party") {
                    groupPartyBuffs.add(buffId)
                  }
                })
              })
              
              const groupCoverage = partyBuffsList.length > 0 
                ? Math.round((groupPartyBuffs.size / partyBuffsList.length) * 100)
                : 100
              
              return (
                <div key={Math.random()} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-medium text-foreground">Group {groupIndex + 1}</h3>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${groupCoverage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {groupPartyBuffs.size}/{partyBuffsList.length}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 pl-4 border-l-2 border-border/50">
                    {partyBuffsList.map((buff) => {
                      const providers = groupSpecs.filter(spec => spec.buffs.includes(buff.id))
                      return (
                        <BuffCard
                          key={`${groupIndex}-${buff.id}`}
                          buff={buff}
                          isCovered={groupPartyBuffs.has(buff.id)}
                          providers={providers}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
