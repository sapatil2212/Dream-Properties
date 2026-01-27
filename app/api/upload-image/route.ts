import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    let imageDataUrl: string | null = null
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ message: 'No file provided' }, { status: 400 })
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const mime = file.type || 'application/octet-stream'
      const base64 = buffer.toString('base64')
      imageDataUrl = `data:${mime};base64,${base64}`
    } else {
      const body = await request.json().catch(() => null as any)
      if (body?.image) {
        imageDataUrl = body.image
      } else if (body?.imageUrl) {
        imageDataUrl = body.imageUrl
      }
    }

    if (!imageDataUrl) {
      return NextResponse.json({ message: 'No image provided' }, { status: 400 })
    }

    const result = await cloudinary.uploader.upload(imageDataUrl, {
      folder: 'dream-properties',
      resource_type: 'auto',
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { message: 'Failed to upload image', error: error.message },
      { status: 500 }
    )
  }
}
