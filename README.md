# fluchs - A not-so-minimal Frontend for Miniflux

I was not happy with the web frontend for miniflux or the Android app offerings. 
Some people may not like Single Page Apps, but I don't mind. And this seems like
a perfect use case.

This is a simple reader for Miniflux backends written in [Vue2.7](https://v2.vuejs.org), using 
[Bulma](https://bulma.io)/[Buefy](https://buefy.org) for a clean, responsive UI.

Works for me on a Desktop and mobile browser.

Want to use it? 

1. Compile and deploy somewhere yourself
2. Load it from [https://testha.se/fluchs/](https://testha.se/fluchs/), enter your miniflux server name and API token

(note on #2: *nothing* is sent back to testha.se, servername and api token are stored in your browser's localstorage
and your browser communicates directly with the miniflux server)

## API Token?

You will need to generate an API key (token) to use fluchs. On your regular 
miniflux interface, go to `Settings` -> `API Keys` and click `Create a new API Key`.

## Compile/Develop

```sh
git clone git@codeberg.org:hekker/fluchs.git
npm install
# npm run dev # Compile and Hot-Reload for Development
npm run build-only # strict type checks fail
# deploy, e.g.
rsync -av dist/ ...
```

## Why Vue2?

Buefy wants Vue2. But at least I used 2.7 with the new [composition API](https://vuejs.org/guide/extras/composition-api-faq.html).