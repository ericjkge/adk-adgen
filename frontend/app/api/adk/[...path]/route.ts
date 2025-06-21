import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const url = `http://localhost:8000/${path}`
  const searchParams = request.nextUrl.searchParams
  
  try {
    const response = await fetch(`${url}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 15 minute timeout for long-running operations like video generation
      signal: AbortSignal.timeout(900000)
    })
    
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = { error: text || 'Unknown error' }
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy request failed' }, 
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const url = `http://localhost:8000/${path}`
  const body = await request.json()
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // 15 minute timeout for long-running operations like video generation
      signal: AbortSignal.timeout(900000)
    })
    
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = { error: text || 'Unknown error' }
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy request failed' }, 
      { status: 500 }
    )
  }
} 