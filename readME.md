# FRIENDSHELF

If this is your first time downloading this repository:

```bash
cd desktop
git clone https://github.com/agusalta/Friendshelf
cd friendshelf
npm run start-project
```

If you've previously set up the project, start it with:

```bash
npm run dev
```

# Purpose

This extension retrieves reviews for specific products chosen by the user.

1. Right-click on text.
2. Open the context menu.
3. Click "Search review".
4. The extension retrieves available reviews.

Or

1. Search in your browser.
2. Our icon appears in your browser search results.
3. Hover over the icon to retrieve available reviews.
4. Open the extension.

# Files

_background.js_
Manages the browser's context menu, handles local storage operations for storing extension-specific data, and tracks user text selection events.

_content.js_
Handles search functionalities within the browser's search engine (e.g., Google), allowing the extension to perform specific queries and process search results.

_popup.js_
Manipulates the DOM to update and interact with the extension's user interface, including updating semantic tags and providing a user-friendly interface.

_server.js_
Manages communication with external servers or APIs, handles endpoints for receiving data from other extension components (like popup.js), and processes data for storage or further operations. Also routes endpoints for product.js and deals.js.

