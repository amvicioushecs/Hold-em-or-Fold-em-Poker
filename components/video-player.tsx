"use client"

import { useEffect, useRef } from "react"
import { VideoOff, MicOff } from "lucide-react"

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

  return (
    <div className="relative w-full h-full bg-muted rounded-md md:rounded-lg overflow-hidden">
      {stream && videoEnabled ? (
        <video ref={videoRef} autoPlay playsInline muted={muted || isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto bg-muted-foreground/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg md:text-xl font-bold text-foreground">{name.charAt(0).toUpperCase()}</span>
            </div>
            {!videoEnabled && (
              <div className="flex items-center justify-center text-muted-foreground">
                <VideoOff className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
        <div className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs text-white font-medium truncate max-w-[70%]">
          {name}
        </div>
        <div className="flex gap-1">
          {!videoEnabled && (
            <div className="bg-destructive/80 backdrop-blur-sm p-1 rounded">
              <VideoOff className="w-3 h-3 md:w-3.5 md:h-3.5 text-destructive-foreground" />
            </div>
          )}
          {!audioEnabled && (
            <div className="bg-destructive/80 backdrop-blur-sm p-1 rounded">
              <MicOff className="w-3 h-3 md:w-3.5 md:h-3.5 text-destructive-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Local indicator */}
      {isLocal && (
        <div className="absolute top-1 right-1 bg-primary/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] md:text-[10px] text-primary-foreground font-medium">
          YOU
        </div>
      )}
    </div>
  )
}
