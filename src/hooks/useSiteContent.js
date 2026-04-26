import { useState, useEffect } from 'react';
import { getSiteContent, setSiteContent } from '@/lib/siteContent';

export function useSiteContent() {
  const [content, setContent] = useState(getSiteContent);

  useEffect(() => {
    const handler = (e) => setContent(e.detail);
    window.addEventListener('siteContentUpdated', handler);
    return () => window.removeEventListener('siteContentUpdated', handler);
  }, []);

  const update = (path, value) => {
    const keys = path.split('.');
    const newContent = JSON.parse(JSON.stringify(content));
    let obj = newContent;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    setSiteContent(newContent);
  };

  return { content, update };
}