# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimal blog about the Lore game, covering its history, trivia, and revelations. Built with vanilla HTML/CSS/JS and deployed via GitHub Pages.

## Architecture

- **Frontend**: Vanilla HTML/CSS/JS with Tailwind CSS via CDN
- **Posts**: Simple text files in `posts/` directory
- **Metadata**: `posts.json` contains post metadata (title, date, filename, ID)
- **Hosting**: GitHub Pages (static site)
- **Design**: Ultra-minimal, inspired by antirez.com aesthetic

## File Structure

```
├── index.html          # Main blog page
├── posts.json          # Post metadata
├── posts/              # Individual post content files
│   ├── 001-lore-origins.txt
│   └── 002-easter-eggs.txt
└── js/
    └── blog.js         # Post loading and view tracking logic
```

## Development Commands

Since this is a static site, no build process is required. Simply:
- Open `index.html` in a browser for local testing
- Use a local server for CORS-free testing: `python -m http.server 8000`

## Adding New Posts

1. Create a new `.txt` file in the `posts/` directory
2. Add an entry to `posts.json` with metadata:
   ```json
   {
     "id": "003",
     "title": "Your Post Title",
     "date": "2025-01-20",
     "filename": "003-your-post.txt"
   }
   ```

## Features

- **View Tracking**: Uses localStorage to track post views per browser
- **Responsive Design**: Mobile-friendly with Tailwind CSS
- **Minimal Aesthetic**: Black text on white, monospace font
- **Click-to-expand**: Posts are collapsed by default, expand on title click

## GitHub Pages Deployment

- Enable Pages in repository settings
- Use main branch as source
- Site will be available at `https://yourusername.github.io/blog-vladi`