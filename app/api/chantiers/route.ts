import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

const DEFAULT_ROLE_KEY = "defaultRole";
const SELECTED_PROJECT_KEY = "selectedProjectId";
const recordTypes = ["tools", "consumables", "materials", "labor", "expenses", "transport", "daily"];

function splitRecord(record: any) {
  const {
    id, projectId, createdBy, createdByRole, date, validationStatus, version, obs,
    validatedAt, validatedBy, cancelledAt, cancelReason, correctedAt, correctionReason, originalId,
    ...data
  } = record || {};
  return {
    id,
    projectId,
    createdById: createdBy || null,
    createdByRole: createdByRole || null,
    date: date || new Date().toISOString().slice(0, 10),
    validationStatus: validationStatus || "Brouillon",
    version: Number(version || 1),
    obs: obs || null,
    validatedAt: validatedAt || null,
    validatedBy: validatedBy || null,
    cancelledAt: cancelledAt || null,
    cancelReason: cancelReason || null,
    correctedAt: correctedAt || null,
    correctionReason: correctionReason || null,
    originalId: originalId || null,
    data
  };
}

function mergeRecord(row: any) {
  return {
    ...(row.data || {}),
    id: row.id,
    projectId: row.projectId,
    createdBy: row.createdById || undefined,
    createdByRole: row.createdByRole || undefined,
    date: row.date,
    validationStatus: row.validationStatus,
    version: row.version,
    obs: row.obs || undefined,
    validatedAt: row.validatedAt || undefined,
    validatedBy: row.validatedBy || undefined,
    cancelledAt: row.cancelledAt || undefined,
    cancelReason: row.cancelReason || undefined,
    correctedAt: row.correctedAt || undefined,
    correctionReason: row.correctionReason || undefined,
    originalId: row.originalId || undefined
  };
}

async function readRelationalState() {
  const [roles, permissions, settings, users, projects, records, attachments, audit] = await Promise.all([
    prisma.role.findMany({ include: { permissions: true }, orderBy: { name: "asc" } }),
    prisma.permission.findMany(),
    prisma.appSetting.findMany(),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ include: { chefs: true }, orderBy: { createdAt: "asc" } }),
    prisma.chantierRecord.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.attachment.findMany({ orderBy: { ts: "desc" } }),
    prisma.auditLog.findMany({ orderBy: { ts: "desc" }, take: 1000 })
  ]);
  if (!projects.length && !roles.length && !users.length) return null;
  const selectedProjectId = String(settings.find(s => s.key === SELECTED_PROJECT_KEY)?.value || projects[0]?.id || "");
  const project = projects.find(p => p.id === selectedProjectId) || projects[0];
  const byType: Record<string, any[]> = Object.fromEntries(recordTypes.map(t => [t, []]));
  records.forEach(r => { if (byType[r.type]) byType[r.type].push(mergeRecord(r)); });
  return {
    project: project ? { id: project.id, name: project.name, code: project.code, client: project.client, lieu: project.lieu, responsable: project.responsable, controleur: project.controleur, budget: project.budget, start: project.start, end: project.end, status: project.status, description: project.description, createdAt: project.createdAt.toISOString(), updatedAt: project.updatedAt.toISOString(), chefIds: project.chefs.map(c => c.userId), primaryChefId: project.primaryChefId || "" } : undefined,
    projects: projects.map(p => ({ id: p.id, name: p.name, code: p.code, client: p.client, lieu: p.lieu, responsable: p.responsable, controleur: p.controleur, budget: p.budget, start: p.start, end: p.end, status: p.status, description: p.description, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(), chefIds: p.chefs.map(c => c.userId), primaryChefId: p.primaryChefId || "" })),
    selectedProjectId,
    ...byType,
    attachments: attachments.map(a => ({ id: a.id, projectId: a.projectId, createdBy: a.createdById || undefined, createdByRole: a.createdByRole || undefined, date: a.date, ts: a.ts, filename: a.filename, mime: a.mime, size: a.size, dataUrl: a.dataUrl, linkedType: a.linkedType, linkedId: a.linkedId, linkedLabel: a.linkedLabel, description: a.description })),
    audit: audit.map(a => ({ id: a.id, ts: a.ts, user: a.user, role: a.role || undefined, projectId: a.projectId || undefined, projectName: a.projectName || undefined, action: a.action, type: a.type, recordId: a.recordId, label: a.label, details: a.details })),
    auth: {
      sessionUserId: null,
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email, password: u.password, role: u.roleName, active: u.active })),
      roles: roles.map(r => ({ name: r.name, permissions: r.permissions.map(p => p.permissionId) })),
      defaultRole: String(settings.find(s => s.key === DEFAULT_ROLE_KEY)?.value || "Lecture")
    }
  };
}

