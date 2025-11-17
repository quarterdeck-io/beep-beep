import { auth } from "@/lib/auth"

export default auth((req) => {
  // req.auth contains the session
  if (!req.auth) {
    const url = new URL("/login", req.url)
    return Response.redirect(url)
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/ebay-connect/:path*", "/product-search/:path*"],
}

