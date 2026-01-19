import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    mobile: string
    firmName?: string | null
    officeAddress?: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      mobile: string
      firmName?: string | null
      officeAddress?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    mobile: string
    name: string
    email: string
    firmName?: string | null
    officeAddress?: string | null
  }
}
