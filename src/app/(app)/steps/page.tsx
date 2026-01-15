'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StepsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse text-[var(--primary)]">מעביר לדשבורד...</div>
    </div>
  )
}
