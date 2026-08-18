"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo, type ReactNode } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

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
  roomCode: string | null
  joinRoom: (code: string, username: string) => Promise<void>
  leaveRoom: () => void
  broadcastMessage: (event: string, payload: any) => void
  myUserId: string
}

const WebRTCContext = createContext<WebRTCContextType | null>(null)

export function WebRTCProvider({ children }: { children: ReactNode }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [players, setPlayers] = useState<Map<string, Player>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isMediaInitialized, setIsMediaInitialized] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const initializationAttempted = useRef(false)
  const supabaseChannelRef = useRef<any>(null)
  const myIdRef = useRef<string>("")
  const myNameRef = useRef<string>("")

  // Generate or retrieve a persistent player ID for the session
  useEffect(() => {
    if (typeof window !== "undefined") {
      let storedId = sessionStorage.getItem("webrtc_player_id")
      if (!storedId) {
        storedId = `player-${Math.floor(1000 + Math.random() * 9000)}`
        sessionStorage.setItem("webrtc_player_id", storedId)
      }
      myIdRef.current = storedId
    }
  }, [])

  const demoPlayers = useMemo(
    () => [
      { id: "player-1", name: "Player 1" },
      { id: "player-2", name: "Player 2" },
      { id: "player-3", name: "Player 3" },
      { id: "player-4", name: "Player 4" },
      { id: "player-5", name: "Player 5" },
    ],
    [],
  )

  const addDemoPlayers = useCallback(() => {
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
  }, [demoPlayers])

  const initializeMedia = useCallback(async () => {
    if (initializationAttempted.current || isMediaInitialized) {
      return
    }

    initializationAttempted.current = true

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
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
          name: myNameRef.current || "You",
          stream,
          isLocal: true,
          videoEnabled: true,
          audioEnabled: true,
        })
        return newPlayers
      })
    } catch (error) {
      console.warn("Camera/microphone access denied or unavailable:", error)
      setMediaError("Camera/microphone not available")
      setIsMediaInitialized(true)

      // Add local player without stream
      setPlayers((prev) => {
        const newPlayers = new Map(prev)
        newPlayers.set("local", {
          id: "local",
          name: myNameRef.current || "You",
          stream: null,
          isLocal: true,
          videoEnabled: false,
          audioEnabled: false,
        })
        return newPlayers
      })
    }
  }, [isMediaInitialized, addDemoPlayers])

  const broadcastMessage = useCallback((event: string, payload: any) => {
    if (supabaseChannelRef.current) {
      supabaseChannelRef.current.send({
        type: "broadcast",
        event,
        payload,
      })
    }
  }, [])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)

        setPlayers((prev) => {
          const newPlayers = new Map(prev)
          const localPlayer = newPlayers.get("local")
          if (localPlayer) {
            localPlayer.videoEnabled = videoTrack.enabled
            newPlayers.set("local", localPlayer)
          }
          return newPlayers
        })

        broadcastMessage("media-status-change", {
          id: myIdRef.current,
          videoEnabled: videoTrack.enabled,
          audioEnabled: isAudioEnabled,
        })
      }
    }
  }, [localStream, isAudioEnabled, broadcastMessage])

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)

        setPlayers((prev) => {
          const newPlayers = new Map(prev)
          const localPlayer = newPlayers.get("local")
          if (localPlayer) {
            localPlayer.audioEnabled = audioTrack.enabled
            newPlayers.set("local", localPlayer)
          }
          return newPlayers
        })

        broadcastMessage("media-status-change", {
          id: myIdRef.current,
          videoEnabled: isVideoEnabled,
          audioEnabled: audioTrack.enabled,
        })
      }
    }
  }, [localStream, isVideoEnabled, broadcastMessage])

  const addPlayer = useCallback((id: string, name: string, stream?: MediaStream) => {
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
  }, [])

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => {
      const newPlayers = new Map(prev)
      newPlayers.delete(id)
      return newPlayers
    })

    const peerConnection = peerConnectionsRef.current.get(id)
    if (peerConnection) {
      peerConnection.close()
      peerConnectionsRef.current.delete(id)
    }
  }, [])

  const leaveRoom = useCallback(() => {
    setRoomCode(null)
    if (supabaseChannelRef.current) {
      supabaseChannelRef.current.unsubscribe()
      supabaseChannelRef.current = null
    }

    peerConnectionsRef.current.forEach((pc) => pc.close())
    peerConnectionsRef.current.clear()

    setPlayers((prev) => {
      const newPlayers = new Map()
      const localPlayer = prev.get("local")
      if (localPlayer) {
        newPlayers.set("local", localPlayer)
      }
      return newPlayers
    })
  }, [])

  const joinRoom = useCallback(async (code: string, username: string) => {
    setRoomCode(code)
    myNameRef.current = username

    if (!isMediaInitialized) {
      await initializeMedia()
    }

    if (!isSupabaseConfigured || !supabase) {
      console.warn("Supabase is not configured. Falling back to mock multiplayer mode.")
      addDemoPlayers()
      return
    }

    if (supabaseChannelRef.current) {
      supabaseChannelRef.current.unsubscribe()
    }

    // Reset players map to contain only the local player
    setPlayers((prev) => {
      const newPlayers = new Map()
      const localPlayer = prev.get("local")
      if (localPlayer) {
        localPlayer.name = username
        newPlayers.set("local", localPlayer)
      } else {
        newPlayers.set("local", {
          id: "local",
          name: username,
          stream: localStream,
          isLocal: true,
          videoEnabled: isVideoEnabled,
          audioEnabled: isAudioEnabled,
        })
      }
      return newPlayers
    })

    const myId = myIdRef.current
    const channel = supabase.channel(`poker-room-${code}`)
    supabaseChannelRef.current = channel

    const getOrCreatePeerConnection = (peerId: string, peerName: string) => {
      if (peerConnectionsRef.current.has(peerId)) {
        return peerConnectionsRef.current.get(peerId)!
      }

      console.log(`[WebRTC] Initiating RTCPeerConnection for player: ${peerName} (${peerId})`)
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      })

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream)
        })
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channel.send({
            type: "broadcast",
            event: "webrtc-signal",
            payload: { to: peerId, from: myId, candidate: event.candidate },
          })
        }
      }

      pc.ontrack = (event) => {
        console.log(`[WebRTC] Track received from remote peer ${peerName}`)
        setPlayers((prev) => {
          const newPlayers = new Map(prev)
          newPlayers.set(peerId, {
            id: peerId,
            name: peerName,
            stream: event.streams[0],
            isLocal: false,
            videoEnabled: true,
            audioEnabled: true,
          })
          return newPlayers
        })
      }

      peerConnectionsRef.current.set(peerId, pc)
      return pc
    }

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState()
        console.log("[WebRTC] Presence Sync:", presenceState)

        Object.keys(presenceState).forEach((key) => {
          if (key === myId) return

          const presences = presenceState[key] as any[]
          const remoteUser = presences[0]
          if (!remoteUser) return

          const remoteName = remoteUser.name || "Guest"

          // Caller election: higher ID calls lower ID
          if (myId > key && !peerConnectionsRef.current.has(key)) {
            const pc = getOrCreatePeerConnection(key, remoteName)
            pc.createOffer()
              .then((offer) => pc.setLocalDescription(offer))
              .then(() => {
                console.log(`[WebRTC] Sending offer to caller: ${remoteName}`)
                channel.send({
                  type: "broadcast",
                  event: "webrtc-signal",
                  payload: { to: key, from: myId, offer: pc.localDescription, name: username },
                })
              })
              .catch((err) => console.error("Error creating RTC offer:", err))
          }
        })
      })
      .on("presence", { event: "leave" }, ({ leftPresences }: { leftPresences: any[] }) => {
        leftPresences.forEach((presence: any) => {
          const remoteId = presence.id
          if (remoteId && remoteId !== myId) {
            console.log(`[WebRTC] Player left: ${presence.name}`)
            removePlayer(remoteId)
          }
        })
      })
      .on("broadcast", { event: "webrtc-signal" }, async ({ payload }: { payload: any }) => {
        if (payload.to !== myId) return

        const peerId = payload.from
        const peerName = payload.name || "Guest"

        try {
          if (payload.offer) {
            console.log(`[WebRTC] Received offer from ${peerName}`)
            const pc = getOrCreatePeerConnection(peerId, peerName)
            await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            channel.send({
              type: "broadcast",
              event: "webrtc-signal",
              payload: { to: peerId, from: myId, answer: pc.localDescription, name: username },
            })
          } else if (payload.answer) {
            console.log(`[WebRTC] Received answer from ${peerName}`)
            const pc = peerConnectionsRef.current.get(peerId)
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
            }
          } else if (payload.candidate) {
            const pc = peerConnectionsRef.current.get(peerId)
            if (pc) {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
            }
          }
        } catch (err) {
          console.error("WebRTC Signaling Error:", err)
        }
      })
      .on("broadcast", { event: "media-status-change" }, ({ payload }: { payload: any }) => {
        setPlayers((prev) => {
          const newPlayers = new Map(prev)
          const player = newPlayers.get(payload.id)
          if (player) {
            player.videoEnabled = payload.videoEnabled
            player.audioEnabled = payload.audioEnabled
            newPlayers.set(payload.id, player)
          }
          return newPlayers
        })
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          console.log(`[WebRTC] Subscribed to room channel: ${code}`)
          await channel.track({ id: myId, name: username, online_at: new Date().toISOString() })
        }
      })
  }, [isMediaInitialized, initializeMedia, localStream, addDemoPlayers, isVideoEnabled, isAudioEnabled, removePlayer])

  useEffect(() => {
    const initCallback = () => {
      initializeMedia()
    }

    let idleCallbackId: number
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        idleCallbackId = requestIdleCallback(initCallback)
      } else {
        const timer = setTimeout(initCallback, 100)
        return () => clearTimeout(timer)
      }
    }

    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window && idleCallbackId) {
        cancelIdleCallback(idleCallbackId)
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      peerConnectionsRef.current.forEach((pc) => pc.close())
    }
  }, [initializeMedia, localStream])

  const contextValue = useMemo(
    () => ({
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
      roomCode,
      joinRoom,
      leaveRoom,
      broadcastMessage,
      myUserId: myIdRef.current || "",
    }),
    [
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
      roomCode,
      joinRoom,
      leaveRoom,
      broadcastMessage,
    ],
  )

  return <WebRTCContext.Provider value={contextValue}>{children}</WebRTCContext.Provider>
}

export function useWebRTC() {
  const context = useContext(WebRTCContext)
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider")
  }
  return context
}
