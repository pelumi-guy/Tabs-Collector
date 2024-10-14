var categories = {
    "Articles/Blogs": [],
    "Entertainment (Videos, Streaming, Music)": [],
    "Social Media": [],
    "Search Result Pages": [],
    News: [],
    "E-Commerce/Shopping": [],
    "Productivity/Tools": [],
    "Forums/Discussion Boards": [],
    "Programming/Development": [],
    Uncategorized: [],
};

var categoryNames = Object.keys(categories);

document.addEventListener("DOMContentLoaded", () => {

    updateSavedTabsCounts();



    // GET THE SELECTORS OF THE BUTTONS
    const categorizeTabsBtn = document.querySelector("button#get_all_tabs");
    const colOneBtn = document.querySelector("button#save_col_1");
    const colTwoBtn = document.querySelector("button#save_col_2");
    const loadColOneBtn = document.querySelector("button#load_col_1");
    const loadColTwoBtn = document.querySelector("button#load_col_2");
    const emptyColsBtn = document.querySelector("button#empty_collections");
    const muteBtn = document.querySelector("button#mute");
    const unMuteBtn = document.querySelector("button#unmute");


    // adding event listeners
    categorizeTabsBtn.addEventListener("click", categorizeTabs);
    colOneBtn.addEventListener('click', () => saveCurrentTabs('Collection1'));
    colTwoBtn.addEventListener('click', () => saveCurrentTabs('Collection2'));
    loadColOneBtn.addEventListener('click', () => switchToSavedSet('Collection1'));
    loadColTwoBtn.addEventListener('click', () => switchToSavedSet('Collection2'));
    emptyColsBtn.addEventListener('click', emptyTabCollections);
    muteBtn.addEventListener('click', muteAllTabsInCurrentWindow);
    unMuteBtn.addEventListener('click', unmuteCurrentTab);


});

async function categorizeTabs() {
        console.log("starting categories: ", categories);

        try {
            // Query all tabs in the current window
            let tabs = await chrome.tabs.query({
                currentWindow: true,
            });

            console.log("tabs:", tabs);

            for (const tab of tabs) {
                if (/^http/.test(tab.url)) {
                    const response = await new Promise((resolve, reject) => {
                        chrome.tabs.sendMessage(tab.id, { action: "request_head_info" }, (response) => {
                            if (!chrome.runtime.lastError) {
                                console.log(`tab ${tab.id} url: ${tab.url} category: ${response}`);
                                resolve(response);
                            } else {
                                console.error(chrome.runtime.lastError, `error line 27, url: ${tab.url}`);
                                resolve("Uncategorized");
                            }
                        });
                    });

                    // Categorize the tab based on the response
                    let found = false;
                    for (const category of categoryNames) {
                        if (category === response) {
                            categories[category].push(tab.id);
                            found = true;
                            break;
                        }
                    }

                    // If no matching category is found, mark as Uncategorized
                    if (!found) {
                        categories["Uncategorized"].push(tab.id);
                    }
                }
            }
        } catch (error) {
            console.error("Error creating the tab group:", error);
        } finally {
            console.log("finally start categories: ", categories);
            // Group tabs by category
            for (const category of categoryNames) {
                console.log(`${category}: ${categories[category]}`)
                if (categories[category].length > 0) {
                    let groupId = await chrome.tabs.group({
                        tabIds: categories[category],
                    });

                    console.log("Group created with ID:", groupId);

                    if (groupId) {
                        await chrome.tabGroups.update(groupId, { title: category });
                        console.log(`Tab Group ${groupId} renamed to ${category}`);
                    }
                }
            }
            console.log("ending categories: ", categories);
            showFeedback("Tabs have been categorized successfully!");
        }
}

function saveAllTabs() {
    chrome.tabs.query({}, (tabs) => {
        const allTabs = tabs.map(tab => ({ url: tab.url, title: tab.title }));
        chrome.storage.sync.set({ 'allTabs': allTabs }, () => {
            showFeedback(`Saved ${tabs.length} tabs to All Tabs set!`);
            updateSavedTabsCounts();
        });
    });
}

function saveCurrentTabs(setName) {
    chrome.tabs.query({}, (tabs) => {
        const tabSet = tabs.map(tab => ({ url: tab.url, title: tab.title }));
        chrome.storage.sync.get('tabSets', (data) => {
            const tabSets = data.tabSets || {};
            tabSets[setName] = tabSet;
            chrome.storage.sync.set({ tabSets }, () => {
                // console.log(`Tab set ${setName} saved:`, tabSet);
                showFeedback(`Saved ${tabs.length} tabs to ${setName === "Collection1" ? "Collection I" : "Collection II"}!`);
                updateSavedTabsCounts();
            });
        });
    });
}

