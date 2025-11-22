import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dance.cash';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/studio/dashboard/', '/payment/', '/confirmation/'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
