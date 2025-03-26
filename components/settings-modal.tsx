"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  workDuration: number
  breakDuration: number
  onApply: (workDuration: number, breakDuration: number) => void
}

export default function SettingsModal({ isOpen, onClose, workDuration, breakDuration, onApply }: SettingsModalProps) {
  // Use string state for input values to preserve leading zeros and handle input correctly
  const [workMinutes, setWorkMinutes] = useState("")
  const [workSeconds, setWorkSeconds] = useState("")
  const [breakMinutes, setBreakMinutes] = useState("")
  const [breakSeconds, setBreakSeconds] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Update local state when props change or dialog opens
  useEffect(() => {
    if (isOpen) {
      setWorkMinutes(Math.floor(workDuration).toString())
      setWorkSeconds(Math.round((workDuration - Math.floor(workDuration)) * 60).toString())
      setBreakMinutes(Math.floor(breakDuration).toString())
      setBreakSeconds(Math.round((breakDuration - Math.floor(breakDuration)) * 60).toString())
      setError(null)
    }
  }, [workDuration, breakDuration, isOpen])

  const handleApply = () => {
    // Parse input values as numbers
    const workMinutesNum = Number.parseInt(workMinutes) || 0
    const workSecondsNum = Number.parseInt(workSeconds) || 0
    const breakMinutesNum = Number.parseInt(breakMinutes) || 0
    const breakSecondsNum = Number.parseInt(breakSeconds) || 0

    // Validate inputs
    if (workMinutesNum < 0 || workSecondsNum < 0 || breakMinutesNum < 0 || breakSecondsNum < 0) {
      setError("Time values cannot be negative")
      return
    }

    if (workSecondsNum >= 60 || breakSecondsNum >= 60) {
      setError("Seconds must be less than 60")
      return
    }

    // Convert to decimal minutes
    const workValue = workMinutesNum + workSecondsNum / 60
    const breakValue = breakMinutesNum + breakSecondsNum / 60

    if (workValue <= 0) {
      setError("Work duration must be greater than 0")
      return
    }

    if (breakValue <= 0) {
      setError("Break duration must be greater than 0")
      return
    }

    if (workValue > 120) {
      setError("Work duration cannot exceed 120 minutes")
      return
    }

    if (breakValue > 60) {
      setError("Break duration cannot exceed 60 minutes")
      return
    }

    // Clear any previous errors
    setError(null)

    // Apply settings
    onApply(workValue, breakValue)
  }

  // Handle input changes with direct string values
  const handleWorkMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkMinutes(e.target.value)
    setError(null)
  }

  const handleWorkSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkSeconds(e.target.value)
    setError(null)
  }

  const handleBreakMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBreakMinutes(e.target.value)
    setError(null)
  }

  const handleBreakSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBreakSeconds(e.target.value)
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="work-minutes" className="text-right">
              Work Time
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="work-minutes"
                type="number"
                min="0"
                max="120"
                value={workMinutes}
                onChange={handleWorkMinutesChange}
                className="w-20"
              />
              <span>min</span>
              <Input
                id="work-seconds"
                type="number"
                min="0"
                max="59"
                value={workSeconds}
                onChange={handleWorkSecondsChange}
                className="w-20"
              />
              <span>sec</span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="break-minutes" className="text-right">
              Break Time
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="break-minutes"
                type="number"
                min="0"
                max="60"
                value={breakMinutes}
                onChange={handleBreakMinutesChange}
                className="w-20"
              />
              <span>min</span>
              <Input
                id="break-seconds"
                type="number"
                min="0"
                max="59"
                value={breakSeconds}
                onChange={handleBreakSecondsChange}
                className="w-20"
              />
              <span>sec</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

