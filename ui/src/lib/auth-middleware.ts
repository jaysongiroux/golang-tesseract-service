import { authOptions } from "./auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Session } from "next-auth";

/**
 * Middleware helper to protect API routes in the /api/protected directory
 * Returns the session if authenticated or a 401 response if not
 */
export async function withProtectedRoute(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>,
  req: NextRequest
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handler(req, session);
}
