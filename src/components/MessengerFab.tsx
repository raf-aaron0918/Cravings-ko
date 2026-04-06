 "use client";
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './MessengerFab.module.css';

const MESSENGER_URL = 'https://m.me/1120823984437011';

export default function MessengerFab() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLAnchorElement | null>(null);
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    if (!expanded) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [expanded]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!expanded) {
      event.preventDefault();
      setExpanded(true);
      return;
    }
  };

  return (
    <a
      ref={rootRef}
      className={`${styles.fab} ${expanded ? styles.expanded : ''}`}
      href={MESSENGER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Cravings Ko on Messenger"
      onClick={handleClick}
    >
      <span className={styles.icon} aria-hidden="true" />
      {expanded && <span className={styles.label}>Chat in Messenger</span>}
    </a>
  );
}
