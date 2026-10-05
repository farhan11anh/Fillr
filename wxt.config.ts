import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'FillrKit',
    description: 'A mode switcher extension for Autofill and Dev Tools',
    permissions: ['storage', 'activeTab', 'scripting', 'webNavigation', 'tabs'],
    commands: {
      "fill-form": {
        "suggested_key": {
          "default": "Ctrl+Shift+F",
          "mac": "Command+Shift+F"
        },
        "description": "Fill the form on the current page"
      }
    }
  },
});
