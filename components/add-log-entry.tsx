"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AddLogEntryProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (description: string) => void
  itemCount: number
}

export function AddLogEntry({ isOpen, onClose, onAdd, itemCount }: AddLogEntryProps) {
  const [description, setDescription] = useState("")

  const handleAdd = () => {
    onAdd(description)
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle>Log Work Session #{itemCount}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">What did you accomplish?</Label>
            <Textarea
              id="description"
              placeholder={`Describe what you worked on (or leave empty for "Item ${itemCount}")...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button type="button" onClick={handleAdd}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

