FROM node:18-bookworm-slim

RUN useradd --user-group --create-home --shell /bin/false appuser

WORKDIR /app

COPY . .

RUN chown -R appuser:appuser /app

RUN chmod +x /app/docker-entrypoint.sh

WORKDIR /app/dapp/dist

USER appuser

EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "8080"]