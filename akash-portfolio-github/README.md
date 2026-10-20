# Akash Tamang — scroll story

A scroll-driven storytelling website: scrolling plays the story like a short film
(camera moves, cloud transitions, a plane in flight, a video on the office monitor,
subtitles). Plain HTML/CSS/JS with no build step, so it runs on GitHub Pages as-is.

## Put it online with GitHub Pages (free)

1. Sign in at https://github.com and click **New repository** (the **+** at the top right).
   - Name it `akash-story` (or use `<your-username>.github.io` to get that address as your main site).
   - Make it **Public**, then click **Create repository**.
2. On the new repo page, click **uploading an existing file**.
3. Drag in **everything inside this folder** (`index.html`, `css`, `js`, `images`, `media`,
   `README.md`, `.nojekyll`), not the folder itself. Click **Commit changes**.
   - Hidden files like `.nojekyll` may not show in Finder/Explorer. That's fine; the site works without it.
4. Go to **Settings → Pages**. Under **Build and deployment** choose
   **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**, then **Save**.
5. Wait 1–2 minutes and refresh that page. Your link appears at the top:
   `https://<your-username>.github.io/akash-story/`

To update the site later, upload changed files to the repo again; GitHub republishes automatically.
A custom domain can be added under **Settings → Pages → Custom domain**.

## Editing

- `js/story.js`: scenes, camera moves, timings, subtitles, contact links, video settings.
- `js/engine.js`: the animation engine.
- `js/video.js`: plays the clip on the Millet Amma monitor while the camera holds there.
- `images/`: illustrations and cut-out layers (`images/lq/` are small previews that load first).
- `media/`: the monitor clip (`.webm` + `.mp4`) and its poster frame.

Preview locally: run `python3 -m http.server` in this folder and open http://localhost:8000
(press **D** while scrolling to show the scroll position).

## About the video

`media/pitch-clip.*` is a 36-second excerpt from Shark Tank India's broadcast of the
Millet Amma pitch. The "Full pitch on YouTube" button links to the official video.
Because the footage belongs to the broadcaster, check with Millet Amma / the show that
you're allowed to use the clip before publishing. If not, remove the `video` block in
`js/story.js` and the monitor keeps showing the logo.
