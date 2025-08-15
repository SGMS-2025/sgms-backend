FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

WORKDIR /app

COPY package*.json ./

# Skip prepare script (husky) during Docker build
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

COPY --chown=nodeuser:nodejs . .

RUN mkdir -p logs && chown -R nodeuser:nodejs logs

USER nodeuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "start"]
