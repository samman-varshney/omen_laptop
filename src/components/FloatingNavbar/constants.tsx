const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const I = ({ d, extra = [] }: { d: string; extra?: string[] }) => (
  <svg
    viewBox="0 0 24 24"
    style={{ width: "100%", height: "100%" }}
    {...strokeProps}
  >
    <path d={d} />
    {extra.map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

const icons = {
  home: (
    <I
      d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      extra={["M9 22V12h6v10"]}
    />
  ),
  search: <I d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />,
  bell: (
    <I d="M15 17H9m4.13-9.39A6 6 0 0 0 6 13v3H4v2h16v-2h-2v-3c0-2.35-1.35-4.38-3.38-5.39zM13.73 21a2 2 0 0 1-3.46 0" />
  ),
  bookmark: <I d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  settings: (
    <I
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      extra={[
        "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
      ]}
    />
  ),
  user: (
    <I
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      extra={["M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"]}
    />
  ),
  mail: (
    <I
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      extra={["m22 6-10 7L2 6"]}
    />
  ),
  layers: (
    <I
      d="m12 2 10 6.5-10 6.5L2 8.5z"
      extra={["M2 15.5l10 6.5 10-6.5", "M2 12l10 6.5L22 12"]}
    />
  ),
  grid: <I d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
};

export const NAV_ITEMS = [
  { label: "Home", icon: icons.home },
  { label: "Search", icon: icons.search },
  { label: "Inbox", icon: icons.mail },
  { label: "Layers", icon: icons.layers },
  { label: "Grid", icon: icons.grid },
  { label: "Profile", icon: icons.user },
  { label: "Settings", icon: icons.settings },
];
