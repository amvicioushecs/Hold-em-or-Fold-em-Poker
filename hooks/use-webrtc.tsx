"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"

interface Player {
  id: string
  name: string
  stream: MediaStream | null
  isLocal: boolean
  videoEnabled: boolean
  audioEnabled: boolean
}

interface WebRTCContextType {
  localStream: MediaStream | null
  players: Map<string, Player>
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isMediaInitialized: boolean
  mediaError: string | null
  toggleVideo: () => void
  toggleAudio: () => void
  initializeMedia: () => Promise<void>
  addPlayer: (id: string, name: string, stream?: MediaStream) => void
  removePlayer: (id: string) => void
}

const WebRTCContext = createContext<WebRTCContextType | null>(null)

export function WebRTCProvider({ children }: { children: ReactNode }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [players, setPlayers] = useState<Map<string, Player>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isMediaInitialized, setIsMediaInitialized] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const initializationAttempted = useRef(false)

  const initializeMedia = async () => {
    // Skip if already attempted or initialized
    if (initializationAttempted.current || isMediaInitialized) {
      return
    }

    initializationAttempted.current = true

    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("Media devices API not available - running without video/audio")
        setMediaError("Media devices not supported in this environment")
        setIsMediaInitialized(true)
        addDemoPlayers()
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      setLocalStream(stream)
      setIsMediaInitialized(true)
      setMediaError(null)

      // Add local player
      setPlayers((prev) => {
        const newPlayers = new Map(prev)
        newPlayers.set("local", {
          id: "local",
          name: "You",
          stream,
          isLocal: true,
          videoEnabled: true,
          audioEnabled: true,
        })
        return newPlayers
      })

      // Simulate adding remote players for demo purposes
      setTimeout(() => {
        addDemoPlayers()
      }, 1000)
    } catch (error) {
      console.log("Media access not available - running without video/audio:", error)
      setMediaError("Camera/microphone not available")
      setIsMediaInitialized(true)

      // Add local player without stream
      setPlayers((prev) => {
        const newPlayers = new Map(prev)
        newPlayers.set("local", {
          id: "local",
          name: "You",
          stream: null,
          isLocal: true,
          videoEnabled: false,
          audioEnabled: false,
        })
        return newPlayers
      })

      // Still add demo players
      setTimeout(() => {
        addDemoPlayers()
      }, 1000)
    }
  }

  const addDemoPlayers = () => {
    // In a real app, these would be actual peer connections
    // For demo, we'll just add placeholder players
    const demoPlayers = [
      { id: "player-1", name: "Player 1" },
      { id: "player-2", name: "Player 2" },
      { id: "player-3", name: "Player 3" },
      { id: "player-4", name: "Player 4" },
      { id: "player-5", name: "Player 5" },
    ]

    setPlayers((prev) => {
      const newPlayers = new Map(prev)
      demoPlayers.forEach((player) => {
        newPlayers.set(player.id, {
          id: player.id,
          name: player.name,
          stream: null,
          isLocal: false,
          videoEnabled: false,
          audioEnabled: false,
        })
      })
      return newPlayers
    })
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)

        // Update local player
        setPlayers((prev) => {
          const newPlayers = new Map(prev)
          const localPlayer = newPlayers.get("local")
          if (localPlayer) {
            localPlayer.videoEnabled = videoTrack.enabled
            newPlayers.set("local", localPlayer)
          }
          return newPlayers
        })
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)

        // Update local player
        setPlayers((prev) => {
          const newPlayers = new Map(prev)
          const localPlayer = newPlayers.get("local")
          if (localPlayer) {
            localPlayer.audioEnabled = audioTrack.enabled
            newPlayers.set("local", localPlayer)
          }
          return newPlayers
        })
      }
    }
  }

  const addPlayer = (id: string, name: string, stream?: MediaStream) => {
    setPlayers((prev) => {
      const newPlayers = new Map(prev)
      newPlayers.set(id, {
        id,
        name,
        stream: stream || null,
        isLocal: false,
        videoEnabled: !!stream,
        audioEnabled: !!stream,
      })
      return newPlayers
    })
  }

  const removePlayer = (id: string) => {
    setPlayers((prev) => {
      const newPlayers = new Map(prev)
      newPlayers.delete(id)
      return newPlayers
    })

    // Clean up peer connection
    const peerConnection = peerConnectionsRef.current.get(id)
    if (peerConnection) {
      peerConnection.close()
      peerConnectionsRef.current.delete(id)
    }
  }

  // Initialize media on mount - but don't block if it fails
  useEffect(() => {
    // Use a small delay to avoid blocking initial render
    const timer = setTimeout(() => {
      initializeMedia()
    }, 100)

    return () => {
      clearTimeout(timer)
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      peerConnectionsRef.current.forEach((pc) => pc.close())
    }
  }, [])

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        players,
        isVideoEnabled,
        isAudioEnabled,
        isMediaInitialized,
        mediaError,
        toggleVideo,
        toggleAudio,
        initializeMedia,
        addPlayer,
        removePlayer,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  )
}

export function useWebRTC() {
  const context = useContext(WebRTCContext)
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider")
  }
  return context
}
