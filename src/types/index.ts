
export interface Tag {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  count?: number;
}

export interface FeaturedCategory {
  id: string;
  category: string;
  title?: string;
  description?: string;
  featuredImage?: string;
  link?: string;
  highlightClass?: string;
  uiProps?: Record<string, any>;
}

export interface HeroBannerData {
  id: string;
  imageUrl: string;
  link?: string;
}

export interface Preferences {
  tags: Tag[];
  categories: Category[];
  languages: string[];
  featuredCategories: FeaturedCategory[];
  heroBanners: HeroBannerData[];
}

export type EventStatus = 'PENDING' | 'APPROVED' | 'DELETED' | 'REJECTED';

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  locationDetails?: {
    venueAddress: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  locationCoords?: {
    type: 'Point';
    coordinates: [number, number];
  };
  category: string;
  language?: string;
  price?: number;
  currency?: string;
  tags: string[];
  featureImage: string;
  detailImage?: string;
  gallery: string[];
  entry?: string;
  meetingLink?: string;
  status: EventStatus;
  isFeatured: boolean;
  startAt?: number;
  createdAt: string;
}

export interface CreateEventDTO extends Omit<Event, 'id' | 'slug' | 'status' | 'createdAt'> { }
