import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const stripePriceId = process.env.STRIPE_PRICE_ID || "price_xxx";
  const filePath = process.env.EBOOK_FILE_PATH || "storage/ebook.pdf";

  await prisma.product.upsert({
    where: { slug: "ebook" },
    update: {},
    create: {
      slug: "ebook",
      name: "Une béninoise en Martinique",
      description: "eBook (PDF)",
      priceCents: 999,
      currency: "eur",
      stripePriceId,
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
