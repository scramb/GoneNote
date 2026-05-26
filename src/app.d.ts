import type { Redis } from 'ioredis';

declare global {
  namespace App {
    interface Locals {
      redis: Redis;
    }
  }
}

export {};
