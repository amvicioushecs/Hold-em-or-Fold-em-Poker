"use client"

import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff } from "lucide-react"
import { useWebRTC } from "@/hooks/use-webrtc"

export default function VideoControls() {
  const { isVideoEnabled, isAudioEnabled, toggleVideo, toggleAudio } = useWebRTC()

  return (
    <div className="absolute top-2 right-2 md:top-4 md:right-20 flex gap-2 z-50">
      <Button
        size="icon"
        variant={isVideoEnabled ? "secondary" : "destructive"}
        onClick={toggleVideo}
        className="w-9 h-9 md:w-10 md:h-10 rounded-full shadow-lg touch-manipulation"
      >
        {isVideoEnabled ? <Video className="w-4 h-4 md:w-5 md:h-5" /> : <VideoOff className="w-4 h-4 md:w-5 md:h-5" />}
      </Button>
      <Button
        size="icon"
        variant={isAudioEnabled ? "secondary" : "destructive"}
        onClick={toggleAudio}
        className="w-9 h-9 md:w-10 md:h-10 rounded-full touch-manipulation text-white shadow-xl bg-slate-800 border-solid border border-slate-600"
      >
        {isAudioEnabled ? <Mic className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" /> : <MicOff className="w-4 h-4 md:w-5 md:h-5" />}
      </Button>
    </div>
  )
}
