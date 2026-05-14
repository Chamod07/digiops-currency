// Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { ApiProperty } from '@nestjs/swagger';

class TransactionItemDto {
  @ApiProperty({ description: 'Transaction hash (0x-prefixed).' })
  txHash: string;

  @ApiProperty({ description: 'Block number in which the transaction was mined.' })
  blockNumber: number;

  @ApiProperty({ description: 'Sender wallet address.' })
  senderAddress: string;

  @ApiProperty({ description: 'Receiver wallet address.' })
  receiverAddress: string;

  @ApiProperty({ description: 'Transferred amount formatted using token decimals (human-readable).' })
  amount: string;

  @ApiProperty({ description: 'Raw transferred amount as an unformatted string.' })
  amountRaw: string;

  @ApiProperty({ description: 'ISO-8601 timestamp of the block, or null if unavailable.', nullable: true })
  timestamp: string | null;
}

class TransactionListDto {
  @ApiProperty({ description: 'Whether more results exist beyond the current page.' })
  hasMore: boolean;

  @ApiProperty({ description: 'Number of results skipped.' })
  offset: number;

  @ApiProperty({ description: 'Maximum number of results returned per page.' })
  limit: number;

  @ApiProperty({ description: 'List of matching transactions, ordered newest first.', type: [TransactionItemDto] })
  transactions: TransactionItemDto[];
}

export class TransactionListResponseDto {
  @ApiProperty({ description: 'A message indicating the result of the API request.' })
  message: string;

  @ApiProperty({ description: 'HTTP status code of the response.' })
  httpCode: number;

  @ApiProperty({ description: 'Paginated list of transactions.', type: TransactionListDto })
  payload: TransactionListDto;
}