async function writeRelationalState(body: any) {
  const roles = body?.auth?.roles || [];
  const users = body?.auth?.users || [];
  const projects = body?.projects || (body?.project ? [body.project] : []);
  const attachments = body?.attachments || [];
  const audit = body?.audit || [];

  await prisma.$transaction(async tx => {
    for (const p of body?.appPermissions || []) {
      await tx.permission.upsert({ where: { id: p.id }, create: { id: p.id, label: p.label }, update: { label: p.label } });
    }
    const permissionIds = new Set<string>();
    roles.forEach((r: any) => (r.permissions || []).forEach((id: string) => permissionIds.add(id)));
    for (const id of permissionIds) await tx.permission.upsert({ where: { id }, create: { id, label: id }, update: {} });
    for (const r of roles) await tx.role.upsert({ where: { name: r.name }, create: { name: r.name }, update: {} });
    await tx.rolePermission.deleteMany();
    for (const r of roles) for (const permissionId of r.permissions || []) await tx.rolePermission.create({ data: { roleName: r.name, permissionId } });
    await tx.appSetting.upsert({ where: { key: DEFAULT_ROLE_KEY }, create: { key: DEFAULT_ROLE_KEY, value: body?.auth?.defaultRole || "Lecture" }, update: { value: body?.auth?.defaultRole || "Lecture" } });
    await tx.appSetting.upsert({ where: { key: SELECTED_PROJECT_KEY }, create: { key: SELECTED_PROJECT_KEY, value: body?.selectedProjectId || projects[0]?.id || "" }, update: { value: body?.selectedProjectId || projects[0]?.id || "" } });

    for (const u of users) await tx.user.upsert({ where: { id: u.id }, create: { id: u.id, name: u.name, email: u.email, password: u.password, roleName: u.role, active: !!u.active }, update: { name: u.name, email: u.email, password: u.password, roleName: u.role, active: !!u.active } });
    for (const p of projects) await tx.project.upsert({ where: { id: p.id }, create: { id: p.id, name: p.name || "", code: p.code || "", client: p.client || "", lieu: p.lieu || "", responsable: p.responsable || "", controleur: p.controleur || "", budget: Number(p.budget || 0), start: p.start || "", end: p.end || "", status: p.status || "Préparation", description: p.description || "", primaryChefId: p.primaryChefId || null }, update: { name: p.name || "", code: p.code || "", client: p.client || "", lieu: p.lieu || "", responsable: p.responsable || "", controleur: p.controleur || "", budget: Number(p.budget || 0), start: p.start || "", end: p.end || "", status: p.status || "Préparation", description: p.description || "", primaryChefId: p.primaryChefId || null } });
    await tx.projectChef.deleteMany();
    for (const p of projects) for (const userId of p.chefIds || []) await tx.projectChef.create({ data: { projectId: p.id, userId } });

    await tx.chantierRecord.deleteMany();
    for (const type of recordTypes) for (const r of body?.[type] || []) {
      const base = splitRecord(r);
      if (!base.id || !base.projectId) continue;
      await tx.chantierRecord.create({ data: { ...base, type, data: base.data as Prisma.InputJsonValue } });
    }
    await tx.attachment.deleteMany();
    for (const a of attachments) await tx.attachment.create({ data: { id: a.id, projectId: a.projectId, createdById: a.createdBy || null, createdByRole: a.createdByRole || null, date: a.date || "", ts: a.ts || new Date().toISOString(), filename: a.filename || "", mime: a.mime || "application/octet-stream", size: Number(a.size || 0), dataUrl: a.dataUrl || "", linkedType: a.linkedType || "project", linkedId: a.linkedId || a.projectId, linkedLabel: a.linkedLabel || "", description: a.description || "" } });
    await tx.auditLog.deleteMany();
    for (const a of audit.slice(0, 1000)) await tx.auditLog.create({ data: { id: a.id, ts: a.ts || new Date().toISOString(), user: a.user || "", role: a.role || null, projectId: a.projectId || null, projectName: a.projectName || null, action: a.action || "", type: a.type || "", recordId: a.recordId || "", label: a.label || "", details: a.details || "" } });
  });
}

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL manquant dans .env.local" }, { status: 500 });
  try {
    return NextResponse.json({ data: await readRelationalState() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Lecture PostgreSQL impossible" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL manquant dans .env.local" }, { status: 500 });
  try {
    await writeRelationalState(await request.json());
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sauvegarde PostgreSQL impossible" }, { status: 500 });
  }
}

export async function DELETE() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL manquant dans .env.local" }, { status: 500 });
  try {
    await prisma.$transaction([
      prisma.attachment.deleteMany(), prisma.auditLog.deleteMany(), prisma.chantierRecord.deleteMany(), prisma.projectChef.deleteMany(), prisma.project.deleteMany(), prisma.user.deleteMany(), prisma.rolePermission.deleteMany(), prisma.role.deleteMany(), prisma.permission.deleteMany(), prisma.appSetting.deleteMany(), prisma.appState.deleteMany()
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Réinitialisation PostgreSQL impossible" }, { status: 500 });
  }
}
