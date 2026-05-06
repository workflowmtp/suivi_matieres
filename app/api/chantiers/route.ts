import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const APP_ID = "chantier_mireille_nextjs_v2";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL manquant dans .env.local" }, { status: 500 });
  }

  try {
    const state = await prisma.appState.findUnique({ where: { id: APP_ID } });
    return NextResponse.json({ data: state?.data ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Lecture PostgreSQL impossible" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL manquant dans .env.local" }, { status: 500 });
  }

  try {
    const body = await request.json();
    await prisma.appState.upsert({
      where: { id: APP_ID },
      create: { id: APP_ID, data: body },
      update: { data: body }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sauvegarde PostgreSQL impossible" }, { status: 500 });
  }
}

export async function DELETE() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL manquant dans .env.local" }, { status: 500 });
  }

  try {
    await prisma.appState.deleteMany({ where: { id: APP_ID } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Réinitialisation PostgreSQL impossible" }, { status: 500 });
  }
}
