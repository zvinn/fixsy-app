// src/constants/mockData.ts
// Realistic Egyptian maintenance demo data for Fixsy

export interface Offer {
    tech_name: string;
    tech_email: string;
    price: number;
    date: string;
    tech_avatar?: string;
    rating?: number;
}

export interface MarketJob {
    id: string;
    title: string;
    desc: string;
    budget: number;
    location: string;
    client_name: string;
    client_email: string;
    status: 'open' | 'closed';
    date: string;
    category?: string;
    urgency?: 'normal' | 'urgent';
    offers?: Offer[];
    [key: string]: unknown;
}

export interface DemoBookingRequest {
    id: string;
    technician_name?: string;
    technician_email?: string;
    technician_id?: string;
    technician_phone?: string;
    client_name?: string;
    client_email?: string;
    service_type?: string;
    price?: number;
    discount?: number;
    date: string;
    scheduledDate?: string;
    status: 'pending' | 'accepted' | 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
    problem_desc?: string;
    client_address?: string;
    problem_image?: string;
    tech_location?: { lat: number; lng: number };
    location?: { lat: number; lng: number };
    client_rating?: number;
    client_comment?: string;
    reviewTimestamp?: string;
    [key: string]: unknown;
}

export const DEMO_MARKET_JOBS: MarketJob[] = [
    {
        id: 'job-eg-101',
        title: 'تأسيس وتشطيب سباكة حمام ومطبخ بالكامل',
        desc: 'مطلوب فني سباكة محترف لتركيب شبكة تغذية وصرف جديدة لحمام ومطبخ شقة 140م بنظام PPR وتجهيز خلاطات دفن واختبار ضغط مع الضمان.',
        budget: 1850,
        location: 'التجمع الخامس - حي النرجس',
        client_name: 'م. شريف عبد الرحمن',
        client_email: 'sherif.eg@gmail.com',
        status: 'open',
        category: 'plumbing',
        urgency: 'urgent',
        date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        offers: [
            {
                tech_name: 'محمد سعد',
                tech_email: 'mohamed.saad@fixsy.com',
                price: 1750,
                rating: 4.9,
                date: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
            },
            {
                tech_name: 'عماد الدين فتحي',
                tech_email: 'emad.tech@fixsy.com',
                price: 1900,
                rating: 4.8,
                date: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            }
        ]
    },
    {
        id: 'job-eg-102',
        title: 'صيانة فورية لتكييف كاريير 2.25 حصان (لا يبرد)',
        desc: 'التكييف يصدر هواء دافئ والكمبروسر يفصل بعد 5 دقائق. مطلوب فحص ضغط الفريون وتنظيف الفلاتر والكشف عن أي تسريب محتمل.',
        budget: 450,
        location: 'المعادي - شارع النصر',
        client_name: 'د. ياسمين الشريف',
        client_email: 'yasmin.sh@yahoo.com',
        status: 'open',
        category: 'ac',
        urgency: 'urgent',
        date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        offers: [
            {
                tech_name: 'أحمد وجدي',
                tech_email: 'ahmed.wagdy@fixsy.com',
                price: 400,
                rating: 4.95,
                date: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
            }
        ]
    },
    {
        id: 'job-eg-103',
        title: 'تركيب لوحة قواطع كهربائية ومفاتيح شنايدر',
        desc: 'تجميع لوحة كهرباء رئيسية 18 خط وتركيب مفتاح تفاضلي لحماية الأحمال الزائدة وتوزيع الإنارة والمكيفات باحترافية.',
        budget: 750,
        location: 'الشيخ زايد - الحي الثامن',
        client_name: 'كابتن هاني سليم',
        client_email: 'hani.salim@outlook.com',
        status: 'open',
        category: 'electricity',
        date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        offers: []
    },
    {
        id: 'job-eg-104',
        title: 'تصليح باب خشب زان وتعديل شباك ألوميتال جرار',
        desc: 'الباب يحك بالأرضية بسبب هبوط المفصلات، والشباك الجرار يحتاج تغيير عجلات مجرى وتزييت الترس الداخلي.',
        budget: 350,
        location: 'مدينة نصر - عباس العقاد',
        client_name: 'أحمد ممدوح (عميل)',
        client_email: 'client.demo@fixsy.com',
        status: 'open',
        category: 'carpentry',
        date: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
        offers: [
            {
                tech_name: 'أسطى كرم النجار',
                tech_email: 'karam.wood@fixsy.com',
                price: 320,
                rating: 4.85,
                date: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
            }
        ]
    },
    {
        id: 'job-eg-105',
        title: 'دهان نقاشة شقة 120م جوتن فينوماستيك نصف لمعة',
        desc: 'معجنة وتجليخ الحوائط وجهين ودهان بطانة وطبقتين تشطيب نهائي مع عزل السقف، الخامات متوفرة والمطلوب مصنعية فقط.',
        budget: 4200,
        location: 'الدقي - بجوار نادي الصيد',
        client_name: 'أ. نورهان المهدي',
        client_email: 'nourhan.m@gmail.com',
        status: 'open',
        category: 'painting',
        date: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        offers: [
            {
                tech_name: 'سامح النقاش',
                tech_email: 'sameh.paint@fixsy.com',
                price: 3900,
                rating: 4.75,
                date: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
            },
            {
                tech_name: 'فريق الإتقان للديكور',
                tech_email: 'decor.itqan@fixsy.com',
                price: 4100,
                rating: 4.9,
                date: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
            }
        ]
    }
];

