export PATH="/root/.bun/bin:$PATH"
npx prisma migrate deploy
bun run src/server.js
