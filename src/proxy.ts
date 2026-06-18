import { NextResponse, type NextRequest } from "next/server";

import { authorizePrivateStagingRequest } from "./lib/auth/private-staging-basic-auth";

export function proxy(request: NextRequest) {
  try {
    const auth = authorizePrivateStagingRequest(request.headers);

    if (auth.allowed) {
      return NextResponse.next();
    }

    return privateStagingDenied(auth.status, auth.reason);
  } catch (error) {
    return privateStagingDenied(
      503,
      error instanceof Error ? `Private staging configuration error: ${error.message}` : "Private staging configuration error.",
    );
  }
}

function privateStagingDenied(status: 401 | 503, message: string) {
  return new NextResponse(message, {
    status,
    headers:
      status === 401
        ? {
            "WWW-Authenticate": 'Basic realm="ORMB private staging", charset="UTF-8"',
            "Cache-Control": "no-store",
          }
        : {
            "Cache-Control": "no-store",
          },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/staging/:path*"],
};
