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
            {
                q: { en: 'What does the small chip on each product card mean?', bn: 'প্রতিটি পণ্য কার্ডের ছোট চিপটি কী?' },
                a: {
                    en: 'It\'s the available stock at the current outlet, with the unit (e.g. "12 PCS", "2.5 KG", "0 PCS"). Color-coded: red when out of stock, amber when at or below the product\'s reorder level, gray otherwise. Hover for an explanation. The number reflects the live total — it updates after every sale, return, transfer, or stock adjustment.',
                    bn: 'বর্তমান আউটলেটে উপলব্ধ স্টক, ইউনিট সহ (যেমন "12 PCS", "2.5 KG", "0 PCS")। রঙ অনুযায়ী: লাল = স্টক শূন্য, কমলা = পণ্যের রিঅর্ডার লেভেল বা তার নিচে, ধূসর = পর্যাপ্ত স্টক। ব্যাখ্যার জন্য মাউস ধরে রাখুন। সংখ্যাটি লাইভ — প্রতিটি বিক্রি, রিটার্ন, ট্রান্সফার, বা স্টক অ্যাডজাস্টমেন্টের পরে আপডেট হয়।',
                },
            },
            {
                q: { en: 'Some products look greyed out. Why?', bn: 'কিছু পণ্য ধূসর দেখাচ্ছে — কেন?' },
                a: {
                    en: 'They\'re out of stock at the current outlet (quantity ≤ 0). They stay clickable — the system will block the sale at finalize time if stock truly is 0, but you can still ring up "we have one in the back" sales by adding to cart. Use the "In stock only" toggle above the grid to hide them entirely.',
                    bn: 'বর্তমান আউটলেটে স্টক শূন্য (পরিমাণ ≤ ০)। তবুও ক্লিকযোগ্য থাকে — যদি স্টক সত্যিই ০ হয় তবে সিস্টেম Finalize-এর সময় বিক্রি ব্লক করবে, কিন্তু "আমাদের একটি পিছনে আছে" এমন বিক্রি কার্টে যোগ করা যাবে। পুরোপুরি লুকাতে চাইলে গ্রিডের উপরে "In stock only" টগল ব্যবহার করুন।',
                },
            },
            {
                q: { en: 'Where is the "In stock only" toggle, and what does it do?', bn: '"In stock only" টগল কোথায়, এবং এটি কী করে?' },
                a: {
                    en: 'Just above the product grid, between the product count and the price column. ON (default) hides products with 0 stock at the current outlet. OFF shows everything. Useful when a back-room item arrived but hasn\'t been counted yet, or for a "we\'ll restock tomorrow" credit sale. Your preference resets per session.',
                    bn: 'পণ্য গ্রিডের ঠিক উপরে, পণ্য সংখ্যা ও মূল্যের কলামের মাঝখানে। চালু (ডিফল্ট) — বর্তমান আউটলেটে শূন্য স্টকের পণ্য লুকায়। বন্ধ — সব পণ্য দেখায়। গুদামে আসা কিন্তু এখনও গণনা হয়নি এমন আইটেম, বা "কাল রিস্টক হবে" এমন ক্রেডিট বিক্রির জন্য উপযোগী। প্রতিটি সেশনে পছন্দ রিসেট হয়।',
                },
            },
            {
                q: { en: 'I scanned a barcode into the search box and it added to the cart on its own. Is that right?', bn: 'সার্চ বক্সে বারকোড স্ক্যান করতেই পণ্যটি নিজে থেকে কার্টে যোগ হয়ে গেল — এটা ঠিক?' },
                a: {
                    en: 'Yes — when the search box has focus and you press Enter (a barcode scanner ends with Enter), if exactly one product matches the scanned code it auto-adds to the cart. Lets you blast through a basket of items without taking your hands off the scanner. If the scan matches zero products the list stays open with a "no match" note; if it matches more than one (e.g. partial SKU), you have to click the right tile.',
                    bn: 'হ্যাঁ — সার্চ বক্সে কার্সর থাকা অবস্থায় Enter চাপলে (বারকোড স্ক্যানার শেষে Enter পাঠায়), যদি ঠিক একটি পণ্য সেই কোডের সাথে মেলে — সেটি স্বয়ংক্রিয়ভাবে কার্টে যোগ হয়। স্ক্যানার থেকে হাত না সরিয়ে অনেক আইটেম দ্রুত যোগ করা যায়। কোনো মিল না পেলে তালিকা "no match" সহ খোলা থাকে; একাধিক মিললে (যেমন আংশিক SKU) সঠিক টাইল ক্লিক করতে হবে।',
                },
            },
            {
                q: { en: 'A walk-in just gave me their phone for loyalty. Can I create their profile without leaving POS?', bn: 'একজন Walk-in গ্রাহক লয়্যালটির জন্য তাদের ফোন নম্বর দিল। POS না ছেড়ে কি তাদের প্রোফাইল তৈরি করা যাবে?' },
                a: {
                    en: 'Yes — click the + (person_add) icon next to the Customer dropdown. The "Quick add customer" dialog asks for just name + phone, creates the profile, and auto-selects them on the current cart so they start earning points on this sale. For credit limit / address / customer type, use the full Customers form later — Quick Add only captures the minimum so checkout doesn\'t break flow.',
                    bn: 'হ্যাঁ — Customer ড্রপডাউনের পাশের + (person_add) আইকনে ক্লিক করুন। "Quick add customer" ডায়ালগ শুধু নাম + ফোন চায়, প্রোফাইল তৈরি করে, এবং বর্তমান কার্টে তাদের স্বয়ংক্রিয়ভাবে নির্বাচন করে — তাই এই বিক্রি থেকেই তারা পয়েন্ট অর্জন শুরু করেন। Credit limit / ঠিকানা / customer type পরে Customers-এর পূর্ণ ফর্ম থেকে দিন — Quick Add শুধু ন্যূনতম ক্যাপচার করে যাতে চেকআউট মাঝপথে আটকে না যায়।',
                },
            },
            {
                q: { en: 'Why does the cart show a Serial Number field on some product lines and not others? My shop is set to Generic.', bn: 'কার্টে কিছু পণ্য লাইনে Serial Number ফিল্ড আসছে, কিছুতে আসছে না — আমার দোকান তো Generic-এ সেট। কেন?' },
                a: {
                    en: 'Because the field is per-product, not per-tenant. The product\'s catalog row has a RequiresSerial / IsImeiRequired / RequiresBatch flag — those are what the cart line reads. So a Generic shop selling one serial-tracked phone still sees the Serial input on that line; a Pharmacy shop selling toothpaste won\'t see a batch field on that line. Finalize is blocked until required serials / batches are filled in, mirroring the server-side validation.',
                    bn: 'কারণ ফিল্ডটি পণ্য-ভিত্তিক, Tenant-ভিত্তিক নয়। পণ্যের ক্যাটালগ রো-তে RequiresSerial / IsImeiRequired / RequiresBatch ফ্ল্যাগ থাকে — কার্ট লাইন সেটাই পড়ে। তাই Generic দোকানে একটি সিরিয়াল-ট্র্যাকড ফোন বিক্রি করলেও Serial ইনপুট আসবে; Pharmacy দোকানে টুথপেস্টে কোনো batch ফিল্ড আসবে না। প্রয়োজনীয় সিরিয়াল / ব্যাচ পূরণ না হওয়া পর্যন্ত Finalize ব্লক থাকে — সার্ভার-সাইড validation-এর সাথে মেলে।',
                },
            },
            {
                q: { en: 'The price on a product card shows two numbers — one bold, one struck through. What\'s the difference?', bn: 'পণ্য কার্ডে দুটি দাম দেখাচ্ছে — একটি বোল্ড, একটি কাটা। পার্থক্য কী?' },
                a: {
                    en: 'It\'s the resolved price chain. The bold number is what the customer pays. The struck-through number(s) underneath show what was bypassed. Emerald bold = this outlet has its own price (set via the catalog Pricing dialog). Amber bold = an active offer is overriding the base (set via the product\'s Offer Price section). Gray bold (no strikethrough) = plain base selling price. POS picks the right one automatically: outlet override > active offer > base. The Cart line uses the same number you see on the card — no surprise at finalize.',
                    bn: 'এটি resolved price chain। বোল্ড সংখ্যাটি গ্রাহক যা দেবে। নিচের কাটা সংখ্যা(গুলি) দেখায় কোনটি বাইপাস হয়েছে। পান্না সবুজ বোল্ড = এই আউটলেটের নিজস্ব দাম (catalog-এর Pricing ডায়ালগ থেকে সেট)। অ্যাম্বার বোল্ড = একটি active offer base-কে ওভাররাইড করছে (পণ্যের Offer Price সেকশন থেকে সেট)। ধূসর বোল্ড (কাটা ছাড়া) = সাধারণ base selling price। POS সঠিকটি স্বয়ংক্রিয়ভাবে বাছে: outlet override > active offer > base। কার্ট লাইন কার্ডে দেখানো সংখ্যাটিই ব্যবহার করে — Finalize-এ কোনো surprise নেই।',
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
            {
                q: { en: 'A customer brought a receipt with a barcode on it. Can I scan it to pull up the sale?', bn: 'গ্রাহক বারকোড সহ একটি রিসিট নিয়ে এসেছে — সেটি স্ক্যান করে বিক্রি বের করা যাবে?' },
                a: {
                    en: 'Yes — POS toolbar → Find Sale → focus the search box and scan. The receipt barcode encodes the invoice number, so the matching sale jumps to the top of the result list; click it and Process Return. Saves typing on returns where the customer hands you the receipt at the desk. The barcode prints on every receipt finalized from May 2026 onward (Phase 2.34) — older receipts don\'t have it, so you\'ll still type the invoice number for those.',
                    bn: 'হ্যাঁ — POS টুলবার → Find Sale → সার্চ বক্সে কার্সর রেখে স্ক্যান করুন। রিসিট বারকোড invoice নম্বর এনকোড করে রাখে, তাই মিলে যাওয়া বিক্রি ফলাফলের তালিকার উপরে আসে; ক্লিক করে Process Return করুন। যেসব রিটার্নে গ্রাহক ডেস্কে রিসিট তুলে দেন সেখানে টাইপ করার ঝামেলা বাঁচে। বারকোড মে ২০২৬ থেকে Finalize হওয়া প্রতিটি রিসিটে প্রিন্ট হয় (Phase 2.34) — পুরনো রিসিটে নেই, তাই সেগুলোতে invoice নম্বর টাইপ করতেই হবে।',
                },
            },
        ],
    },

    // ───────────── Catalog ─────────────
    {
        id: 'catalog',
        routePrefix: '/catalog',
        icon: 'heroicons_outline:cube',
        title: { en: 'Catalog — Products, Brands, Categories, Units', bn: 'ক্যাটালগ — পণ্য, ব্র্যান্ড, ক্যাটাগরি, ইউনিট' },
        summary: {
            en: 'Master data for everything you sell. Set up categories first, then brands, units, and finally products.',
            bn: 'যা কিছু বিক্রি করেন তার মাস্টার ডেটা। আগে ক্যাটাগরি, তারপর ব্র্যান্ড, ইউনিট, এবং সবশেষে পণ্য তৈরি করুন।',
        },
        questions: [
            {
                q: { en: 'In what order should I set up the catalog?', bn: 'ক্যাটালগ কোন ক্রমে সেটআপ করব?' },
                a: {
                    en: '1) Categories (Mobile, Accessories…) — can be hierarchical. 2) Brands (Apple, Samsung…). 3) Units (Each, kg, liter — mark IsWeight for kg/liter). 4) Products — each one needs SKU, name, category, brand, unit, cost price, selling price, tax rate. Optional: barcode, reorder level. SKU must be unique within your tenant.',
                    bn: '১) ক্যাটাগরি (Mobile, Accessories…) — এগুলো nested হতে পারে। ২) ব্র্যান্ড (Apple, Samsung…)। ৩) ইউনিট (Each, kg, liter — kg/liter এর জন্য IsWeight চেক করুন)। ৪) পণ্য — প্রতিটিতে SKU, নাম, ক্যাটাগরি, ব্র্যান্ড, ইউনিট, ক্রয়মূল্য, বিক্রয়মূল্য, ট্যাক্স রেট লাগে। অপশনাল: বারকোড, রিঅর্ডার লেভেল। SKU অবশ্যই Tenant-এর মধ্যে ইউনিক হতে হবে।',
                },
            },
            {
                q: { en: 'What\'s the difference between cost price and selling price?', bn: 'Cost price আর Selling price-এর পার্থক্য কী?' },
                a: {
                    en: 'Cost price = what you pay your supplier (drives margin reports). Selling price = what the customer pays at POS (the default; cashiers can override per sale if they have Sales.Discount permission). Both should be net of tax — tax is added separately based on TaxRate.',
                    bn: 'Cost price = সরবরাহকারীকে আপনি যা দেন (মার্জিন রিপোর্ট এর জন্য)। Selling price = POS-এ গ্রাহক যা দেয় (ডিফল্ট; Sales.Discount অনুমতি থাকলে ক্যাশিয়ার বিক্রি ভিত্তিতে পরিবর্তন করতে পারেন)। দুটোই ট্যাক্স ছাড়া হওয়া উচিত — TaxRate অনুযায়ী আলাদাভাবে ট্যাক্স যোগ হয়।',
                },
            },
            {
                q: { en: 'How do I make a product require a serial / batch / weight?', bn: 'কোনো পণ্যে সিরিয়াল / ব্যাচ / ওজন কীভাবে বাধ্যতামূলক করব?' },
                a: {
                    en: 'After creating the product, look for vertical-specific buttons on its row: Electronics → opens "Electronics details" (RequiresSerial / IMEI / WarrantyMonths). Pharmacy → opens "Pharmacy details" (RequiresBatch / Prescription / Controlled). Weight-tracked products use a unit with IsWeight = true. The POS will then enforce capture on every sale of that product.',
                    bn: 'পণ্য তৈরির পরে রো-এর উপর vertical-নির্দিষ্ট বোতাম পাবেন: Electronics → "Electronics details" খোলে (RequiresSerial / IMEI / WarrantyMonths)। Pharmacy → "Pharmacy details" খোলে (RequiresBatch / Prescription / Controlled)। ওজন-ট্র্যাকড পণ্যের জন্য IsWeight = true সহ ইউনিট ব্যবহার করুন। POS তখন বিক্রির সময় ক্যাপচার বাধ্যতামূলক করবে।',
                },
            },
            {
                q: { en: 'Can I price a product differently at different outlets?', bn: 'আউটলেট ভেদে কি পণ্যের আলাদা মূল্য দেওয়া যাবে?' },
                a: {
                    en: 'Yes — open the product row, click "Pricing" — set per-outlet overrides (e.g. airport store sells higher). Outlets without an override use the base SellingPrice. The cashier sees the resolved per-outlet price at POS.',
                    bn: 'হ্যাঁ — পণ্য রো-তে ক্লিক করে "Pricing" ক্লিক করুন — আউটলেট-ভিত্তিক ওভাররাইড সেট করুন (যেমন এয়ারপোর্ট স্টোর বেশি দামে বিক্রি)। যেসব আউটলেটে ওভাররাইড নেই, তারা মূল SellingPrice ব্যবহার করে। POS-এ ক্যাশিয়ার আউটলেট অনুযায়ী রেজল্ভড দাম দেখতে পান।',
                },
            },
            {
                q: { en: 'I deactivated a product but old sales still show it. Why?', bn: 'একটি পণ্য নিষ্ক্রিয় (deactivate) করেছি, কিন্তু পুরনো বিক্রিতে এখনও দেখাচ্ছে — কেন?' },
                a: {
                    en: 'On purpose. Sale lines snapshot the product name and SKU at the moment of finalize so historical receipts stay readable even after a product is renamed or retired. Deactivating only hides the product from the POS picker — it does not back-port to old sales.',
                    bn: 'এটি ইচ্ছাকৃত। বিক্রির লাইন Finalize-এর মুহূর্তে পণ্যের নাম ও SKU snapshot করে রাখে যাতে পরে rename/retire করলেও পুরনো রিসিট পঠনযোগ্য থাকে। নিষ্ক্রিয় করলে শুধু POS পিকার থেকে পণ্যটি লুকায় — পুরনো বিক্রি অপরিবর্তিত থাকে।',
                },
            },
            {
                q: { en: 'How do I bulk-import products from Excel?', bn: 'Excel থেকে একসাথে অনেক পণ্য কীভাবে আমদানি করব?' },
                a: {
                    en: 'On the Products list, click the "Import" button next to the + Add button. Download the template first (it shows the exact required columns: SKU, Name, Category, Brand, Unit, CostPrice, SellingPrice, TaxRate, plus optional Barcode / ReorderLevel / Description / IsActive). Fill in your data, save as .xlsx, upload. Pick a Mode: AutoCreate (default — missing categories / brands / units are created automatically; existing SKUs skipped), Update (existing SKUs get overwritten), or Strict (any missing reference fails the row). The result screen shows created / updated / skipped / failed counts plus row-level errors.',
                    bn: 'Products তালিকায়, "+" Add বোতামের পাশে "Import" বোতামে ক্লিক করুন। প্রথমে টেমপ্লেট ডাউনলোড করুন (যা সঠিক প্রয়োজনীয় কলাম দেখায়: SKU, Name, Category, Brand, Unit, CostPrice, SellingPrice, TaxRate, এবং ঐচ্ছিক Barcode / ReorderLevel / Description / IsActive)। আপনার ডেটা পূরণ করুন, .xlsx হিসেবে সেভ করুন, আপলোড করুন। একটি Mode বাছুন: AutoCreate (ডিফল্ট — অনুপস্থিত categories / brands / units স্বয়ংক্রিয়ভাবে তৈরি হয়; বিদ্যমান SKU বাদ পড়ে), Update (বিদ্যমান SKU ওভাররাইট হয়), বা Strict (যেকোনো অনুপস্থিত রেফারেন্স রো ব্যর্থ করে)। ফলাফল স্ক্রিনে created / updated / skipped / failed সংখ্যা ও রো-ভিত্তিক ত্রুটি দেখানো হয়।',
                },
            },
            {
                q: { en: 'How do I print barcode labels for a product?', bn: 'একটি পণ্যের জন্য বারকোড লেবেল কীভাবে প্রিন্ট করব?' },
                a: {
                    en: 'Products → find the row → click the teal qr_code_2 icon on the right. The "Print barcode labels" dialog asks for quantity (1–500), whether to include the selling price, and paper format: A4 sticker sheet (5 × 13 = 65 labels per page, Avery-style adhesive) or Thermal label printer (50 × 30 mm, one label per "page" for Zebra / TSC / Argox). Click Print — a new tab opens with the rendered labels ready to send to your printer. Uses the product\'s barcode if set; falls back to its SKU when no manufacturer barcode exists.',
                    bn: 'Products → রো খুঁজুন → ডান পাশের teal qr_code_2 আইকনে ক্লিক। "Print barcode labels" ডায়ালগ পরিমাণ (১–৫০০), লেবেলে বিক্রয়মূল্য রাখবেন কিনা, এবং পেপার ফরম্যাট জিজ্ঞেস করে: A4 sticker sheet (৫ × ১৩ = প্রতি পৃষ্ঠায় ৬৫ লেবেল, Avery-style আঠালো) বা Thermal label printer (৫০ × ৩০ mm, প্রতি "পেজে" একটি লেবেল — Zebra / TSC / Argox-এর জন্য)। Print ক্লিক করুন — নতুন ট্যাবে rendered লেবেল প্রিন্টারে পাঠানোর জন্য খুলবে। পণ্যের barcode সেট থাকলে সেটাই; manufacturer barcode না থাকলে SKU ব্যবহার হয়।',
                },
            },
            {
                q: { en: 'Can I print labels for many products at once?', bn: 'একসাথে অনেক পণ্যের লেবেল প্রিন্ট করা যাবে?' },
                a: {
                    en: 'Yes — tick the checkboxes on every product row you want labels for, then click "Print barcode labels" in the bulk-actions toolbar that appears at the top. Same dialog as the single-product flow, but the quantity field applies to every selected product (e.g. qty 3 across 8 products = 24 labels total, all on the same page / roll). Most useful right after a Goods Receipt of mixed items, or before a promo shelf reset.',
                    bn: 'হ্যাঁ — যেসব পণ্যের লেবেল চান সব রো-তে চেকবক্স টিক করুন, তারপর উপরে আসা bulk-actions টুলবারে "Print barcode labels" ক্লিক করুন। একই ডায়ালগ, কিন্তু quantity প্রতিটি নির্বাচিত পণ্যে প্রযোজ্য (যেমন ৮টি পণ্যে qty ৩ = মোট ২৪ লেবেল, একই পৃষ্ঠা / রোলে)। মিশ্র আইটেমের Goods Receipt-এর ঠিক পরে, বা promo shelf রিসেটের আগে সবচেয়ে উপযোগী।',
                },
            },
            {
                q: { en: 'How do I run a sale / offer price on a product for a fixed period?', bn: 'একটি পণ্যে নির্দিষ্ট সময়ের জন্য sale / offer মূল্য কীভাবে চালু করব?' },
                a: {
                    en: 'Open the product → "Offer Price (optional)" section. Type = Flat (e.g. ৳50 off) or Percentage (e.g. 10% off); leave Type = None to clear the offer. Set Start Date / End Date if the offer should auto-on for a window only — leave both blank for an always-on offer. Resolution at sale time: per-outlet override > active offer > base price. The amber price chip on POS shows the offer with the base struck through underneath, so cashiers see they\'re honouring a promotion at a glance.',
                    bn: 'পণ্য খুলুন → "Offer Price (optional)" সেকশন। Type = Flat (যেমন ৳৫০ ছাড়) বা Percentage (যেমন ১০% ছাড়); Type = None রাখলে offer ক্লিয়ার হবে। শুধু একটি window-এ স্বয়ংক্রিয় চালু রাখতে চাইলে Start Date / End Date সেট করুন — সবসময় চালু রাখতে দুটোই খালি রাখুন। বিক্রির সময় রেজল্যুশন: per-outlet override > active offer > base price। POS-এ অ্যাম্বার price chip অফার দেখায় এবং নিচে base কাটা থাকে — তাই ক্যাশিয়ার এক নজরেই বুঝতে পারেন তারা একটি promotion চালাচ্ছেন।',
                },
            },
        ],
    },

    // ───────────── Inventory ─────────────
    {
        id: 'inventory',
        routePrefix: '/inventory',
        icon: 'heroicons_outline:archive-box',
        title: { en: 'Inventory — Stock, Movements, Serials', bn: 'ইনভেন্টরি — স্টক, মুভমেন্ট, সিরিয়াল' },
        summary: {
            en: 'See what\'s on the shelf, what moved, and individual serial-tracked units.',
            bn: 'শেলফে কী আছে, কী সরিয়েছে, এবং সিরিয়াল-ট্র্যাকড প্রতিটি ইউনিট দেখুন।',
        },
        questions: [
            {
                q: { en: 'How is stock count maintained?', bn: 'স্টক কাউন্ট কীভাবে রক্ষণাবেক্ষণ হয়?' },
                a: {
                    en: 'A running total per (product × outlet). Goods Receipts +increase; Sales / Stock Adjustments / Stock Transfers (out) -decrease. Every change writes a StockMovement row (append-only audit log). The system blocks any operation that would push stock negative.',
                    bn: '(পণ্য × আউটলেট) প্রতি একটি রানিং টোটাল। Goods Receipts +বৃদ্ধি; বিক্রি / Stock Adjustments / Stock Transfers (আউট) -হ্রাস। প্রতিটি পরিবর্তন একটি StockMovement রো লেখে (append-only অডিট লগ)। স্টক নেগেটিভ হবে এমন কোনো অপারেশন সিস্টেম ব্লক করে।',
                },
            },
            {
                q: { en: 'When should I use a Stock Adjustment vs a Cycle Count?', bn: 'কখন Stock Adjustment আর কখন Cycle Count ব্যবহার করব?' },
                a: {
                    en: 'Stock Adjustment = a single line correction with a reason (e.g. one box damaged, one item found behind a shelf). Cycle Count = a structured stocktake covering many products at once — you snapshot expected quantities, count physically, the system posts adjustments only for the variances. Use Cycle Count for monthly or year-end physical inventory.',
                    bn: 'Stock Adjustment = একটি কারণসহ একক লাইন সংশোধন (যেমন একটি বাক্স নষ্ট হয়েছে, একটি আইটেম শেলফের পিছনে পাওয়া গেছে)। Cycle Count = একসাথে অনেক পণ্যের সংগঠিত স্টকটেক — আশা করা পরিমাণ snapshot করুন, ভৌতভাবে গণনা করুন, সিস্টেম শুধু variance-এর জন্য adjustment পোস্ট করে। মাসিক বা বছর-শেষের ভৌতিক ইনভেন্টরির জন্য Cycle Count ব্যবহার করুন।',
                },
            },
            {
                q: { en: 'How do I move stock between outlets?', bn: 'এক আউটলেট থেকে অন্য আউটলেটে স্টক কীভাবে সরাব?' },
                a: {
                    en: 'Stock Transfers in the left nav. Create a transfer (Draft) at the source — pick the destination outlet and the items + quantity. Click Dispatch (decrements source stock, sets InTransit). When the goods arrive, the destination opens it and clicks Receive (increments destination stock). Both sides see the transfer in their history.',
                    bn: 'বাঁ পাশের নেভিগেশনে Stock Transfers। উৎস আউটলেটে একটি Transfer (Draft) তৈরি করুন — গন্তব্য আউটলেট ও আইটেম + পরিমাণ বেছে নিন। Dispatch ক্লিক করুন (উৎস স্টক হ্রাস, InTransit সেট)। পণ্য পৌঁছানোর পর গন্তব্য তা খুলে Receive ক্লিক করেন (গন্তব্য স্টক বৃদ্ধি)। উভয় পক্ষ ইতিহাসে Transfer দেখতে পান।',
                },
            },
            {
                q: { en: 'Where do I see individual serial numbers?', bn: 'প্রতিটি সিরিয়াল নম্বর কোথায় দেখা যাবে?' },
                a: {
                    en: 'Stock Serials in the left nav. Each serial has a Status: InStock (available to sell) / Sold / Returned / UnderRepair / WrittenOff / Transferred. Look up by serial number directly via the search box. The serial is created by a Goods Receipt for serial-tracked products and flips through statuses based on subsequent sales / returns / transfers.',
                    bn: 'বাঁ পাশের নেভিগেশনে Stock Serials। প্রতিটি সিরিয়ালের একটি Status থাকে: InStock (বিক্রির জন্য উপলব্ধ) / Sold / Returned / UnderRepair / WrittenOff / Transferred। সার্চ বক্স দিয়ে সরাসরি সিরিয়াল নম্বর খুঁজুন। সিরিয়াল-ট্র্যাকড পণ্যের জন্য Goods Receipt-এ সিরিয়াল তৈরি হয় এবং পরবর্তী বিক্রি / রিটার্ন / ট্রান্সফার অনুযায়ী Status পরিবর্তিত হয়।',
                },
            },
            {
                q: { en: 'Why does the Movements list have so many entries?', bn: 'Movements তালিকায় এত এন্ট্রি কেন?' },
                a: {
                    en: 'Every change to stock writes one — by design. It\'s the audit trail. Sale → one Movement(Sale, -qty) per line. Goods Receipt → one Movement(GoodsReceipt, +qty) per line. Adjustment, Transfer in/out, Return, Damage, Recount — all logged. If a stock count looks wrong, the Movements list is your source of truth for "what happened, when, by whom."',
                    bn: 'স্টকের প্রতিটি পরিবর্তনে একটি এন্ট্রি — পরিকল্পনাগতভাবে। এটিই অডিট ট্রেইল। বিক্রি → প্রতি লাইনে একটি Movement(Sale, -পরিমাণ)। Goods Receipt → প্রতি লাইনে একটি Movement(GoodsReceipt, +পরিমাণ)। Adjustment, Transfer in/out, Return, Damage, Recount — সব লগ হয়। স্টক কাউন্ট ভুল মনে হলে "কখন, কী হয়েছিল, কে করেছে" তার সত্যের উৎস হলো Movements তালিকা।',
                },
            },
            {
                q: { en: 'How do I load opening-balance stock for the first time?', bn: 'প্রথমবারের জন্য opening-balance স্টক কীভাবে লোড করব?' },
                a: {
                    en: 'On Inventory > Stock On Hand, click the "Import" button at the top, OR use the on-screen "Import opening balances" banner that appears when an outlet has no stock yet. Download the template (columns: OutletCode, SKU, Quantity, optional Notes). Fill it in — one row per (outlet × SKU) combination — and upload as .xlsx. Each row creates a StockAdjustment with reason "OpeningBalance" so the audit trail clearly distinguishes bulk imports from manual corrections. Re-uploading the same file is idempotent: matching quantities are skipped, not failed.',
                    bn: 'Inventory > Stock On Hand-এ, উপরে "Import" বোতাম ক্লিক করুন, বা যখন একটি আউটলেটে স্টক নেই তখন প্রদর্শিত "Import opening balances" ব্যানার ব্যবহার করুন। টেমপ্লেট ডাউনলোড করুন (কলাম: OutletCode, SKU, Quantity, ঐচ্ছিক Notes)। পূরণ করুন — প্রতি (আউটলেট × SKU) জোড়ার জন্য একটি রো — এবং .xlsx হিসেবে আপলোড করুন। প্রতিটি রো একটি StockAdjustment তৈরি করে কারণ "OpeningBalance" সহ যাতে অডিট ট্রেইল ম্যানুয়াল সংশোধন থেকে বাল্ক ইম্পোর্টকে আলাদা রাখে। একই ফাইল পুনরায় আপলোড করা idempotent: মিলে যাওয়া পরিমাণ skipped হয়, failed নয়।',
                },
            },
            {
                q: { en: 'Why does my product not appear at this outlet even though I imported it?', bn: 'আমি একটি পণ্য ইম্পোর্ট করার পরেও কেন এই আউটলেটে দেখা যাচ্ছে না?' },
                a: {
                    en: 'Products are tenant-wide (same catalog at every outlet), but stock is per-outlet. Importing a product creates the catalog row but not stock. To see the product on POS at a given outlet, either run the initial-stock import (recommended for migration), receive a Goods Receipt against that outlet, or post a manual Stock Adjustment with the desired opening quantity.',
                    bn: 'পণ্য Tenant-ব্যাপী (প্রতিটি আউটলেটে একই ক্যাটালগ), কিন্তু স্টক প্রতি আউটলেটে। একটি পণ্য ইম্পোর্ট করলে ক্যাটালগ সারি তৈরি হয়, স্টক নয়। POS-এ একটি নির্দিষ্ট আউটলেটে পণ্য দেখতে: হয় initial-stock import চালান (মাইগ্রেশনের জন্য recommended), অথবা সেই আউটলেটে Goods Receipt রিসিভ করুন, বা পছন্দসই opening quantity সহ একটি ম্যানুয়াল Stock Adjustment পোস্ট করুন।',
                },
            },
        ],
    },

    // ───────────── Customers ─────────────
    {
        id: 'customers',
        routePrefix: '/customers',
        icon: 'heroicons_outline:user-group',
        title: { en: 'Customers', bn: 'গ্রাহক' },
        summary: {
            en: 'Linked customers earn loyalty, can buy on credit, and get warranties registered to them.',
            bn: 'লিংকড গ্রাহক লয়্যালটি পয়েন্ট জমান, ক্রেডিটে কিনতে পারেন, এবং তাদের নামে ওয়ারেন্টি নিবন্ধিত হয়।',
        },
        questions: [
            {
                q: { en: 'What\'s the difference between Retail / Wholesale / Corporate types?', bn: 'Retail / Wholesale / Corporate প্রকারের পার্থক্য কী?' },
                a: {
                    en: 'A label that helps you segment customers in reports. None of them gate features automatically — credit limit, loyalty, etc. are all set per customer regardless of type. Pick the one that matches how your business thinks about that customer.',
                    bn: 'রিপোর্টে গ্রাহকদের সেগমেন্ট করতে সাহায্য করে এমন একটি লেবেল। কোনোটিই স্বয়ংক্রিয়ভাবে ফিচার সীমিত করে না — ক্রেডিট লিমিট, লয়্যালটি ইত্যাদি প্রকার নির্বিশেষে গ্রাহক ভিত্তিতে সেট হয়। যেটি আপনার ব্যবসা সেই গ্রাহককে যেভাবে দেখে তার সাথে মেলে সেটি বেছে নিন।',
                },
            },
            {
                q: { en: 'How does Credit Limit work?', bn: 'Credit Limit কীভাবে কাজ করে?' },
                a: {
                    en: 'Set on the customer profile. When a sale\'s payments don\'t cover the total AND the customer has a credit limit, the unpaid amount goes onto their account up to that limit. CurrentBalance shows what they owe. Walk-ins can\'t use credit. Use Customers → row → Adjust Balance to record a payment received later.',
                    bn: 'গ্রাহক প্রোফাইলে সেট। বিক্রির পেমেন্ট মোট বিল কভার না করলে এবং গ্রাহকের ক্রেডিট লিমিট থাকলে, বাকি টাকা সেই লিমিট পর্যন্ত তাদের অ্যাকাউন্টে যোগ হয়। CurrentBalance তাদের বকেয়া দেখায়। Walk-in ক্রেডিট ব্যবহার করতে পারে না। পরে পেমেন্ট পেলে Customers → রো → Adjust Balance থেকে রেকর্ড করুন।',
                },
            },
            {
                q: { en: 'How do I award a customer bonus loyalty points?', bn: 'কোনো গ্রাহককে বোনাস লয়্যালটি পয়েন্ট কীভাবে দেব?' },
                a: {
                    en: 'Customers → row → Adjust Loyalty (manager / admin only). Enter a positive amount + reason (e.g. "Sign-up bonus", "Complaint compensation"). The transaction is logged in the LoyaltyTransactions table so you can always trace where points came from.',
                    bn: 'Customers → রো → Adjust Loyalty (শুধু manager / admin)। ধনাত্মক পরিমাণ + কারণ লিখুন (যেমন "Sign-up bonus", "Complaint compensation")। লেনদেন LoyaltyTransactions টেবিলে লগ হয় যাতে পয়েন্ট কোথা থেকে এলো তা সবসময় ট্রেস করা যায়।',
                },
            },
            {
                q: { en: 'A customer asks "what was my last visit?" — where do I look?', bn: 'গ্রাহক জিজ্ঞেস করছে "আমার শেষ ভিজিট কখন ছিল?" — কোথায় দেখব?' },
                a: {
                    en: 'POS → Find Sale → search by their phone or name. Or Sales in the left nav — filter by customer. The detail page shows every line, payment, and balance.',
                    bn: 'POS → Find Sale → ফোন বা নাম দিয়ে সার্চ। বা বাঁ পাশের নেভিগেশনে Sales — গ্রাহক দিয়ে ফিল্টার। ডিটেইল পেজে প্রতিটি লাইন, পেমেন্ট, ব্যালেন্স দেখা যাবে।',
                },
            },
        ],
    },

    // ───────────── Suppliers ─────────────
    {
        id: 'suppliers',
        routePrefix: '/suppliers',
        icon: 'heroicons_outline:truck',
        title: { en: 'Suppliers', bn: 'সরবরাহকারী' },
        summary: {
            en: 'Vendors and wholesalers feeding your inventory. Used by Purchase Orders.',
            bn: 'যেসব ভেন্ডর / পাইকার আপনার ইনভেন্টরিতে পণ্য সরবরাহ করেন। Purchase Orders-এ ব্যবহৃত হয়।',
        },
        questions: [
            {
                q: { en: 'Do I have to create a supplier before placing a PO?', bn: 'PO তৈরির আগে কি Supplier তৈরি করতে হবে?' },
                a: {
                    en: 'Yes — every Purchase Order points at exactly one supplier. Create suppliers first, then POs. Even one-off purchases need a supplier row (you can label it "Misc Local Vendor" if you don\'t want to track each).',
                    bn: 'হ্যাঁ — প্রতিটি Purchase Order ঠিক একটি সরবরাহকারীকে নির্দেশ করে। আগে Supplier তৈরি করুন, তারপর PO। একবারের কেনাকাটাতেও Supplier রো লাগে (প্রতিটি আলাদা ট্র্যাক না করতে চাইলে "Misc Local Vendor" নামে একটি বানিয়ে রাখুন)।',
                },
            },
            {
                q: { en: 'Why can\'t I delete a supplier?', bn: 'একটি Supplier কেন ডিলিট করতে পারছি না?' },
                a: {
                    en: 'They have one or more Purchase Orders or Goods Receipts linked. Deleting would break audit history. Switch their Active toggle off — they stop appearing in the PO supplier picker but historical records stay intact.',
                    bn: 'তাদের সাথে এক বা একাধিক Purchase Order বা Goods Receipt লিংকড আছে। ডিলিট করলে অডিট ইতিহাস ভেঙে যাবে। Active টগল বন্ধ করুন — তারা PO supplier পিকার থেকে অদৃশ্য হবে, কিন্তু ঐতিহাসিক রেকর্ড অটুট থাকে।',
                },
            },
            {
                q: { en: 'How do I track money I owe a supplier?', bn: 'একজন Supplier-কে আমি কত টাকা পাওনা — কীভাবে দেখব?' },
                a: {
                    en: 'Each Goods Receipt records what you received and the cost; payments to suppliers are recorded outside the PO flow today. Reports → Supplier Summary aggregates totals received per supplier. Detailed AP (accounts payable) tracking is on the roadmap.',
                    bn: 'প্রতিটি Goods Receipt কী রিসিভ করেছেন ও খরচ রেকর্ড করে; Supplier-কে পেমেন্ট আজ PO flow-এর বাইরে রেকর্ড হয়। Reports → Supplier Summary প্রতি Supplier-এ মোট রিসিভড সংগ্রহ করে। বিস্তারিত AP (Accounts Payable) ট্র্যাকিং রোডম্যাপে আছে।',
                },
            },
        ],
    },

    // ───────────── Purchasing (POs + GRs + PRs) ─────────────
    {
        id: 'purchasing',
        routePrefix: '/purchase-orders',
        icon: 'heroicons_outline:clipboard-document-list',
        title: { en: 'Purchasing — POs, Receipts, Returns', bn: 'ক্রয় — PO, রিসিট, রিটার্ন' },
        summary: {
            en: 'Order from suppliers, receive goods (which increases stock), send back what didn\'t meet spec.',
            bn: 'সরবরাহকারী থেকে অর্ডার দিন, পণ্য রিসিভ করুন (যা স্টক বাড়ায়), যা স্পেক না মেলে ফেরত পাঠান।',
        },
        questions: [
            {
                q: { en: 'PO statuses — what do they mean?', bn: 'PO-এর স্ট্যাটাসগুলো কী অর্থ বহন করে?' },
                a: {
                    en: 'Draft (you\'re still editing) → Submitted (sent to supplier, locked from edit) → PartiallyReceived (some lines arrived, others outstanding) → Received (everything in). Cancelled is a one-way exit any time before Received. Status updates roll up automatically as Goods Receipts post against the PO.',
                    bn: 'Draft (এখনো এডিট করছেন) → Submitted (Supplier-কে পাঠানো হয়েছে, এডিট লক) → PartiallyReceived (কিছু লাইন এসেছে, বাকি অপেক্ষায়) → Received (সব এসেছে)। Received-এর আগে যেকোনো সময় Cancelled একমুখী এক্সিট। Goods Receipts PO-তে পোস্ট হলে স্ট্যাটাস স্বয়ংক্রিয়ভাবে আপডেট হয়।',
                },
            },
            {
                q: { en: 'How do I receive goods that arrived?', bn: 'এসে পৌঁছানো পণ্য কীভাবে রিসিভ করব?' },
                a: {
                    en: 'Open the PO → "New Goods Receipt from PO". Pick which lines and how many of each are arriving. For serial-tracked products, scan or type each serial. For batch-tracked (pharmacy), enter batch number + expiry per line. Click Complete — stock increases, serials are created, batches are upserted, and the PO\'s outstanding qty drops. Multiple receipts per PO are fine for partial deliveries.',
                    bn: 'PO খুলুন → "New Goods Receipt from PO"। কোন লাইন এবং প্রতিটির কত আসছে বেছে নিন। সিরিয়াল-ট্র্যাকড পণ্যের জন্য প্রতিটি সিরিয়াল স্ক্যান বা টাইপ করুন। Batch-ট্র্যাকড (Pharmacy) এর জন্য প্রতি লাইনে batch number + expiry লিখুন। Complete ক্লিক করুন — স্টক বাড়ে, সিরিয়াল তৈরি হয়, ব্যাচ আপসার্ট হয়, PO-এর outstanding পরিমাণ কমে। আংশিক ডেলিভারির জন্য একই PO-তে একাধিক রিসিট ঠিক আছে।',
                },
            },
            {
                q: { en: 'Why is the PO\'s "remaining" count wrong after a damaged delivery?', bn: 'একটি ক্ষতিগ্রস্ত ডেলিভারির পরে PO-এর "remaining" কাউন্ট ভুল কেন?' },
                a: {
                    en: 'Receive what physically arrived as a Goods Receipt first (so stock matches reality), then create a Purchase Return for the damaged units. The return decrements stock back AND restores the PO\'s outstanding qty so the supplier can re-send. The PO will roll Received → PartiallyReceived automatically.',
                    bn: 'প্রথমে যা ভৌতভাবে এসেছে তা একটি Goods Receipt হিসেবে রিসিভ করুন (যাতে স্টক বাস্তবের সাথে মেলে), তারপর ক্ষতিগ্রস্ত ইউনিটের জন্য একটি Purchase Return তৈরি করুন। Return স্টক কমায় এবং PO-এর outstanding পরিমাণ ফিরিয়ে আনে যাতে Supplier পুনরায় পাঠাতে পারে। PO Received → PartiallyReceived-এ স্বয়ংক্রিয়ভাবে যাবে।',
                },
            },
            {
                q: { en: 'Purchase Return — when do I get a credit vs a refund vs a replacement?', bn: 'Purchase Return-এ কখন ক্রেডিট, কখন রিফান্ড, কখন রিপ্লেসমেন্ট পাব?' },
                a: {
                    en: 'You pick on the return form. CreditNote = supplier credits you against future POs (most common). CashRefund / BankRefund = supplier sends money back. Replacement = supplier ships replacement units (zero credit needed). Adjustment = invoice line correction. The total credit must match the return cost unless every line is Replacement.',
                    bn: 'Return ফর্মে আপনি বেছে নেন। CreditNote = ভবিষ্যতের PO-এর বিপরীতে Supplier ক্রেডিট দেয় (সবচেয়ে সাধারণ)। CashRefund / BankRefund = Supplier টাকা ফেরত পাঠায়। Replacement = Supplier প্রতিস্থাপন ইউনিট পাঠায় (ক্রেডিট লাগে না)। Adjustment = invoice লাইন সংশোধন। প্রতিটি লাইন Replacement না হলে মোট ক্রেডিট অবশ্যই Return খরচের সমান হতে হবে।',
                },
            },
            {
                q: { en: 'Per-outlet PO numbering — what does OUTLETCODE-PO-000001 mean?', bn: 'প্রতি আউটলেটে PO numbering — OUTLETCODE-PO-000001 মানে কী?' },
                a: {
                    en: 'Each outlet has its own counter for POs (PO-NNNNNN), Goods Receipts (GR-NNNNNN), and Purchase Returns (PR-NNNNNN). The prefix matches the outlet code. So MAIN-PO-000042 is Main outlet\'s 42nd PO. The counter is concurrency-safe — two managers can\'t collide on the same number.',
                    bn: 'প্রতিটি আউটলেটের নিজস্ব কাউন্টার আছে PO (PO-NNNNNN), Goods Receipts (GR-NNNNNN), এবং Purchase Returns (PR-NNNNNN) এর জন্য। প্রিফিক্স আউটলেট কোডের সাথে মেলে। তাই MAIN-PO-000042 হলো Main আউটলেটের ৪২তম PO। কাউন্টার concurrency-safe — দুজন manager একই নম্বর পাবেন না।',
                },
            },
        ],
    },

    // ───────────── Shifts ─────────────
    {
        id: 'shifts',
        routePrefix: '/shifts',
        icon: 'heroicons_outline:clock',
        title: { en: 'Shifts — Open / Close / X-Z reports', bn: 'শিফট — Open / Close / X-Z রিপোর্ট' },
        summary: {
            en: 'A shift is a cashier session. Open at start of day, close at end — system shows expected cash and variance.',
            bn: 'একটি শিফট হলো একজন ক্যাশিয়ারের সেশন। দিনের শুরুতে খুলুন, শেষে বন্ধ করুন — সিস্টেম প্রত্যাশিত নগদ ও পার্থক্য দেখায়।',
        },
        questions: [
            {
                q: { en: 'How do I open a shift?', bn: 'একটি শিফট কীভাবে খুলব?' },
                a: {
                    en: 'Shifts → Open Shift. Count the cash in your drawer, enter as opening float. The shift status chip in the POS toolbar turns green. Every sale you ring up while the shift is open attaches to that shift.',
                    bn: 'Shifts → Open Shift। আপনার ড্রয়ারে নগদ গণনা করুন, opening float হিসেবে লিখুন। POS টুলবারের shift status চিপ সবুজ হবে। শিফট খোলা থাকা অবস্থায় আপনি যত বিক্রি করবেন, সব সেই শিফটে অ্যাটাচ হবে।',
                },
            },
            {
                q: { en: 'How does the variance get calculated at close?', bn: 'বন্ধ করার সময় variance কীভাবে গণনা হয়?' },
                a: {
                    en: 'expected cash = opening float + cash payments received - cash refunds paid out. Closing float = what you count physically in the drawer at end of day. Variance = closing float − expected cash. Negative = short; positive = over. Investigate any non-zero variance.',
                    bn: 'expected cash = opening float + প্রাপ্ত নগদ পেমেন্ট - প্রদত্ত নগদ রিফান্ড। Closing float = দিনের শেষে আপনি ড্রয়ারে যা ভৌতভাবে গণনা করেন। Variance = closing float − expected cash। ঋণাত্মক = ঘাটতি; ধনাত্মক = বেশি। যেকোনো অশূন্য variance তদন্ত করুন।',
                },
            },
            {
                q: { en: 'X-report vs Z-report — what\'s the difference?', bn: 'X-report ও Z-report পার্থক্য কী?' },
                a: {
                    en: 'X-report = live snapshot of an OPEN shift (what\'s happened so far today). Z-report = permanent record of a CLOSED shift (the day\'s archive). Many tax jurisdictions require Z-reports for end-of-day. Both reports include float reconciliation, sales rollup, returns rollup, payment-method breakdown, top 5 items.',
                    bn: 'X-report = খোলা শিফটের লাইভ snapshot (আজ এখন পর্যন্ত যা হয়েছে)। Z-report = বন্ধ শিফটের স্থায়ী রেকর্ড (দিনের আর্কাইভ)। অনেক ট্যাক্স এখতিয়ারে দিনশেষে Z-report প্রয়োজন। উভয় রিপোর্টে float reconciliation, sales rollup, returns rollup, payment-method breakdown, top 5 items থাকে।',
                },
            },
            {
                q: { en: 'I forgot to open a shift before ringing sales. What happens?', bn: 'বিক্রি শুরুর আগে শিফট খুলতে ভুলে গেছি — কী হবে?' },
                a: {
                    en: 'Sales still go through — they just don\'t attach to a shift (Sale.ShiftId stays null). The POS shows an amber warning chip telling you. Z-report won\'t include those sales. Open a shift retroactively isn\'t supported — best practice is open before your first sale.',
                    bn: 'বিক্রি চলবে — শুধু কোনো শিফটে অ্যাটাচ হবে না (Sale.ShiftId নাল থাকবে)। POS-এ একটি কমলা সতর্ক চিপ দেখাবে। Z-report-এ সেই বিক্রি থাকবে না। পশ্চাৎমুখী (retroactively) শিফট খোলা সাপোর্ট নেই — সবচেয়ে ভাল অভ্যাস হলো প্রথম বিক্রির আগেই শিফট খোলা।',
                },
            },
        ],
    },

    // ───────────── Promotions / Loyalty ─────────────
    {
        id: 'marketing',
        routePrefix: '/promotions',
        icon: 'heroicons_outline:megaphone',
        title: { en: 'Promotions & Loyalty', bn: 'প্রোমোশন ও লয়্যালটি' },
        summary: {
            en: 'Discount campaigns and loyalty points — keep customers coming back.',
            bn: 'ছাড়ের ক্যাম্পেইন ও লয়্যালটি পয়েন্ট — গ্রাহক ফিরিয়ে আনতে।',
        },
        questions: [
            {
                q: { en: 'What kinds of promotions can I configure?', bn: 'কী ধরনের প্রোমোশন কনফিগার করা যাবে?' },
                a: {
                    en: 'Three types × three scopes. Types: PercentageOff (10% off), FixedAmountOff (50 BDT off), BuyXGetY (buy 2 get 1 free). Scopes: Cart (whole sale), Product (specific SKUs), Category (e.g. all Mobiles). Set start / end dates, optional minimum cart value, and a promo code customers enter at POS.',
                    bn: 'তিন ধরন × তিন স্কোপ। ধরন: PercentageOff (১০% ছাড়), FixedAmountOff (৫০ টাকা ছাড়), BuyXGetY (২ কিনলে ১ ফ্রি)। স্কোপ: Cart (পুরো বিক্রি), Product (নির্দিষ্ট SKU), Category (যেমন সব Mobile)। শুরু / শেষ তারিখ, optional ন্যূনতম cart মূল্য, এবং POS-এ গ্রাহক যে promo কোড লেখেন — সব সেট করুন।',
                },
            },
            {
                q: { en: 'Promo + loyalty + tax — in what order are they applied?', bn: 'Promo + loyalty + ট্যাক্স — কোন ক্রমে প্রয়োগ হয়?' },
                a: {
                    en: 'Subtotal → minus promotion discount → minus loyalty redemption → plus tax = grand total. Loyalty earned is calculated on the net total (after redemption) so customers can\'t earn points on points they redeemed.',
                    bn: 'Subtotal → বিয়োগ promotion discount → বিয়োগ loyalty redemption → যোগ tax = মোট। অর্জিত লয়্যালটি net total-এর উপর হিসাব হয় (redemption-এর পরে) যাতে গ্রাহকরা যে পয়েন্ট redeem করেছেন সেগুলোতে পয়েন্ট পান না।',
                },
            },
            {
                q: { en: 'How do customers earn points?', bn: 'গ্রাহক কীভাবে পয়েন্ট অর্জন করেন?' },
                a: {
                    en: '1 point per integer currency unit of the net total — automatically, on every Finalized sale where a customer is linked. Walk-ins don\'t earn. Adjustments (manager bonus, complaint compensation) can be added manually via Customers → row → Adjust Loyalty.',
                    bn: 'প্রতি পূর্ণ মুদ্রা ইউনিট net total-এ ১ পয়েন্ট — স্বয়ংক্রিয়ভাবে, প্রতিটি Finalized বিক্রিতে যেখানে গ্রাহক লিংকড। Walk-in পান না। Adjustment (manager বোনাস, অভিযোগের ক্ষতিপূরণ) ম্যানুয়ালি Customers → রো → Adjust Loyalty থেকে যোগ করা যায়।',
                },
            },
            {
                q: { en: 'Can a cashier preview the discount before finalizing?', bn: 'Finalize-এর আগে ক্যাশিয়ার কি ছাড়ের পরিমাণ প্রিভিউ করতে পারেন?' },
                a: {
                    en: 'Yes. Type the promo code in the POS, click Preview — the cart shows the resolved discount amount or a rejection reason ("minimum cart not met", "expired", "wrong product"). Nothing is committed until Finalize.',
                    bn: 'হ্যাঁ। POS-এ promo কোড টাইপ করুন, Preview ক্লিক করুন — cart resolved ছাড়ের পরিমাণ বা প্রত্যাখ্যানের কারণ দেখায় ("minimum cart not met", "expired", "wrong product")। Finalize না করা পর্যন্ত কিছুই কমিট হয় না।',
                },
            },
        ],
    },

    // ───────────── Reports ─────────────
    {
        id: 'reports',
        routePrefix: '/reports',
        icon: 'heroicons_outline:chart-bar',
        title: { en: 'Reports', bn: 'রিপোর্ট' },
        summary: {
            en: 'Read-only rollups for sales, inventory, AR aging, and more.',
            bn: 'বিক্রি, ইনভেন্টরি, AR aging ইত্যাদির শুধু-পঠন রোলআপ।',
        },
        questions: [
            {
                q: { en: 'Which reports are shipped today?', bn: 'বর্তমানে কোন রিপোর্টগুলো আছে?' },
                a: {
                    en: 'Sales summary (by-day / by-method / by-outlet), Top products, Inventory on-hand, Low stock, Expiring batches (pharmacy), Purchase summary, AR Aging (credit-sale balances bucketed 0-30 / 31-60 / 61-90 / 90+ days). Use the date-range and outlet filters to slice each report.',
                    bn: 'Sales summary (দিন-ভিত্তিক / পদ্ধতি-ভিত্তিক / আউটলেট-ভিত্তিক), Top products, Inventory on-hand, Low stock, Expiring batches (Pharmacy), Purchase summary, AR Aging (ক্রেডিট-বিক্রির ব্যালেন্স ০-৩০ / ৩১-৬০ / ৬১-৯০ / ৯০+ দিনে ভাগ)। প্রতিটি রিপোর্ট slice করতে date-range ও আউটলেট ফিল্টার ব্যবহার করুন।',
                },
            },
            {
                q: { en: 'What does AR Aging tell me?', bn: 'AR Aging কী বলে?' },
                a: {
                    en: 'Who owes you money, sliced by how long it\'s been outstanding. Each row = one customer; columns = 0-30 days / 31-60 / 61-90 / 90+. Walk-in sales aren\'t counted (they can\'t buy on credit). Use it to chase overdue accounts.',
                    bn: 'কে আপনার কাছে কত টাকা পাওনা, কতদিন ধরে — তার ভিত্তিতে slice। প্রতিটি রো = একজন গ্রাহক; কলাম = ০-৩০ দিন / ৩১-৬০ / ৬১-৯০ / ৯০+। Walk-in বিক্রি গণনা হয় না (তারা ক্রেডিটে কিনতে পারে না)। বকেয়া অ্যাকাউন্ট তাড়া করতে এটি ব্যবহার করুন।',
                },
            },
            {
                q: { en: 'Can I export reports to Excel?', bn: 'রিপোর্ট কি Excel-এ export করা যায়?' },
                a: {
                    en: 'Not natively today — reports render in the browser. Most report tables can be selected and pasted into Excel directly. CSV export is on the post-launch roadmap.',
                    bn: 'আজ নেটিভভাবে না — রিপোর্ট ব্রাউজারে render হয়। বেশিরভাগ report টেবিল সিলেক্ট করে সরাসরি Excel-এ পেস্ট করা যায়। CSV export পোস্ট-লঞ্চ রোডম্যাপে আছে।',
                },
            },
        ],
    },

    // ───────────── Audit Trail ─────────────
    {
        id: 'audit',
        routePrefix: '/audit',
        icon: 'heroicons_outline:shield-check',
        title: { en: 'Audit Trail', bn: 'অডিট ট্রেইল' },
        summary: {
            en: 'Every Create / Update / Delete in the tenant DB is logged with old/new values. Use it for forensics.',
            bn: 'Tenant DB-এ প্রতিটি Create / Update / Delete পুরনো/নতুন মান সহ লগ হয়। তদন্তের জন্য ব্যবহার করুন।',
        },
        questions: [
            {
                q: { en: 'Who can view the audit trail?', bn: 'অডিট ট্রেইল কে দেখতে পারেন?' },
                a: {
                    en: 'Admin by default. The "View Audit Trail" permission can also be granted to a custom role (e.g. an internal compliance role). The page is read-only by design — nobody can edit or delete trail rows.',
                    bn: 'ডিফল্টভাবে Admin। "View Audit Trail" অনুমতি একটি কাস্টম role-কেও (যেমন অভ্যন্তরীণ compliance role) দেওয়া যায়। পৃষ্ঠাটি ডিজাইন অনুযায়ী শুধু-পঠন — কেউ trail রো এডিট বা ডিলিট করতে পারেন না।',
                },
            },
            {
                q: { en: 'How long are trail entries kept?', bn: 'Trail এন্ট্রি কতদিন রাখা হয়?' },
                a: {
                    en: 'Per-tenant retention (default 365 days). A daily background job at 02:00 UTC purges rows older than the cutoff. Set to 0 to keep forever. Configurable per tenant by root admin.',
                    bn: 'প্রতি Tenant ভিত্তিক retention (ডিফল্ট ৩৬৫ দিন)। UTC ০২:০০-এ একটি দৈনিক background জব cut-off-এর চেয়ে পুরনো রো পরিষ্কার করে। চিরতরে রাখতে ০ সেট করুন। Root admin Tenant ভিত্তিক কনফিগার করতে পারেন।',
                },
            },
            {
                q: { en: 'How do I find who changed a specific record?', bn: 'একটি নির্দিষ্ট রেকর্ড কে পরিবর্তন করেছে — কীভাবে খুঁজব?' },
                a: {
                    en: 'Audit page → filter by Table (e.g. "Products") + Type (Update). Each row\'s expand arrow shows old vs new values side by side as JSON, plus the user id and timestamp. Filter further by date range or user id if you know them.',
                    bn: 'Audit পৃষ্ঠা → Table দিয়ে ফিল্টার (যেমন "Products") + Type (Update)। প্রতিটি রো-এর expand তীর পুরনো বনাম নতুন মান JSON হিসেবে পাশাপাশি দেখায়, সাথে user id ও timestamp। জানা থাকলে date-range বা user id দিয়ে আরও ফিল্টার করুন।',
                },
            },
        ],
    },

    // ───────────── Users & Roles ─────────────
    {
        id: 'users',
        routePrefix: '/users',
        icon: 'heroicons_outline:users',
        title: { en: 'Users & Roles', bn: 'ইউজার ও রোল' },
        summary: {
            en: 'Add staff, assign roles (Manager / Cashier / InventoryClerk), scope them to specific outlets.',
            bn: 'কর্মী যোগ করুন, রোল (Manager / Cashier / InventoryClerk) দিন, নির্দিষ্ট আউটলেটে scope করুন।',
        },
        questions: [
            {
                q: { en: 'What roles ship by default?', bn: 'ডিফল্টভাবে কোন কোন রোল আছে?' },
                a: {
                    en: 'Five built-in: Admin (everything), Manager (POS + back-office + reports + override authorization), Cashier (POS only — sell, return, park, look up sales, view their own shift), InventoryClerk (catalog + inventory + purchasing + transfers + reports — no POS), Basic (read-only personal profile). You can also build custom roles via Users → Roles.',
                    bn: 'পাঁচটি বিল্ট-ইন: Admin (সব), Manager (POS + ব্যাক-অফিস + রিপোর্ট + override অনুমোদন), Cashier (শুধু POS — বিক্রি, রিটার্ন, park, sale খোঁজা, নিজের শিফট দেখা), InventoryClerk (catalog + inventory + purchasing + transfers + রিপোর্ট — POS নয়), Basic (শুধু-পঠন ব্যক্তিগত প্রোফাইল)। Users → Roles থেকে কাস্টম role-ও তৈরি করা যায়।',
                },
            },
            {
                q: { en: 'How do I scope a user to a specific outlet?', bn: 'একজন ইউজারকে নির্দিষ্ট আউটলেটে কীভাবে scope করব?' },
                a: {
                    en: 'Users → row → emerald store icon ("Manage Outlets") → tick the outlets they should access. Empty assignment = all outlets (default). One outlet ticked = they only see / sell / receive at that outlet. Admin / root always see everything.',
                    bn: 'Users → রো → পান্না সবুজ store আইকন ("Manage Outlets") → তারা যেসব আউটলেটে অ্যাক্সেস পাবেন সেগুলো টিক করুন। কিছু না দিলে = সব আউটলেট (ডিফল্ট)। একটি আউটলেট টিক করলে = শুধু সেই আউটলেটে দেখা / বিক্রি / রিসিভ। Admin / root সবসময় সব দেখেন।',
                },
            },
            {
                q: { en: 'Can a user have multiple roles?', bn: 'একজন ইউজার কি একাধিক রোল পেতে পারেন?' },
                a: {
                    en: 'Yes — Users → row → violet roles icon ("Manage Roles") → tick all that apply. Permissions are the union: a user with both Manager + Cashier sees everything either role could.',
                    bn: 'হ্যাঁ — Users → রো → বেগুনি roles আইকন ("Manage Roles") → প্রযোজ্য সব টিক করুন। অনুমতি union হয়: Manager + Cashier দুটো থাকলে দুটোর সব অনুমতি পাবেন।',
                },
            },
            {
                q: { en: 'A user forgot their password — how do I reset it without sending an email?', bn: 'একজন ইউজার পাসওয়ার্ড ভুলে গেছে — ইমেল না পাঠিয়ে কীভাবে রিসেট করব?' },
                a: {
                    en: 'Users → row → rose lock_reset icon. The dialog generates a strong temporary password (or you can type one). Tell the user via a secure channel — they\'ll be forced to change it on first sign-in. Requires "Update Users" permission.',
                    bn: 'Users → রো → গোলাপী lock_reset আইকন। ডায়ালগ একটি শক্তিশালী অস্থায়ী পাসওয়ার্ড জেনারেট করে (অথবা আপনি টাইপ করতে পারেন)। ইউজারকে একটি নিরাপদ চ্যানেলে দিন — প্রথম সাইন-ইনে তিনি পাসওয়ার্ড পরিবর্তন করতে বাধ্য হবেন। "Update Users" অনুমতি প্রয়োজন।',
                },
            },
        ],
    },

    // ───────────── Tenant settings ─────────────
    {
        id: 'tenant',
        routePrefix: '/tenant',
        icon: 'heroicons_outline:building-office-2',
        title: { en: 'Tenant settings', bn: 'Tenant সেটিংস' },
        summary: {
            en: 'Tenant-wide defaults: business type (vertical), POS layout, label printing, theme. Mostly set once at creation.',
            bn: 'Tenant-ব্যাপী ডিফল্ট: business type (vertical), POS layout, label printing, theme। বেশিরভাগ তৈরির সময়ই একবার সেট হয়।',
        },
        questions: [
            {
                q: { en: 'Where do I set the default "Show price on barcode labels" option for my shop?', bn: 'বারকোড লেবেলে ডিফল্টভাবে দাম দেখানোর সেটিং কোথায়?' },
                a: {
                    en: 'Tenant settings → Basic Information tab → scroll to "Label printing defaults". Tick "Show selling price on barcode labels by default" so every Print Labels dialog opens with it on. The companion option "Use outlet-specific price (when set) instead of catalog base" makes labels reflect per-outlet overrides — handy if your airport store sells higher than the main branch. Cashiers / managers can still uncheck either box per print job; this is just the starting state.',
                    bn: 'Tenant settings → Basic Information ট্যাব → "Label printing defaults"-এ scroll করুন। "Show selling price on barcode labels by default" টিক করুন যাতে প্রতিটি Print Labels ডায়ালগ এটি চালু অবস্থায় খোলে। সঙ্গী অপশন "Use outlet-specific price (when set) instead of catalog base" লেবেলে per-outlet override প্রতিফলিত করে — যদি আপনার airport স্টোর মূল শাখার চেয়ে বেশি দামে বিক্রি করে তাহলে কাজে আসে। ক্যাশিয়ার / ম্যানেজার প্রতিটি print job-এ এগুলো বদলাতে পারেন; এটি শুধু starting state।',
                },
            },
            {
                q: { en: 'I changed the tenant theme but my screen didn\'t change. Do I need to refresh?', bn: 'Tenant থিম পরিবর্তন করেছি কিন্তু স্ক্রিন বদলাচ্ছে না — রিফ্রেশ করতে হবে?' },
                a: {
                    en: 'No — from May 2026 onward (Phase 2.38a) the live UI updates immediately on Save (colors, dark/light, accent). If nothing happened, Save probably failed validation on another field — look for a red error message under one of the inputs in any tab, fix it, and Save again. The theme picker itself lives in edit mode on the Review & Create tab → "Configure Theme".',
                    bn: 'না — মে ২০২৬ থেকে (Phase 2.38a) Save করলেই live UI সাথে সাথে আপডেট হয় (রঙ, dark/light, accent)। কিছু না ঘটলে অন্য কোনো ফিল্ডে validation ফেল করেছে — যেকোনো ট্যাবে ইনপুটের নিচে লাল error message খুঁজুন, ঠিক করুন, আবার Save করুন। Theme পিকার edit মোডে Review & Create ট্যাব → "Configure Theme"-এ আছে।',
                },
            },
            {
                q: { en: 'I picked a different Business Type but Save didn\'t change anything. Why?', bn: 'একটি ভিন্ন Business Type বেছেছি কিন্তু Save কিছু পরিবর্তন করেনি — কেন?' },
                a: {
                    en: 'Switching the vertical is a separate, deliberate action — it changes which pages and APIs your tenant can reach. Pick the new Business Type, then click the amber "Change Vertical" button in the warning panel below the field. Regular Save ignores that field on purpose. Any batches / serials / prescriptions you had under the old vertical stay in the DB; they just stop being reachable from the new vertical\'s UI. Switch back and they reappear — nothing is deleted.',
                    bn: 'Vertical পরিবর্তন একটি আলাদা, ইচ্ছাকৃত পদক্ষেপ — এটি বদলায় আপনার Tenant কোন পৃষ্ঠা ও API-তে পৌঁছাতে পারবে। নতুন Business Type বেছে নিন, তারপর ফিল্ডের নিচের warning panel-এ অ্যাম্বার "Change Vertical" বোতাম ক্লিক করুন। সাধারণ Save ইচ্ছাকৃতভাবেই সেই ফিল্ড উপেক্ষা করে। পুরনো vertical-এর batches / serials / prescriptions DB-তে থাকে; শুধু নতুন vertical-এর UI থেকে আর পৌঁছানো যায় না। আবার ফিরে গেলে তারা ফিরে আসে — কিছুই মুছে যায় না।',
                },
            },
            {
                q: { en: 'What does "Outlet Label" do?', bn: '"Outlet Label" কী কাজ করে?' },
                a: {
                    en: 'Cosmetic-only: changes the word "Outlet" everywhere in the app to whatever you type (Store, Branch, Pharmacy, Warehouse…). The underlying entity is still an Outlet — APIs, reports, audit trail all keep the canonical name. Useful when "Outlet" reads wrong for your sector — e.g. pharmacies prefer "Pharmacy", manufacturers prefer "Warehouse". Change anytime, no migration involved.',
                    bn: 'শুধুই cosmetic: অ্যাপ জুড়ে "Outlet" শব্দটি আপনার টাইপ করা শব্দে বদলায় (Store, Branch, Pharmacy, Warehouse…)। আসল entity তবু Outlet-ই থাকে — API, রিপোর্ট, audit trail সব canonical নামই রাখে। যেসব sector-এ "Outlet" ভুল শোনায় তখন উপকারী — যেমন pharmacies "Pharmacy" পছন্দ করে, manufacturers "Warehouse"। যেকোনো সময় পরিবর্তন করুন, কোনো migration লাগে না।',
                },
            },
        ],
    },
];
