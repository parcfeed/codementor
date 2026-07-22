import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { registerSchema } from "@/features/auth/schemas";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const POST = apiHandler(async (request: Request) => {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  checkRateLimit(`register:${ip}`);
  const body = await request.json();
  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    throw ApiError.validation("Les donnees transmises sont invalides.", {
      errors: parsedBody.error.flatten().fieldErrors,
    });
  }

  const { email, name, password } = parsedBody.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw ApiError.conflict("Un compte existe deja avec cette adresse email.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      reputationScore: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    { success: true, message: "Compte cree avec succes.", user },
    { status: 201 },
  );
});
