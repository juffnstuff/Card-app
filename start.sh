#!/bin/sh
npx prisma migrate deploy
node server/index.js
