# Vue 3 Vite Component Tagger

A Vite plugin that automatically adds `data-soeasy-id` and `data-soeasy-name` attributes to your Vue 3 components. This is useful for identifying components in the DOM, for example for testing or analytics.

## Installation

```bash
npm install vue3-vite-component-tagger
# or
yarn add vue3-vite-component-tagger
# or
pnpm add vue3-vite-component-tagger
```

## Usage

Add the plugin to your `vite.config.ts` file:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import componentTagger from "vue3-vite-component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), componentTagger()],
});
```

The plugin will automatically add `data-soeasy-id` and `data-soeasy-name` to all your Vue components in development mode.

### Example

Given a Vue component:

```vue
<template>
  <div>
    <header>
      <h1>Welcome</h1>
    </header>
    <button @click="handleClick">Click me</button>
  </div>
</template>
```

The plugin will transform it to:

```vue
<template>
  <div data-soeasy-id="src/App.vue:2:3" data-soeasy-name="div">
    <header data-soeasy-id="src/App.vue:3:5" data-soeasy-name="header">
      <h1 data-soeasy-id="src/App.vue:4:7" data-soeasy-name="h1">Welcome</h1>
    </header>
    <button data-soeasy-id="src/App.vue:6:5" data-soeasy-name="button" @click="handleClick">Click me</button>
  </div>
</template>
```

The `data-soeasy-id` will be a unique identifier for each component instance, in the format `path/to/file.vue:line:column`.

The `data-soeasy-name` will be the tag name of the element.

## Features

- Automatically tags all Vue template elements in `.vue` files
- Adds unique `data-soeasy-id` based on file path and location
- Adds `data-soeasy-name` with the element's tag name
- Only runs in development mode (`serve`)
- Skips elements that already have `data-soeasy-id`
- Ignores `node_modules` files