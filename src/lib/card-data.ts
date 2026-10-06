/**
 * All personal content for the card lives here.
 * Change text/links in this file only — components read from it.
 * NOTE: the student ID is intentionally NOT included anywhere.
 */
export const CARD = {
  name: "Rafid Tanim",
  university: "BRAC University",
  department: "CSE Department",
  batch: "Batch '28",
  footerExtra: "BRACU",
  watermark: "'28",
  stubText: "Student",
  backStubText: "Say hi",
  serial: "No. BRACU·CSE·28",
  /** Big faded number in the background of the back side (jersey number). */
  backNumber: "10",
  /** Front typewriter line — cycles through these one at a time. */
  roles: [
    "CSE Student",
    "Data Science",
    "Web Development",
    "Football Analytics",
    "Business Analytics",
    "Online Business",
    "Clothing",
    "Sports",
    "YouTube Creator",
    "Voiceover Artist",
  ],
  /** Chips on the back side (kept short so they fit on phones). */
  chips: ["Student", "Data Science", "Web Development"],
  links: {
    instagram: "https://www.instagram.com/rafid__tanim/",
    facebook: "https://www.facebook.com/rafid.tanim/",
    github: "https://github.com/RafTan10",
  },
  email: "rafidtanim10@gmail.com",
} as const

/** Hue ranges (degrees) the Shuffle button picks from: orange, blue, purple. */
export const HUE_RANGES: ReadonlyArray<readonly [number, number]> = [
  [8, 44],
  [190, 230],
  [260, 300],
]
