'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { ContactsToolbar } from '@/components/contacts/contacts-toolbar'
import { ContactsTable } from '@/components/contacts/contacts-table'
import { ImportFileDropzone } from '@/components/contacts/import-file-dropzone'
import { PushToGuestsDialog } from '@/components/contacts/push-to-guests-dialog'
import { useWedding } from '@/hooks/use-wedding'
import { useGuests } from '@/hooks/use-guests'
import { useContacts } from '@/hooks/use-contacts'
import { exportContactsToExcel } from '@/lib/contacts-excel'

export default function ContactsPage() {
  const router = useRouter()
  const { wedding, loading: weddingLoading } = useWedding()
  const { addGuestsBulk } = useGuests(wedding?.id)
  const {
    contacts,
    allContacts,
    loading: contactsLoading,
    search,
    setSearch,
    filterGroup,
    setFilterGroup,
    groupTags,
    importContacts,
    updateContact,
    deleteContact,
    clearAll,
  } = useContacts()

  useEffect(() => {
    if (!weddingLoading && !wedding) {
      router.push('/setup')
    }
  }, [wedding, weddingLoading, router])

  if (weddingLoading || contactsLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    )
  }

  const hasContacts = allContacts.length > 0

  return (
    <div className="space-y-4">
      <PageHeader
        title="אנשי קשר"
        subtitle={
          hasContacts
            ? `${allContacts.length} אנשי קשר`
            : 'ייבאו את אנשי הקשר מהטלפון'
        }
        action={
          hasContacts ? (
            <div className="flex gap-2 flex-wrap">
              <ImportFileDropzone onImport={importContacts} compact />
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportContactsToExcel(allContacts)}
              >
                <Download className="h-4 w-4 ml-1" />
                ייצוא Excel
              </Button>
              <PushToGuestsDialog
                filteredContacts={contacts}
                allContacts={allContacts}
                weddingId={wedding.id}
                onPush={addGuestsBulk}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground"
              >
                <Trash2 className="h-4 w-4 ml-1" />
                נקה הכל
              </Button>
            </div>
          ) : undefined
        }
      />

      {!hasContacts ? (
        <ImportFileDropzone onImport={importContacts} />
      ) : (
        <>
          <ContactsToolbar
            search={search}
            onSearchChange={setSearch}
            filterGroup={filterGroup}
            onFilterGroupChange={setFilterGroup}
            groupTags={groupTags}
          />
          <ContactsTable
            contacts={contacts}
            groupTags={groupTags}
            onUpdateContact={updateContact}
            onDeleteContact={deleteContact}
          />
        </>
      )}
    </div>
  )
}
