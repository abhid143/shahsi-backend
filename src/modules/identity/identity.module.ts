import { Module } from '@nestjs/common';
import { IdentityController } from './interfaces/identity.controller';

@Module({
  controllers: [IdentityController],
})
export class IdentityModule {}