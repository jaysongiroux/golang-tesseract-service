import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/utils/crypto";
import { passwordSchema } from "@/utils/zodSchema";
import { compare } from "bcryptjs";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const handler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { oldPassword, newPassword } = await req.json();

  const schema = z.object({
    oldPassword: z.string(),
    newPassword: passwordSchema,
  });

  const result = schema.safeParse({ oldPassword, newPassword });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      password: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } else if (!user.password) {
    return NextResponse.json(
      { error: "User has no password" },
      { status: 400 }
    );
  }

  const isPasswordCorrect = await compare(oldPassword, user.password);

  if (!isPasswordCorrect) {
    return NextResponse.json(
      { error: "Invalid old password" },
      { status: 400 }
    );
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      password: hashedNewPassword,
    },
  });

  return NextResponse.json({ message: "Password updated" }, { status: 200 });
};

export const POST = (req: NextRequest) => withProtectedRoute(handler, req);
