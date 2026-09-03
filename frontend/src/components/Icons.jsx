function Icon({ size = 18, children, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}


export function HomeIcon() {
  return (
    <Icon>
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H4a1 1 0 0 1-1-1z" />   
    </Icon>
  )
}

export function SearchIcon() {
  return (
    <Icon>
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="15.5" y2="15.5" />
    </Icon>
  )
}

export function PlusIcon() {
  return (
    <Icon>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  )
}

export function MailIcon() {
  return (
    <Icon >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  )
}

