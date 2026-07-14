export interface Activity {
    id: string;
    name: string;
    price: number;
    min_participants: number;
    max_participants: number;
    date: Date;
    type: string;
    participant_requirements: string[];
    price_included_items: string;
    location: string;
    meeting_point: string;
    description: string;
    image: string;
    note: string;
    by: string;
    activity_time: string;
    activity_duration: string;
}
