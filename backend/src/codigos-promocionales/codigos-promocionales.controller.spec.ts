import { Test, TestingModule } from '@nestjs/testing';
import { CodigosPromocionalesController } from './codigos-promocionales.controller';

describe('CodigosPromocionalesController', () => {
  let controller: CodigosPromocionalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodigosPromocionalesController],
    }).compile();

    controller = module.get<CodigosPromocionalesController>(CodigosPromocionalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
