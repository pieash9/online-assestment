import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "access_token";

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

	const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
	const isLoginRoute = pathname === "/login";

	if (!token && isDashboardRoute) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (token && isLoginRoute) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/login", "/dashboard/:path*"],
};
