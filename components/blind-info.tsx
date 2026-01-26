"use client"

interface BlindInfoProps {
  smallBlind: number
  bigBlind: number
  handNumber: number
}

export default function BlindInfo({ smallBlind, bigBlind, handNumber }: BlindInfoProps) {
  return (
    <div className="absolute top-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-amber-500/50">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 md:w-5 md:h-5 bg-blue-600 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white border border-blue-400">
              SB
            </div>
            <span className="text-blue-400 font-bold">${smallBlind.toLocaleString()}</span>
          </div>
          <span className="text-amber-400">/</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 md:w-5 md:h-5 bg-red-600 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white border border-red-400">
              BB
            </div>
            <span className="text-red-400 font-bold">${bigBlind.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
    </div>
  )
}
