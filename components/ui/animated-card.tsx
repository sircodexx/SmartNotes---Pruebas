"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ClientOnly from "@/components/client-only"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <ClientOnly>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>{children}</Card>
      </motion.div>
    </ClientOnly>
  )
}
