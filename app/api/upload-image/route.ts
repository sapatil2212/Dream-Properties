import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ message: 'No image provided' }, { status: 400 })
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
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
