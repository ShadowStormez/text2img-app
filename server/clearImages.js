import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete all images
  const deleted = await prisma.image.deleteMany({});
  console.log(`Deleted ${deleted.count} images`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
