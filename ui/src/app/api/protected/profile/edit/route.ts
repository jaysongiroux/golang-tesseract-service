import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { nameSchema } from "@/utils/zodSchema";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const editProfileHandler = async (req: NextRequest, session: Session) => {
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { name } = await req.json();

  //   validate name
  const schema = z.object({
    name: nameSchema,
  });

  const { success } = schema.safeParse({ name });
  if (!success) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      name: true,
      id: true,
    },
  });

  return NextResponse.json(user);
};

export const POST = (req: NextRequest) =>
  withProtectedRoute(editProfileHandler, req);
