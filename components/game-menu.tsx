"use client"

import { X, Settings, Users, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface GameMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function GameMenu({ isOpen, onClose }: GameMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-full sm:w-80 bg-card border-r border-border z-50 animate-in slide-in-from-left duration-300",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Game Menu</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex justify-center">
              <Image src="/logo.png" alt="Hold'em or Fold'em Poker" width={120} height={120} className="w-24 h-24" />
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:bg-accent"
                onClick={onClose}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:bg-accent"
                onClick={onClose}
              >
                <Users className="mr-3 h-5 w-5" />
                Players
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:bg-accent"
                onClick={onClose}
              >
                <HelpCircle className="mr-3 h-5 w-5" />
                How to Play
              </Button>

              <Separator className="my-4" />

              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10"
                onClick={onClose}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Leave Table
              </Button>
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Hold&apos;em or Fold&apos;em Poker
              <br />
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
