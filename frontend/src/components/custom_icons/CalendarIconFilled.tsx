const CalendarFilled = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="#094FA1"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-calendar-minus2-icon lucide-calendar-minus-2"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path
        d="M2.5 10h19"
        style={{
          fill: "var(--color-Primary)",
          stroke: "var(--color-Tertiary)",
        }}
      />
      <path d="M10 16h4" />

      <path
        d="M14.5 16a18 0 0 0 1-5.2 0"
        style={{
          fill: "var(--color-Primary)",
          stroke: "var(--color-Tertiary)",
        }}
      ></path>
    </svg>
  );
};

export default CalendarFilled;
