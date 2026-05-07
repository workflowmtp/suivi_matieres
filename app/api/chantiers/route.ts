import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

const DEFAULT_ROLE_KEY = "defaultRole";
const SELECTED_PROJECT_KEY = "selectedProjectId";
const recordTypes = ["tools", "consumables", "materials", "labor", "expenses", "transport", "daily"];
const defaultPermissions = [
  { id: "view_all", label: "Voir les tableaux et modules" },
  { id: "view_project", label: "Consulter chantiers" },
  { id: "view_tools", label: "Consulter outillage" },
  { id: "view_consumables", label: "Consulter consommables" },
  { id: "view_materials", label: "Consulter matières" },
  { id: "view_labor", label: "Consulter main-d’œuvre" },
  { id: "view_expenses", label: "Consulter dépenses" },
  { id: "view_transport", label: "Consulter transport" },
  { id: "view_daily", label: "Consulter fiches journalières" },
  { id: "view_attachments", label: "Consulter pièces jointes" },
  { id: "project_create", label: "Créer chantier" },
  { id: "project_edit", label: "Modifier chantier" },
  { id: "project_delete", label: "Supprimer chantier" },
  { id: "create_tools", label: "Ajouter outillage" },
  { id: "create_consumables", label: "Ajouter consommables" },
  { id: "create_materials", label: "Ajouter matières" },
  { id: "create_labor", label: "Ajouter main-d’œuvre" },
  { id: "create_expenses", label: "Ajouter dépenses" },
  { id: "create_transport", label: "Ajouter coût transport" },
  { id: "create_daily", label: "Créer fiche journalière" },
  { id: "validate", label: "Valider écritures" },
  { id: "correct", label: "Corriger écritures" },
  { id: "cancel", label: "Annuler écritures" },
  { id: "attachments", label: "Gérer pièces jointes" },
  { id: "audit_view", label: "Voir journal écritures" },
  { id: "export", label: "Exporter rapports" },
  { id: "access_manage", label: "Gérer utilisateurs et permissions" },
  { id: "reset", label: "Réinitialiser la base" }
];
const allowedPermissionIds = new Set(defaultPermissions.map(p => p.id));
const defaultRoles = [
  { name: "Administrateur", permissions: defaultPermissions.map(p => p.id) },
  { name: "PCA", permissions: ["view_all", "view_project", "view_tools", "view_consumables", "view_materials", "view_labor", "view_expenses", "view_transport", "view_daily", "view_attachments", "project_create", "project_edit", "project_delete", "validate", "correct", "cancel", "attachments", "audit_view", "export", "reset"] },
  { name: "DG", permissions: ["view_all", "view_project", "view_tools", "view_consumables", "view_materials", "view_labor", "view_expenses", "view_transport", "view_daily", "view_attachments", "project_create", "project_edit", "project_delete", "validate", "correct", "cancel", "attachments", "audit_view", "export"] },
  { name: "Contrôleur", permissions: ["view_all", "view_project", "view_tools", "view_consumables", "view_materials", "view_labor", "view_expenses", "view_transport", "view_daily", "view_attachments", "validate", "correct", "cancel", "attachments", "audit_view", "export"] },
  { name: "Chef chantier", permissions: ["view_all", "view_project", "view_tools", "view_consumables", "view_materials", "view_transport", "view_daily", "view_attachments", "project_edit", "create_tools", "create_consumables", "create_materials", "create_transport", "create_daily", "attachments"] },
  { name: "Magasinier", permissions: ["view_all", "view_project", "view_tools", "view_consumables", "view_materials", "view_attachments", "create_tools", "create_consumables", "create_materials", "attachments"] },
  { name: "Comptable", permissions: ["view_all", "view_project", "view_labor", "view_expenses", "view_transport", "view_attachments", "create_labor", "create_expenses", "create_transport", "attachments", "export"] },
  { name: "Lecture", permissions: ["view_all"] }
];

