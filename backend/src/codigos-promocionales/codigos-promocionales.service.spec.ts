import { Test, TestingModule } from '@nestjs/testing';
import { CodigosPromocionalesService } from './codigos-promocionales.service';

describe('CodigosPromocionalesService', () => {
  let service: CodigosPromocionalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodigosPromocionalesService],
    }).compile();

    service = module.get<CodigosPromocionalesService>(CodigosPromocionalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
