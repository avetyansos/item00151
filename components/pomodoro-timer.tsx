"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import SettingsModal from "./settings-modal"
import { ThemeToggle } from "./theme-toggle"
import { WorkLog, type WorkLogItem } from "./work-log"
import { AddLogEntry } from "./add-log-entry"
import { EditLogEntry } from "./edit-log-entry"
import { v4 as uuidv4 } from "uuid"

export default function PomodoroTimer() {
  // Timer states
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<"work" | "break">("work")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // Default: 25 minutes in seconds
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [logEntryOpen, setLogEntryOpen] = useState(false)
  const [editEntryOpen, setEditEntryOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkLogItem | null>(null)

  // Work log state
  const [workLog, setWorkLog] = useState<WorkLogItem[]>([])
  const [workItemCount, setWorkItemCount] = useState(0)
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null)
  const [completedSessionType, setCompletedSessionType] = useState<"work" | "break" | null>(null)
  const [completedSessionDuration, setCompletedSessionDuration] = useState<number>(0)
  const [pendingWorkItemId, setPendingWorkItemId] = useState<string | null>(null)

  // Queue for pending work items that need to be named
  const [pendingWorkItems, setPendingWorkItems] = useState<string[]>([])
  const [currentlyNamingItem, setCurrentlyNamingItem] = useState<string | null>(null)

  // Total work timer state
  const [totalWorkTime, setTotalWorkTime] = useState(0) // in seconds
  const [workTimerRunning, setWorkTimerRunning] = useState(false)
  const workTimerRef = useRef<NodeJS.Timeout | null>(null)
  const workTimerStartRef = useRef<number | null>(null)

  // Settings - now can be decimal values
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Calculate total time for current mode (convert minutes to seconds)
  const totalTime = mode === "work" ? Math.round(workDuration * 60) : Math.round(breakDuration * 60)

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  // Load work log from localStorage on initial render
  useEffect(() => {
    const savedLog = localStorage.getItem("pomodoroWorkLog")
    if (savedLog) {
      try {
        const parsedLog = JSON.parse(savedLog)
        // Convert string dates back to Date objects
        const logWithDates = parsedLog.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setWorkLog(logWithDates)

        // Count existing work items to set the initial counter
        const workItems = logWithDates.filter((item: WorkLogItem) => item.type === "work")
        setWorkItemCount(workItems.length)
      } catch (e) {
        console.error("Failed to parse work log from localStorage", e)
      }
    }

    // Load total work time from localStorage
    const savedTotalWorkTime = localStorage.getItem("pomodoroTotalWorkTime")
    if (savedTotalWorkTime) {
      setTotalWorkTime(Number.parseInt(savedTotalWorkTime, 10))
    }
  }, [])

  // Save work log to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("pomodoroWorkLog", JSON.stringify(workLog))
  }, [workLog])

  // Save total work time to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("pomodoroTotalWorkTime", totalWorkTime.toString())
  }, [totalWorkTime])

  // Process the next pending work item when the current one is done
  useEffect(() => {
    if (!logEntryOpen && pendingWorkItems.length > 0 && !currentlyNamingItem) {
      const nextItemId = pendingWorkItems[0]
      setPendingWorkItems((prev) => prev.slice(1))
      setPendingWorkItemId(nextItemId)
      setCurrentlyNamingItem(nextItemId)
      setLogEntryOpen(true)
    }
  }, [logEntryOpen, pendingWorkItems, currentlyNamingItem])

  // Effect to handle the work timer
  useEffect(() => {
    if (workTimerRunning) {
      // Only start the work timer if we're in work mode
      if (mode === "work") {
        workTimerStartRef.current = Date.now()
        workTimerRef.current = setInterval(() => {
          setTotalWorkTime((prev) => prev + 1)
        }, 1000)
      }
    } else {
      if (workTimerRef.current) {
        clearInterval(workTimerRef.current)
        workTimerRef.current = null
      }
    }

    return () => {
      if (workTimerRef.current) {
        clearInterval(workTimerRef.current)
      }
    }
  }, [workTimerRunning, mode])

  // Effect to handle timer countdown
  useEffect(() => {
    if (isRunning) {
      // Record session start time if not already set
      if (!currentSessionStart) {
        setCurrentSessionStart(new Date())
      }

      // Start the work timer if in work mode
      if (mode === "work") {
        setWorkTimerRunning(true)
      } else {
        setWorkTimerRunning(false)
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time's up - switch modes
            const completedMode = mode // The mode that just completed
            const nextMode = mode === "work" ? "break" : "work"
            const nextDuration = nextMode === "work" ? workDuration : breakDuration
            const completedDuration = completedMode === "work" ? workDuration : breakDuration

            // Clear interval
            if (timerRef.current) {
              clearInterval(timerRef.current)
            }

            // Show notification
            toast({
              title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} time completed!`,
              description: `Starting ${nextMode} time.`,
              duration: 4000,
            })

            // Play notification sound
            const audio = new Audio("/notification.mp3")
            audio.play().catch((e) => console.log("Audio play failed:", e))

            // Store the completed session info
            setCompletedSessionType(completedMode)
            setCompletedSessionDuration(completedDuration)

            // Handle session completion
            if (completedMode === "work") {
              // For work sessions, create a new work item with default name
              const newCount = workItemCount + 1
              setWorkItemCount(newCount)

              const newItemId = uuidv4()

              const newEntry: WorkLogItem = {
                id: newItemId,
                timestamp: new Date(),
                description: `Item ${newCount}`,
                duration: completedDuration,
                type: "work",
              }

              setWorkLog((prev) => [newEntry, ...prev])

              // If a log entry is already open, add this item to the pending queue
              if (logEntryOpen || currentlyNamingItem) {
                setPendingWorkItems((prev) => [...prev, newItemId])
              } else {
                // Otherwise, open the log entry dialog for this item
                setPendingWorkItemId(newItemId)
                setCurrentlyNamingItem(newItemId)
                setLogEntryOpen(true)
              }
            }
            // We don't log break sessions anymore

            // Update mode and reset timer
            setMode(nextMode)

            // Start or stop the work timer based on the new mode
            if (nextMode === "work") {
              setWorkTimerRunning(true)
            } else {
              setWorkTimerRunning(false)
            }

            // Convert minutes to seconds, ensuring we round to whole seconds
            return Math.round(nextDuration * 60)
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      // Pause the work timer when the main timer is paused
      setWorkTimerRunning(false)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, mode, workDuration, breakDuration, toast, workItemCount, logEntryOpen, currentlyNamingItem])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle timer controls
  const toggleTimer = () => {
    if (!isRunning) {
      // Starting a new session
      if (!currentSessionStart) {
        setCurrentSessionStart(new Date())
      }
      // Only start the work timer if in work mode
      if (mode === "work") {
        setWorkTimerRunning(true)
      }
    } else {
      // Pausing - always pause the work timer
      setWorkTimerRunning(false)
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setWorkTimerRunning(false)
    setCurrentSessionStart(null)
    // Convert minutes to seconds, ensuring we round to whole seconds
    setTimeLeft(mode === "work" ? Math.round(workDuration * 60) : Math.round(breakDuration * 60))
  }

  // Skip break time
  const skipBreak = () => {
    if (mode === "break") {
      // Stop the timer if it's running
      const wasRunning = isRunning
      if (isRunning) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      // Switch to work mode
      setMode("work")
      setTimeLeft(Math.round(workDuration * 60))

      // Start the work timer if the timer was running
      if (wasRunning) {
        // Use setTimeout to ensure state updates before starting the timer
        setTimeout(() => {
          setIsRunning(true)
          setWorkTimerRunning(true)
        }, 0)
      } else {
        setIsRunning(false)
        setWorkTimerRunning(false)
      }

      toast({
        title: "Break skipped",
        description: "Starting work time.",
        duration: 2000,
      })
    }
  }

  // Apply settings and reset timer only if values changed
  const applySettings = (work: number, break_: number) => {
    const settingsChanged = work !== workDuration || break_ !== breakDuration

    setWorkDuration(work)
    setBreakDuration(break_)

    // Only reset the timer if settings actually changed or timer is not running
    if (settingsChanged || !isRunning) {
      // Convert minutes to seconds, ensuring we round to whole seconds
      setTimeLeft(mode === "work" ? Math.round(work * 60) : Math.round(break_ * 60))
    }

    setSettingsOpen(false)
  }

  // Update work item name
  const updateWorkItemName = (description: string) => {
    if (pendingWorkItemId) {
      setWorkLog((prev) =>
        prev.map((item) =>
          item.id === pendingWorkItemId ? { ...item, description: description || item.description } : item,
        ),
      )
      setPendingWorkItemId(null)
      setCurrentlyNamingItem(null)
    }
  }

  // Handle editing a work item
  const handleEditItem = (id: string) => {
    const item = workLog.find((item) => item.id === id)
    if (item) {
      setEditingItem(item)
      setEditEntryOpen(true)
    }
  }

  // Save edited work item
  const saveEditedItem = (id: string, description: string) => {
    setWorkLog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, description: description || item.description } : item)),
    )
    setEditingItem(null)
  }

  // Reset total work time
  const resetTotalWorkTime = () => {
    setTotalWorkTime(0)
  }

  // Update document title with timer
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${mode.charAt(0).toUpperCase() + mode.slice(1)} Time`

    return () => {
      document.title = "Pomodoro Timer"
    }
  }, [timeLeft, mode])

  return (
    <div className="flex flex-col items-center w-full">
      <Card className="w-full max-w-md shadow-lg">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Mode indicator */}
            <div className="text-lg font-medium text-center">{mode === "work" ? "Work Time" : "Break Time"}</div>

            {/* Timer display */}
            <div className="text-6xl font-bold tabular-nums">{formatTime(timeLeft)}</div>

            {/* Progress bar */}
            <Progress value={progress} className="w-full h-2" />

            {/* Controls */}
            {mode === "work" ? (
              // Work mode controls - row layout with settings below
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <Button onClick={toggleTimer} variant="default" size="lg" className="w-24">
                    {isRunning ? <Pause className="mr-2" size={18} /> : <Play className="mr-2" size={18} />}
                    {isRunning ? "Pause" : "Start"}
                  </Button>

                  <Button onClick={resetTimer} variant="outline" size="lg">
                    <RotateCcw className="mr-2" size={18} />
                    Reset
                  </Button>
                </div>

                <Button onClick={() => setSettingsOpen(true)} variant="ghost" size="lg">
                  <Settings className="mr-2" size={18} />
                  Settings
                </Button>
              </div>
            ) : (
              // Break mode controls - grid layout
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <Button onClick={toggleTimer} variant="default" size="lg">
                  {isRunning ? <Pause className="mr-2" size={18} /> : <Play className="mr-2" size={18} />}
                  {isRunning ? "Pause" : "Start"}
                </Button>

                <Button onClick={resetTimer} variant="outline" size="lg">
                  <RotateCcw className="mr-2" size={18} />
                  Reset
                </Button>

                <Button onClick={skipBreak} variant="secondary" size="lg">
                  <SkipForward className="mr-2" size={18} />
                  Skip
                </Button>

                <Button onClick={() => setSettingsOpen(true)} variant="ghost" size="lg">
                  <Settings className="mr-2" size={18} />
                  Settings
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          workDuration={workDuration}
          breakDuration={breakDuration}
          onApply={applySettings}
        />
      </Card>

      {/* Work Log */}
      <WorkLog
        items={workLog.filter((item) => item.type === "work")}
        onEditItem={handleEditItem}
        totalWorkTime={totalWorkTime}
        onResetTotalWorkTime={resetTotalWorkTime}
      />

      {/* Add Log Entry Modal - Only shown for work sessions */}
      <AddLogEntry
        isOpen={logEntryOpen}
        onClose={() => {
          setLogEntryOpen(false)
          // Process any pending items after this one is closed
          setTimeout(() => {
            setCurrentlyNamingItem(null)
          }, 100)
        }}
        onAdd={updateWorkItemName}
        itemCount={workItemCount}
      />

      {/* Edit Log Entry Modal */}
      <EditLogEntry
        isOpen={editEntryOpen}
        onClose={() => {
          setEditEntryOpen(false)
          setEditingItem(null)
        }}
        onSave={saveEditedItem}
        item={editingItem}
      />
    </div>
  )
}

