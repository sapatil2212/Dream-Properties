import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        securityKey: { label: "Security Key", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Check Super Admin first (from .env)
        if (credentials.email === process.env.SUPER_ADMIN_EMAIL) {
          if (
            credentials.password === process.env.SUPER_ADMIN_PASSWORD && 
            credentials.securityKey === process.env.SUPER_ADMIN_SECURITY_KEY
          ) {
            return {
              id: 'superadmin',
              email: credentials.email,
              name: 'Super Admin',
              role: 'SUPER_ADMIN',
              mobile: '',
            }
          } else {
            throw new Error('Invalid credentials or security key')
          }
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('Invalid credentials')
        }

        if (user.status === 'Disabled') {
          throw new Error('Your account has been blocked. Please contact support.')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        // Check security key for SaaS roles
        const ssaasRoles = ['ADMIN', 'TELECALLER', 'SALES_EXECUTIVE']
        if (ssaasRoles.includes(user.role)) {
          if (user.securityKey !== credentials.securityKey) {
            throw new Error('Invalid security key')
          }
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          mobile: user.mobile,
          firmName: user.projectName,
          officeAddress: user.propertyAddress,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.mobile = user.mobile
        token.firmName = user.firmName
        token.officeAddress = user.officeAddress
      }
      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.user?.name || token.name
        token.email = session.user?.email || token.email
        token.mobile = session.user?.mobile || token.mobile
        token.firmName = session.user?.firmName || token.firmName
        token.officeAddress = session.user?.officeAddress || token.officeAddress
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.mobile = token.mobile as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.firmName = token.firmName as string | null
        session.user.officeAddress = token.officeAddress as string | null
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
