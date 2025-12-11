"use client"

import { Button } from "@/components/ui/button"
import { Coins, Plus } from "lucide-react"
import { useState } from "react"

interface RebuyAddonPanelProps {
  isRebuyAvailable: boolean
  isAddOnAvailable: boolean
  rebuyConfig?: {
    cost: number
    chipsReceived: number
    maxRebuys: number
  }
  addOnConfig?: {
    cost: number
    chipsReceived: number
  }
  playerRebuysUsed: number
  playerHasAddOn: boolean
  playerChips: number
  onRebuy: () => void
  onAddOn: () => void
}

export function RebuyAddonPanel({
  isRebuyAvailable,
  isAddOnAvailable,
  rebuyConfig,
  addOnConfig,
  playerRebuysUsed,
  playerHasAddOn,
  playerChips,
  onRebuy,
  onAddOn,
}: RebuyAddonPanelProps) {
  const [showPanel, setShowPanel] = useState(false)

  if (!isRebuyAvailable && !isAddOnAvailable) return null

  const canRebuy =
    isRebuyAvailable &&
    rebuyConfig &&
    playerRebuysUsed < rebuyConfig.maxRebuys &&
    (!rebuyConfig.allowedWhenChipsBelow || playerChips < rebuyConfig.allowedWhenChipsBelow)

  const canAddOn = isAddOnAvailable && addOnConfig && !playerHasAddOn

  if (!canRebuy && !canAddOn) return null

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {!showPanel ? (
        <Button
          onClick={() => setShowPanel(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-chart-4 hover:bg-chart-4/90"
        >
          <Coins className="w-6 h-6" />
        </Button>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-xl p-4 space-y-3 min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-foreground">Options</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowPanel(false)} className="h-6 w-6 p-0">
              ✕
            </Button>
          </div>

          {canRebuy && rebuyConfig && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Rebuy</p>
                  <p className="text-xs text-muted-foreground">{rebuyConfig.chipsReceived.toLocaleString()} chips</p>
                  <p className="text-xs text-muted-foreground">
                    {playerRebuysUsed}/{rebuyConfig.maxRebuys} used
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-chart-4">${rebuyConfig.cost}</p>
                </div>
              </div>
              <Button onClick={onRebuy} className="w-full bg-chart-2 hover:bg-chart-2/90" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Rebuy
              </Button>
            </div>
          )}

          {canAddOn && addOnConfig && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Add-On</p>
                  <p className="text-xs text-muted-foreground">{addOnConfig.chipsReceived.toLocaleString()} chips</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-chart-4">${addOnConfig.cost}</p>
                </div>
              </div>
              <Button onClick={onAddOn} className="w-full bg-chart-3 hover:bg-chart-3/90" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add-On
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
