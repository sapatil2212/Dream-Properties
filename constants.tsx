
import React from 'react';
import { LayoutDashboard, Building2, Users, PieChart, BadgePercent, PhoneCall, CalendarCheck, Settings, CreditCard, LifeBuoy } from 'lucide-react';
import { Property, Lead, UserRole, Builder, Transaction } from './types.ts';

export const MOCK_BUILDERS: Builder[] = [
  { id: 'b1', name: 'Skyline Group', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100', activeProjects: 5, totalInventory: 120, joinedDate: '2023-01-15', status: 'Active' },
  { id: 'b2', name: 'Metro Build', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100', activeProjects: 2, totalInventory: 45, joinedDate: '2023-05-20', status: 'Active' },
  { id: 'b3', name: 'Greenfield Dev', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100', activeProjects: 8, totalInventory: 210, joinedDate: '2022-11-10', status: 'Active' },
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'f1',
    title: 'Sky Towers',
    location: 'Worli, Mumbai',
    address: 'Plot No. 45, Hill Road, Worli, Mumbai - 400018',
    price: '₹4.5 Cr onwards',
    priceRaw: 45000000,
    pricePerSqft: '₹24,324 / sq.ft',
    type: 'Flats',
    listingType: 'buy',
    status: 'Fast Filling',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80'],
    bedrooms: 3,
    bathrooms: 3,
    area: '1850 sq.ft',
    builder: 'Skyline Group',
    builderId: 'b1',
    description: 'Premium residential project offering luxurious apartments with stunning sea views.',
    amenities: ['Gym', 'Pool', 'Clubhouse'],
    highlights: ['Sea-facing', 'Smart Home'],
    specifications: [{ label: 'Possession', value: 'Dec 2025' }],
    nearbyPlaces: [{ name: 'Worli Sea Face', distance: '0.5 km' }],
    views: 1240,
    leadsCount: 45
  },
  {
    id: 'f2',
    title: 'Urban Oasis',
    location: 'Bandra West, Mumbai',
    address: 'Carter Road, Bandra West',
    price: '₹3.2 Cr onwards',
    priceRaw: 32000000,
    pricePerSqft: '₹32,000 / sq.ft',
    type: 'Flats',
    listingType: 'buy',
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80'],
    bedrooms: 2,
    bathrooms: 2,
    area: '1100 sq.ft',
    builder: 'Metro Build',
    builderId: 'b2',
    description: 'Modern apartments in the heart of Bandra.',
    amenities: ['Rooftop Garden', 'Cafe'],
    highlights: ['Prime Location', 'High ROI'],
    specifications: [{ label: 'Possession', value: 'Ready' }],
    nearbyPlaces: [{ name: 'Bandra Station', distance: '1.2 km' }],
    views: 890,
    leadsCount: 22
  }
];

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', propertyOfInterest: 'Sky Towers', propertyId: 'f1', status: 'Site Visit Scheduled', date: '2024-05-20', source: 'Website', lastNote: 'Looking for high floor with sea view.' },
  { id: 'l2', name: 'Priya Singh', email: 'priya@example.com', phone: '9123456789', propertyOfInterest: 'Urban Oasis', propertyId: 'f2', status: 'New', date: '2024-05-21', source: 'Facebook' },
  { id: 'l3', name: 'Amit Patel', email: 'amit@example.com', phone: '9988776655', propertyOfInterest: 'Sky Towers', propertyId: 'f1', status: 'Interested', date: '2024-05-19', source: 'Referral', lastNote: 'Sent brochure over WhatsApp.' },
  { id: 'l4', name: 'Sneha Gupta', email: 'sneha@example.com', phone: '9898989898', propertyOfInterest: 'Meadow Lands', propertyId: 'p1', status: 'Follow-up', date: '2024-05-18', source: 'Website' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2024-05-15', type: 'Commission', amount: 45000, status: 'Completed', description: 'Commission for Unit 402 - Sky Towers' },
  { id: 't2', date: '2024-05-10', type: 'Subscription', amount: 12000, status: 'Completed', description: 'Builder Monthly Subscription - Metro Build' },
  { id: 't3', date: '2024-05-08', type: 'Payout', amount: 25000, status: 'Processing', description: 'Monthly Sales Bonus - Rahul J' },
];

export const NAV_ITEMS = {
  [UserRole.SUPER_ADMIN]: [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { label: 'Builders', icon: <Building2 size={20} />, href: '/dashboard/builders' },
    { label: 'Marketplace', icon: <Building2 size={20} />, href: '/dashboard/properties' },
    { label: 'Accounts', icon: <Users size={20} />, href: '/dashboard/users' },
    { label: 'Billing', icon: <CreditCard size={20} />, href: '/dashboard/billing' },
    { label: 'Analytics', icon: <PieChart size={20} />, href: '/dashboard/reports' },
    { label: 'Settings', icon: <Settings size={20} />, href: '/dashboard/settings' },
  ],
  [UserRole.ADMIN]: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { label: 'Sales Team', icon: <Users size={20} />, href: '/dashboard/employees' },
    { label: 'Leads Hub', icon: <Users size={20} />, href: '/dashboard/leads' },
    { label: 'Finances', icon: <BadgePercent size={20} />, href: '/dashboard/finance' },
  ],
  [UserRole.BUILDER]: [
    { label: 'Insights', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { label: 'Inventory', icon: <Building2 size={20} />, href: '/dashboard/properties' },
    { label: 'Leads', icon: <Users size={20} />, href: '/dashboard/leads' },
    { label: 'Reports', icon: <PieChart size={20} />, href: '/dashboard/reports' },
  ],
  [UserRole.TELECALLER]: [
    { label: 'Lead Queue', icon: <PhoneCall size={20} />, href: '/dashboard' },
    { label: 'Scheduled', icon: <CalendarCheck size={20} />, href: '/dashboard/follow-ups' },
  ],
  [UserRole.SALES_EXECUTIVE]: [
    { label: 'My Pipeline', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { label: 'Visits', icon: <CalendarCheck size={20} />, href: '/dashboard/site-visits' },
  ],
};
