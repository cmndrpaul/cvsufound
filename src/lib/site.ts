// Edit the details below. They appear on the website (How it works, footer, etc.).
export const siteConfig = {
  name: "CvSUFound",
  tagline: "Lost & Found for the CvSU community",
  claimDesk: {
    office: "[OFFICE NAME]",
    location: "[BUILDING / ROOM]",
    hours: "[OFFICE HOURS]",
    contact: "[EMAIL / CONTACT NO.]",
  },
  // Optional: only allow this email domain on the signup form, e.g. "cvsu.edu.ph".
  // Set it in .env.local as NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN.
  allowedEmailDomain: process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? "",
};
