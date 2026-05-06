-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "roles" (
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_name" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_name","permission_id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "role_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "lieu" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "controleur" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primary_chef_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_chefs" (
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "project_chefs_pkey" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "chantier_records" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "validation_status" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "obs" TEXT,
    "created_by_id" TEXT,
    "created_by_role" TEXT,
    "validated_at" TEXT,
    "validated_by" TEXT,
    "cancelled_at" TEXT,
    "cancel_reason" TEXT,
    "corrected_at" TEXT,
    "correction_reason" TEXT,
    "original_id" TEXT,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chantier_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "created_by_role" TEXT,
    "date" TEXT NOT NULL,
    "ts" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data_url" TEXT NOT NULL,
    "linked_type" TEXT NOT NULL,
    "linked_id" TEXT NOT NULL,
    "linked_label" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "ts" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "role" TEXT,
    "project_id" TEXT,
    "project_name" TEXT,
    "action" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "chantier_records_project_id_type_idx" ON "chantier_records"("project_id", "type");

-- CreateIndex
CREATE INDEX "attachments_project_id_idx" ON "attachments"("project_id");

-- CreateIndex
CREATE INDEX "audit_logs_project_id_idx" ON "audit_logs"("project_id");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "roles"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "roles"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_chefs" ADD CONSTRAINT "project_chefs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_chefs" ADD CONSTRAINT "project_chefs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chantier_records" ADD CONSTRAINT "chantier_records_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chantier_records" ADD CONSTRAINT "chantier_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