function emptyTabCollections() {
    chrome.storage.sync.remove('tabSets', () => {
        showFeedback("All tab collections have been cleared!");
        updateSavedTabsCounts();
    });

}

function switchToSavedSet(setName) {
    chrome.storage.sync.get(['tabSets', 'allTabs'], (data) => {
        console.log(`Attempting to switch to ${setName}`);

        let savedSet;
        if (setName === 'allTabs') {
            savedSet = data.allTabs;
        } else {
            const tabSets = data.tabSets || {};
            savedSet = tabSets[setName];
        }

        if (savedSet && savedSet.length > 0) {
            console.log(`Found saved set for ${setName}:`, savedSet);
            chrome.tabs.query({ currentWindow: true }, (currentTabs) => {
                // Keep the current tab and remove others
                const currentTabId = currentTabs.find(tab => tab.active).id;
                const tabIdsToRemove = currentTabs.map(tab => tab.id).filter(id => id !== currentTabId);

                chrome.tabs.remove(tabIdsToRemove, () => {
                    savedSet.forEach((tab, index) => {
                        if (tab.url) {
                            if (index === 0) {
                                // Update the current tab instead of creating a new one
                                chrome.tabs.update(currentTabId, { url: tab.url }, (updatedTab) => {
                                    if (chrome.runtime.lastError) {
                                        console.error(`Error updating tab: ${chrome.runtime.lastError.message}`);
                                        showFeedback(`Error opening ${tab.url}: ${chrome.runtime.lastError.message}`);
                                    } else {
                                        console.log(`Updated current tab: ${updatedTab.id}`);
                                    }
                                });
                            } else {
                                // Create new tabs for the rest
                                chrome.tabs.create({ url: tab.url }, (newTab) => {
                                    if (chrome.runtime.lastError) {
                                        console.error(`Error creating tab: ${chrome.runtime.lastError.message}`);
                                        showFeedback(`Error opening ${tab.url}: ${chrome.runtime.lastError.message}`);
                                    } else {
                                        console.log(`Created new tab: ${newTab.id}`);
                                    }
                                });
                            }
                        } else {
                            console.error('Invalid tab data:', tab);
                            showFeedback('Error: Invalid tab data');
                        }
                    });
                });
            });
        } else {
            console.error(`No saved tab set found for ${setName}!`);
            showFeedback(`No saved tab set found for ${setName}!`);
        }
    });
}

function openOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

function showFeedback(message) {
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.textContent = message;
    feedbackDiv.style.display = 'block';
    setTimeout(() => {
        feedbackDiv.style.display = 'none';
    }, 3000);
}

function updateSavedTabsCounts() {
    chrome.storage.sync.get(['tabSets', 'allTabs'], (data) => {
        const tabSets = data.tabSets || {};
        updateSavedTabsCount('Collection1', (tabSets.Collection1 || []).length);
        updateSavedTabsCount('Collection2', (tabSets.Collection2 || []).length);
        // updateSavedTabsCount('allTabs', (data.allTabs || []).length);
    });
}

function updateSavedTabsCount(setName, count) {
    const selector = setName === "Collection1" ? "col1Count" : "col2Count";
    const countSpan = document.getElementById(selector);
    if (countSpan) {
        countSpan.textContent = `(${count} tabs)`;
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    chrome.storage.sync.set({ 'darkMode': isDarkMode });
}

function muteAllTabsInCurrentWindow() {
    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        for (let tab of tabs) {
            if (!tab.mutedInfo.muted) {
                await chrome.tabs.update(tab.id, { muted: true });
                console.log(`Tab ${tab.id} is now muted.`);
            }
        }
        showFeedback(`Muted all tabs in the current window.`);
    });
}

function unmuteCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            let currentTab = tabs[0];
            if (currentTab.mutedInfo.muted) {
                chrome.tabs.update(currentTab.id, { muted: false }, () => {
                    console.log(`Tab ${currentTab.id} is now unmuted.`);
                    showFeedback(`Unmuted the current tab.`);
                });
            } else {
                showFeedback(`Current tab is already unmuted.`);
            }
        } else {
            console.error('No active tab found.');
        }
    });
}