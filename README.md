# Infinite Accounting Services website

The website for **Infinite Accounting Services Inc**, a bookkeeping and tax firm in Orland Park, IL. It is built on the Local Cascade client website template.

`public/` is the whole website: plain HTML, CSS and a little JavaScript, with no build step and no npm. Vercel serves it exactly as it is (`vercel.json`). Open this repo in Claude Code and say what you want changed. `CLAUDE.md` explains how every change is made, checked and shipped, and `BRIEF.md` is the standard every page is held to.

## What is in this repo

| File or folder | What it is |
|---|---|
| `public/` | The website. Every page is a folder with an `index.html`. |
| `public/assets/site.css` | The design system: colours, type, spacing and every component. |
| `public/assets/site.js` | Menus, smooth "Contact us" scrolling, the built-in form and chat, scroll movement. |
| `site.json` | The business details every page uses. |
| `VERIFY.md` | What the client still needs to send or confirm, written so it can be emailed as is. |
| `IMAGE-PROMPTS.md` | The 31 Higgsfield photos, where each one is used, and how to add or regenerate one. |
| `tools/check.mjs` | The automatic checks. Run `node tools/check.mjs` before every ship. |
| `tools/golive-check.sh` | The domain check at go-live. |

## The pages (25, plus the 404 page)

- **Main pages:** home (the bookkeeping page, below), about Danielle, what to expect, reviews, FAQ, business information and contact. There is no pricing page and no prices anywhere, at the client's request (fees are quoted after a free consultation).
- **Services:** the services overview and tax preparation. Bookkeeping lives on the home page.
- **Service areas:** the overview and 8 town pages (Orland Park, Tinley Park, Palos Heights, Palos Hills, Frankfort, Crestwood, Worth and Orland Hills).
- **Blog:** the blog index and 4 posts.
- **Legal:** privacy policy and terms of use.

**The home page is the bookkeeping page.** It promotes bookkeeping cleanup and ongoing monthly accounting to healthcare and mental health practices across the United States, particularly practices earning $1 million or more a year (the operator's brief, 2026-11-07). In order: Danielle's portrait in the hero with Call and Book a call, a proof row, the problems practices call about, the cleanup offer, a numbered list of what monthly accounting includes, the practice types it is built for, Danielle with 2 Google reviews, how working together begins, the booking calendar, tax preparation as the second service, a nationwide answer with the local towns, FAQs and the form. It makes no HIPAA claims and asks visitors never to send patient information. It also embeds the client's Calendly calendar (section `#book`, linked from under the hero buttons), an exception to the brief's no-booking rule approved on 2026-11-07 and recorded in `site.json` `booking_exception`. Like the form, the calendar loads only when a visitor scrolls near it or heads for it. The old bookkeeping address, `/services/bookkeeping/`, redirects permanently to the home page (`vercel.json` `redirects`), and every link on the site that went there now goes to `/`.

Every page has its own title, description and canonical. Each also has Open Graph tags, the business structured data, a contact form, a text link, and a closing call to action. Pages with FAQs carry FAQ structured data.

## Opening animation

Every time the home page opens (first visit, reload or coming back to it), and on the first page of a visit when someone lands elsewhere, a navy curtain with the logo eases in and lifts away (about 1.4 seconds), then the header and hero text settle into place. Between pages there is a soft cross-fade where the browser supports it. Visitors who ask their device for reduced motion, and browsers without scripts, see none of it. The rules are at the end of `public/assets/site.css` (search for "opening animation"); the curtain markup is the first thing inside `<body>` on every page.

## Speed and SEO scores

Tested with Lighthouse (the engine behind PageSpeed Insights) on every page, phone and desktop settings. Run PageSpeed Insights on the client's own domain after go-live, not on a `*.vercel.app` address: those addresses are deliberately marked noindex, which lowers the SEO score there. `vercel.json` sets long browser caching for `/assets/` (the stylesheet and script are versioned by content, so changes still show at once) and for `/images/`, plus security headers (HSTS, Content-Security-Policy, Permissions-Policy, X-Frame-Options, nosniff, Referrer-Policy).

## Before go-live (agency)

1. **The CRM pieces** (`site.json` `integrations`). All three are set and used exactly as given.
   - **Form embed.** The website form (LeadConnector) is the contact form on every page. Its code sits in a `<template>` exactly as given, and `site.js` switches it on when it comes near the screen, or straight away when someone presses Contact us. On the contact page a short "Loading the form" note holds its place for that moment.
   - **Chat widget.** Once per page, in the footer, also in a `<template>` exactly as given. `site.js` switches it on at the visitor's first scroll, tap, key press or mouse move, or 10 seconds after the page loads. On the contact page, where the form is in view at once, its placeholder also has an "Open the form" button. Loading the CRM pieces this way keeps PageSpeed scores high and sets no third-party cookies before a visitor does anything. On a phone the chat button sits in the bottom right corner, level with the call and contact buttons; `site.js` lets taps pass through the empty part of its greeting bubble so it never blocks the Contact us button, and the widget hides while the phone menu is open.
   - **Review link.** Every "Leave us a review" button goes to https://review.strain-systems.com/infinite-accounting.
   - **To change in the CRM (not in this repo):** the chat widget colour (it is dark red; the site's blue is `#1D5FA8`), the form's black "Send text" button (the site's green is `#1E8449`), a text message consent line on the website form like the one the chat already has, and the form's sample phone number (808) to (708).
2. **Vercel.** Import this repo as a new Vercel project. Then fill in `vercel_project` and `preview_url` in `site.json`.
3. **The client's answers** in `VERIFY.md`. Every [VERIFY] on the site is listed by `node tools/check.mjs --missing`.
4. **Reviews.** The Google reviews in `site.json` `reviews` were copied word for word from the client's Google Business Profile on 2026-10-17 (7 reviews, all 5 stars; 5 with written text are shown). Refresh them before go-live and whenever new ones arrive, then rebuild.
5. **Photos.** 23 of the Higgsfield photos are on the site, listed with their places in `IMAGE-PROMPTS.md`. The client still has to approve them (`VERIFY.md`).
6. **Security.** The onboarding form contained a domain login in plain text. It is not stored anywhere in this repo. The client should change that password.

`site.json` `domain` is already set to `www.infiniteaccountingservices.com`, so every canonical, Open Graph and sitemap address uses it. Preview deployments on `*.vercel.app` are kept out of Google by the noindex header in `vercel.json`.
