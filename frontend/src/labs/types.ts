// Shared type for all lab metadata objects.
// Every lab folder must export a default object matching this shape.
export interface LabMeta {
    slug: string           // folder name, also used for the URL: /lab/:slug
    number: string         // display label e.g. '01'
    titleEn: string        // displayed title on the card
    subtitleEn: string     // one-line topic description
    descriptionEn: string  // longer description shown on hover / tooltip
    quipAr: string         // Egyptian Arabic flavor text
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    points: number
    estimatedTime: string  // e.g. '45 min'
    icon: string           // emoji
    tags: string[]
    locked: boolean        // if true, card shows a lock icon and is not clickable
    isNew?: boolean        // shows a "New!" badge on the card
}
