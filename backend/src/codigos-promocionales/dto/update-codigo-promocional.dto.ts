import { PartialType } from '@nestjs/mapped-types';
import { CreateCodigoPromocionalDto } from './create-codigo-promocional.dto';

export class UpdateCodigoPromocionalDto extends PartialType(
  CreateCodigoPromocionalDto,
) {}
