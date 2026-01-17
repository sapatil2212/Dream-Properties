import { UserRole } from '@prisma/client';
export { UserRole };

export type PropertyCategory = 'Flats' | 'Villa' | 'Shop' | 'Office' | 'Plot' | 'Agricultural' | 'Industrial' | 'Warehouse';

export interface Property {
  id: number | string;
  builderId: number | string;
  title: string;
  description?: string;
  price: string;
  priceRaw?: number;
  area: string;
  location: string;
  address: string;
  type: string;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  possession_date?: string;
  rera_id?: string;
  amenities: string[] | any;
  images: string[] | any;
  highlights?: string[] | any;
  specifications?: any;
  project_units?: number;
  project_area?: string;
  configurations?: string;
  avg_price?: string;
  launch_date?: string;
  sizes?: string;
  project_size?: string;
  area_unit?: string;
  property_subtype?: string;
  map_link?: string;
  nearby_locations?: any;
  attachments?: any;
  listing_type?: 'Sell' | 'Rent' | 'Lease';
  builder?: string; // For display
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyOfInterest: string;
  propertyId: string;
  status: 'New' | 'Interested' | 'Site Visit Scheduled' | 'Closed' | 'Lost' | 'Follow-up';
  date: string;
  assignedTo?: string;
  source: 'Website' | 'Walk-in' | 'Facebook' | 'Referral';
  lastNote?: string;
}

export interface Builder {
  id: string;
  name: string;
  logo: string;
  activeProjects: number;
  totalInventory: number;
  joinedDate: string;
  status: 'Active' | 'Pending' | 'Suspended';
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  lastLogin?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Commission' | 'Subscription' | 'Payout';
  amount: number;
  status: 'Completed' | 'Processing' | 'Failed';
  description: string;
}
