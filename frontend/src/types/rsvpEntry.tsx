export type RSVPStatus = 'Going' | 'Cancelled' | 'Done';

export type RSVP = {
  _id: string;
  event_id: string;        // ID of the event
  user_id: string;         // ID of the user
  name: string;            // Name of the user
  email: string;           // Email of the user
  status: RSVPStatus;      // RSVP status
  date: Date;              // Timestamp of RSVP
};

export default RSVP;


export const mockRSVPs: RSVP[] = [
  {
    _id: "65a1b2c3d4e5f6a7b8c9d0f1",
    event_id: "681993b40266f3adf1b7123c",
    user_id: "67ee6f72d6018e079211a2d0",
    name: "John Doe",
    email: "john.doe@example.com",
    status: 'Going' as RSVPStatus,
    date: new Date("2024-05-10T14:30:00.000Z")
  },
  {
    _id: "65a1b2c3d4e5f6a7b8c9d0f2",
    event_id: "681993b40266f3adf1b7123c",
    user_id: "65a1b2c3d4e5f6a7b8c9d1a2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: 'Cancelled' as RSVPStatus,
    date: new Date("2024-05-12T09:15:00.000Z")
  },
  {
    _id: "65a1b2c3d4e5f6a7b8c9d0f3",
    event_id: "681993b40266f3adf1b7123c",
    user_id: "65a1b2c3d4e5f6a7b8c9d1a3",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    status: 'Done' as RSVPStatus,
    date: new Date("2024-05-08T16:45:00.000Z")
  },
  {
    _id: "65a1b2c3d4e5f6a7b8c9d0f4",
    event_id: "681993b40266f3adf1b7123c",
    user_id: "65a1b2c3d4e5f6a7b8c9d1a4",
    name: "Emily Davis",
    email: "emily.d@example.com",
    status: 'Going' as RSVPStatus,
    date: new Date("2024-05-15T11:20:00.000Z")
  },
  {
    _id: "65a1b2c3d4e5f6a7b8c9d0f5",
    event_id: "681993b40266f3adf1b7123c",
    user_id: "65a1b2c3d4e5f6a7b8c9d1a5",
    name: "Michael Wilson",
    email: "michael.w@example.com",
    status: 'Going' as RSVPStatus,
    date: new Date("2024-05-14T13:10:00.000Z")
  }
];

export const mockChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "RSVPs Over Time",
      data: [12, 19, 8, 15, 22, 7],
      borderColor: "#094FA1",
      tension: 0.3,
      borderWidth: 2,
      textColor: "#094FA1",
    },
  ],
};