"use client"

import {
  BUFFS,
  DEBUFFS,
  CLASS_COLORS,
  type Spec,
  type Buff,
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
}

function BuffCard({
  buff,
  isCovered,
  providers,
  isDebuff = false,
}: {
  buff: Buff
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
            "max-w-xs p-4 text-sm",
            isDebuff ? "border-destructive/50" : "border-primary/50"
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-bold",
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
            <p className="text-muted-foreground leading-relaxed">
              {buff.effect}
            </p>
            {!isCovered && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Provided by:</span>{" "}
                  {buff.providedBy.map((specId) => {
                    const spec = SPECS_MAP[specId]
                    return spec ? `${spec.name} ${spec.class.charAt(0).toUpperCase() + spec.class.slice(1)}` : specId
                  }).join(", ")}
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

export function BuffTracker({ roster }: BuffTrackerProps) {
  const { coveredBuffs, coveredDebuffs, buffProviders, debuffProviders } =
    useMemo(() => {
      const buffSet = new Set<string>()
      const debuffSet = new Set<string>()
      const buffProv: Record<string, Spec[]> = {}
      const debuffProv: Record<string, Spec[]> = {}

      for (const spec of roster) {
        for (const buffId of spec.buffs) {
          buffSet.add(buffId)
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
      }
    }, [roster])

  const buffCoverage = Math.round((coveredBuffs.size / BUFFS.length) * 100)
  const debuffCoverage = Math.round((coveredDebuffs.size / DEBUFFS.length) * 100)

  return (
    <div className="space-y-6">
      {/* Buffs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Raid Buffs
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${buffCoverage}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {coveredBuffs.size}/{BUFFS.length}
            </span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {BUFFS.map((buff) => (
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
    </div>
  )
}
