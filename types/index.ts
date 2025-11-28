export interface Artist {
    id: string;
    created_at: string;
    studio_id: string;
    name: string;
    bio?: string;
    instagram?: string;
    website?: string;
    image_url?: string;
}

export interface Event {
    id: string;
    created_at: string;
    studio_id: string;
    name: string; // Was title
    description?: string;
    date: string;
    location: string;
    price_usd: number; // Was price
    banner_url?: string; // Was image_url
    capacity: number;
    artist_id?: string;
    artist?: Artist;
    event_artists?: { artist: Artist }[];
    start_time: string;
    end_time: string;
    style: string;
    teacher: string;
    recurring?: boolean;
    recurring_pattern?: string;
}

export interface Studio {
    id: string;
    email: string;
    name: string;
    description?: string;
    logo_url?: string;
}

export interface Signup {
    id: string;
    event_id: string;
    attendee_name: string;
    attendee_phone?: string;
    attendee_email?: string;
    payment_method?: string;
    price_paid_usd?: number;
    price_paid_bch?: number;
    transaction_id?: string;
    nft_txid?: string;
    cashtamp_id?: string;
    confirmed_at?: string;
    created_at: string;
    event?: Event;
    event_name?: string;
    studio_id?: string;
}
