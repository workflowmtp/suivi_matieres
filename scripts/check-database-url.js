const fs = require("fs");

function readLocalDatabaseUrl() {
  if (!fs.existsSync(".env")) return "";
  const line = fs.readFileSync(".env", "utf8").split(/\r?\n/).find(l => l.trim().startsWith("DATABASE_URL="));
  if (!line) return "";
  return line.split("=").slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
}

const url = process.env.DATABASE_URL || readLocalDatabaseUrl();

if (!url) {
  console.error("DATABASE_URL est manquante dans l'environnement de build.");
  console.error("Ajoutez DATABASE_URL dans Vercel > Project Settings > Environment Variables.");
  process.exit(1);
}

if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
  console.error("DATABASE_URL invalide : elle doit commencer par postgresql:// ou postgres://");
  console.error(`Préfixe reçu : ${url.slice(0, 24)}`);
  process.exit(1);
}
