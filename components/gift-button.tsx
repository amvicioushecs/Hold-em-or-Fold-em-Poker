"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Gift } from "lucide-react"
import GiftSender from "./gift-sender"

interface GiftButtonProps {
  recipientId?: string
  playerChips: number
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function GiftButton({
  recipientId,
  playerChips,
  variant = "outline",
  size = "sm",
  className,
}: GiftButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setIsOpen(true)} className={className}>
        <Gift className="w-4 h-4 mr-2" />
        Send Gift
      </Button>

      <GiftSender
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        recipientId={recipientId}
        playerChips={playerChips}
      />
    </>
  )
}
