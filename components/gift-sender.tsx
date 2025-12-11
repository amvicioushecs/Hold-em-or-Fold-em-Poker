"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { GiftIcon, Send, X } from "lucide-react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import GiftShop from "./gift-shop"
import type { Gift } from "@/types/gift"
import { cn } from "@/lib/utils"

interface GiftSenderProps {
  isOpen: boolean
  onClose: () => void
  recipientId?: string
  playerChips: number
}

export default function GiftSender({ isOpen, onClose, recipientId, playerChips }: GiftSenderProps) {
  const [step, setStep] = useState<"select-gift" | "select-player" | "confirm">("select-gift")
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(recipientId || null)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const { players } = useWebRTC()
  const { sendMessage } = useChat()

  const handleGiftSelect = (gift: Gift) => {
    setSelectedGift(gift)
    if (recipientId) {
      setStep("confirm")
    } else {
      setStep("select-player")
    }
  }

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId)
    setStep("confirm")
  }

  const handleSendGift = async () => {
    if (!selectedGift || !selectedPlayerId) return

    setIsSending(true)

    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const recipient = players.get(selectedPlayerId)
    if (recipient) {
      // Send system message
      sendMessage(
        "system",
        "System",
        `🎁 ${players.get("local")?.name || "You"} sent ${selectedGift.icon} ${selectedGift.name} to ${recipient.name}${message ? `: "${message}"` : ""}`,
        "system",
      )
    }

    setIsSending(false)
    handleClose()
  }

  const handleClose = () => {
    setStep("select-gift")
    setSelectedGift(null)
    setSelectedPlayerId(recipientId || null)
    setMessage("")
    onClose()
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`
    return price.toString()
  }

  const otherPlayers = Array.from(players.values()).filter((p) => !p.isLocal)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 gap-0">
        {step === "select-gift" && (
          <>
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="flex items-center gap-2">
                <GiftIcon className="w-5 h-5" />
                Send a Gift
              </DialogTitle>
            </DialogHeader>
            <GiftShop onSelectGift={handleGiftSelect} playerChips={playerChips} />
          </>
        )}

        {step === "select-player" && (
          <>
            <DialogHeader className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setStep("select-gift")}>
                  <X className="w-5 h-5" />
                </Button>
                <DialogTitle>Choose Recipient</DialogTitle>
                <div className="w-10" />
              </div>
            </DialogHeader>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {otherPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerSelect(player.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground">{player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.videoEnabled ? "🎥 Video on" : "🎥 Video off"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === "confirm" && selectedGift && (
          <>
            <DialogHeader className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep(recipientId ? "select-gift" : "select-player")}
                >
                  <X className="w-5 h-5" />
                </Button>
                <DialogTitle>Confirm Gift</DialogTitle>
                <div className="w-10" />
              </div>
            </DialogHeader>
            <div className="p-6">
              <div className="text-center mb-6">
                {/* Gift Preview */}
                <div
                  className={cn(
                    "inline-flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-4 mb-4",
                    selectedGift.rarity === "legendary" && "border-yellow-400 bg-yellow-400/10",
                    selectedGift.rarity === "epic" && "border-purple-400 bg-purple-400/10",
                    selectedGift.rarity === "rare" && "border-blue-400 bg-blue-400/10",
                    selectedGift.rarity === "common" && "border-gray-400 bg-gray-400/10",
                  )}
                >
                  <div className="text-6xl mb-2">{selectedGift.icon}</div>
                  <p className="text-sm font-bold">{selectedGift.name}</p>
                </div>

                {/* Recipient */}
                {selectedPlayerId && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Sending to:</p>
                    <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {players.get(selectedPlayerId)?.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold">{players.get(selectedPlayerId)?.name}</span>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-foreground">${formatPrice(selectedGift.price)}</p>
                  <p className="text-xs text-muted-foreground">
                    Balance after: ${formatPrice(playerChips - selectedGift.price)}
                  </p>
                </div>
              </div>

              {/* Optional Message */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Add a message (optional)</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something nice..."
                  className="resize-none"
                  rows={3}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/100</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(recipientId ? "select-gift" : "select-player")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSendGift}
                  disabled={isSending || playerChips < selectedGift.price}
                  className="flex-1"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Gift
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
