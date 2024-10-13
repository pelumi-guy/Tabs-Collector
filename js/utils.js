function categorizePage(dom) {
    const domainCategories = {
        "Social Media": ["facebook.com", "twitter.com", "instagram.com", "linkedin.com"],
        "News": ["nytimes.com", "bbc.com", "cnn.com", "reuters.com"],
        "E-Commerce/Shopping": ["amazon.com", "ebay.com", "aliexpress.com", "etsy.com"],
        "Entertainment (Videos, Streaming, Music)": ["youtube.com", "netflix.com", "vimeo.com", "spotify.com"],
        "Forums/Discussion Boards": ["reddit.com", "quora.com", "stackexchange.com"],
        "Programming/Development": ["github.com", "stackoverflow.com", "gitlab.com"],
        "Productivity/Tools": ["docs.google.com", "trello.com", "asana.com"]
    };

    const weights = {
        "Social Media": 10,
        "Entertainment (Videos, Streaming, Music)": 10,
        "Articles/Blogs": 7,
        "Search Result Pages": 7,
        "News": 5,
        "E-Commerce/Shopping": 5,
        "Productivity/Tools": 4,
        "Forums/Discussion Boards": 4,
        "Programming/Development": 6,
        "Uncategorized": 1
    };

    const scores = {
        "Articles/Blogs": 0,
        "News": 0,
        "Social Media": 0,
        'Search Result Pages': 7,
        "E-Commerce/Shopping": 0,
        "Entertainment (Videos, Streaming, Music)": 0,
        "Productivity/Tools": 0,
        "Forums/Discussion Boards": 0,
        "Programming/Development": 0,
        "Uncategorized": 0
    };

    function matchDomain(domains) {
        const currentDomain = window.location.hostname;
        return domains.some(domain => currentDomain.includes(domain));
    }

    function getMetaTagContent(property) {
        const metaTag = dom.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
        return metaTag ? metaTag.getAttribute("content") : null;
    }

    function containsKeywords(keywords, text) {
        const lowerCaseText = text.toLowerCase();
        return keywords.some(keyword => lowerCaseText.includes(keyword.toLowerCase()));
    }

    // Domain-based category match
    for (let category in domainCategories) {
        if (matchDomain(domainCategories[category])) {
            scores[category] += weights[category];
        }
    }


    const url = dom.location.href;
    if (url.includes("/search")) {
        category = 'Search Result Pages';
        scores["Search Result Pages"] += weights["Search Result Pages"];
    }

    // Check for article/blog content
    if (dom.querySelector("article, section, .blog-post")) {
        scores["Articles/Blogs"] += weights["Articles/Blogs"];
    }

    // Check for news content in meta tags and keywords
    if (
        getMetaTagContent("og:type") === "article" ||
        getMetaTagContent("name") === "news" ||
        containsKeywords(["news", "headline", "breaking"], dom.body.innerText)
    ) {
        scores["News"] += weights["News"];
    }

    // Check for social media profile pages
    if (getMetaTagContent("og:type") === "profile") {
        scores["Social Media"] += weights["Social Media"];
    }

    // Check for e-commerce product pages
    if (
        getMetaTagContent("og:type") === "product" ||
        containsKeywords(["add to cart", "checkout", "buy now", "product"], dom.body.innerText)
    ) {
        scores["E-Commerce/Shopping"] += weights["E-Commerce/Shopping"];
    }

    // Check for video streaming or entertainment
    if (
        dom.querySelector("video, iframe[src*='youtube.com'], iframe[src*='vimeo.com']") ||
        getMetaTagContent("og:type") === "video"
    ) {
        scores["Entertainment (Videos, Streaming, Music)"] += weights["Entertainment (Videos, Streaming, Music)"];
    }

    // Check for productivity tools
    if (containsKeywords(["task", "project", "doc", "document"], dom.body.innerText)) {
        scores["Productivity/Tools"] += weights["Productivity/Tools"];
    }

    // Check for forums or discussion boards
    if (containsKeywords(["thread", "discussion", "comment"], dom.body.innerText)) {
        scores["Forums/Discussion Boards"] += weights["Forums/Discussion Boards"];
    }

    // Check for programming/development platforms
    if (
        containsKeywords(["repository", "commit", "code", "project"], dom.body.innerText) ||
        dom.querySelector("code, pre")
    ) {
        scores["Programming/Development"] += weights["Programming/Development"];
    }

    // Default "Uncategorized" if no matches found
    if (Object.values(scores).every(score => score === 0)) {
        scores["Uncategorized"] += weights["Uncategorized"];
    }

    // Determine the highest scoring category
    const finalCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    return finalCategory;
}

const objectMap = (object, mapFn) => {
    return Object.keys(object).reduce(function(result, key) {
        let v = object[key];
        if (typeof v === 'object' && !Array.isArray(v) && v !== null) {
            const temp = objectMap(v, mapFn);
            v = temp;
            // console.log({v});
        }
        // console.log({v});
        result[key] = mapFn(v);

        return result;
    }, {});
};

module.exports = objectMap;