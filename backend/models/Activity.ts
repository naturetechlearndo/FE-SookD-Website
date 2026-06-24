export interface Activity {
    activity_id: string;
    activity_name: string;
    activity_price: number;
    activity_min_participants: number;
    activity_max_participants: number;
    activity_date: Date;
    activity_type: string;
    activity_participant_requirements: string;
    activity_price_included_items: string;
    activity_location: string;
    activity_meeting_point: string;
    activity_description: string;
    activity_image: string;
    activity_note: string;
    activity_by: string;
}