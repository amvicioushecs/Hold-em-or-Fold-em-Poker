"use client"
import { RulesPage } from "@/components/rules-page"
import { useRouter } from "next/navigation"

export default function Rules() {
  const router = useRouter()

  return <RulesPage onClose={() => router.back()} />
}
