// Lab 05 metadata — El-Basaama: Banner Grabbing & CVEs
import type { LabMeta } from '../types'

const meta: LabMeta = {
    slug: 'lab05',
    number: '05',
    titleEn: 'El-Basaama',
    subtitleEn: 'Banner Grabbing & CVE Analysis',
    descriptionEn:
        'Grab service banners with netcat and telnet, identify exact software versions, and cross-reference them against the National Vulnerability Database (NVD) to find critical CVEs.',
    quipAr: 'السيرفر بيحكيلك عن نفسه — إنت بس محتاج تعرف تسمع. كل version هي clue 🕵️',
    difficulty: 'Advanced',
    points: 250,
    estimatedTime: '50 min',
    icon: '🏷️',
    tags: ['Banner Grabbing', 'CVE', 'netcat', 'NVD', 'Version Detection'],
    locked: false,
    isNew: true,
}

export default meta
