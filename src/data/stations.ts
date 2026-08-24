import type { Station } from '@/types';

// A curated set of Indian railway stations with real coordinates.
export const STATIONS: Station[] = [
  { id: 'st_mmc', code: 'MMCT', name: 'Mumbai Central', state: 'Maharashtra', latitude: 18.9696, longitude: 72.8205, platform: 'PF1' },
  { id: 'st_bct', code: 'BCT', name: 'Borivali', state: 'Maharashtra', latitude: 19.2307, longitude: 72.8567 },
  { id: 'st_st', code: 'ST', name: 'Surat', state: 'Gujarat', latitude: 21.1959, longitude: 72.8302 },
  { id: 'st_brc', code: 'BRC', name: 'Vadodara Junction', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { id: 'st_annd', code: 'ANND', name: 'Anand Junction', state: 'Gujarat', latitude: 22.5645, longitude: 72.9901 },
  { id: 'st_adi', code: 'ADI', name: 'Ahmedabad Junction', state: 'Gujarat', latitude: 23.0276, longitude: 72.5871 },
  { id: 'st_rtm', code: 'RTM', name: 'Ratlam Junction', state: 'Madhya Pradesh', latitude: 23.3315, longitude: 75.0367 },
  { id: 'st_kota', code: 'KOTA', name: 'Kota Junction', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648 },
  { id: 'st_swm', code: 'SWM', name: 'Sawai Madhopur', state: 'Rajasthan', latitude: 26.0141, longitude: 76.3578 },
  { id: 'st_ndls', code: 'NDLS', name: 'New Delhi', state: 'Delhi', latitude: 28.6428, longitude: 77.2199 },
  { id: 'st_hwh', code: 'HWH', name: 'Howrah Junction', state: 'West Bengal', latitude: 22.5839, longitude: 88.3425 },
  { id: 'st_hwh_r', code: 'HWH', name: 'Howrah', state: 'West Bengal', latitude: 22.5839, longitude: 88.3425 },
  { id: 'st_ghy', code: 'GHY', name: 'Guwahati', state: 'Assam', latitude: 26.1774, longitude: 91.7200 },
  { id: 'st_sbc', code: 'SBC', name: 'Bengaluru City', state: 'Karnataka', latitude: 12.9766, longitude: 77.5683 },
  { id: 'st_mas', code: 'MAS', name: 'Chennai Central', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { id: 'st_sc', code: 'SC', name: 'Secunderabad Junction', state: 'Telangana', latitude: 17.4344, longitude: 78.5013 },
  { id: 'st_pune', code: 'PUNE', name: 'Pune Junction', state: 'Maharashtra', latitude: 18.5286, longitude: 73.8743 },
  { id: 'st_jp', code: 'JP', name: 'Jaipur Junction', state: 'Rajasthan', latitude: 26.9196, longitude: 75.7878 },
  { id: 'st_lko', code: 'LKO', name: 'Lucknow Charbagh', state: 'Uttar Pradesh', latitude: 26.8487, longitude: 80.9232 },
  { id: '_st_bsb', code: 'BSB', name: 'Varanasi Junction', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  { id: 'st_ald', code: 'ALD', name: 'Prayagraj Junction', state: 'Uttar Pradesh', latitude: 25.4358, longitude: 81.8466 },
  { id: 'st_cnb', code: 'CNB', name: 'Kanpur Central', state: 'Uttar Pradesh', latitude: 26.4524, longitude: 80.3290 },
  { id: 'st_agc', code: 'AGC', name: 'Agra Cantt', state: 'Uttar Pradesh', latitude: 27.1571, longitude: 77.9985 },
  { id: 'st_ngp', code: 'NGP', name: 'Nagpur Junction', state: 'Maharashtra', latitude: 21.1538, longitude: 79.0932 },
  { id: 'st_et', code: 'ET', name: 'Itarsi Junction', state: 'Madhya Pradesh', latitude: 22.6207, longitude: 77.7623 },
  { id: 'st_bpl', code: 'BPL', name: 'Bhopal Junction', state: 'Madhya Pradesh', latitude: 23.2673, longitude: 77.4024 },
  { id: 'st_jhs', code: 'JHS', name: 'Jhansi Junction', state: 'Uttar Pradesh', latitude: 25.4484, longitude: 78.5685 },
  { id: 'st_gwl', code: 'GWL', name: 'Gwalior', state: 'Madhya Pradesh', latitude: 26.2124, longitude: 78.1772 },
  { id: 'st_math', code: 'MTC', name: 'Mathura Junction', state: 'Uttar Pradesh', latitude: 27.4924, longitude: 77.6708 },
  { id: 'st_kyn', code: 'KYN', name: 'Kalyan Junction', state: 'Maharashtra', latitude: 19.2403, longitude: 73.1305 },
  { id: 'st_igru', code: 'IGU', name: 'Igatpuri', state: 'Maharashtra', latitude: 19.6986, longitude: 73.5447 },
  { id: 'st_nsl', code: 'NSL', name: 'Nashik Road', state: 'Maharashtra', latitude: 19.9553, longitude: 73.8380 },
  { id: 'st_mmr', code: 'MMR', name: 'Manmad Junction', state: 'Maharashtra', latitude: 20.2515, longitude: 74.4716 },
  { id: 'st_j', code: 'J', name: 'Jalgaon', state: 'Maharashtra', latitude: 21.0077, longitude: 75.5764 },
  { id: 'st_bsln', code: 'BSL', name: 'Bhusaval Junction', state: 'Maharashtra', latitude: 21.0436, longitude: 75.7844 },
  { id: 'st_khandwa', code: 'KNW', name: 'Khandwa', state: 'Madhya Pradesh', latitude: 21.8244, longitude: 76.3578 },
];

export const stationById = (id: string): Station | undefined =>
  STATIONS.find((s) => s.id === id);

export const stationByCode = (code: string): Station | undefined =>
  STATIONS.find((s) => s.code === code.toUpperCase());

export const searchStations = (query: string, limit = 8): Station[] => {
  const q = query.trim().toLowerCase();
  if (!q) return STATIONS.slice(0, limit);
  return STATIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.state ?? '').toLowerCase().includes(q)
  ).slice(0, limit);
};
