"use client"

import { useEffect, useState } from "react"
import {
  X,
  Settings,
  Users,
  HelpCircle,
  LogOut,
  Gift,
  BarChart3,
  Trophy,
  Volume2,
  VolumeX,
  Vibrate,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import StatsDashboard from "./stats-dashboard"
import TournamentLobby from "./tournament-lobby"
import FriendsPage from "./friends-page"

interface GameMenuProps {
  isOpen: boolean
  onClose: () => void
}

type MenuView = "root" | "settings" | "howto"

const STORAGE_KEYS = {
  sound: "hof-sound-enabled",
  haptics: "hof-haptics-enabled",
} as const

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback
  const v = localStorage.getItem(key)
  if (v === null) return fallback
  return v === "1"
}

export default function GameMenu({ isOpen, onClose }: GameMenuProps) {
  const [showStats, setShowStats] = useState(false)
  const [showTournamentLobby, setShowTournamentLobby] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [view, setView] = useState<MenuView>("root")
  const [soundOn, setSoundOn] = useState(true)
  const [hapticsOn, setHapticsOn] = useState(true)

  // Reset sub-view when menu opens
  useEffect(() => {
    if (isOpen) {
      setView("root")
      setSoundOn(readBool(STORAGE_KEYS.sound, true))
      setHapticsOn(readBool(STORAGE_KEYS.haptics, true))
    }
  }, [isOpen])

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const toggleSound = () => {
    setSoundOn((v) => {
      const next = !v
      localStorage.setItem(STORAGE_KEYS.sound, next ? "1" : "0")
      return next
    })
  }

  const toggleHaptics = () => {
    setHapticsOn((v) => {
      const next = !v
      localStorage.setItem(STORAGE_KEYS.haptics, next ? "1" : "0")
      if (next && typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12)
      }
      return next
    })
  }

  if (showFriends) {
    return <FriendsPage onClose={() => setShowFriends(false)} />
  }

  if (showTournamentLobby) {
    return (
      <TournamentLobby
        onClose={() => setShowTournamentLobby(false)}
        onStart={() => {
          setShowTournamentLobby(false)
          onClose()
        }}
      />
    )
  }

  if (showStats) {
    return <StatsDashboard onClose={() => setShowStats(false)} />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex max-w-[430px] mx-auto flex-col justify-end">
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom sheet — mobile-first */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Table settings"
        className={cn(
          "relative z-10 flex max-h-[88dvh] w-full flex-col rounded-t-2xl border border-slate-800/80 border-b-0",
          "bg-[#0C0F16] shadow-[0_-20px_40px_rgba(0,0,0,0.45)]",
          "animate-in slide-in-from-bottom duration-300",
        )}
      >
        {/* Grab handle */}
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-1">
          <div className="flex items-center gap-2">
            {view !== "root" && (
              <button
                type="button"
                onClick={() => setView("root")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/50 bg-[#191C22] text-slate-300"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold tracking-wide text-[#E5A93C]">
                {view === "root" && "Table Menu"}
                {view === "settings" && "Settings"}
                {view === "howto" && "How to Play"}
              </h2>
              {view === "root" && (
                <p className="text-[11px] text-slate-500">Hold'em or Fold'em</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/50 bg-[#191C22] text-slate-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {view === "root" && (
            <nav className="space-y-2 pb-4">
              <MenuRow
                icon={<Settings className="h-5 w-5" />}
                label="Settings"
                hint="Sound, haptics"
                onClick={() => setView("settings")}
              />
              <MenuRow
                icon={<Users className="h-5 w-5" />}
                label="Friends"
                onClick={() => {
                  onClose()
                  setShowFriends(true)
                }}
              />
              <MenuRow
                icon={<BarChart3 className="h-5 w-5" />}
                label="Statistics"
                onClick={() => {
                  onClose()
                  setShowStats(true)
                }}
              />
              <MenuRow
                icon={<Trophy className="h-5 w-5" />}
                label="Tournaments"
                onClick={() => {
                  onClose()
                  setShowTournamentLobby(true)
                }}
              />
              <MenuRow
                icon={<Gift className="h-5 w-5" />}
                label="Send Gifts"
                hint="Soon"
                disabled
                onClick={() => {}}
              />
              <MenuRow
                icon={<HelpCircle className="h-5 w-5" />}
                label="How to Play"
                onClick={() => setView("howto")}
              />

              <div className="my-3 h-px bg-slate-800" />

              <button
                type="button"
                onClick={() => {
                  onClose()
                  window.location.reload()
                }}
                className="flex h-14 w-full items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 text-left text-red-400 active:scale-[0.99]"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-sm font-bold uppercase tracking-wide">Leave Table</span>
              </button>

              <p className="pt-4 text-center text-[10px] text-slate-600">Version 1.0.0</p>
            </nav>
          )}

          {view === "settings" && (
            <div className="space-y-3 pb-6">
              <ToggleRow
                icon={soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                label="Sound effects"
                description="Card deals, chips, wins"
                checked={soundOn}
                onChange={toggleSound}
              />
              <ToggleRow
                icon={<Vibrate className="h-5 w-5" />}
                label="Haptics"
                description="Vibrate on your turn & actions"
                checked={hapticsOn}
                onChange={toggleHaptics}
              />
              <p className="px-1 pt-2 text-[11px] leading-relaxed text-slate-500">
                Preferences are saved on this device. More table options (card backs, felt themes) coming later.
              </p>
            </div>
          )}

          {view === "howto" && (
            <div className="space-y-4 pb-6 text-sm text-slate-300">
              <HowCard title="Goal">
                Build the best 5-card hand using your 2 hole cards and up to 5 community cards.
              </HowCard>
              <HowCard title="On your turn">
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    <strong className="text-slate-100">Fold</strong> — give up the hand
                  </li>
                  <li>
                    <strong className="text-slate-100">Check / Call</strong> — match the bet or pass if free
                  </li>
                  <li>
                    <strong className="text-slate-100">Raise</strong> — increase the bet
                  </li>
                </ul>
              </HowCard>
              <HowCard title="Blinds">
                Small and big blind post before cards are dealt. Action starts left of the big blind pre-flop.
              </HowCard>
              <HowCard title="All-in or Fold tables">
                Only Fold and All-in are allowed — no calling partial stacks or multi-street raises.
              </HowCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuRow({
  icon,
  label,
  hint,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  hint?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-14 w-full items-center gap-3 rounded-xl border border-slate-800 bg-[#151922] px-4 text-left transition-colors",
        "active:bg-slate-800/80",
        disabled && "opacity-45",
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#191C22] text-[#E5A93C]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-100">{label}</span>
        {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
      </span>
      {!disabled && <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />}
    </button>
  )
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#151922] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#191C22] text-[#E5A93C]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-100">{label}</p>
        <p className="text-[11px] text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-emerald-500" : "bg-slate-600",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  )
}

function HowCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#151922] p-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#E5A93C]">{title}</h3>
      <div className="text-[13px] leading-relaxed text-slate-300">{children}</div>
    </div>
  )
}
