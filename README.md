# FillrKit

FillrKit is a cutting-edge Google Chrome extension designed specifically to streamline the development and testing process of web applications (especially SPAs and Quasar Framework-based apps). This extension provides two main features: a smart **Multi-Scenario Autofill** and **Dev Tools** integration.

Built with a focus on speed and compatibility, FillrKit can record form states in real-time and refill them with just a single click—even for complex UI components such as Cascading Dropdowns, Custom Selects, and Toggle Buttons.

---

## 👨‍💻 Author

**Farhan** ([@farhan11anh](https://github.com/farhan11anh))
- GitHub: [https://github.com/farhan11anh](https://github.com/farhan11anh)

---

## 🚀 Key Features

- **Smart Record & Autofill**: Instantly record form states (values) and execute autofill in your subsequent testing sessions.
- **Multi-Scenario**: Save multiple different autofill datasets (e.g., Success Scenario, Reject Scenario, etc.) for the same web page.
- **Complex UI Support**: Equipped with smart adapters capable of penetrating and handling complex inputs native to UI frameworks like Quasar (cascading `q-select`, `q-radio`, `q-btn-toggle`). Includes a "patient" system (Race Condition handler) that waits for additional or cascading forms to appear before filling them.
- **Storage Management**: Direct manipulation and copying of Local Storage data within the Dev Tools tab.
- **Dynamic Theme**: Full support for both Dark Mode and Light Mode.

---

## 🛠 Tech Stack

This extension is built on a modern web stack that guarantees high performance:

- **[WXT](https://wxt.dev/)**: A Next-Gen framework for Browser Extension development with full Manifest V3 support.
- **[Vue 3](https://vuejs.org/)**: A reactive UI framework powering the Popup interface.
- **[Vite](https://vitejs.dev/)**: A lightning-fast build tool that handles ecosystem bundling.
- **TypeScript**: Ensures the codebase is type-safe and free from hidden bugs.
- **Chrome Storage API**: Persistent scenario storage safely kept in the browser's local memory.

---

## 📖 Usage Guide

### 1. Build & Installation
1. Ensure you have Node.js installed.
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Build for production (Chrome Manifest V3):
   ```bash
   npm run build
   ```
4. Open the Chrome browser and navigate to `chrome://extensions/`.
5. Enable **Developer mode** in the top right corner.
6. Click **Load unpacked** and select the build output folder, which is `.output/chrome-mv3/`.

### 2. Autofill Feature Guide
1. Open your testing application/web page (must be on the `http://` or `https://` protocol).
2. Manually fill out the web form as you normally would (including selecting dropdowns or radio buttons).
3. Click the **FillrKit** extension icon to open the interface.
4. On the Autofill tab, click the **"Rekam Field & Value Saat Ini"** (Record Current Fields & Values) button. The extension will automatically recognize the names and locations of all inputs on the screen.
5. Use the **"Skenario Aktif"** (Active Scenario) feature to separate data if you are testing a different flow. (e.g., click "Buat Baru" to create _Scenario 2_).
6. When you refresh the page or reopen an empty form page, click the **"Terapkan Autofill"** (Apply Autofill) button and watch all fields automatically fill themselves (including complex dropdown options which will open and click themselves automatically).
