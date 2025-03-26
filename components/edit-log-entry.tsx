"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { WorkLogItem } from "./work-log"

interface EditLogEntryProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, description: string) => void
  item: WorkLogItem | null
}

export function EditLogEntry({ isOpen, onClose, onSave, item }: EditLogEntryProps) {
  const [description, setDescription] = useState("")

  // Update description when item changes
  useEffect(() => {
    if (item) {
      setDescription(item.description)
    }
  }, [item])

  const handleSave = () => {
    if (item) {
      onSave(item.id, description)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle>Edit Work Item</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

