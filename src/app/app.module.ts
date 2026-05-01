import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { CatalogModule } from '../modules/catalog/catalog.module';
import { AppCacheModule } from '../infra/cache/cache.module';
import { LoggingModule } from '../infra/logging/logging.module';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RequestLoggerMiddleware } from '../infra/logging/request-logger.middleware';
import { HealthController } from './health.controller';
import { CartModule } from '../modules/cart/cart.module';
import { CheckoutModule } from '../modules/checkout/checkout.module';
import { PaymentsModule } from '../modules/payments/payments.module';
import { SearchModule } from '../modules/search/search.module';
import { BridalPartyModule } from '../modules/bridal-party/bridal-party.module';
import { FitEngineModule } from '../modules/fit-engine/fit-engine.module';
import { UserProfileModule } from '../modules/user-profile/user-profile.module';
import { RecommendationEngineModule } from '../modules/recommendation-engine/recommendation-engine.module';
import { ReturnsFeedbackModule } from '../modules/returns-feedback/returns-feedback.module';

@Module({
  imports: [AuthModule,CatalogModule,AppCacheModule,
    LoggingModule,CartModule,CheckoutModule,PaymentsModule,SearchModule,
    BridalPartyModule,FitEngineModule,UserProfileModule,RecommendationEngineModule,
    ReturnsFeedbackModule], 
  controllers: [AppController,HealthController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}