import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Solo PDF e imagenes.' }, { status: 400 })
    }

    // Generar nombre unico
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `tickets/${timestamp}-${file.name}`

    const blob = await put(filename, file, {
      access: 'private',
    })

    return NextResponse.json({ 
      pathname: blob.pathname,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'pdf'
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
