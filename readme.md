# TABS COLLECTOR
<p>
 <img src="./images/icon-128x128.png" alt="TabS Collector Icon  "/>
</p>

## Overview

This Chrome extension helps manage and organize your browsing experience by categorizing tabs into various groups based on their content, allowing you to store and load tabs from collections, and providing a quick solution to mute all tabs or unmute the current active tab when needed.

### Features

- **Categorize Tabs:** Automatically categorizes open tabs into predefined categories like Social Media, News, E-Commerce, and more using a custom algorithm.
- **Store & Load Tabs:** You can store and load tabs from two different collections, making it easy to save sets of tabs and revisit them later.
- **Mute/Unmute Tabs:** Mute all tabs in the current window with one click or unmute the currently active tab.

### Categories
The extension automatically categorizes tabs into the following categories:
- Social Media
- News
- E-Commerce/Shopping
- Entertainment (Videos, Streaming, Music)
- Forums/Discussion Boards
- Programming/Development
- Productivity/Tools
- Articles/Blogs
- Search Result Pages
- Uncategorized

### Technologies Used

- **HTML:** Provides the structure of the extension's popup and options pages.
- **CSS:** Used for styling the extension UI components.
- **JavaScript:** Implements the core logic for categorizing tabs, storing/loading collections, and muting/unmuting tabs.
- **Chrome Extensions Manifest v3:** Defines the permissions, background scripts, and behavior of the extension.

### Getting Started

#### Installation

1. Clone the repository:
   ```
   git clone https://github.com/pelumi-guy/Tabs-Collector.git
   ```

2. Navigate to the project directory:
    ```
    cd chrome-tab-categorizer
    ```

3. Load the extension in Chrome:
- Open Chrome and navigate to `chrome://extensions/`.
- Enable **Developer mode** by toggling the switch in the top right corner.
- Click **Load unpacked** and select the project directory.
- The extension will now appear in your Chrome extensions bar. You can pin it for quick access.

### Usage

#### Categorizing Tabs:

- Click on the extension icon in the toolbar.
- The open tabs in the current window will automatically be sorted into categories like Social Media, News, or E-Commerce.

#### Storing and Loading Tabs:

- Use the **Save Current Tabs To Collection** button to save the current set of tabs to one of the two collections.
- Use the **Save Current Tabs To Collection** button to restore a saved collection of tabs.

#### Mute/Unmute Tabs:

- Click the **Mute All Tabs** button to mute all tabs in the current window.
- Click the **Unmute Current Tab** button to unmute the currently active tab.

### Development

To make changes to the extension, modify the relevant HTML, CSS, and JavaScript files. After making changes, reload the extension in Chrome:

1. Go to `chrome://extensions/`.
2. Click the **Reload** button under the extension.

### Future Improvements

- Improve tab categorization with machine learning or additional heuristics.
- Allow storing/loading of more than two collections of tabs.
- Add a feature to auto-categorize tabs as they are opened.
- Implement more robust error handling for loading collections.

### Contributing

If you'd like to contribute to the project, feel free to fork the repository and submit a pull request. Issues and suggestions are welcome!

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