export const DEMO_BOOKINGS: DemoBookingRequest[] = [
    {
        id: 'book-eg-201',
        technician_name: 'محمد سعد',
        technician_email: 'mohamed.saad@fixsy.com',
        technician_id: 'tech_saad_1',
        technician_phone: '01012345678',
        client_name: 'أحمد محمود',
        client_email: 'client.demo@fixsy.com',
        service_type: 'plumbing',
        price: 350,
        discount: 50,
        date: new Date(Date.now() - 3600 * 1000).toISOString(),
        scheduledDate: 'اليوم، 04:30 مساءً',
        status: 'in_progress',
        problem_desc: 'صيانة فورية لتسريب محبس زاوية أسفل حوض المطبخ وتغيير الوصلة المرنة الإيطالية',
        client_address: 'عمارة 14، شارع التسعين الشمالي، التجمع الخامس',
        tech_location: { lat: 30.0285, lng: 31.4721 },
        location: { lat: 30.0298, lng: 31.4745 }
    },
    {
        id: 'book-eg-202',
        technician_name: 'أحمد وجدي',
        technician_email: 'ahmed.wagdy@fixsy.com',
        technician_id: 'tech_wagdy_2',
        technician_phone: '01198765432',
        client_name: 'أحمد محمود',
        client_email: 'client.demo@fixsy.com',
        service_type: 'ac',
        price: 850,
        date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        scheduledDate: 'أمس، 02:00 ظهراً',
        status: 'completed',
        problem_desc: 'تنظيف شامل للوحدة الداخلية والخارجية وشحن فريون R410A أصلي مع قياس الأمبير',
        client_address: 'برج الأطباء، شارع النصر، المعادي',
        client_rating: 5,
        client_comment: 'فني ممتاز ومحترم جداً، حضر في الميعاد بدقة والشغل عالي الجودة وبفاتورة وضمان.',
        reviewTimestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
    },
    {
        id: 'book-eg-203',
        technician_name: 'محمود حسن',
        technician_email: 'mahmoud.electric@fixsy.com',
        technician_id: 'tech_electric_3',
        technician_phone: '01234567890',
        client_name: 'أحمد محمود',
        client_email: 'client.demo@fixsy.com',
        service_type: 'electricity',
        price: 500,
        date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        scheduledDate: 'اليوم، 06:00 مساءً',
        status: 'on_way',
        problem_desc: 'فحص انقطاع الكهرباء المفاجئ عن غرف النوم وتغيير قاطع أتوماتيك محترق',
        client_address: 'كمبوند بيفرلي هيلز، الشيخ زايد',
        tech_location: { lat: 30.0489, lng: 30.9854 },
        location: { lat: 30.0512, lng: 30.9912 }
    }
];

export const DEMO_TECH_STATS = {
    weeklyEarnings: [
        { name: 'السبت', fullDate: 'السبت', amount: 850 },
        { name: 'الأحد', fullDate: 'الأحد', amount: 1200 },
        { name: 'الإثنين', fullDate: 'الإثنين', amount: 1650 },
        { name: 'الثلاثاء', fullDate: 'الثلاثاء', amount: 1100 },
        { name: 'الأربعاء', fullDate: 'الأربعاء', amount: 2100 },
        { name: 'الخميس', fullDate: 'الخميس', amount: 2450 },
        { name: 'الجمعة', fullDate: 'الجمعة', amount: 950 }
    ],
    totalBalance: 3850,
    totalCompletedOrders: 34,
    rating: 4.92,
    completionRate: '98%'
};
