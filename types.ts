
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BUILDER = 'BUILDER',
  TELECALLER = 'TELECALLER',
  SALES_EXECUTIVE = 'SALES_EXECUTIVE',
  BUYER = 'BUYER'
}

export type PropertyCategory = 'Flats' | 'Villa' | 'Shop' | 'Office' | 'Plot' | 'Agricultural' | 'Industrial' | 'Warehouse';

export interface Property {
  id: string;
  title: string;
  location: string;
  address: string;
  type: PropertyCategory;
  listingType: 'buy' | 'rent';
  price: string;
  priceRaw: number;
  pricePerSqft: string;
  status: 'Available' | 'Sold Out' | 'Fast Filling';
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  builder: string;
  builderId: string;
  description: string;
  amenities: string[];
  highlights: string[];
  specifications: { label: string; value: string }[];
  nearbyPlaces: { name: string; distance: string }[];
  views: number;
  leadsCount: number;
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
