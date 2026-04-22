export type EntryStatus = 'waiting' | 'seated' | 'removed';

export type WaitlistEntry = {
  id: string;
  token: string;
  name: string;
  phone: string;
  party_size: number;
  status: EntryStatus;
  created_at: string;
  seated_at: string | null;
  removed_at: string | null;
};

export type Settings = {
  id: number;
  avg_wait_minutes: number;
  restaurant_name: string;
  updated_at: string;
};

export type PublicEntry = Pick<WaitlistEntry, 'id' | 'name' | 'party_size' | 'created_at'>;
