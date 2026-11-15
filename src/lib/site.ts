// Edit the details below. They appear on the website (How it works, footer, etc.).
export const siteConfig = {
  name: "CvSUFound",
  tagline: "Lost & Found for the CvSU community",
  claimDesk: {
    office: "CSG OFFICE",
    location: "OSAS BUILDING",
    hours: "11:00AM - 01:00PM",
    contact: "cvsunaiccsg@cvsu.edu.ph",
  },
  // Optional: only allow this email domain on the signup form, e.g. "cvsu.edu.ph".
  // Set it in .env.local as NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN.
  allowedEmailDomain: process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? "",
};
