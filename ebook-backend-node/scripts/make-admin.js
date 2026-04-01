import { prisma } from "../src/lib/prisma.js";

async function main() {
  const email = process.argv[2];

  if (!email) {
    throw new Error("Email manquant. Exemple: node scripts/make-admin.js emiliodesouza800@gmail.com");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, isAdmin: true },
  });

  if (!existing) {
    throw new Error(`Aucun utilisateur trouvé avec l'email: ${email}`);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
    select: { id: true, email: true, isAdmin: true },
  });

  console.log("Utilisateur passé admin :", user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });