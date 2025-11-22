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
    title: string;
    description?: string;
    date: string;
    location: string;
    price: number;
    image_url?: string;
    capacity: number;
    artist_id?: string;
    artist?: Artist;
    // Legacy fields (optional to avoid breaking existing code immediately, but should be refactored)
    name?: string; // mapped to title
    banner_url?: string; // mapped to image_url
    price_usd?: number; // mapped to price
    time?: string; // part of date
    style?: string;
    teacher?: string;
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
    created_at: string;
    event_id: string;
    name: string;
    email: string;
    phone?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    payment_method?: 'bch' | 'fiat';
    payment_status?: 'pending' | 'completed' | 'failed';
    nft_token_id?: string;
    nft_tx_id?: string;
    event?: Event;
}
