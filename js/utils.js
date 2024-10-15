function categorizePage(dom) {
    const domainCategories = {
        "Social Media": [
            "facebook.com", "twitter.com", "instagram.com", "linkedin.com",
            "tiktok.com", "pinterest.com", "snapchat.com", "weibo.com",
            "tumblr.com", "reddit.com", "vk.com", "discord.com"
        ],
        "News": [
            "nytimes.com", "bbc.com", "cnn.com", "reuters.com",
            "foxnews.com", "theguardian.com", "washingtonpost.com",
            "forbes.com", "bloomberg.com", "huffpost.com", "npr.org",
            "aljazeera.com", "wsj.com", "ft.com", "abcnews.go.com"
        ],
        "E-Commerce/Shopping": [
            "amazon.com", "ebay.com", "aliexpress.com", "etsy.com",
            "walmart.com", "target.com", "bestbuy.com", "flipkart.com",
            "shopify.com", "newegg.com", "wayfair.com", "zara.com",
            "hm.com", "shein.com", "macys.com", "costco.com"
        ],
        "Entertainment (Videos, Streaming, Music)": [
            "youtube.com", "netflix.com", "vimeo.com", "spotify.com",
            "hulu.com", "twitch.tv", "disneyplus.com", "hbomax.com",
            "soundcloud.com", "apple.com/apple-tv-plus", "pandora.com",
            "dailymotion.com", "crunchyroll.com", "vudu.com", "peacocktv.com"
        ],
        "Forums/Discussion Boards": [
            "reddit.com", "quora.com", "stackexchange.com",
            "stackoverflow.com", "xenforo.com", "discord.com", "4chan.org",
            "slashdot.org", "gamefaqs.com", "resetera.com", "kialo.com"
        ],
        "Programming/Development": [
            "github.com", "stackoverflow.com", "gitlab.com", "bitbucket.org",
            "codepen.io", "jsfiddle.net", "hackerrank.com", "leetcode.com",
            "codecademy.com", "freecodecamp.org", "w3schools.com",
            "developers.google.com", "dev.to", "npmjs.com", "docker.com", "geeksforgeeks.org",
        ],
        "Productivity/Tools": [
            "docs.google.com", "trello.com", "asana.com", "chatgpt.com",
            "openai.com", "notion.so", "slack.com", "microsoft.com/en-us/microsoft-365",
            "dropbox.com", "zoom.us", "evernote.com", "clickup.com",
            "todoist.com", "toggl.com", "basecamp.com", "loom.com"
        ],
        "ALX": ["alxswe.com", "alxafrica.com"]
    };


    const weights = {
        "ALX": 10,
        "Social Media": 10,
        "Programming/Development": 9,
        "Entertainment (Videos, Streaming, Music)": 8,
        "Articles/Blogs": 7,
        "Search Result Pages": 6,
        "News": 5,
        "E-Commerce/Shopping": 4,
        "Productivity/Tools": 3,
        "Forums/Discussion Boards": 2,
        "Uncategorized": 1
    };

    const scores = {
        "ALX": 0,
        "Articles/Blogs": 0,
        "News": 0,
        "Social Media": 0,
        "Search Result Pages": 0,
        "E-Commerce/Shopping": 0,
        "Entertainment (Videos, Streaming, Music)": 0,
        "Productivity/Tools": 0,
        "Forums/Discussion Boards": 0,
        "Programming/Development": 0,
        "Uncategorized": 0
    };

    let matchedKnownDomain = false;

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
            matchedKnownDomain = true;
        }
    }

    if (!matchedKnownDomain) {
        const url = dom.location.href;
        if (url.includes("/search")) {
            scores["Search Result Pages"] += weights["Search Result Pages"];
        }

        if (url.includes("alx")) {
            scores["ALX"] += weights["ALX"];
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
    }

    // Determine the highest scoring category
    const finalCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    return finalCategory;
}

function objectMap(object, mapFn) {
    return Object.keys(object).reduce(function (result, key) {
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