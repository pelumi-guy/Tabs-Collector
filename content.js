chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "request_dom_info") {
        const category = categorizePage(document);
        sendResponse(category);
    }
});