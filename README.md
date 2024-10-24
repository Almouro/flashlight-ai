# 🔦 flashlight-ai 🤖

This is an experiment to combine to power of AI to automatically explore an app, while [flashlight](https://github.com/bamlab/flashlight) is measuring and reporting performance issues, as demoed at [React Advanced 2024](https://alex.moureaux.me/dev/talks/react-advanced-2024-performance-testing-is-hard-can-ai-help)

This is still early stage, but feel free to try it out! 😊

## Installation

For now, you can only run this from source, clone the repo and run:

```bash
yarn install
```

## Usage

```bash
export OPENAI_API_KEY=<...>
node auditor run
```

You will be asked to give a clear exploration goal to the AI. For instance, something like:

_Login with username@gmail.com / password. Go to the search tab, search for something, then scroll the results and like an image._

When this is done, the AI writes a JSON report in `./webapp/app/components/results.json` and a video in `./webapp/public/video.mp4`.

You can open the web report with:

```bash
cd webapp
npm run dev
open http://localhost:3000
```
