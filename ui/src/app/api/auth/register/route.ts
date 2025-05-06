import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/utils/crypto";
import { emailSchema, nameSchema, passwordSchema } from "@/utils/zodSchema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Define validation schema
    const userSchema = z.object({
      name: nameSchema,
      email: emailSchema,
      password: passwordSchema,
    });

    // Validate the input
    const result = userSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const hashed_password = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed_password,
      },
    });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    return new NextResponse(
      JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
