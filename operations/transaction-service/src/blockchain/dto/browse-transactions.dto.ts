// Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { IsOptional, IsDateString, IsNumber, Min, Max, IsEthereumAddress, Matches } from '@nestjs/class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BrowseTransactionsDto {
  @ApiPropertyOptional({ description: 'Filter by sender (from) wallet address.' })
  @IsOptional()
  @IsEthereumAddress()
  readonly senderAddress?: string;

  @ApiPropertyOptional({ description: 'Filter by receiver (to) wallet address.' })
  @IsOptional()
  @IsEthereumAddress()
  readonly receiverAddress?: string;

  @ApiPropertyOptional({ description: 'Filter by exact transaction hash.' })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{64}$/)
  readonly transactionHash?: string;

  @ApiPropertyOptional({ description: 'Return only transactions after this time (ISO-8601, exclusive).' })
  @IsOptional()
  @IsDateString()
  readonly startTime?: string;

  @ApiPropertyOptional({ description: 'Return only transactions before this time (ISO-8601, exclusive).' })
  @IsOptional()
  @IsDateString()
  readonly endTime?: string;

  @ApiPropertyOptional({ description: 'Maximum number of results to return (1-100). Defaults to 10.', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  readonly limit?: number;

  @ApiPropertyOptional({ description: 'Number of results to skip for pagination. Defaults to 0.', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly offset?: number;
}
