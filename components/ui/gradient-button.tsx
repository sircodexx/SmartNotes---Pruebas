"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GradientButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary"
  type?: "button" | "submit" | "reset"
}

export function GradientButton({
  children,
  className,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: GradientButtonProps) {
  const baseClasses = "relative overflow-hidden transition-all duration-300"
  const primaryClasses =
    "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
  const secondaryClasses =
    "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800"

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        type={type}
        className={cn(baseClasses, variant === "primary" ? primaryClasses : secondaryClasses, className)}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </motion.div>
  )
}