async function ensureDefaultAccess() {
  for (const p of defaultPermissions) {
    await prisma.permission.upsert({ where: { id: p.id }, create: p, update: { label: p.label } });
  }
  const roleCount = await prisma.role.count();
  const rolesToSeed = roleCount ? defaultRoles.filter(r => r.name === "Administrateur") : defaultRoles;
  for (const r of rolesToSeed) {
    await prisma.role.upsert({ where: { name: r.name }, create: { name: r.name }, update: {} });
    await prisma.rolePermission.createMany({
      data: [...new Set(r.permissions)].map(permissionId => ({ roleName: r.name, permissionId })),
      skipDuplicates: true
    });
  }
  await prisma.appSetting.upsert({
    where: { key: DEFAULT_ROLE_KEY },
    create: { key: DEFAULT_ROLE_KEY, value: "Lecture" },
    update: {}
  });
}

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
  await ensureDefaultAccess();
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
  if (!projects.length && !users.length) return null;
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
  const roles = (body?.auth?.roles?.length ? body.auth.roles : defaultRoles).map((r: any) => ({
    name: r.name,
    permissions: [...new Set((r.permissions || []).filter((id: string) => allowedPermissionIds.has(id)))]
  }));
  const users = body?.auth?.users || [];
  const projects = body?.projects || (body?.project ? [body.project] : []);
  const projectIds = projects.map((p: any) => p.id).filter(Boolean);
  const roleNames = roles.map((r: any) => r.name).filter(Boolean);
  const attachments = body?.attachments || [];
  const audit = body?.audit || [];

  for (const p of defaultPermissions) {
    await prisma.permission.upsert({ where: { id: p.id }, create: { id: p.id, label: p.label }, update: { label: p.label } });
  }
  const permissionIds = new Set<string>();
  roles.forEach((r: any) => (r.permissions || []).forEach((id: string) => permissionIds.add(id)));
  for (const id of permissionIds) await prisma.permission.upsert({ where: { id }, create: { id, label: id }, update: {} });
  for (const r of roles) await prisma.role.upsert({ where: { name: r.name }, create: { name: r.name }, update: {} });
  await prisma.rolePermission.deleteMany();
  const rolePermissionKeys = new Set<string>();
  const rolePermissionRows: { roleName: string; permissionId: string }[] = [];
  for (const r of roles) for (const permissionId of r.permissions || []) {
    const key = `${r.name}::${permissionId}`;
    if (rolePermissionKeys.has(key)) continue;
    rolePermissionKeys.add(key);
    rolePermissionRows.push({ roleName: r.name, permissionId });
  }
  if (rolePermissionRows.length) await prisma.rolePermission.createMany({ data: rolePermissionRows, skipDuplicates: true });
  await prisma.appSetting.upsert({ where: { key: DEFAULT_ROLE_KEY }, create: { key: DEFAULT_ROLE_KEY, value: body?.auth?.defaultRole || "Lecture" }, update: { value: body?.auth?.defaultRole || "Lecture" } });
  await prisma.appSetting.upsert({ where: { key: SELECTED_PROJECT_KEY }, create: { key: SELECTED_PROJECT_KEY, value: body?.selectedProjectId || projects[0]?.id || "" }, update: { value: body?.selectedProjectId || projects[0]?.id || "" } });

  await prisma.attachment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.chantierRecord.deleteMany();
  await prisma.projectChef.deleteMany();
  if (projectIds.length) await prisma.project.deleteMany({ where: { id: { notIn: projectIds } } });
  const validRoleNames = new Set(roles.map((r: any) => r.name));
  for (const u of users) {
    const requestedRole = u.role || u.roleName;
    const roleName = validRoleNames.has(requestedRole) ? requestedRole : body?.auth?.defaultRole || "Lecture";
    await prisma.user.upsert({ where: { id: u.id }, create: { id: u.id, name: u.name, email: u.email, password: u.password, roleName, active: !!u.active }, update: { name: u.name, email: u.email, password: u.password, roleName, active: !!u.active } });
  }
  if (roleNames.length) await prisma.role.deleteMany({ where: { name: { notIn: roleNames }, users: { none: {} } } });
  for (const p of projects) await prisma.project.upsert({ where: { id: p.id }, create: { id: p.id, name: p.name || "", code: p.code || "", client: p.client || "", lieu: p.lieu || "", responsable: p.responsable || "", controleur: p.controleur || "", budget: Number(p.budget || 0), start: p.start || "", end: p.end || "", status: p.status || "Préparation", description: p.description || "", primaryChefId: p.primaryChefId || null }, update: { name: p.name || "", code: p.code || "", client: p.client || "", lieu: p.lieu || "", responsable: p.responsable || "", controleur: p.controleur || "", budget: Number(p.budget || 0), start: p.start || "", end: p.end || "", status: p.status || "Préparation", description: p.description || "", primaryChefId: p.primaryChefId || null } });
  const projectChefKeys = new Set<string>();
  const projectChefRows: { projectId: string; userId: string }[] = [];
  for (const p of projects) for (const userId of p.chefIds || []) {
    if (!p.id || !userId) continue;
    const key = `${p.id}::${userId}`;
    if (projectChefKeys.has(key)) continue;
    projectChefKeys.add(key);
    projectChefRows.push({ projectId: p.id, userId });
  }
  if (projectChefRows.length) await prisma.projectChef.createMany({ data: projectChefRows, skipDuplicates: true });
  for (const type of recordTypes) for (const r of body?.[type] || []) {
    const base = splitRecord(r);
    if (!base.id || !base.projectId) continue;
    await prisma.chantierRecord.create({ data: { ...base, type, data: base.data as Prisma.InputJsonValue } });
  }
  for (const a of attachments) await prisma.attachment.create({ data: { id: a.id, projectId: a.projectId, createdById: a.createdBy || null, createdByRole: a.createdByRole || null, date: a.date || "", ts: a.ts || new Date().toISOString(), filename: a.filename || "", mime: a.mime || "application/octet-stream", size: Number(a.size || 0), dataUrl: a.dataUrl || "", linkedType: a.linkedType || "project", linkedId: a.linkedId || a.projectId, linkedLabel: a.linkedLabel || "", description: a.description || "" } });
  const validProjectIds = new Set(projectIds);
  for (const a of audit.slice(0, 1000)) await prisma.auditLog.create({ data: { id: a.id, ts: a.ts || new Date().toISOString(), user: a.user || "", role: a.role || null, projectId: validProjectIds.has(a.projectId) ? a.projectId : null, projectName: a.projectName || null, action: a.action || "", type: a.type || "", recordId: a.recordId || "", label: a.label || "", details: a.details || "" } });
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
