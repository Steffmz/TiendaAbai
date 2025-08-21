const { PrismaClient } = require('@prisma/client');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    try {
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize PrismaClient:', error);
      prisma = null;
    }
  }
  return prisma;
}

module.exports = getPrismaClient();
