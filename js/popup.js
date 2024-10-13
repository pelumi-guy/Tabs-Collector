const categories = {
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

const categoryNames = Object.keys(categories);

document.addEventListener("DOMContentLoaded", () => {
    // GET THE SELECTORS OF THE BUTTONS
    const getAllTabsBtn = document.querySelector("button#get_all_tabs");
    // const stopVideoButton = document.querySelector("button#stop_video")

    // adding event listeners

    getAllTabsBtn.addEventListener("click", async() => {
        try {
            // Query all inactive (non-active) tabs in the current window
            let tabs = await chrome.tabs.query({
                currentWindow: true,
            });

            console.log("tabs:", tabs);

            tabs.forEach((tab) => {
                if (/^http/.test(tab.url)) {
                    chrome.tabs.sendMessage(
                        tab.id, { action: "request_head_info" },
                        function(response) {
                            if (!chrome.runtime.lastError) {
                                console.log(`tab ${tab.id} url: ${tab.url} category: ${response}`);
                                for (const category of categoryNames) {
                                    if (category === response) {
                                        categories[category].push(tab.id);
                                        break;
                                    }
                                }
                            } else {
                                categories["Uncategorized"].push(tab.id);
                                console.error(chrome.runtime.lastError, "error line 27");
                            }
                        }
                    );
                }
            });

            // Group tabs by category

            for (const category of categoryNames) {
                if (categories[category].length > 0) {
                    let groupId = await chrome.tabs.group({
                        tabIds: categories[category],
                    });

                    console.log("Group created with ID:", groupId);

                    chrome.tabGroups.update(groupId, { title: category }, (tabGroups) =>
                        console.log(`Tab Group ${groupId} renamed to ${category}`)
                    );
                }
            }

            // Extract tab IDs from the queried tabs
            // let tabIds = tabs.map((tab) => tab.id);

            // if (tabIds.length > 0) {
            //     // Group the tabs into a new group (if no groupId is provided, a new group is created)
            //     let groupId = await chrome.tabs.group({ tabIds: tabIds });

            //     chrome.tabGroups.update(
            //         groupId, { title: "Tab Group 1" },
            //         (tabGroups) =>
            //         console.log(`Tab Group ${groupId} renamed to Tab Group 1`)
            //     );

            //     console.log("Group created with ID:", groupId);
            // } else {
            //     console.log("No inactive tabs found to group.");
            // }
        } catch (error) {
            console.error("Error creating the tab group:", error);
        }
    });

    console.log("button clicked");
});

//     stopVideoButton.addEventListener("click", () => {
//         chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//             chrome.tabs.sendMessage(tabs[0].id, { action: "stopvideo" }, function(response) {
//                 if (!chrome.runtime.lastError) {
//                     console.log(response)
//                 } else {
//                     console.log(chrome.runtime.lastError, 'error line 27')
//                 }
//             })
//         })
//     })
// })