
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const blog = await getCollection('blog');

    // Sort by published date descending
    const sortedPosts = blog.sort((a, b) => {
        return new Date(b.data.published).getTime() - new Date(a.data.published).getTime();
    });

    return rss({
        title: 'Yuying Wu\'s Blog',
        description: 'Yet another blog for sharing my life.',
        site: context.site,
        items: sortedPosts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.published,
            description: post.data.description,
            // Assuming the blog post URL is /blog/[entry] which uses id
            link: `/blog/${post.id}/`,
        })),
        customData: `<language>zh-cn</language>`,
    });
}
