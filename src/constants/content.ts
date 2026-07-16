import type { SiteContent } from '../types';

export const SITE_CONTENT: SiteContent = {
  navLinks: [
    { label: 'Experiences', href: '#experiences', page: 'experiences' },
    { label: 'Product', href: '#products', page: 'products' },
    { label: 'Discover', href: '#discover', page: 'discover' },
    { label: 'Membership', href: '#membership', page: 'membership' },
    { label: 'About', href: '#about', page: 'about' },
  ],

  experiences: {
    hero: {
      heading: 'Double the Thrill',
      subheading: {
        TH:"เอกสิทธิ์พิเศษเพื่อช่วงเวลาแห่งความประทับใจ",
        ENG:'Exclusive Privileges for Couples.',
      }
      ,
    },
    cards: [
      {
        id: 'e1',
        image: '/img/exp-cycling.jpg',
        imageColor: '#4a7c59',
        discount: 5,
        discountNote: 'ราคาสมาชิกระดับ Silver',
        title: 'เที่ยวสะเน่พ่อง–เกาะสะเดิ้ง',
        tags: ['#ท่องกรรม', '#ทุ่งทะเล'],
        duration: '2 วัน',
        price: 3000,
        description: 'สัมผัสคุณค่าการเดินทางธรรมชาติอย่างแท้จริง',
      },
      {
        id: 'e2',
        image: '/img/exp-bug.jpg',
        imageColor: '#3d6b47',
        discount: 20,
        discountNote: 'กรมการเรียนรู้เป็นเรือง',
        title: 'โลกของแมลง',
        tags: ['#ท่องกรรม', '#สวนปิดเภา'],
        duration: '3 ชั่วโมง',
        price: 999,
        description: 'เน้นการสัมผัสจริง เปิดโลกทัศน์ใหม่ให้กับเด็กและผู้ใหญ่',
      },
      {
        id: 'e3',
        image: '/img/exp-waterfall.jpg',
        imageColor: '#2d5a3d',
        discount: 5,
        discountNote: 'ราคาสมาชิกระดับ Silver',
        title: 'BKJ Tour',
        tags: ['#ท่องกรรม', '#บางกะเจ้า'],
        duration: '12 ชั่วโมง',
        price: 1390,
        description: 'ทัวร์มางทะเจ้า มุมลับจากชาวพื้นที่',
      },
      {
        id: 'e4',
        image: '/img/exp-reptile.jpg',
        imageColor: '#3a6b2f',
        discount: 20,
        discountNote: 'กรมการเรียนรู้เป็นเรือง',
        title: 'โลกของสัตว์เลื้อยคลาน',
        tags: ['#ท่องกรรม', '#สวนมั่งคั่ง'],
        duration: '3 ชั่วโมง',
        price: 999,
        description: 'เน้นการสัมผัสจริง เปิดโลกทัศน์ใหม่ให้กับเด็กและผู้ใหญ่',
      },
      {
        id: 'e5',
        image: '/img/exp-boat.jpg',
        imageColor: '#1b5e40',
        discount: 5,
        discountNote: 'ราคาสมาชิกระดับ Silver',
        title: 'เที่ยวเป็นเรือง',
        tags: ['#ท่องกรรม', '#บางกะเจ้า'],
        duration: '1 วัน',
        price: 2900,
        description: 'บันทึกความทรงจำผ่านภาพถ่าย',
      },
      {
        id: 'e6',
        image: '/img/exp-herb.jpg',
        imageColor: '#4a5e2f',
        discount: 10,
        discountNote: 'ราคาสมาชิกระดับ Gold',
        title: 'Omakase ชุมชน',
        tags: ['#ท่องกรรม', '#บางกะเจ้า'],
        duration: '2 ชั่วโมง',
        price: 1000,
        description: 'รู้จักสมุนไพรและภาอาหารชุมชน',
      },
    ],
  },

  hero: {
    TH: {
      heading: 'Tramony',
      subheading: 'ท่องเที่ยวและร่วมเป็นส่วนหนึ่งในการดูแลโลกใบนี้',
    },
    ENG: {
      heading: 'Tramony',
      subheading: 'Travel and become part of a more sustainable world.',
    }
  },

  journey: {
    heading: 'Start your Journey',
    cards: [
      { id: 'taste', title: 'Taste', href: '#taste', page: 'products' },
      { id: 'activity', title: 'Activity', href: '#activity', page: 'experiences' },
      { id: 'travel', title: 'Travel', href: '#travel' },
    ],
  },
  // ====================================================//
  natureQuote: {
    TH: {
      heading: 'เรื่องราวที่ดีที่สุด เริ่มต้นจากธรรมชาติ',
      subtext: 'พร้อมให้คุณได้สัมผัสแล้วที่นี่',
    },
    ENG: {
      heading: 'The best stories begin in nature',
      subtext: 'ready for you to experience today',
    },
  },

  pursuit: {
    TH: {
      heading: 'เปิดประสบการณ์',
      body: "สำรวจจุดหมายที่เชื่อมโยงธรรมชาติ วัฒนธรรม และชุมชนเข้าด้วยกัน ไม่ว่าจะเป็นบางกะเจ้า นครปฐม บ้านคีรีวง หรือมูลนิธิกระต่ายในดวงจันทร์ ทุกการเดินทางคือโอกาสในการค้นพบประสบการณ์ใหม่ เรียนรู้เรื่องราวของท้องถิ่น และร่วมสร้างผลกระทบเชิงบวกต่อชุมชนและสิ่งแวดล้อม",
      ctaLabel: 'สำรวจเพิ่มเติม',
      ctaHref: '#pursuit',
    },
    ENG: {
      heading: 'Discover Our Destinations',
      body: "Explore destinations where nature, culture, and communities come together. Whether cycling through Bang Kachao, experiencing the heritage of Nakhon Pathom, embracing the tranquility of Ban Khiri Wong, or supporting the Rabbit in the Moon Foundation, every journey is a chance to discover something new and leave a positive impact.",
      ctaLabel: 'Discover more',
      ctaHref: '#pursuit',
    },
  },

  luxury: {
    TH: {
      heading: 'สินค้าและกิจกรรมจากชุมชน',
      body: 'ค้นพบสินค้าท้องถิ่นและกิจกรรมที่สร้างสรรค์ร่วมกับชุมชนจากหลากหลายพื้นที่ ทุกการเลือกซื้อและทุกการเข้าร่วมกิจกรรมมีส่วนช่วยสนับสนุนอาชีพของคนในท้องถิ่น อนุรักษ์วัฒนธรรม และส่งเสริมการท่องเที่ยวอย่างยั่งยืน'
    },
    ENG: {
      heading: 'Explore Community Experiences',
      body: 'Discover a wide selection of locally crafted products and meaningful activities created together with communities. Every purchase and every experience helps support local livelihoods, preserve cultural heritage, and promote sustainable tourism.',
    },
  },
  //===============================================================//

  socialImpact: {
    TH: {
      heading: "ผลกระทบต่อสังคม",
      subheading:
        "ผลลัพธ์จากการขับเคลื่อนและร่วมมือกับชุมชนตลอดปี 2025–2026 เพื่อสร้างความยั่งยืนในทุกมิติ",
      stats: [
        {
          id: "s1",
          value: "การศึกษา\nสิ่งแวดล้อม\nระบบสาธารณะสุข",
          label: "สนับสนุนชุมชนในหลายด้าน",
          description:
            "รายได้จากการขายสินค้าและกิจกรรมจะถูกนำไปสนับสนุนชุมชนในด้านต่างๆ",
        },
        {
          id: "s2",
          value: "0",
          label: "ให้ความรู้และสร้างอาชีพให้กับคนในชุมชน(คน)",
          description: "คำนวณจากยอดขายสะสมของเว็บไซต์",
        },
        {
          id: "s3",
          value: "0",
          label: "สร้างรายได้ให้คนในชุมชน(บาท)",
          description: "จำนวนรายได้ที่สร้างให้กับคนในชุมชน",
        },
      ],
    },

    ENG: {
      heading: "Social Impact",
      subheading:
        "The outcomes of our collaboration with local communities throughout 2025–2026 to create sustainability in every dimension.",
      stats: [
        {
          id: "s1",
          value: "Education\nEnvironment\nPublic Health",
          label: "Supporting Communities in Multiple Areas",
          description:
            "Revenue from product sales and activities is used to support community development.",
        },
        {
          id: "s2",
          value: "0",
          label: "People Trained and Supported",
          description: "Calculated from cumulative website sales.",
        },
        {
          id: "s3",
          value: "0",
          label: "Income Generated (THB)",
          description: "Total income generated for the community.",
        },
      ],
    },
  },

  footer: {
    TH: {
      brand: {
        name: 'Tramony',
        tagline:
          'มุ่งเชื่อมโยงนักเดินทางเข้ากับประสบการณ์ที่มีความหมาย การเดินทางไม่ควรเป็นเพียงการพักผ่อน แต่ควรเป็นโอกาสในการเรียนรู้ สร้างความสัมพันธ์กับธรรมชาติและร่วมเป็นส่วนหนึ่งในการดูแลโลกใบนี้ ด้วยการคัดสรรประสบการณ์คุณภาพจากผู้ให้บริการที่ใส่ใจ ทั้งผู้คน ชุมชน และสิ่งแวดล้อม',
      },
      address: {
        lines: ['68/7 หมู่ 3 ตำบลบางกอบัว', 'อำเภอพระประแดง', 'จังหวัดสมุทรปราการ 10130'],
      },
      contact: {
        items: [
          { icon: 'phone', label: '+66925054994', href: 'tel:+66925054994' },
          { icon: 'email', label: 'info.learndo@gmail.com', href: 'mailto:info.learndo@gmail.com' },
          { icon: 'facebook', label: 'facebook.com/LearnDoClub', href: 'https://www.facebook.com/LearnDoClub' },
          { icon: 'line', label: '@learndo', href: 'https://line.me/R/ti/p/@learndo' },
        ],
      },
      copyright: 'Copyright © 2026 – Tramony. All rights reserved.',
    },
    ENG: {
      brand: {
        name: "Tramony",
        tagline:
          "We connect travelers with meaningful experiences. Travel should be more than just a getaway—it should be an opportunity to learn, build meaningful connections with nature, and become part of protecting our planet. We carefully curate high-quality experiences from providers who genuinely care about people, local communities, and the environment.",
      },

      address: {
        lines: [
          "68/7 Moo 3, Bang Kobua Subdistrict",
          "Phra Pradaeng District",
          "Samut Prakan 10130, Thailand",
        ],
      },

      contact: {
        items: [
          { icon: "phone", label: "+66925054994", href: "tel:+66925054994" },
          { icon: "email", label: "info.learndo@gmail.com", href: "mailto:info.learndo@gmail.com" },
          {
            icon: "facebook",
            label: "facebook.com/LearnDoClub",
            href: "https://www.facebook.com/LearnDoClub",
          },
          {
            icon: "line",
            label: "@learndo",
            href: "https://line.me/R/ti/p/@learndo",
          },
        ],
      },

      copyright: "Copyright © 2026 – Tramony. All rights reserved.",
    },
  },
};
