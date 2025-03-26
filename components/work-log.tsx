"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Clock, RotateCcw } from "lucide-react"

export interface WorkLogItem {
  id: string
  timestamp: Date
  description: string
  duration: number
  type: "work" | "break"
}

interface WorkLogProps {
  items: WorkLogItem[]
  onEditItem: (id: string) => void
  totalWorkTime: number
  onResetTotalWorkTime: () => void
}

export function WorkLog({ items, onEditItem, totalWorkTime, onResetTotalWorkTime }: WorkLogProps) {
  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  // Format duration in minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)}s`
    }
    return `${minutes}m`
  }

  // Format time as HH:MM:SS
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Sort items by timestamp (newest first)
  const sortedItems = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  if (items.length === 0) {
    return (
      <Card className="mt-6 w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Work Log</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>Total: {formatTotalTime(totalWorkTime)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-6 px-2"
              onClick={onResetTotalWorkTime}
              aria-label="Reset total work time"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Completed sessions will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6 w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Work Log</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>Total: {formatTotalTime(totalWorkTime)}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-6 px-2"
            onClick={onResetTotalWorkTime}
            aria-label="Reset total work time"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-4">
            {sortedItems.map((item) => (
              <div key={item.id} className="flex flex-col space-y-1 border-b pb-3 last:border-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{formatDate(item.timestamp)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDuration(item.duration)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onEditItem(item.id)}
                      aria-label="Edit work item"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

