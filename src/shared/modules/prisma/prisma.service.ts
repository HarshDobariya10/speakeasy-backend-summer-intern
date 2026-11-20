import { INestApplication, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { readReplicas } from '@prisma/extension-read-replicas';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  public prisma: any; // Extended PrismaClient with read replicas

  constructor() {
    // Create write/primary adapter
    const writeAdapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
    const writeClient = new PrismaClient({ adapter: writeAdapter });

    // Create read replica adapter (if read replica URL is provided)
    const readReplicaUrl = process.env.DATABASE_READ_REPLICA_URL;
    if (readReplicaUrl) {
      const readReplicaAdapter = new PrismaMariaDb(readReplicaUrl);
      const readReplicaClient = new PrismaClient({
        adapter: readReplicaAdapter,
      });

      // Extend write client with read replicas
      this.prisma = writeClient.$extends(
        readReplicas({
          replicas: [readReplicaClient],
        }),
      );
    } else {
      // Fallback to write client only if no read replica is configured
      this.prisma = writeClient;
    }
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Replace the Prisma beforeExit with Node.js process beforeExit
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
