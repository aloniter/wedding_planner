import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Public app — no auth required, pass all requests through
  return NextResponse.next({ request })
}
