import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://shah-communication.web.app/', lastModified: new Date() },
    { url: 'https://shah-communication.web.app/login', lastModified: new Date() },
    { url: 'https://shah-communication.web.app/register', lastModified: new Date() },
    { url: 'https://shah-communication.web.app/home', lastModified: new Date() },
  ];
}
