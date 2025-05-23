import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value
  const path = request.nextUrl.pathname

  // Protected routes that require authentication
  const protectedRoutes = ["/chat", "/profile"]

  // Auth routes that should redirect to chat if already logged in
  const authRoutes = ["/login", "/register"]

  // Check if the user is trying to access a protected route without being logged in
  if (protectedRoutes.some((route) => path.startsWith(route)) && !userId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to chat if the user is already logged in and trying to access auth routes
  if (authRoutes.includes(path) && userId) {
    return NextResponse.redirect(new URL("/chat", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/chat/:path*", "/profile/:path*", "/login", "/register"],
}
