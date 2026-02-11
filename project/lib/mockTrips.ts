export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  createdAt: string;
}

export const mockTrips: Trip[] = [
  {
    id: "1",
    destination: "Paris",
    startDate: "2025-01-15",
    endDate: "2025-01-18",
    travelers: 2,
    budget: 1000,
    createdAt: "2024-12-01",
  },
  {
    id: "2",
    destination: "Roma",
    startDate: "2025-02-10",
    endDate: "2025-02-15",
    travelers: 1,
    budget: 1500,
    createdAt: "2024-11-28",
  },
  {
    id: "3",
    destination: "Barcelona",
    startDate: "2025-03-05",
    endDate: "2025-03-09",
    travelers: 4,
    budget: 2000,
    createdAt: "2024-11-25",
  },
];
