import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // For Convex Better Auth, the token is managed by the Convex client
  // We can't easily check it server-side in middleware
  // So just let protected routes through and handle auth in the page/component
  
  // If you really need middleware protection, you'd need to verify the JWT
  // But it's simpler to handle auth in your components with useConvexAuth()
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/create"], // Keep /posts public for now
};