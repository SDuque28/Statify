import { Transform } from 'class-transformer';
import { IsDefined, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetTopArtistsQueryDto {
  @IsDefined()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  userId: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsIn(['short_term', 'medium_term', 'long_term'])
  time_range?: 'short_term' | 'medium_term' | 'long_term';
}
