"use client"

import { useState, type ReactNode } from "react"
import type { TeamMember, TeamRole } from "@prisma/client"
import { Plus, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TeamMemberForm } from "@/components/settings/team-member-form"

type DirectoryMember = TeamMember

type TeamMemberDialogProps = {
  roles: Array<Pick<TeamRole, "id" | "name">>
  member?: DirectoryMember | null
  trigger?: ReactNode
  mode?: "create" | "edit"
}

export function TeamMemberDialog({ roles, member, trigger, mode }: TeamMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const isEdit = mode === "edit" || Boolean(member)

  const defaultTrigger = (
    <Button variant={isEdit ? "ghost" : "default"} size={isEdit ? "sm" : "default"} className={isEdit ? "gap-2" : "gap-2"}>
      {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
      {isEdit ? "Editar" : "Nuevo integrante"}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar ${member?.name ?? "integrante"}` : "Nuevo integrante"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza la información interna que compartimos con el equipo."
              : "Completa los datos básicos para sumar a alguien al directorio interno."}
          </DialogDescription>
        </DialogHeader>
        <TeamMemberForm roles={roles} member={member} onSubmitted={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
