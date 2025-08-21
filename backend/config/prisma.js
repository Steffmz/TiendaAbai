const { PrismaClient } = require('@prisma/client');

// Create a single PrismaClient instance and export it for reuse
const prisma = new PrismaClient();

module.exports = prisma;
