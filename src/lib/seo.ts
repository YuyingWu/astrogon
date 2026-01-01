
export function getArticleSchema(item, siteUrl = "https://wuyuying.com") {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${siteUrl}/blog/${item.slug}`
        },
        "headline": item.data.title,
        "description": item.data.description,
        "image": item.data.cover ? item.data.cover : `${siteUrl}/images/og-image.png`,
        "author": {
            "@type": "Person",
            "name": "小伍",
            "url": siteUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": "Yuying Wu's blog",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/favicon/favicon-32x32.png`
            }
        },
        "datePublished": item.data.published,
        "dateModified": item.data.updated || item.data.published
    };
}
