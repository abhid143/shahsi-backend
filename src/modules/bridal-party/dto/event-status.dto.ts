export class EventStatusResponseDto {
  eventId!: string;
  eventName!: string;
  eventDate!: Date;

  totalMembers!: number;
  joined!: number;
  sizeSubmitted!: number;
  selected!: number;
  paid!: number;

  pendingPayments!: number;

  isReadyForOrder!: boolean;
}