# AD Lab Hospital

A responsive hospital website built with **Bootstrap 5** — no build step, no backend, no cloud database.

## Run it

Open `index.html` in a browser, or serve the folder locally:

```bash
cd "AD LAb"
python3 -m http.server 8080
# then open http://localhost:8080
```

## What's included

| Section | Description |
|---|---|
| Navigation bar | Sticky Bootstrap navbar, collapses to a hamburger menu on mobile, scroll-spy highlighting |
| Hero | Headline, call-to-action buttons, hospital stats and a "today at a glance" card |
| Services | Six responsive cards (Cardiology, Emergency, Diagnostics, Orthopaedics, Pediatrics, Pharmacy) |
| Doctors | Four doctor profile cards with speciality, qualifications and a "Book Appointment" shortcut |
| Appointment form | Validated form (name, phone, email, department, doctor, date, time, notes, consent) |
| Footer | Contact details, quick links, social icons and an emergency call button |

## Appointment data

There is **no server or cloud DB**. Submitted appointments are stored in the browser's
`localStorage` under the key `adlab.appointments` as a JSON array.

- Validation uses the native Bootstrap 5 validation classes plus a few custom checks
  (no past dates, conflict detection for the same doctor/date/time on this device).
- To inspect the saved requests, open DevTools → Application → Local Storage.
- To clear them: `localStorage.removeItem("adlab.appointments")` in the console.

## Files

```
AD LAb/
├── index.html      # markup: navbar, hero, services, doctors, form, footer
├── css/style.css   # theme, cards, hover effects, accessibility tweaks
├── js/app.js       # form validation, localStorage saving, prefill from doctor cards
└── README.md
```

## Notes

- Bootstrap and Bootstrap Icons are loaded from CDN, so an internet connection is needed
  the first time the page loads.
- This is a demo project, not a production medical service.
