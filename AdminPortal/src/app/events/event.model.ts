export class EventModel {
    _id: string;
    name: string;
    description: string;
    scheduledAt: string;
    createdAt: string;
    totalGuests: number;
    banner: string;
    guestFile: string;
    guests: [];
    createdBy: string;
}