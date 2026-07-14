interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  ariaLabel: string;
}

/** iOS-style toggle switch. */
export function Switch({ checked, onChange, ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`switch${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__thumb" />
    </button>
  );
}
