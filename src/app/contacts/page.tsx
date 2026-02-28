'use client'

import { useEffect, useState } from 'react'
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
import { parseVcfText } from '@/lib/vcf'
import { parseContactsCsv } from '@/lib/contacts-csv'

export default function ContactsPage() {
  const router = useRouter()
  const [processedShare, setProcessedShare] = useState(false)
  const [hasShared, setHasShared] = useState(false)
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

  // Check for shared file on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSharedParam = window.location.search.includes('shared=1')
      setHasShared(hasSharedParam)
    }
  }, [])

  // Handle shared files from Web Share Target API
  useEffect(() => {
    const handleSharedFile = async () => {
      if (processedShare || !hasShared) return

      try {
        const cache = await caches.open('wedding-planner-share')
        const metaResponse = await cache.match(new Request('shared-file:metadata'))
        const fileResponse = await cache.match(new Request('shared-file:content'))

        if (!metaResponse || !fileResponse) return

        const metadata = (await metaResponse.json()) as { name: string; type: string }
        const fileBlob = await fileResponse.blob()

        // Parse based on file type
        let parsedContacts: Awaited<ReturnType<typeof parseVcfText>>

        const ext = metadata.name.toLowerCase().split('.').pop()
        if (ext === 'vcf') {
          const text = await fileBlob.text()
          parsedContacts = parseVcfText(text)
        } else if (ext === 'csv') {
          const file = new File([fileBlob], metadata.name, { type: 'text/csv' })
          parsedContacts = await parseContactsCsv(file)
        } else {
          return
        }

        if (parsedContacts.length > 0) {
          importContacts(parsedContacts)
        }

        // Clean up cache
        await cache.delete(new Request('shared-file:metadata'))
        await cache.delete(new Request('shared-file:content'))

        // Remove the query param
        router.replace('/contacts')
      } catch (error) {
        console.error('Error processing shared file:', error)
      } finally {
        setProcessedShare(true)
      }
    }

    handleSharedFile()
  }, [hasShared, processedShare, importContacts, router])

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
