export interface GlossaryEntry {
    term: string          // canonical name displayed in the popup
    aliases?: string[]    // additional strings to highlight (case-insensitive)
    definitionEn: string  // clear, beginner-friendly English definition
    analogyAr: string     // relatable Egyptian Arabic analogy
    category: 'network' | 'crypto' | 'web' | 'os' | 'pentest'
}

export const GLOSSARY: GlossaryEntry[] = [
    // ── Network ───────────────────────────────────────────────────
    {
        term: 'Load Balancer',
        aliases: ['load balancer', 'load-balancer'],
        definitionEn:
            'A device or service that distributes incoming network traffic across multiple servers so no single server gets overwhelmed. It also hides the real backend server IPs from the public.',
        analogyAr: 'زي موظف الاستقبال في مستشفى كبيرة.. بيوزع الناس على الدكاترة عشان محدش يقعد يموت في الطابور 😅',
        category: 'network',
    },
    {
        term: 'CDN',
        aliases: ['cdn', 'cloudflare', 'content delivery network'],
        definitionEn:
            'Content Delivery Network — a global network of edge servers that cache and serve content close to the user. It hides the origin server\'s real IP and absorbs attacks like DDoS.',
        analogyAr: 'زي فروع ماكدونالدز.. الأكل اتعمل في مكان واحد بس في كل حتة فرع يسلمك الطلب بسرعة 🍟',
        category: 'network',
    },
    {
        term: 'TTL',
        aliases: ['ttl', 'time to live'],
        definitionEn:
            'Time To Live — a counter in each network packet. Every router that forwards the packet decrements the TTL by 1. When it hits 0, the packet is discarded. It prevents packets from looping forever. It also hints at the OS: Linux starts at 64, Windows at 128.',
        analogyAr: 'زي صلاحية الأكل.. كل ما الباكيت بيعدي راوتر بيتقلّل. لو وصل للصفر بيتحذف. ومن الرقم تعرف نظام التشغيل 🥫',
        category: 'network',
    },
    {
        term: 'DNS',
        aliases: ['dns', 'domain name system'],
        definitionEn:
            'Domain Name System — the internet\'s phone book. It translates human-readable domain names (evilcorp.com) into IP addresses (203.0.113.42) that computers use to connect.',
        analogyAr: 'زي جهات الاتصال في تليفونك.. إنت بتحفظ اسم "ماما" وهو بيمسك رقمها الحقيقي 📞',
        category: 'network',
    },
    {
        term: 'MX Record',
        aliases: ['mx record', 'mail exchanger', 'mx'],
        definitionEn:
            'A DNS record that specifies which mail server handles email for a domain. If you find the MX record, you know where emails go — useful for phishing recon.',
        analogyAr: 'ده عنوان البريد.. بيقولك رسائل الدومين ده بتيجي فين 📬',
        category: 'network',
    },
    {
        term: 'SPF Record',
        aliases: ['spf record', 'spf', 'sender policy framework'],
        definitionEn:
            'Sender Policy Framework — a DNS TXT record that lists which servers are authorized to send email on behalf of a domain. Attackers study it to know which mail providers a company uses and to craft convincing phishing emails.',
        analogyAr: 'زي قائمة الناس المسموح لهم يبعتوا إيميل باسم الشركة.. لو مش عارف مزوّر يبعته 📧',
        category: 'network',
    },
    {
        term: 'DNSSEC',
        aliases: ['dnssec'],
        definitionEn:
            'DNS Security Extensions — cryptographic signatures added to DNS records to ensure they come from a legitimate source. Without it, attackers can poison DNS caches and redirect users to fake sites (DNS Spoofing).',
        analogyAr: 'زي ختم الشمع على الجواب القديم.. بيأكد إن محدش عدّل على الرسالة في الطريق 🔏',
        category: 'crypto',
    },
    {
        term: 'NAT',
        aliases: ['nat', 'network address translation'],
        definitionEn:
            'Network Address Translation — your router\'s trick of hiding all your private IPs (192.168.x.x) behind one public IP. It means outside traffic can\'t directly reach your machine without a tunnel or port-forward.',
        analogyAr: 'زي عمارة فيها 50 شقة وبس ليها رقم تليفون واحد على الباب.. تعمل كلها بـ IP واحد 🏢',
        category: 'network',
    },
    {
        term: 'Firewall',
        aliases: ['firewall', 'filtered'],
        definitionEn:
            'A system that monitors and controls incoming/outgoing network traffic based on rules. It blocks unauthorized connections. A "filtered" port in nmap means a firewall is blocking the probe.',
        analogyAr: 'زي بوابة النادي.. بيقولك "إنت مسموح لك تدخل؟" قبل ما يفتحلك 🚧',
        category: 'network',
    },
    {
        term: 'Port',
        aliases: ['port', 'ports'],
        definitionEn:
            'A virtual endpoint on a computer for a specific service. Think of it like apartment numbers in a building — the IP is the building address, the port is the specific apartment. Port 80 = HTTP, 443 = HTTPS, 22 = SSH, 3306 = MySQL.',
        analogyAr: 'زي أرقام الشقق في عمارة.. الـ IP هو العمارة والـ Port هو الشقة 🏠',
        category: 'network',
    },
    {
        term: 'SSH',
        aliases: ['ssh', 'secure shell'],
        definitionEn:
            'Secure Shell — an encrypted protocol for remotely logging into and managing a server. On port 22 by default. If you gain SSH access to a target, you have a full command shell.',
        analogyAr: 'زي التحكم عن بُعد في الكمبيوتر.. بس مشفّر ومش زي TeamViewer معاه فيروسات 😄',
        category: 'os',
    },
    // ── Web ────────────────────────────────────────────────────────
    {
        term: 'HTTP Headers',
        aliases: ['http headers', 'response headers', 'http response header'],
        definitionEn:
            'Metadata sent by a web server alongside the page content. Headers like Server, X-Powered-By, and X-Generator reveal the tech stack (OS, web server, CMS) without looking at a single line of code.',
        analogyAr: 'زي لما تفتح علبة منتج وتقرأ المكونات على الجانب.. السيرفر بيوضح كل هاجة بنفسه 🏷️',
        category: 'web',
    },
    {
        term: 'CMS',
        aliases: ['cms', 'wordpress', 'customcms', 'content management system'],
        definitionEn:
            'Content Management System — software like WordPress, Drupal, or Joomla used to manage website content. Knowing the CMS lets attackers search for known CVEs (vulnerabilities) specific to that system.',
        analogyAr: 'زي إنك عرفت نوع القفل على الباب.. دلوقتي تدور على مفتاح يفتحه 🔑',
        category: 'web',
    },
    {
        term: 'CVE',
        aliases: ['cve', 'cves', 'vulnerability', 'vulnerabilities'],
        definitionEn:
            'Common Vulnerabilities and Exposures — a public database of known security flaws with unique IDs (e.g., CVE-2021-44228). Once you know the tech stack, you search for its CVEs.',
        analogyAr: 'زي قاعدة بيانات للـ bugs المشهورة.. عرفت الـ CMS وبعدين دورت على ثغراته 📋',
        category: 'pentest',
    },
    // ── OS / System ────────────────────────────────────────────────
    {
        term: 'Privilege Escalation',
        aliases: ['privilege escalation', 'privesc', 'escalation'],
        definitionEn:
            'The process of gaining higher permissions than you currently have — usually from a regular user to root/admin. Techniques include sudo misconfigs, SUID binaries, and kernel exploits.',
        analogyAr: 'زي إنك بدأت موظف عادي وعرفت تاخد صلاحيات المدير.. بدون ما هو يعرف 😏',
        category: 'os',
    },
    {
        term: 'Root',
        aliases: ['root', 'root access', 'root-owned'],
        definitionEn:
            'The superuser on Linux/Unix systems with unrestricted access to everything. root (UID 0) can read any file, kill any process, and modify any setting. The ultimate goal in most privilege escalation attacks.',
        analogyAr: 'زي المدير العام.. عنده مفاتيح كل حاجة في الشركة 👑',
        category: 'os',
    },
    {
        term: 'SUID',
        aliases: ['suid'],
        definitionEn:
            'Set User ID — a Linux file permission that runs the executable as its owner (often root), not as the current user. Misconfigured SUID binaries are a classic privesc vector.',
        analogyAr: 'زي برنامج بيشتغل بصلاحيات المدير حتى لو اللي شغّله موظف عادي 😬',
        category: 'os',
    },
    // ── Pentest ────────────────────────────────────────────────────
    {
        term: 'OSINT',
        aliases: ['osint', 'open source intelligence'],
        definitionEn:
            'Open Source Intelligence — gathering information from publicly available sources (websites, social media, DNS records, WHOIS) without touching the target directly. It\'s 100% legal and often the most valuable phase of recon.',
        analogyAr: 'زي إنك تجمع معلومات عن حد من بروفايله على السوشيال ميديا من غير ما تكلمه 🕵️',
        category: 'pentest',
    },
    {
        term: 'Reverse Shell',
        aliases: ['reverse shell', 'reverse shells'],
        definitionEn:
            'A type of connection where the target machine connects back to the attacker\'s machine, bypassing firewalls. Instead of you connecting to them, they call you — and you answer with a command prompt.',
        analogyAr: 'بدل ما إنت تطق على بابهم (وتتمنع الـ firewall).. بتخليهم هم يتصلوا فيك 📞',
        category: 'pentest',
    },
    {
        term: 'DDoS',
        aliases: ['ddos', 'dos'],
        definitionEn:
            'Distributed Denial of Service — flooding a target with so much traffic from many sources that it becomes unavailable to legitimate users. CDNs like Cloudflare absorb much of this traffic.',
        analogyAr: 'زي لما ألف واحد يحاول يدخل مطعم صغير في نفس الوقت.. الزبائن الحقيقيين ملاقوش مكان 🚫',
        category: 'pentest',
    },
    {
        term: 'Google Dork',
        aliases: ['google dork', 'dork', 'dorking', 'dorks'],
        definitionEn:
            'Using advanced Google search operators (site:, inurl:, filetype:, intitle:) to find specific information that standard searches miss — like exposed admin panels, config files, or database dumps.',
        analogyAr: 'بحث جوجل بـ superpower.. بتلاقي حاجات مخبية من غير ما تدخل أي موقع 🔍',
        category: 'pentest',
    },
]

// ── Lookup helper ──────────────────────────────────────────────
export const GLOSSARY_MAP: Record<string, GlossaryEntry> = {}

for (const entry of GLOSSARY) {
    GLOSSARY_MAP[entry.term.toLowerCase()] = entry
    for (const alias of entry.aliases ?? []) {
        GLOSSARY_MAP[alias.toLowerCase()] = entry
    }
}
