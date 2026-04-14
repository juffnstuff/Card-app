const { PrismaClient } = require('@prisma/client');

// Shared singleton — avoids opening multiple connection pools
const prisma = new PrismaClient();

module.exports = prisma;
