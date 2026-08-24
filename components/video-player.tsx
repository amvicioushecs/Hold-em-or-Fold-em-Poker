"use client"

import { useEffect, useRef } from "react"
import { VideoOff, MicOff, User } from "lucide-react"

interface VideoPlayerProps {
  stream: MediaStream | null
  name: string
  isLocal?: boolean
  videoEnabled?: boolean
  audioEnabled?: boolean
  muted?: boolean
}

export default function VideoPlayer({
  stream,
  name,
  isLocal = false,
  videoEnabled = true,
  audioEnabled = true,
  muted = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const getInitials = (nameStr: string) => {
    if (nameStr.toLowerCase() === "you") return "YOU"
    const parts = nameStr.split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return nameStr.substring(0, 2).toUpperCase()
  }

  const initials = getInitials(name)

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-md md:rounded-lg overflow-hidden flex items-center justify-center">
      {stream && videoEnabled ? (
        <video ref={videoRef} autoPlay playsInline muted={muted || isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-500/10 to-amber-700/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
            <span className="text-[#FEB956] text-xs md:text-sm font-black tracking-wider">{initials}</span>
          </div>
        </div>
      )}

      {/* Audio/Video Off Indicators in corner */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 z-25">
        {!videoEnabled && (
          <div className="bg-slate-950/70 backdrop-blur-sm p-1 rounded-full border border-white/5">
            <VideoOff className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
          </div>
        )}
        {!audioEnabled && (
          <div className="bg-slate-950/70 backdrop-blur-sm p-1 rounded-full border border-white/5">
            <MicOff className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  )
}
