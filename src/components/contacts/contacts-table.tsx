'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2 } from 'lucide-react'
import { ContactGroupBadge } from './contact-group-badge'
import type { ImportedContact, ImportedContactUpdate } from '@/lib/types'

interface ContactsTableProps {
  contacts: ImportedContact[]
  groupTags: string[]
  onUpdateContact: (id: string, updates: ImportedContactUpdate) => void
  onDeleteContact: (id: string) => void
}

export function ContactsTable({
  contacts,
  groupTags,
  onUpdateContact,
  onDeleteContact,
}: ContactsTableProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">לא נמצאו אנשי קשר</p>
        <p className="text-sm mt-1">נסו לשנות את החיפוש או הסינון</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם פרטי</TableHead>
              <TableHead>שם משפחה</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead>קבוצה</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.first_name}</TableCell>
                <TableCell>{contact.last_name}</TableCell>
                <TableCell dir="ltr" className="text-right">
                  {contact.phone || '—'}
                </TableCell>
                <TableCell dir="ltr" className="text-right">
                  {contact.email || '—'}
                </TableCell>
                <TableCell>
                  <ContactGroupBadge
                    groupTag={contact.group_tag}
                    onGroupChange={(group) =>
                      onUpdateContact(contact.id, { group_tag: group })
                    }
                    extraGroups={groupTags}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{contact.full_name}</span>
                    <ContactGroupBadge
                      groupTag={contact.group_tag}
                      onGroupChange={(group) =>
                        onUpdateContact(contact.id, { group_tag: group })
                      }
                      extraGroups={groupTags}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {contact.phone && <span dir="ltr">{contact.phone}</span>}
                    {contact.email && <span dir="ltr">{contact.email}</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => onDeleteContact(contact.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
