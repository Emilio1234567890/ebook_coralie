import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const filePath = process.env.EBOOK_FILE_PATH || "storage/ebook.pdf";
  const priceCents = Number(process.env.EBOOK_PRICE_CENTS || 1499);
  const currency = String(process.env.EBOOK_CURRENCY || "eur").toLowerCase();

  await prisma.product.upsert({
    where: { slug: "ebook" },
    update: {
      name: "Une béninoise en Martinique",
      description: "eBook (PDF)",
      priceCents,
      currency,
      filePath,
      active: true,
    },
    create: {
      slug: "ebook",
      name: "Une béninoise en Martinique",
      description: "eBook (PDF)",
      priceCents,
      currency,
      filePath,
      active: true,
    },
  });

  console.log("✅ Seed ok: product ebook");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
