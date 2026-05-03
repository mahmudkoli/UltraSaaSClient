import { HelpFeature } from './help.types';

/**
 * Static bilingual FAQ content. Phase A covers the 5 most-frequented surfaces
 * (POS, Sales, Branding Profiles, Outlets, Returns). Add a new feature by
 * appending to this array — the help drawer auto-renders it.
 *
 * BN strings are drafts. Have a native Bangla speaker review before public
 * launch (see help.types.ts header).
 */
export const HELP_CONTENT: HelpFeature[] = [
    // ───────────── POS ─────────────
    {
        id: 'pos',
        routePrefix: '/pos',
        icon: 'heroicons_outline:shopping-cart',
        title: { en: 'POS — Ringing up sales', bn: 'POS — বিক্রয় করা' },
        summary: {
            en: 'Search products, add to cart, take payment, finalize. The screen you live in.',
            bn: 'পণ্য খুঁজুন, কার্টে যোগ করুন, পেমেন্ট নিন, ফাইনালাইজ করুন। আপনি প্রতিদিন এই স্ক্রিনেই কাজ করবেন।',
        },
        questions: [
            {
                q: { en: 'How do I add a product to the cart?', bn: 'কার্টে কীভাবে পণ্য যোগ করব?' },
                a: {
                    en: 'Type the SKU, name, or barcode in the search box on the left. Click the matching tile — the product jumps into the cart on the right. With a barcode scanner: focus the search box, then scan; the product is added automatically.',
                    bn: 'বাঁ পাশের সার্চ বক্সে SKU, নাম বা বারকোড টাইপ করুন। মিল পেলে টাইলে ক্লিক করুন — পণ্যটি ডান পাশের কার্টে যোগ হয়ে যাবে। বারকোড স্ক্যানার ব্যবহার করলে: সার্চ বক্সে কার্সর রেখে স্ক্যান করুন; পণ্য স্বয়ংক্রিয়ভাবে কার্টে যোগ হবে।',
                },
            },
            {
                q: { en: 'Customer paid with cash AND card. How do I split it?', bn: 'গ্রাহক নগদ এবং কার্ড — দুটো দিয়ে পেমেন্ট দিল। কীভাবে ভাগ করব?' },
                a: {
                    en: 'Pick the first method (e.g. Cash), enter the amount paid in cash, click Add. Pick the second method (Card), enter the remaining amount, click Add. The Total Paid field shows the running sum. Finalize when paid amount equals the total.',
                    bn: 'প্রথমে একটি পদ্ধতি (যেমন Cash) বেছে নিন, নগদে দেওয়া টাকার পরিমাণ লিখুন, Add ক্লিক করুন। তারপর দ্বিতীয় পদ্ধতি (Card) নির্বাচন করুন, বাকি টাকার পরিমাণ লিখুন, আবার Add ক্লিক করুন। মোট পেমেন্ট মোট বিলের সমান হলে Finalize ক্লিক করুন।',
                },
            },
            {
                q: { en: 'The customer wants to pay later. What do I do?', bn: 'গ্রাহক বলছে পরে পেমেন্ট করবে — কী করব?' },
                a: {
                    en: 'Customer Credit — only available if the customer is linked (not walk-in) and has a Credit Limit set on their profile. Pick "Customer Credit" as the payment method. The unpaid amount goes onto the customer\'s account; you can collect it later via Customers → Adjust Balance. Walk-ins can\'t use credit.',
                    bn: 'Customer Credit — শুধু লিংকড গ্রাহকদের জন্য (Walk-in নয়) এবং তাদের প্রোফাইলে Credit Limit সেট থাকতে হবে। "Customer Credit" পেমেন্ট পদ্ধতি নির্বাচন করুন। বাকি টাকা গ্রাহকের অ্যাকাউন্টে যোগ হয়ে যাবে; পরে Customers → Adjust Balance থেকে আদায় করা যাবে। Walk-in গ্রাহক ক্রেডিটে কেনাকাটা করতে পারবেন না।',
                },
            },
            {
                q: { en: 'Customer stepped away mid-checkout. Can I save the cart?', bn: 'গ্রাহক বিল করার মাঝখানে চলে গেল। কার্ট কি সেভ রাখা যাবে?' },
                a: {
                    en: 'Yes — click Park (next to Finalize). Optionally label the cart ("Mr Khan — pink scarf"). The cart clears so you can ring up the next customer. When the original customer returns, click Recall (top toolbar, amber count badge) and pick their cart. Stock isn\'t reserved — only locked when you finalize.',
                    bn: 'হ্যাঁ — Finalize-এর পাশের Park বোতাম ক্লিক করুন। চাইলে কার্টের একটি লেবেল দিন ("Mr Khan — pink scarf")। কার্ট ক্লিয়ার হয়ে যাবে যাতে পরবর্তী গ্রাহকের বিল করতে পারেন। মূল গ্রাহক ফিরে এলে Recall (টপ টুলবার, কমলা ব্যাজ সহ) ক্লিক করে তাদের কার্ট বেছে নিন। স্টক রিজার্ভ হয় না — শুধুমাত্র Finalize করলেই স্টক কাটা হবে।',
                },
            },
            {
                q: { en: 'Why is there a "Receipt" dropdown next to the customer field?', bn: 'গ্রাহকের পাশের "Receipt" ড্রপডাউন কীসের জন্য?' },
                a: {
                    en: 'It picks which receipt template prints on Finalize. Pre-fills with this outlet\'s default. You only need to change it when a customer asks for a different format — most commonly "this is a B2B sale, please print A4 instead of thermal." If the dropdown isn\'t showing, your tenant hasn\'t set up Branding Profiles yet — admin can add them via Branding Profiles in the left nav.',
                    bn: 'Finalize করলে কোন রিসিট টেমপ্লেট প্রিন্ট হবে তা এই ড্রপডাউন থেকে নির্বাচন করা যায়। আউটলেটের ডিফল্ট প্রোফাইল আগে থেকেই সেট থাকে। শুধু তখনই পরিবর্তন করুন যখন গ্রাহক ভিন্ন ফরম্যাট চান — সাধারণত "এটা B2B বিক্রি, থার্মালের বদলে A4 প্রিন্ট দিন।" ড্রপডাউন না দেখালে আপনার Tenant-এ Branding Profile সেটআপ করা হয়নি — অ্যাডমিন বাঁ পাশের নেভিগেশন থেকে Branding Profiles-এ গিয়ে যোগ করতে পারবেন।',
                },
            },
            {
                q: { en: 'Loyalty redemption — how does it work?', bn: 'লয়্যালটি পয়েন্ট কীভাবে রিডিম করব?' },
                a: {
                    en: 'Link the customer first. If they have points, the cart shows their balance and a Redeem field appears. Enter how many points to apply (1 point = 1 currency unit). The amount deducts from cash due. Points earned on a sale are calculated on the net total (after redemption) — 1 point per integer currency unit.',
                    bn: 'প্রথমে গ্রাহক লিংক করুন। তাদের পয়েন্ট থাকলে কার্টে ব্যালেন্স দেখাবে এবং একটি Redeem ফিল্ড আসবে। কত পয়েন্ট ব্যবহার করবেন তা লিখুন (১ পয়েন্ট = ১ ইউনিট মুদ্রা)। এই পরিমাণ পেমেন্ট থেকে কেটে যাবে। সেলে অর্জিত পয়েন্ট নেট মোটের উপর হিসাব হয় (রিডেম বাদ দিয়ে) — প্রতি পূর্ণ মুদ্রা ইউনিটের জন্য ১ পয়েন্ট।',
                },
            },
            {
                q: { en: 'I made a mistake — can I edit a finalized sale?', bn: 'ভুল হয়েছে — Finalize করা বিল কি এডিট করা যাবে?' },
                a: {
                    en: 'No. Once finalized, a sale is immutable — money was taken, stock was decremented, an invoice number was issued. Corrections must go through Returns: open the sale, click Process Return, and pick the lines + condition (Resellable / Damaged) and refund method.',
                    bn: 'না। Finalize হলে বিল আর পরিবর্তন করা যায় না — পেমেন্ট নেওয়া হয়ে গেছে, স্টক কেটে গেছে, ইনভয়েস নম্বর জেনারেট হয়ে গেছে। সংশোধন করতে হলে Returns ব্যবহার করতে হবে: বিক্রি ওপেন করুন, Process Return ক্লিক করুন, যে লাইন এবং কন্ডিশন (Resellable / Damaged) এবং রিফান্ড পদ্ধতি বেছে নিন।',
                },
            },
        ],
    },

    // ───────────── Sales / receipts ─────────────
    {
        id: 'sales',
        routePrefix: '/sales',
        icon: 'heroicons_outline:receipt-percent',
        title: { en: 'Sales & Receipts', bn: 'বিক্রি ও রিসিট' },
        summary: {
            en: 'Look up past sales, re-print receipts, switch receipt format on the fly.',
            bn: 'পূর্বের বিক্রি দেখুন, রিসিট পুনরায় প্রিন্ট করুন, প্রিন্টের সময় ফরম্যাট পরিবর্তন করুন।',
        },
        questions: [
            {
                q: { en: 'How do I find a previous sale?', bn: 'পুরনো বিক্রি কীভাবে খুঁজে পাব?' },
                a: {
                    en: 'Two paths: 1) Sales in the left nav — full table with filters and search. 2) From POS, click Find Sale in the toolbar — quick search by invoice number / customer / phone for the current outlet. The Sales list lets you click any row to see the full detail (items, payments, totals).',
                    bn: 'দুটি উপায়: ১) বাঁ পাশের নেভিগেশনে Sales — ফিল্টার ও সার্চ সহ সম্পূর্ণ তালিকা। ২) POS থেকে টুলবারে Find Sale ক্লিক করুন — বর্তমান আউটলেটের জন্য ইনভয়েস নম্বর / গ্রাহক / ফোন দিয়ে দ্রুত সার্চ। Sales তালিকা থেকে যেকোনো রো ক্লিক করলে বিস্তারিত দেখতে পাবেন (আইটেম, পেমেন্ট, মোট)।',
                },
            },
            {
                q: { en: 'Customer wants another copy of their receipt. How?', bn: 'গ্রাহক রিসিটের আরেকটি কপি চাইছে — কীভাবে দেব?' },
                a: {
                    en: 'Sales → click the sale → Print Receipt. The same receipt that printed at finalize prints again. From POS you can also click Find Sale → row → Print without leaving POS.',
                    bn: 'Sales → বিক্রিতে ক্লিক করুন → Print Receipt। যেমন রিসিট Finalize-এ প্রিন্ট হয়েছিল, সেটাই আবার প্রিন্ট হবে। POS থেকেও Find Sale → রো → Print ক্লিক করে POS না ছেড়েই কাজ সারতে পারবেন।',
                },
            },
            {
                q: { en: 'Customer wants the same sale in A4 format instead of thermal. Can I?', bn: 'গ্রাহক থার্মালের বদলে A4 ফরম্যাটে রিসিট চাইছে — সম্ভব?' },
                a: {
                    en: 'Yes — open the sale, click the ⋮ (three dots) menu next to Print Receipt. Pick any active branding profile from the list (e.g. "B2B Invoice · A4"). The same sale prints in the chosen format. This is print-only — your records, totals, taxes, and audit trail stay intact. The sale\'s original format is also preserved for future re-prints.',
                    bn: 'হ্যাঁ — বিক্রি খুলুন, Print Receipt-এর পাশের ⋮ (তিন ডট) মেনু ক্লিক করুন। তালিকা থেকে যেকোনো অ্যাক্টিভ Branding Profile বেছে নিন (যেমন "B2B Invoice · A4")। একই বিক্রি ভিন্ন ফরম্যাটে প্রিন্ট হবে। এটি শুধু প্রিন্টের জন্য — রেকর্ড, মোট, ট্যাক্স, অডিট ট্রেইল অপরিবর্তিত থাকে। বিক্রির আসল ফরম্যাটও পরবর্তী প্রিন্টের জন্য সংরক্ষিত থাকে।',
                },
            },
            {
                q: { en: 'The Summary card shows "Receipt template: X · Y" — what does it mean?', bn: 'সামারি কার্ডে "Receipt template: X · Y" দেখাচ্ছে — এটা কী?' },
                a: {
                    en: 'X is the branding profile name (e.g. "Walk-in Receipt"); Y is the paper format (e.g. "80mm Thermal"). It tells you which template was used when the sale was finalized. Admins manage these in Branding Profiles. If you don\'t see this row, the sale was rung up with the legacy outlet/tenant branding (still works fine — just no profile assigned).',
                    bn: 'X হলো Branding Profile-এর নাম (যেমন "Walk-in Receipt"); Y হলো পেপার ফরম্যাট (যেমন "80mm Thermal")। এটি দেখায় বিক্রি Finalize করার সময় কোন টেমপ্লেট ব্যবহৃত হয়েছিল। অ্যাডমিন এগুলো Branding Profiles থেকে পরিচালনা করেন। এই রো না দেখালে বিক্রিতে পুরনো আউটলেট/Tenant ব্র্যান্ডিং ব্যবহার হয়েছিল (এটিও ঠিক আছে — শুধু কোনো প্রোফাইল অ্যাসাইন করা হয়নি)।',
                },
            },
            {
                q: { en: 'How do I void a sale?', bn: 'একটি বিক্রি বাতিল (void) কীভাবে করব?' },
                a: {
                    en: 'You don\'t void directly. Process a Return covering all items — when the entire sale is returned, the parent Sale is auto-voided. This keeps the audit trail clean: every void has a return record showing what came back, in what condition, and what refund method was used.',
                    bn: 'সরাসরি void করা যায় না। সব আইটেম কভার করে একটি Return প্রসেস করুন — সম্পূর্ণ বিক্রি ফেরত গেলে মূল Sale স্বয়ংক্রিয়ভাবে void হয়ে যাবে। এতে অডিট ট্রেইল পরিষ্কার থাকে: প্রতিটি void-এর জন্য একটি Return রেকর্ড থাকে যা দেখায় কী কী ফিরে এলো, কোন কন্ডিশনে, এবং কোন রিফান্ড পদ্ধতি ব্যবহৃত হয়েছিল।',
                },
            },
        ],
    },

    // ───────────── Branding Profiles ─────────────
    {
        id: 'branding-profiles',
        routePrefix: '/branding-profiles',
        icon: 'heroicons_outline:document-text',
        title: { en: 'Branding Profiles', bn: 'ব্র্যান্ডিং প্রোফাইল' },
        summary: {
            en: 'Multiple receipt / invoice designs per tenant — pick a default per outlet, override per sale.',
            bn: 'প্রতিটি Tenant-এর জন্য একাধিক রিসিট / ইনভয়েস ডিজাইন — আউটলেট-ভিত্তিক ডিফল্ট, বিক্রি-ভিত্তিক ওভাররাইড।',
        },
        questions: [
            {
                q: { en: 'When should I use Branding Profiles vs the tenant logo?', bn: 'কখন Branding Profile ব্যবহার করব আর কখন Tenant লোগো?' },
                a: {
                    en: 'Tenant logo / color / tax ID is enough if you only ever print one kind of receipt — say, an 80mm thermal at every outlet. Use Branding Profiles when you need MULTIPLE designs side by side: a thermal POS slip for walk-ins, an A4 invoice for B2B, possibly a 58mm slip for mobile printers. One profile per design.',
                    bn: 'যদি সবসময় শুধু একই ধরনের রিসিট প্রিন্ট হয় (যেমন প্রতিটি আউটলেটে 80mm থার্মাল), তাহলে Tenant-এর লোগো / রঙ / ট্যাক্স আইডি যথেষ্ট। যখন একসাথে একাধিক ডিজাইন প্রয়োজন — Walk-in-এর জন্য থার্মাল, B2B-এর জন্য A4, মোবাইল প্রিন্টারের জন্য 58mm — তখন Branding Profile ব্যবহার করুন। প্রতিটি ডিজাইনের জন্য একটি প্রোফাইল।',
                },
            },
            {
                q: { en: 'What paper formats are supported?', bn: 'কোন কোন পেপার ফরম্যাট সাপোর্টেড?' },
                a: {
                    en: 'Three: 80mm Thermal (standard POS roll, the default for retail / supermarkets), 58mm Thermal (smaller mobile / handheld printers), and A4 Invoice (full page, used for desktop / laser printers, B2B / wholesale, dot-matrix carbon-copy markets). The two thermal formats share one template; A4 has its own full-page invoice layout with billing block, per-line tax, payment summary.',
                    bn: 'তিনটি: 80mm Thermal (স্ট্যান্ডার্ড POS রোল, রিটেল / সুপারমার্কেটের জন্য ডিফল্ট), 58mm Thermal (ছোট মোবাইল / হ্যান্ডহেল্ড প্রিন্টার), এবং A4 Invoice (পূর্ণ পৃষ্ঠা, ডেস্কটপ / লেজার প্রিন্টার, B2B / পাইকারি, ডট-ম্যাট্রিক্স কার্বন-কপির জন্য)। দুটি থার্মাল ফরম্যাট একই টেমপ্লেট ব্যবহার করে; A4-এর নিজস্ব পূর্ণ পৃষ্ঠা ইনভয়েস লেআউট আছে — বিলিং ব্লক, প্রতি লাইনের ট্যাক্স, পেমেন্ট সামারি সহ।',
                },
            },
            {
                q: { en: 'Can I delete a profile that I no longer use?', bn: 'যে প্রোফাইল আর ব্যবহার করি না, সেটা ডিলিট করা যাবে?' },
                a: {
                    en: 'Only if no sale has ever used it. The system blocks delete when any sale references the profile — re-prints would lose their original look. Instead, switch the Active toggle off. The profile disappears from the picker (cashiers can\'t pick it on new sales, outlets stop offering it) but old receipts still re-print correctly.',
                    bn: 'কেবল তখনই — যদি কোনো বিক্রিতে কখনো এই প্রোফাইল ব্যবহার না হয়ে থাকে। কোনো বিক্রি এই প্রোফাইল ব্যবহার করলে সিস্টেম ডিলিট ব্লক করে — পুনরায় প্রিন্ট করলে আসল ডিজাইন হারিয়ে যাবে। তার বদলে Active টগল বন্ধ করুন। প্রোফাইল পিকার থেকে অদৃশ্য হবে (নতুন বিক্রিতে ক্যাশিয়ার বাছতে পারবেন না, আউটলেট অফার করা বন্ধ করবে) কিন্তু পুরনো রিসিট সঠিকভাবে প্রিন্ট হতে থাকবে।',
                },
            },
            {
                q: { en: 'I edited a profile but my old receipt still looks the same. Why?', bn: 'একটি প্রোফাইল এডিট করেছি কিন্তু পুরনো রিসিট আগের মতোই দেখাচ্ছে — কেন?' },
                a: {
                    en: 'On purpose. Each sale snapshots the profile id (and through it the look) at the moment of finalize. Editing the profile after a sale doesn\'t back-port to old sales — that would change historical receipts, which is bad for accounting and audit. Edit takes effect on every NEW sale finalized after the edit.',
                    bn: 'ইচ্ছাকৃতভাবেই। প্রতিটি বিক্রি Finalize-এর সময় প্রোফাইল আইডি (এবং সেই অনুযায়ী ডিজাইন) সংরক্ষণ করে। বিক্রির পরে প্রোফাইল এডিট করলে পুরনো বিক্রির রিসিট পরিবর্তন হবে না — এটি ঐতিহাসিক রিসিট পরিবর্তন করত, যা হিসাব ও অডিটের জন্য ক্ষতিকর। এডিটের পরে নতুনভাবে Finalize হওয়া বিক্রিতেই কেবল প্রভাব পড়বে।',
                },
            },
            {
                q: { en: 'How do I assign a profile to an outlet?', bn: 'একটি প্রোফাইল আউটলেটে কীভাবে অ্যাসাইন করব?' },
                a: {
                    en: 'Outlets → click the outlet → Default branding profile dropdown. Pick which profile that outlet\'s receipts use by default. Cashiers can still override per sale via the Receipt picker at POS, but most sales just inherit the outlet default.',
                    bn: 'Outlets → আউটলেটে ক্লিক → Default branding profile ড্রপডাউন। সেই আউটলেটের রিসিটে ডিফল্ট হিসেবে কোন প্রোফাইল ব্যবহার হবে তা বেছে নিন। ক্যাশিয়ার চাইলে POS-এ Receipt পিকার থেকে প্রতিটি বিক্রিতে ওভাররাইড করতে পারবেন, কিন্তু বেশিরভাগ বিক্রি আউটলেটের ডিফল্ট অনুসরণ করবে।',
                },
            },
            {
                q: { en: 'What\'s the logo size limit?', bn: 'লোগোর সাইজ লিমিট কত?' },
                a: {
                    en: '1 MB max. PNG, JPEG, WebP, GIF, or SVG. The image embeds inline in printed receipts (so the popup is self-contained for offline / email previews) — keep it small. Square images work best.',
                    bn: 'সর্বোচ্চ ১ MB। PNG, JPEG, WebP, GIF, বা SVG। ছবিটি প্রিন্ট রিসিটে ইনলাইনভাবে এমবেড হয় (যাতে অফলাইন / ইমেল প্রিভিউয়ের জন্য পপআপ সেলফ-কনটেইনড থাকে) — তাই ছোট রাখুন। বর্গাকার ছবি সেরা হয়।',
                },
            },
        ],
    },

    // ───────────── Outlets ─────────────
    {
        id: 'outlets',
        routePrefix: '/outlet',
        icon: 'heroicons_outline:building-storefront',
        title: { en: 'Outlets', bn: 'আউটলেট' },
        summary: {
            en: 'Each outlet is a physical location: store, warehouse, or HQ. Tenant plan caps how many you can have.',
            bn: 'প্রতিটি আউটলেট একটি ভৌত স্থান: দোকান, গুদাম, বা প্রধান কার্যালয়। Tenant-এর প্ল্যান অনুযায়ী আপনার মোট আউটলেট সংখ্যা সীমাবদ্ধ।',
        },
        questions: [
            {
                q: { en: 'What\'s the difference between Suspend, Archive, and Delete?', bn: 'Suspend, Archive, এবং Delete — পার্থক্য কী?' },
                a: {
                    en: 'Suspend = temporarily off, still counts toward your plan\'s outlet quota. Archive = permanently shut down, releases the quota slot, no longer appears in pickers (POS, sales, etc.). Delete is not offered for outlets that have any sales / inventory history — Archive is the soft retire path.',
                    bn: 'Suspend = সাময়িকভাবে বন্ধ, প্ল্যানের আউটলেট কোটায় গণনা হয়। Archive = স্থায়ীভাবে বন্ধ, কোটার স্লট ছাড়ে, পিকারে (POS, বিক্রি ইত্যাদি) আর দেখা যায় না। যেসব আউটলেটের কোনো বিক্রি / ইনভেন্টরি ইতিহাস আছে তাদের Delete অফার করা হয় না — Archive-ই সফট রিটায়ার পথ।',
                },
            },
            {
                q: { en: 'Why does the outlet code stay uppercase and locked after creation?', bn: 'আউটলেট কোড তৈরির পর কেন বড় হাতের অক্ষরে লক হয়ে যায়?' },
                a: {
                    en: 'The code prefixes every invoice number from that outlet (e.g. MAIN-000042). Letting it change later would corrupt the audit trail — two different sales could appear to share an invoice format. Pick the code carefully at create time.',
                    bn: 'এই কোড সেই আউটলেটের প্রতিটি ইনভয়েস নম্বরের সামনে যুক্ত হয় (যেমন MAIN-000042)। পরে পরিবর্তন করতে দিলে অডিট ট্রেইল নষ্ট হবে — দুটি ভিন্ন বিক্রি একই ইনভয়েস ফরম্যাট শেয়ার করতে পারে। তাই তৈরির সময়ই সাবধানে কোড বেছে নিন।',
                },
            },
            {
                q: { en: 'Can a cashier see only their assigned outlets?', bn: 'একজন ক্যাশিয়ার কি শুধু তাদের নির্ধারিত আউটলেটগুলো দেখবে?' },
                a: {
                    en: 'Yes — open the user from Users, click the emerald store icon (Manage Outlets), pick which outlets they can access. Empty assignment = all outlets (the default). One outlet assigned = they can only ring up sales / view inventory at that outlet. Admin / Manager always see everything.',
                    bn: 'হ্যাঁ — Users থেকে ইউজার খুলুন, পান্না সবুজ store আইকনে ক্লিক করুন (Manage Outlets), কোন কোন আউটলেটে অ্যাক্সেস পাবেন তা বেছে নিন। কোনো অ্যাসাইনমেন্ট না থাকলে = সব আউটলেট (ডিফল্ট)। একটি আউটলেট অ্যাসাইন করলে = শুধু সেই আউটলেটে বিক্রি / ইনভেন্টরি দেখতে পাবেন। Admin / Manager সবসময় সব কিছু দেখেন।',
                },
            },
            {
                q: { en: 'How does logo / brand color fall back?', bn: 'লোগো / ব্র্যান্ড কালার কীভাবে ফলব্যাক করে?' },
                a: {
                    en: 'Resolution at print time: the sale\'s branding profile (if any) wins first. Then the outlet\'s default branding profile. Then the outlet\'s own logo / color / tax ID. Then the tenant\'s logo / color / tax ID. So a chain can upload once at the tenant level and every outlet inherits — unless you explicitly override at outlet or profile level.',
                    bn: 'প্রিন্টের সময় রেজোলিউশন: বিক্রির Branding Profile (যদি থাকে) প্রথম। তারপর আউটলেটের ডিফল্ট Branding Profile। তারপর আউটলেটের নিজস্ব লোগো / রঙ / ট্যাক্স আইডি। তারপর Tenant-এর লোগো / রঙ / ট্যাক্স আইডি। তাই একটি চেইন Tenant লেভেলে একবার আপলোড করলেই সব আউটলেট পেয়ে যায় — যদি না আউটলেট বা প্রোফাইল লেভেলে আলাদা সেট করেন।',
                },
            },
        ],
    },

    // ───────────── Returns ─────────────
    {
        id: 'returns',
        routePrefix: '/returns',
        icon: 'heroicons_outline:arrow-uturn-left',
        title: { en: 'Returns & Refunds', bn: 'ফেরত ও রিফান্ড' },
        summary: {
            en: 'Process a return on a finalized sale. System restores stock, voids warranties, records the refund.',
            bn: 'Finalize হওয়া বিক্রিতে রিটার্ন প্রসেস করুন। সিস্টেম স্টক ফেরত আনে, ওয়ারেন্টি বাতিল করে, রিফান্ড রেকর্ড করে।',
        },
        questions: [
            {
                q: { en: 'How do I process a return?', bn: 'একটি রিটার্ন কীভাবে প্রসেস করব?' },
                a: {
                    en: 'Open the original sale (Sales → click the row), click Process Return. Pick which lines are coming back, the quantity, and the condition: Resellable (item is still good — stock restored, can be sold again) or Damaged (item is broken — stock NOT restored, written off). Pick the refund method (Cash / Card / Mobile / Bank / Voucher) and amount. Click Complete.',
                    bn: 'মূল বিক্রি খুলুন (Sales → রো ক্লিক), Process Return ক্লিক করুন। কোন লাইন ফেরত আসছে, পরিমাণ, এবং কন্ডিশন বেছে নিন: Resellable (পণ্যটি ভালো আছে — স্টকে ফেরত যাবে, আবার বিক্রি করা যাবে) বা Damaged (পণ্য নষ্ট — স্টকে ফেরত যাবে না, write off হবে)। রিফান্ড পদ্ধতি (Cash / Card / Mobile / Bank / Voucher) ও পরিমাণ নির্বাচন করে Complete ক্লিক করুন।',
                },
            },
            {
                q: { en: 'What\'s the difference between Resellable and Damaged?', bn: 'Resellable এবং Damaged-এর মধ্যে পার্থক্য কী?' },
                a: {
                    en: 'Resellable: stock count goes back up by the returned quantity, the serial flips to "Returned" and can be sold again, a positive StockMovement(Return) is recorded. Damaged: stock count does NOT change (the item is gone for good), the serial flips through Returned then WrittenOff, a negative StockMovement(Damage) is recorded. Pick carefully — this drives whether the item shows up in inventory tomorrow.',
                    bn: 'Resellable: স্টক কাউন্ট রিটার্ন পরিমাণ অনুযায়ী বাড়ে, সিরিয়াল "Returned"-এ যায় এবং আবার বিক্রি হতে পারে, একটি পজিটিভ StockMovement(Return) রেকর্ড হয়। Damaged: স্টক কাউন্ট পরিবর্তন হয় না (পণ্যটি চিরতরে চলে গেছে), সিরিয়াল Returned থেকে WrittenOff-এ যায়, একটি নেগেটিভ StockMovement(Damage) রেকর্ড হয়। সাবধানে বেছে নিন — এটি নির্ধারণ করে আগামীকাল ইনভেন্টরিতে আইটেম দেখা যাবে কি না।',
                },
            },
            {
                q: { en: 'The full sale was returned — what happens to the original sale?', bn: 'পুরো বিক্রি ফেরত এসেছে — মূল বিক্রির কী হয়?' },
                a: {
                    en: 'It auto-voids. Once every line of the sale has been returned across one or more return records, the parent Sale flips to Voided. The invoice number is preserved (audit trail), but the sale stops counting in reports / shift totals. The return record(s) are linked to the void so you can trace what came back, when, and why.',
                    bn: 'এটি স্বয়ংক্রিয়ভাবে void হয়ে যায়। বিক্রির প্রতিটি লাইন এক বা একাধিক রিটার্ন রেকর্ডের মাধ্যমে ফেরত গেলে, মূল Sale Voided-এ পরিবর্তিত হয়। ইনভয়েস নম্বর সংরক্ষিত থাকে (অডিট ট্রেইল), কিন্তু বিক্রি রিপোর্ট / শিফট মোটে গণ্য হয় না। রিটার্ন রেকর্ড void-এর সাথে লিংকড থাকে, যাতে কী ফিরে এসেছে, কখন, কেন তা ট্রেস করা যায়।',
                },
            },
            {
                q: { en: 'Can I return a sale partially — e.g. only one line?', bn: 'বিক্রির শুধু একটি লাইন কি ফেরত আনা যাবে?' },
                a: {
                    en: 'Yes. Pick only the lines you want to return, the rest stay live. You can run multiple returns against the same sale over time (one today, another a week later) until the cumulative returned quantity equals the original. The system blocks over-return automatically.',
                    bn: 'হ্যাঁ। শুধু যে লাইনগুলো ফেরত আনতে চান বেছে নিন, বাকিগুলো সচল থাকবে। একই বিক্রিতে সময়ের ব্যবধানে একাধিক রিটার্ন চালানো যায় (আজ একটি, এক সপ্তাহ পরে আরেকটি) যতক্ষণ না মোট ফেরত পরিমাণ মূলের সমান হয়। সিস্টেম over-return আপনাআপনি ব্লক করে।',
                },
            },
            {
                q: { en: 'What happens to the warranty if I return an electronics item?', bn: 'ইলেকট্রনিক্স আইটেম ফেরত আনলে ওয়ারেন্টির কী হয়?' },
                a: {
                    en: 'Auto-voided. If the original sale created a warranty (electronics with WarrantyMonths > 0), the warranty flips to Void on return — the customer no longer has warranty coverage on that serial. If it\'s a Resellable return and the item is later sold again, a new warranty is created on the new sale.',
                    bn: 'স্বয়ংক্রিয়ভাবে void হয়। মূল বিক্রিতে যদি একটি ওয়ারেন্টি তৈরি হয়ে থাকে (WarrantyMonths > 0 সহ ইলেকট্রনিক্স), রিটার্নে ওয়ারেন্টি Void-এ যায় — সেই সিরিয়ালে গ্রাহকের ওয়ারেন্টি কভারেজ আর থাকে না। যদি Resellable রিটার্ন হয় এবং আইটেম আবার বিক্রি হয়, নতুন বিক্রিতে নতুন ওয়ারেন্টি তৈরি হবে।',
                },
            },
        ],
    },
];
