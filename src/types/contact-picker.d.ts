/**
 * Type definitions for the Contact Picker API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API
 * Supported on: Android Chrome 80+, Samsung Internet 11.2+
 * NOT supported on iOS Safari
 */

interface ContactAddress {
  addressLine?: string[]
  city?: string[]
  country?: string[]
  dependentLocality?: string[]
  organization?: string[]
  postalCode?: string[]
  region?: string[]
  sortingCode?: string[]
}

interface ContactInfo {
  address?: ContactAddress[]
  email?: string[]
  icon?: Blob[]
  name?: string[]
  tel?: string[]
  url?: string[]
}

interface ContactsManager {
  select(
    properties: string[],
    options?: { multiple?: boolean }
  ): Promise<ContactInfo[]>
  getProperties(): Promise<string[]>
}

interface Navigator {
  contacts?: ContactsManager
}
