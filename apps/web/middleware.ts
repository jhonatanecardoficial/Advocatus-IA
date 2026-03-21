import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
    const token = req.cookies.get("accessToken")
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

    if (token) {
        if (isAuthPage) {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }
        return NextResponse.next()
    }

    if (!isAuthPage) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/matters/:path*", "/clients/:path*", "/billing/:path*", "/ai-search/:path*", "/intelligence/:path*"]
}
