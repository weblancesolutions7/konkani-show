
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

export interface Preferences {
  tags: Tag[];
  categories: Category[];
  cities: string[];
  featuredCategories: FeaturedCategory[];
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
  category: string;
  tags: string[];
  featureImage: string;
  gallery: string[];
  entry?: string;
  meetingLink?: string;
  status: EventStatus;
  createdAt: string;
}

export interface CreateEventDTO extends Omit<Event, 'id' | 'slug' | 'status' | 'createdAt'> { }
