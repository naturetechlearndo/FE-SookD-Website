import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';

interface DiscoverPageProps {
  lang?: 'TH' | 'ENG';
  onNavigate?: (page: string) => void;
}

function driveThumb(url: string, size = 'w800'): string {
  const m = url?.match(/\/d\/([^/]+)\//);
  if (!m) return url || '';
  return `https://res.cloudinary.com/zgor0mh6/image/fetch/q_auto,f_auto/${encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`)}`;
}
function getDriveAudioUrl(url?: string): string {
  if (!url) return '';
  // ดึงรหัส ID ของไฟล์ออกจากลิงก์ Google Drive
  const m = url.match(/\/d\/([^/]+)\//);
  if (m) {
    // แปลงเป็นลิงก์ตรงสำหรับสตรีมเสียง
    return `https://drive.google.com/uc?export=download&id=${m[1]}`;
  }
  return url; // ถ้ารูปแบบไม่ใช่ Google Drive ก็คืนค่าเดิมกลับไป
}

function embedVideoUrl(url: string): string {
  if (!url) return '';
  const ytShort = url.match(/youtu\.be\/([^?]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  const ytFull = url.match(/[?&]v=([^&]+)/);
  if (ytFull) return `https://www.youtube.com/embed/${ytFull[1]}`;
  if (url.includes('facebook.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=560&show_text=false`;
  }
  const gdrive = url.match(/\/d\/([^/]+)\//);
  if (gdrive) return `https://drive.google.com/file/d/${gdrive[1]}/preview`;
  return url;
}

interface HighlightSubSection {
  sectionHeader?: string;
  sectionHeaderEn?: string;
  icon?: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  image?: string;
  exploreLabel?: string;
  exploreLabelEn?: string;
  experienceLabel?: string;
  experienceLabelEn?: string;
  experienceLink?: string;
  gameLink?: string;
  exploreLink?: string;
}

interface HighlightModal {
  subtitle?: string;
  subtitleEn?: string;
  description: string;
  descriptionEn?: string;
  image?: string;
  exploreLabel: string;
  exploreLabelEn?: string;
  exploreLink?: string;
  subSections?: HighlightSubSection[];
}

interface Highlight {
  name: string;
  nameEn: string;
  image: string;
  modal?: HighlightModal;
}

interface PlaceData {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  image2: string;
  detail: string;
  detailEn?: string;
  onlineActivity: string;
  onlineActivityEn?: string;
  onlineActivityVideo: string;
  faq: string;
  faqEn?: string;
  activityIds: string[];
  showActivityHeader?: boolean;
  highlights?: Highlight[];
  uncleAudioUrl?: string;
  uncleAudioUrlEn?: string;
}

const DISCOVER_PLACES: PlaceData[] = [
  {
    id: 'bangkachao',
    name: 'บางกะเจ้า(สมุทรปราการ)',
    nameEn: 'Bang Kachao(Samut Prakan)',
    image: 'https://drive.google.com/file/d/1dzAeWnM4dR1JSQ13wsD-a0W2CbInr8gB/view?usp=drive_link',
    image2: 'https://drive.google.com/file/d/1RhST5yKE-pvc306zZJFVIO6_3kVEpult/view?usp=drive_link',
    detail: 'ใครเบื่อห้าง อยากหาที่รีเซ็ตสมอง แนะนำให้มาปั่นจักรยานชิลๆ ที่คุ้งบางกะเจ้าเลยครับ ตอนนี้เที่ยวโคตรง่ายเพราะเขามี แอปพลิเคชันช่วยเที่ยว คอยนำทางให้ เช็กพิกัด แพลนทริปได้ในมือถือเลย ไม่มีหลงแน่นอน รอบนี้จัดมาให้เลือกตามใจชอบถึง 3 เส้นทาง 3 สไตล์ ชอบแบบไหนเลือกเลย!\n\n📌 ไฮไลท์ห้ามพลาดในทริป:\n📱 โหลดแอปฯ เดียวจบ: นำทางแม่นยำ เช็กกิจกรรมชุมชนได้แบบเรียลไทม์\n\n🗺️ 3 เส้นทางเลือกได้ตามฟีล:\nสายธรรมชาติ: ปั่นรับลม สูดโอโซน ถ่ายรูปมุมมหาชนที่ สวนศรีนครเขื่อนขันธ์\nสายกิจกรรม: ไปดูชีวิต ผึ้งชันโรง (ผึ้งจิ๋วไม่มีเหล็กไน) น่ารักและเป็นมิตรมาก\nสายวัฒนธรรม: แวะเสพประวัติศาสตร์ที่ พิพิธภัณฑ์บ้านคลองบน แล้วเดินสายไหว้พระตามวัดในพื้นที่\n\n🎨 เวิร์กช้อปทำมือสุดคราฟต์: ได้ลองทำสบู่สมุนไพร, มัดย้อมผ้าสีธรรมชาติ และทำขนมพื้นถิ่นกินเอง สนุกมาก!',
    detailEn: 'Tired of malls and looking for a mind reset? We highly recommend cycling around the green loop of Bang Kachao! Getting around is now super easy — there\'s a dedicated app to navigate, check coordinates, and plan your trip from your phone. Three routes, three styles — pick your vibe!\n\n📌 Must-See Highlights:\n📱 One app covers everything: accurate navigation and real-time community events.\n\n🗺️ 3 Routes to Choose:\nNature Ride: Pedal through fresh air and snap shots at Sri Nakhon Khuean Khan Park.\nActivity Route: Meet the adorable stingless bees (Chhannarong) — tiny, sting-free, and friendly!\nCultural Route: Explore history at Klong Bon Folk Museum and visit local temples.\n\n🎨 Craft Workshops: Make herbal soap, natural tie-dye fabric, and traditional local snacks!',
    onlineActivity: 'นี่คือไฮไลท์ทิวทัศน์และวิถีชีวิตที่คุณจะได้สัมผัส ณ \'คุ้งบางกะเจ้า\' พื้นที่สีเขียวที่ไม่ได้มีเพียงแค่ต้นไม้ แต่ยังเป็นบ้านของวิถีชีวิตที่เกื้อกูลกับธรรมชาติ มาร่วมเป็นส่วนหนึ่งที่ช่วยรักษาความเขียวขจีเหล่านี้ให้คงอยู่ ผ่านการอุดหนุนสินค้าจากชุมชนกันนะคะ',
    onlineActivityEn: 'Here are the scenic and lifestyle highlights you\'ll experience at \'Bang Kachao\' — a green urban oasis that\'s more than just trees. It\'s home to a way of life that thrives in harmony with nature. Join us in preserving this greenery by supporting community products.',
    onlineActivityVideo: 'https://drive.google.com/file/d/12TBZSZTENWerlFkd7AGOCLlB4bIzGLLB/view?usp=drive_link',
    faq: 'Q : เดินทางไปบางกะเจ้ายังไง?\n\nAns : สามารถเดินทางได้หลายวิธี\nรถสาธารณะ: นั่งรถไฟฟ้า BTS ลงสถานีบางนา แล้วต่อรถแท็กซี่หรือมอเตอร์ไซค์มาที่ "ท่าเรือวัดบางนานอก" เพื่อขึ้นเรือข้ามฟากไปฝั่งบางกะเจ้า (ท่าเรือวัดบางน้ำผึ้งนอก)\nรถยนต์ส่วนตัว: สามารถขับรถข้ามสะพานภูมิพล แล้ววิ่งตามป้ายบอกทางเข้ามายังพื้นที่บางกะเจ้าได้เลย',
    faqEn: 'Q: How do I get to Bang Kachao?\n\nAns: There are several ways:\nPublic Transport: Take BTS to Bang Na station, then take a taxi or motorcycle to \'Wat Bang Na Nok Pier\' and board the ferry to Bang Kachao (Wat Bang Nam Phueng Nok Pier).\nPrivate Car: Drive across Bhumibol Bridge and follow the signs into Bang Kachao.',
    activityIds: ['ACT010', 'ACT011', 'ACT012', 'ACT014', 'ACT015', 'ACT016', 'ACT017', 'ACT018'],
    highlights: [
      { name: 'วัดโปรดเกศเชษฐาราม', nameEn: 'Wat Prodt Ket Chettharam', image: '/img/discover-wat.jpg',
        modal: {
          description: 'วัดโปรดเกศเชษฐาราม ตั้งอยู่ที่อำเภอพระประแดง จังหวัดสมุทรปราการ สร้างขึ้นโดยได้รับอิทธิพลจากศิลปะจีนผสมไทย ในวัดมีพระอุโบสถที่งดงามและพระพุทธรูปปางมารวิชัยที่เป็นพระประธานวัด นี้ยังเป็นศูนย์รวมจิตใจของชาวบ้านในชุมชนและจัดกิจกรรมทางศาสนาเป็นประจำ',
          descriptionEn: 'Wat Prodt Ket Chettharam, located in Phra Pradaeng District, Samut Prakan Province, was built with Chinese-Thai artistic influences. The temple features a beautiful ordination hall and a Maravichai posture principal Buddha image. It is the spiritual heart of the local community and regularly hosts religious activities.',
          image: '/img/watprodgate.jpg',
          exploreLabel: 'สำรวจวัดโปรดเกศเชษฐาราม',
          exploreLabelEn: 'Explore Wat Prodt Ket Chettharam',
          exploreLink: 'https://www.google.com/maps/place/%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B8%94%E0%B9%80%E0%B8%81%E0%B8%A8%E0%B9%80%E0%B8%8A%E0%B8%A9%E0%B8%90%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1+%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AD%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87/@13.6675251,100.5286457,3a,75y,73.58h,86.74t/data=!3m8!1e1!3m6!1s9xkO6-bd1G2EheSck3iKhw!2e0!3e11!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D3.2559134984606715%26panoid%3D9xkO6-bd1G2EheSck3iKhw%26yaw%3D73.57655347349332!7i16384!8i8192!4m6!3m5!1s0x30e2a21fc18e127b:0x9ca6c7487b44a12d!8m2!3d13.66747!4d100.5287382!16s%2Fg%2F1hm2lkypq?entry=ttu&g_ep=EgoyMDI2MDcwNi4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { title: 'พระวิหาร', titleEn: 'Prayer Hall', description: 'เสริมดวงชะตา มงคล ๑๐๘ กับพระพุทธไสยาสน์', descriptionEn: 'Enhance your fortune with 108 auspicious blessings alongside the Reclining Buddha', image: '/img/pravihan.jpg', exploreLabel: 'สำรวจพระวิหาร', exploreLabelEn: 'Explore Prayer Hall',
              experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', experienceLink: 'https://bangkachao.mxrth.co/phraviharn/index.html',
              exploreLink: 'https://www.google.com/maps/place/%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B8%94%E0%B9%80%E0%B8%81%E0%B8%A8%E0%B9%80%E0%B8%8A%E0%B8%A9%E0%B8%90%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1+%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AD%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87/@13.6675734,100.5288045,3a,75y,54.18h,80.29t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgICUoo2sTg!2e10!3e11!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAFP8RcMczgHs1RIu4WeqMNQrTaNAt2yeP0-JLMEkQUSluxOkMGyHq8cWlCGh6Yy8-Kwn1B_v6kYAYy0PM-RQcYmyfqgl8xLmbZqq0y-CSaDp_YCz3u1g_G68XpGp0f-qDecrPYutkMGf%3Dw900-h600-k-no-pi9.712856614663536-ya340.17846039924973-ro0-fo100!7i7680!8i3840!4m6!3m5!1s0x30e2a21fc18e127b:0x9ca6c7487b44a12d!8m2!3d13.66747!4d100.5287382!16s%2Fg%2F1hm2lkypq?entry=ttu&g_ep=EgoyMDI2MDcwNi4wIKXMDSoASAFQAw%3D%3D',
            },
            { title: 'พระมณฑป', titleEn: 'Phra Mondop', description: 'เลี้ยงเซียมซี กับปู่ฤาษีนาคลิทธิโคดม', descriptionEn: 'Draw fortune sticks with the Hermit Sage Naga Likhit Khodom', image: '/img/pramontop.jpg', exploreLabel: 'สำรวจพระมณฑป', exploreLabelEn: 'Explore Phra Mondop',
              experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', experienceLink: 'https://bangkachao.mxrth.co/phramondop/index.html',
              exploreLink: 'https://www.google.com/maps/place/%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B8%94%E0%B9%80%E0%B8%81%E0%B8%A8%E0%B9%80%E0%B8%8A%E0%B8%A9%E0%B8%90%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1+%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AD%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87/@13.6675251,100.5286457,3a,75y,83.12h,84.79t/data=!3m7!1e1!3m5!1s9xkO6-bd1G2EheSck3iKhw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D5.2147582870416755%26panoid%3D9xkO6-bd1G2EheSck3iKhw%26yaw%3D83.12037990502836!7i16384!8i8192!4m6!3m5!1s0x30e2a21fc18e127b:0x9ca6c7487b44a12d!8m2!3d13.66747!4d100.5287382!16s%2Fg%2F1hm2lkypq?entry=ttu&g_ep=EgoyMDI2MDcwNi4wIKXMDSoASAFQAw%3D%3D',
            },
          ],
          
          
        },
        
      },
      { name: 'พิพิธภัณฑ์พื้นบ้านคลองบน', nameEn: 'Klong Bon Folk Museum', image: '/img/discover-museum.jpg',
        modal: {
          description: 'พิพิธภัณฑ์พื้นบ้านคลองบน ตั้งอยู่ที่ตำบลบางกอบัว อำเภอพระประแดง จังหวัดสมุทรปราการ ก่อตั้งโดยนายแดง ไกรสมโภช ซึ่งเป็นชาวบ้านในชุมชนที่มีความหลงใหลในการสะสมของเก่าและของโบราณที่หายาก เช่น เครื่องเงิน เครื่องลายคราม เครื่องครัว และเครื่องมือการเกษตร เพื่อเป็นแหล่งศึกษาเรียนรู้และอนุรักษ์วิถีชีวิตของชุมชนดั้งเดิม',
          descriptionEn: 'Klong Bon Folk Museum, located in Bang Kua Boa Sub-district, Phra Pradaeng District, Samut Prakan Province, was founded by Mr. Daeng Kraisomphot — a passionate local collector of antiques and rare artifacts such as silverware, blue-and-white porcelain, kitchenware, and agricultural tools. It serves as a community learning and cultural preservation center.',
          image: '/img/banklongbon.jpg',
          exploreLabel: 'สำรวจพิพิธภัณฑ์พื้นบ้านคลองบน',
          exploreLabelEn: 'Explore Klong Bon Folk Museum',
          exploreLink: 'https://www.google.com/maps/place/%E0%B8%9E%E0%B8%B4%E0%B8%9E%E0%B8%B4%E0%B8%98%E0%B8%A0%E0%B8%B1%E0%B8%93%E0%B8%91%E0%B9%8C%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B8%9A%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A5%E0%B8%AD%E0%B8%87%E0%B8%9A%E0%B8%99/@13.697497,100.5712505,3a,75y,261.34h,75.52t/data=!3m7!1e1!3m5!1sqqC1csRdY1kO6Bi5oGEkyA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D14.477671552547747%26panoid%3DqqC1csRdY1kO6Bi5oGEkyA%26yaw%3D261.3410752219753!7i16384!8i8192!4m6!3m5!1s0x30e29f79c8ec6d27:0x810fee238fe07c26!8m2!3d13.6974483!4d100.5711631!16s%2Fg%2F11gf9qbc6r?entry=ttu&g_ep=EgoyMDI2MDcwNi4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { sectionHeader: 'กิจกรรม', sectionHeaderEn: 'Activities', icon: '🏺', title: 'Visit the antiques', image: '/img/banklongbonact.jpg',
              experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', experienceLink: 'https://bangkachao.mxrth.co/museum/index.html' },
          ],
        },
      },
      { name: 'ผึ้งชันโรง', nameEn: 'Stingless Bee', image: '/img/discover-bee.jpg',
        modal: {
          subtitle: 'ต.บางน้ำผึ้ง อ.พระประแดง จ.สมุทรปราการ',
          subtitleEn: 'Bang Nam Phueng Sub-district, Phra Pradaeng District, Samut Prakan',
          description: 'สวนเกษตรดั้งเดิมในคุ้งบางกะเจ้าโดยการเลี้ยงผึ้งชันโรงได้กลายเป็นเครื่องมือทางสังคมที่บังคับให้ชุมชนต้องร่วมใจกันงดใช้สารเคมีและยาฆ่าแมลงในสวนเพื่อความอยู่รอดของผึ้ง ส่งผลให้เกิดข้อตกลงร่วมในการปกป้องพื้นที่สีเขียว คืนอากาศบริสุทธิ์และสิ่งแวดล้อมที่ปลอดภัยให้คนในชุมชน พร้อมทั้งสร้างระบบเศรษฐกิจฐานรากที่ช่วยให้ผู้สูงอายุและชาวบ้านมีรายได้เสริมที่มั่นคงจากสวนหลังบ้านของตนเองอย่างยั่งยืน',
          descriptionEn: 'In the traditional orchards of Bang Kachao, stingless bee farming has become a social tool compelling the community to collectively stop using chemicals in their gardens for the bees\' survival. This has led to a shared commitment to protect green spaces, restore clean air and a safe environment for residents, while building a grassroots economy that provides sustainable supplemental income for the elderly and locals from their own backyards.',
          image: '/img/channarong.jpg',
          exploreLabel: 'สำรวจผึ้งชันโรงบางน้ำผึ้ง',
          exploreLabelEn: 'Explore Stingless Bees, Bang Nam Phueng',
          exploreLink: 'https://www.google.com/maps/@13.6772865,100.5740957,3a,75y,76.17h,84.91t/data=!3m7!1e1!3m5!1s7EqwUULW0Xx3wrlPqVGLog!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D5.087855876007708%26panoid%3D7EqwUULW0Xx3wrlPqVGLog%26yaw%3D76.17240953897732!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI2MDcwNi4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { sectionHeader: 'กิจกรรม', sectionHeaderEn: 'Activities', title: 'Honey Crush', description: 'สัมผัสประสบการณ์เก็บน้ำผึ้ง', descriptionEn: 'Experience the honey harvesting adventure', image: '/img/channaronggame.jpg', experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', gameLink: '/games/honey-crush.html' },
          ],
        },
      },
      { name: 'ผ้ามัดย้อมบางกะเจ้า', nameEn: 'Bang Kachao Tie-Dye', image: '/img/discover-tiedye.jpg',
        modal: {
          subtitle: 'ต.บางกะเจ้า และ ต.บางกระสอบ อ.พระประแดง จ.สมุทรปราการ',
          subtitleEn: 'Bang Kachao & Bang Krasob Sub-districts, Phra Pradaeng District, Samut Prakan',
          description: 'พื้นที่ร่องสวนและป่าชายเลนดั้งเดิมในคุ้งบางกะเจ้า ซึ่งเป็นแหล่งปลูกมะม่วงน้ำดอกไม้ที่มีชื่อเสียงและมีต้นจากขึ้นหนาแน่นตามริมน้ำ พื้นที่แห่งนี้เป็นพื้นที่ต้นแบบแห่งการอนุรักษ์พันธุกรรมพืชและสร้างมูลค่าเพิ่ม ผ่านงานคราฟต์ระดับพรีเมียม โดยชาวบ้านได้เปลี่ยน "เปลือกลูกจาก" ที่เคยเป็นขยะเหลือทิ้ง และ "ใบมะม่วงน้ำดอกไม้" ที่ต้องตัดแต่งกิ่ง มาสกัดเป็นสีธรรมชาติอันเป็นอัตลักษณ์เฉพาะถิ่น สร้างรายได้เสริมให้เกษตรกรและกลุ่มสตรีในชุมชน พร้อมทั้งสร้างข้อตกลงร่วมกันในการรักษาสวนผลไม้และป่าจากดั้งเดิมไว้ ไม่ให้ถูกแปรสภาพเป็นสิ่งปลูกสร้าง เพื่อส่งต่อระบบนิเวศที่สมบูรณ์ให้คนในท้องถิ่นยั่งยืน',
          descriptionEn: 'The traditional orchards and mangrove areas of Bang Kachao — famous for Nam Dok Mai mangoes and lined with nipa palm — serve as a model for plant genetic conservation and premium craft value creation. Locals have transformed \'nipa palm peel\' (once discarded waste) and \'mango leaves\' (from pruning) into naturally-extracted dyes unique to the area, generating income for farmers and women\'s groups while upholding shared agreements to preserve the original orchards and nipa forests for a sustainable ecological inheritance.',
          image: '/img/pamudyom.jpg',
          exploreLabel: 'สำรวจผ้ามัดย้อมบางกะเจ้า',
          exploreLabelEn: 'Explore Bang Kachao Tie-Dye',
          exploreLink: 'https://www.google.com/maps/place/%E0%B8%A5%E0%B8%B9%E0%B8%81%E0%B8%88%E0%B8%B2%E0%B8%81+%E0%B8%9C%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%B1%E0%B8%94%E0%B8%A2%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B8%AA%E0%B8%B5%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4/@13.683707,100.5594704,3a,75y,255.77h,74.46t/data=!3m7!1e1!3m5!1sX9NYeWMzQGQkwp6oecgcyQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D15.53959917074532%26panoid%3DX9NYeWMzQGQkwp6oecgcyQ%26yaw%3D255.76943433802157!7i16384!8i8192!4m15!1m8!3m7!1s0x30e2a1559efd530b:0xafef3cdd2768ad8e!2z4Lil4Li54LiB4LiI4Liy4LiBIOC4nOC5ieC4suC4oeC4seC4lOC4ouC5ieC4reC4oeC4quC4teC4mOC4o-C4o-C4oeC4iuC4suC4leC4tA!8m2!3d13.6837517!4d100.5592469!10e5!16s%2Fg%2F11qlwf98v1!3m5!1s0x30e2a1559efd530b:0xafef3cdd2768ad8e!8m2!3d13.6837517!4d100.5592469!16s%2Fg%2F11qlwf98v1?entry=ttu&g_ep=EgoyMDI2MDcwNi4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { sectionHeader: 'กิจกรรม', sectionHeaderEn: 'Activities', title: 'Style Sketch', description: 'สัมผัสประสบการณการออกแบบลายที่มีแค่สำหรับคุณคนเดียว', descriptionEn: 'Experience designing a pattern that\'s exclusively yours', image: '/img/pamudyomgame.jpg', experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', gameLink: '/games/style-sketch.html' },
          ],
        },
      },
    ],
    uncleAudioUrl: '/audio/uncle-bangkachao.mp3',
    uncleAudioUrlEn: '/audio/uncle-bangkachaoEN.mp3',
  },
  {
    id: 'nakhonpathom',
    name: 'นครปฐม',
    nameEn: 'Nakhon Pathom',
    image: 'https://drive.google.com/file/d/1jtZBGbqNmgjEesiAIIAlAw5Bn1vXhre_/view?usp=drive_link',
    image2: 'https://drive.google.com/file/d/1SG17ycdENdQF2wqEuMDr1CSXnQjVGfzU/view?usp=sharing',
    detail: 'ใครบอกนครปฐมมีแค่วัดกับคาเฟ่โบราณ? ทริปนี้เราจะพาทุกคนไปสัมผัสเมืองนครปฐมในมุมใหม่ที่โฮมมี่ อบอุ่น แฝงไปด้วยความอาร์ต และที่สำคัญคือ "มาคนเดียวก็มีรูปคู่/รูปเผลอสวยๆ กลับไป" เพราะทริปนี้เรามีบริการสุดจึ้งอย่าง โปรแกรมเช่าเพื่อน (Rent a Friend) ที่จะมาเป็นทั้งตากล้อง เพื่อนคุย และคนนำเที่ยวให้เราตลอดทริป!\n\nมาดูกันว่า 1 วันในนครปฐมแบบสไตล์วินเทจ-โมเดิร์น เราไปเช็คอินที่ไหนกันบ้าง 👇\n\n🗺️ พิกัดฮีลใจ นครปฐม 1 วันเต็ม:\nมุมแรกของวัน ปักหมุดที่ พระปฐมเจดีย์ ตอนเช้า แสงสวย คนไม่เยอะ สตาร์ทวันแห่งความทรงจำได้ดีสุดๆ\n\nสายคาเฟ่ต้องเลิฟ แวะเติมความหวานที่ Ma-Toem Cafe (มาเติม คาเฟ่) และต่อด้วย Introvert Cafe กาแฟสายอาร์ตที่เต็มไปด้วยแรงบันดาลใจ\n\nเดินเล่นชิลๆ หน้า มอศิลปากร เสพศิลปะและสตรีทอาร์ตเก๋ๆ แถว กำแพงกราฟฟิตี้ ซ่อนแอบความเท่ในตัวเมืองนครปฐม\n\nตกเย็นไปนั่งตากลม ชมวิวริม แม่น้ำท่าจีน ปล่อยใจไปกับความเงียบสงบ\n\nปิดท้ายทริปด้วยการกลับมาดูแสงไฟสีทองยามค่ำคืนที่ พระปฐมเจดีย์ อีกครั้ง สวยสะกดตาจนไม่อยากกลับเลยครับ',
    detailEn: 'Who said Nakhon Pathom only has temples and vintage cafés? This trip takes you to a fresh perspective of Nakhon Pathom — homey, warm, artsy, and most importantly: \'even solo travelers come back with great couple shots and candid photos\' — because this trip features the amazing \'Rent a Friend\' program where a personal friend will be your photographer, companion, and guide throughout!\n\nHere\'s what a full day of vintage-modern Nakhon Pathom looks like 👇\n\n🗺️ Soul-Healing Spots — One Full Day:\nMorning: Start at Phra Pathom Chedi — beautiful light, fewer crowds. A perfect start to a memorable day.\n\nCafé Stop: Sweet treats at Ma-Toem Café, then artsy coffee at Introvert Café full of inspiration.\n\nStroll by Silpakorn University, admire street art and graffiti walls hiding cool vibes in the city.\n\nEvening: Sit by the Tha Chin River, let your mind drift with the peaceful calm.\n\nEnd the trip watching golden lights of Phra Pathom Chedi at night — so beautiful you won\'t want to leave.',
    onlineActivity: 'นี่คือไฮไลท์ทิวทัศน์และเรื่องราวที่คุณจะได้สัมผัส ณ \'นครปฐม\' เมืองแห่งความทรงจำที่ไม่ได้มีเพียงแค่วัดวาอาราม แต่ยังซ่อนมุมอาร์ต คาเฟ่โฮมมี่ และวิถีชีวิตผู้คนที่พร้อมโอบกอดคุณด้วยความอบอุ่น มาร่วมเติมเต็มชิ้นส่วนความทรงจำที่หายไป และออกเดินทางไปค้นหาความคิดถึงด้วยกันในทริปนี้กันนะคะ',
    onlineActivityEn: 'Here are the scenic highlights and stories you\'ll experience at \'Nakhon Pathom\' — a city of memories that\'s more than just temples. It hides art corners, homey cafés, and warm people ready to welcome you. Come fill in the missing pieces of your memories and rediscover nostalgia together on this trip.',
    onlineActivityVideo: 'https://youtu.be/-dKvtTxihgo?si=lzsBO5pxGx1Zs63-',
    faq: 'Q: สิ่งที่จะได้รับจากโปรแกรมนี้มีอะไรบ้าง?\nAns: บอกเลยว่าคุ้มสุดๆ สำหรับสายทำคอนเทนต์ เพราะคุณจะได้รับ:\nไฟล์รูปภาพสวยๆ 30+ รูป (คัดมาให้เน้นๆ)\nวิดีโอสั้นสำหรับทำ Reels / TikTok คอยเก็บโมเมนต์เผลอๆ ตลอดทริป',
    faqEn: 'Q: What do I get from this program?\nAns: Totally worth it for content creators — you\'ll receive:\n30+ beautiful curated photos\nA short video for Reels / TikTok capturing candid moments throughout the trip',
    activityIds: ['ACT019'],
    showActivityHeader: true,
    uncleAudioUrl: '/audio/uncle-nakhonpathom.mp3',
    uncleAudioUrlEn: '/audio/uncle-nakhonpathomEN.mp3',
    highlights: [
      { name: 'ทริปเที่ยว', nameEn: 'Day Trip', image: '/img/watnakhonphatom.jpg',
        modal: {
          description: 'ท่องเที่ยวนครปฐมในมุมใหม่ สัมผัสเสน่ห์เมืองประวัติศาสตร์ ทั้งวัด คาเฟ่ และวิถีชีวิตชุมชนที่อบอุ่น พร้อมบริการสุดพิเศษอย่าง โปรแกรมเช่าเพื่อน (Rent a Friend) ที่จะมาเป็นทั้งตากล้อง เพื่อนคุย และคนนำเที่ยวให้ตลอดทริป',
          descriptionEn: 'Explore Nakhon Pathom from a fresh angle — temples, cafés, and warm community life. Comes with the special \'Rent a Friend\' program featuring a personal photographer, companion, and guide for the entire trip.',
          image: '/img/nakhonphatomview.png',
          exploreLabel: 'สำรวจนครปฐม',
          exploreLabelEn: 'Explore Nakhon Pathom',
          exploreLink: 'https://www.google.com/maps/place/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%9B%E0%B8%90%E0%B8%A1%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C+%E0%B8%AD%E0%B8%B3%E0%B9%80%E0%B8%A0%E0%B8%AD%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%87%E0%B8%99%E0%B8%84%E0%B8%A3%E0%B8%9B%E0%B8%90%E0%B8%A1+%E0%B8%99%E0%B8%84%E0%B8%A3%E0%B8%9B%E0%B8%90%E0%B8%A1+73000/@13.8198123,100.0613552,3a,75y,267.5h,94.72t/data=!3m7!1e1!3m5!1sq0jjCYbeGNk0u56JyP9fHA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-4.722235715000011%26panoid%3Dq0jjCYbeGNk0u56JyP9fHA%26yaw%3D267.495748777769!7i16384!8i8192!4m6!3m5!1s0x30e2e5ea38a1b123:0xd78d5002bf4a79ee!8m2!3d13.8203947!4d100.0555474!16s%2Fg%2F11kb_p_3sx?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { sectionHeader: 'กิจกรรม', sectionHeaderEn: 'Activities', title: 'Memory Jigsaw', description: 'สัมผัสประสบการณ์ต่อจิ๊กซอวพร้อมรำลึกความหลัง', descriptionEn: 'Experience the jigsaw puzzle while reminiscing beautiful memories', image: '/img/nakornpathomhame.png',
              experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', gameLink: '/games/memory-jigsaw.html' },
          ],
        },
      },
    ],
  },
  {
    id: 'khiriwong',
    name: 'บ้านคีรีวง(นครศรีธรรมราช)',
    nameEn: 'Ban Khiriwong (Nakhon Si Thammarat)',
    image: 'https://drive.google.com/file/d/1hcoqE6vHhArhj0bpGrpqf9VuIqSd3u2E/view?usp=drive_link',
    image2: 'https://drive.google.com/file/d/1ljh0wqxRnoWJwDT_64zdHN30ZGhLgJAZ/view?usp=drive_link',
    detail: 'เปลี่ยนวันหยุดเดิมๆ มาพักผ่อนให้ธรรมชาติโอบกอดที่หมู่บ้านคีรีวง สัมผัสวิถีชีวิตสังคมเครือญาติสุดอบอุ่น สูดออกซิเจนให้เต็มปอดคู่กับคลองท่าดีและผืนป่าเขาหลวง ที่นี่คุณสามารถดีไซน์ความสุขได้ตามใจชอบถึง 3 เส้นทาง 3 สไตล์ ตอบโจทย์ทุกสายลุยและสายชิลแน่นอนครับ!\n\n📌 ไฮไลท์ห้ามพลาด:\n🏠 โฮมสเตย์เครือญาติ: นอนพักผ่อนรับไอหมอก ชมวิวภูเขา และกินอาหารพื้นบ้านปลอดสารเคมีกับชาวบ้านแท้ๆ\n\n🗺️ 3 เส้นทาง 3 สไตล์:\n\nสายชิลสัมผัสวิถี: ปั่นจักรยานรับลมเย็นๆ ชมทัศนียภาพรอบหมู่บ้าน แวะชิมผลไม้สดๆ จาก "สวนสมรม" สวนผลไม้ผสมผสานตามธรรมชาติ\n\nสายลุยท้าทาย: เดินป่าศึกษาธรรมชาติเชิงนิเวศ มุ่งสู่ "ยอดเขาหลวง" นำทางโดยอดีตพรานป่าท้องถิ่นตัวจริง\n\nสายเสพวัฒนธรรม: เรียนรู้ประวัติศาสตร์ท้องถิ่นและฟื้นฟูการร้อย "เครื่องประดับลูกปัดโบราณ" ของชุมชน\n\n🎨 เวิร์กช้อปชุมชนสุดคราฟต์: ลงมือทำ "ผ้ามัดย้อมสีธรรมชาติ" จากเปลือกมังคุดและใบไม้ในสวน พร้อมเรียนรู้การทำสบู่เปลือกมังคุดออร์แกนิก',
    detailEn: 'Switch up your usual holiday — come let nature embrace you at Khiriwong Village. Experience the warm, close-knit community lifestyle, breathe in fresh oxygen alongside Tha Di Stream and Khao Luang forest. Design your own happiness across 3 paths, 3 styles — perfect for adventurers and chill travelers alike!\n\n📌 Must-See Highlights:\n🏠 Clan Homestay: Rest in misty mountain views and enjoy chemical-free home cooking with the locals.\n\n🗺️ 3 Paths, 3 Styles:\n\nChill & Cultural Path: Cycle along cool breezes and village scenery, taste fresh fruits from \'Suan Somrom\' — a natural mixed-fruit orchard.\n\nAdventure Challenge Path: Trek through eco-nature trails toward \'Khao Luang Summit\' — guided by a real local former forest ranger.\n\nCultural Immersion Path: Learn local history and revive the craft of weaving \'ancient bead jewelry\' from the community.\n\n🎨 Community Craft Workshops: Hands-on \'natural tie-dye\' with mangosteen peel and garden leaves, plus organic mangosteen soap making.',
    onlineActivity: 'นี่คือไฮไลท์ทิวทัศน์และเรื่องราวที่คุณจะได้สัมผัส ณ \'บ้านคีรีวง\' พื้นที่สีเขียวท่ามกลางอ้อมกอดของป่าต้นน้ำเขาหลวงที่ไม่ได้มีเพียงแค่ธรรมชาติอันงดงาม แต่ยังเป็นบ้านของวิถีชีวิตแบบสังคมเครือญาติที่ร่วมกันดูแล \'สวนสมรม\' และพึ่งพาธรรมชาติอย่างเกื้อกูล มาร่วมเป็นส่วนหนึ่งที่ช่วยรักษาความเขียวขจีและต่อลมหายใจให้ป่าต้นน้ำแห่งนี้คงอยู่ ผ่านการเดินทางมาพักผ่อนในโฮมสเตย์ชุมชน แวะทำเวิร์กช้อปผ้ามัดย้อมธรรมชาติ และอุดหนุนผลิตภัณฑ์ท้องถิ่นร่วมกันนะคะ',
    onlineActivityEn: 'Here are the scenic highlights and stories you\'ll experience at \'Ban Khiriwong\' — a green oasis in the embrace of the Khao Luang watershed forest. More than just beautiful nature, it\'s home to a clan-based way of life that collectively tends the \'Suan Somrom\' in harmony with nature. Join us in preserving this greenery through homestay visits, natural tie-dye workshops, and supporting local products.',
    onlineActivityVideo: 'https://youtu.be/e55u2kzZEFk?si=FGIkrwaRxvsKV_I-',
    faq: 'Q: บริการเดินป่า "ยอดเขาหลวง" มีการจัดการอย่างไร?\nAns: เส้นทางนี้จะนำทางโดย อดีตพรานป่าท้องถิ่น และมีทีมลูกหาบชุมชนคอยดูแลสัมภาระตลอดเส้นทางครับ ความเจ๋งคือกลุ่มลูกหาบจะเข้มงวดเรื่องสิ่งแวดล้อมมาก โดยจะคอยควบคุมและขนขยะของนักท่องเที่ยวกลับลงมาทั้งหมดเพื่อไม่ให้ทำลายป่าต้นน้ำ (ราคาประมาณ 4,500 – 7,200 บาท/ท่าน รวมคนนำทาง ลูกหาบ อาหารทุกมื้อในป่า และค่าธรรมเนียมอุทยานแล้ว)',
    faqEn: 'Q: How is the \'Khao Luang Summit\' trekking service organized?\nAns: The route is guided by a local former forest ranger, with a community porter team handling luggage throughout the trail. The porter group is very strict about the environment — they collect and carry all tourist waste back down to protect the watershed forest. (Price approximately 4,500–7,200 THB/person, including guide, porters, all meals in the forest, and park entrance fees)',
    activityIds: ['ACT005_B2C', 'ACT006_B2C', 'ACT007_B2C', 'ACT008', 'ACT009'],
    highlights: [
      { name: 'สวนสมรม', nameEn: 'Suan Somrom', image: '/img/suansomrom.jpg',
        modal: {
          description: 'ระบบวนเกษตรหรือสวนผลไม้ผสมผสานตามธรรมชาติ บนพื้นที่ลาดชันเชิงเขาหลวง ต.กำโลน อ.ลานสกา จ.นครศรีธรรมราช ผืนป่าต้นน้ำอุดมสมบูรณ์ที่มีคลองท่าดีไหลผ่าน ซึ่งไม่เพียงแต่เป็นแหล่งอาหารและรายได้ของชาวบ้านในระบบสังคมเครือญาติเท่านั้น แต่ยังเป็น ต้นแบบวิถีเกษตรกรรมยั่งยืนที่สร้างผลกระทบเชิงบวก ระดับประเทศ ด้วยการพิสูจน์ว่ามนุษย์สามารถทำมาหากินเลี้ยงชีพควบคู่ไปกับการรักษาป่าต้นน้ำดั้งเดิมได้โดยไม่ทำลายระบบนิเวศ',
          descriptionEn: 'An agroforestry and natural mixed-fruit orchard system on the sloping terrain of Khao Luang, Gamlon Sub-district, Lan Saka District, Nakhon Si Thammarat. This fertile watershed with the Tha Di Stream flowing through is not only a food source and income for villagers under the clan social system, but also a nationally acclaimed model of sustainable agriculture — proving that humans can farm while preserving the original watershed forest without destroying its ecosystem.',
          image: '/img/suansomromm.jpg',
          exploreLabel: 'สำรวจสวนสมรม',
          exploreLabelEn: 'Explore Suan Somrom',
          exploreLink: 'https://www.google.com/maps/place/%E0%B8%AA%E0%B8%A7%E0%B8%99%E0%B8%AA%E0%B8%A1%E0%B8%A3%E0%B8%A1/@8.587255,99.795185,3a,75y,107.97h,90t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgIDcneu3Tg!2e10!3e11!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAFP8RcMtipAaoyNfqQqevBWSiPp-M4sPyRuWGDwD7-5XRwO7CePqrgavx8Zt65Fc2v9TnK-52Dvl6gmBOHUgEDCFhRHtxoeJZ4VZMK-88KCYr0WhlMmhhOfVqpwsx7BXmNGo2lKrlKrK%3Dw900-h600-k-no-pi0-ya107.9697147157759-ro0-fo100!7i7200!8i3600!4m6!3m5!1s0x3053afef43398d59:0xac69adec23e32c74!8m2!3d8.5141213!4d99.7901781!16s%2Fg%2F11jdh_3xxs?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { sectionHeader: 'กิจกรรม', sectionHeaderEn: 'Activities', title: 'Fruit Hunt', description: 'บุกสวนสมรมจับผิดภาพ ค้นหามังคุดผลยักษ์มันวาว และทุเรียนหนามน้ำตาลทองระดับพรีเมียม', descriptionEn: 'Raid Suan Somrom and spot the gleaming giant mangosteen and premium golden-spined durian!', image: '/img/kiriwongfind.jpg',
              experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', gameLink: '/games/fruit-hunt.html' },
          ],
        },
      },
      { name: 'ที่เที่ยวเขาหลวง', nameEn: 'Khao Luang', image: '/img/kaoluang.jpg',
        modal: {
          description: 'เริ่มจากวิกฤตอุทกภัยปี 2531 ที่ชาวบ้านขาดรายได้และเสี่ยงเสียที่ดินให้ทุนนอก แกนนำและผู้เฒ่าผู้แก่จึงใช้ระบบ \'เครือญาติ\' ตั้ง \'ศูนย์ท่องเที่ยวเชิงอนุรักษ์บ้านคีรีวง\' เพื่อพึ่งพาตนเองและกระจายงานอย่างเป็นธรรม: บ้านว่างทำโฮมสเตย์รักษาวิวดั้งเดิม, พรานป่าผันเป็นไกด์/ลูกหาบดูแลขยะภูเขา, กลุ่มสตรีแปรรูปผลผลิตยามราคาตกต่ำ (สบู่เปลือกมังคุด, ผ้ามัดย้อม) โดยรายได้ส่วนหนึ่งจะหักเข้า \'กองทุนกลางหมู่บ้าน\' เพื่อดูแลผู้สูงอายุ มอบทุนเด็ก และเป็นงบปกป้องคลองท่าดีและผืนป่าเขาหลวง เปลี่ยนคนในพื้นที่ให้เป็นผู้พิทักษ์',
          descriptionEn: 'Starting from the 1988 flood crisis when villagers faced income loss and risk of losing land to outside capital, community leaders and elders used the \'clan system\' to establish the \'Khiriwong Conservation Tourism Center\' for self-reliance and fair distribution: vacant homes became homestays preserving original views; forest rangers became guides and porters managing mountain waste; women\'s groups processed products during price slumps (mangosteen soap, tie-dye). Part of the income funds a \'village central fund\' for elderly care, children\'s scholarships, and protecting Tha Di Stream and Khao Luang forest — transforming local people into guardians.',
          image: '/img/kaoluangpic.jpg',
          exploreLabel: 'สำรวจเขาหลวง',
          exploreLabelEn: 'Explore Khao Luang',
          exploreLink: 'https://www.google.com/maps/place/Khao+Luang/@8.4941666,99.73,3a,75y,90t/data=!3m8!1e2!3m6!1sCIHM0ogKEICAgIC0wNSqYw!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAPNQkAFxN4pVNJIf4jB67PJ4lGw6idxH2eNgAxJ4I5hRj9qbkUKe3xeYmF24n3hVYke0YSScXkzQ5QYUxvxrbTjdGstdr4qja0DeH9cNN2sw5Cw3jBMkfr1QFqnWnaeeVwIFWaMihpc%3Dw114-h86-k-no!7i4032!8i3024!4m7!3m6!1s0x3053afd34bbb6d79:0xdec6071e305ef61e!8m2!3d8.4941666!4d99.73!10e5!16s%2Fm%2F02vxgjz?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { sectionHeader: 'กิจกรรม', sectionHeaderEn: 'Activities', title: 'Bead Stringing', description: 'สัมผัสประสบการณ์ร้อยลูกปัดที่ไม่เหมือนใครจากดีไซน์ตัวคุณเอง', descriptionEn: 'Experience the unique bead stringing activity with a design that\'s all your own', image: '/img/beadstringing.jpg',
              experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', gameLink: '/games/bead-stringing.html' },
          ],
        },
      },
    ],
    uncleAudioUrl: '/audio/uncle-khiriwong.mp3',
    uncleAudioUrlEn: '/audio/uncle-khiriwongEN.mp3',
  },
  {
    id: 'moonrabbit',
    name: 'มูลนิธิกระต่ายในดวงจันทร์(ราชบุรี)',
    nameEn: 'Moon Rabbit Foundation (Ratchaburi)',
    image: 'https://drive.google.com/file/d/1MU8r1Xp2fkSEb2Dujk6VQywh1TzcIR6C/view?usp=drive_link',
    image2: 'https://drive.google.com/file/d/1y26hSfv9Eho25A5deQSmzbRnFv9zTDZS/view?usp=drive_link',
    detail: 'รอบนี้มูลนิธิกระต่ายในดวงจันทร์อยากชวนทุกคนเปิดใจ ลองเข้าไปสัมผัสวิถีชีวิตของชาวกะเหรี่ยงดั้งเดิมที่บ้านเกาะสะเดิ่งดูสักครั้ง ที่นี่ไม่ใช่แค่ที่เที่ยวธรรมชาติทั่วไป แต่เป็นเหมือนห้องเรียนชีวิตที่ทำให้เราเข้าใจคำว่า "คนอยู่กับป่า" ของจริง ใครที่อยากหาที่รีเซ็ตตัวเอง ตัดขาดความวุ่นวาย แล้วมาลองใช้ชีวิตช้าๆ แนะนำเลยครับ\n\n☕ ผลผลิตจากป่าลึกที่คุณจะได้ลอง (และช่วยต่อลมหายใจให้ชุมชน):\nกาแฟคราฟต์ออร์แกนิกป่ามรดกโลก: กาแฟตัวนี้ได้รางวัลประกวดมาด้วยนะคราฟต์ พี่ๆ ชาวบ้านต้องเดินเท้าเข้าไปเก็บด้วยมือทีละเมล็ดใต้ร่มไม้ใหญ่ (ไม่ใช้วิธีรูดต้นให้ช้ำ) แล้วเอากลับมาคั่วเองในชุมชน ทุกจิบคือรายได้ที่ช่วยส่งน้องๆ เรียนหนังสือโดยไม่ต้องตัดไม้ทำลายป่าเพิ่มครับ\n\nพริกไทยดำป่าออร์แกนิก: ของดีที่มาจากระบบ "ไร่หมุนเวียน" ในป่าลึก ปลอดสารเคมีแบบ 100% ตัวนี้บอกเลยว่ากลิ่นหอมและรสชาติร้อนแรงเป็นเอกลักษณ์มาก เชฟร้านดังๆ แย่งกันจองเพราะไม่มีคู่แข่งในตลาดทั่วไปเลย\n\nเครื่องเทศตามฤดูกาล: มีทั้งงาขี้ม่อนดิบออร์แกนิก และขมิ้นชันผงแท้กลิ่นหอมๆ ที่ชาวบ้านเก็บเกี่ยวตามฤดูกาลและกฎของธรรมชาติแท้ๆ เอามาทำอาหารหรือดูแลสุขภาพคือดีต่อใจมากครับ',
    detailEn: 'This time, the Moon Rabbit Foundation invites everyone to open their hearts and experience the traditional Karen (Kahriang) way of life at Ban Ko Sading. This isn\'t just another nature destination — it\'s like a life classroom that helps you truly understand what \'people living with the forest\' really means. For anyone looking to reset themselves and try slow living, this is it.\n\n☕ Forest Products You\'ll Get to Try (and that help sustain the community):\nWorld Heritage Forest Organic Craft Coffee: This award-winning coffee has villagers walking into the forest to hand-pick each bean one by one under the forest canopy (no strip-picking), then roasting it themselves in the community. Every sip sends children to school without cutting down more trees.\n\nOrganic Black Forest Pepper: A gem from the \'rotational farming\' system deep in the forest — 100% chemical-free. The bold aroma and heat are uniquely its own. Fine dining chefs compete to reserve it.\n\nSeasonal Spices: Including raw organic perilla seeds and fragrant pure turmeric powder, harvested according to season and natural law.',
    onlineActivity: 'นี่คือไฮไลท์ทิวทัศน์และเรื่องราวที่คุณจะได้สัมผัส ณ \'ผืนป่ามรดกโลกทุ่งใหญ่ตะวันตก\' พื้นที่สีเขียวขจีขนาดใหญ่ที่ไม่ได้มีเพียงแค่ความอุดมสมบูรณ์ของป่าต้นน้ำ แต่ยังเป็นบ้านของวิถีชีวิตชาวกะเหรี่ยงดั้งเดิมที่อยู่ร่วมกับธรรมชาติมาอย่างเกื้อกูลผ่านระบบไร่หมุนเวียน มาร่วมเป็นส่วนหนึ่งในการปกป้องผืนป่าและส่งต่อโอกาสทางการศึกษาให้เด็กๆ ในชุมชน ผ่านการเดินทางมาเปิดโลกกับทริปสำรวจสิ่งมีชีวิตยามค่ำคืน (Herping Trip) พร้อมร่วมอุดหนุนกาแฟคราฟต์ป่าและพริกไทยดำออร์แกนิกด้วยกันนะคะ',
    onlineActivityEn: 'Here are the scenic highlights you\'ll experience in the \'Thung Yai Naresuan (West) World Heritage Forest\' — vast green wilderness that\'s more than a fertile watershed. It\'s home to the traditional Karen way of life, living in harmony with nature through rotational farming. Join us in protecting this forest and opening educational opportunities for community children — through herping trips and supporting forest craft coffee and organic black pepper.',
    onlineActivityVideo: 'https://www.facebook.com/share/v/18keGyzvdM/?mibextid=wwXIfr',
    faq: 'Q: สินค้าเด็ดที่บอกว่า "ไม่มีคู่แข่งในตลาดเลย" คืออะไร?\nAns: คือ "พริกไทยดำป่าออร์แกนิก" ครับ เม็ดพริกไทยเหล่านี้เติบโตในระบบไร่หมุนเวียนดั้งเดิมของชาวกะเหรี่ยงในเขตป่าลึก ปลอดสารเคมี 100% มีกลิ่นและรสชาติร้อนแรงเป็นเอกลักษณ์เฉพาะตัวแบบที่หาซื้อจากตลาดอุตสาหกรรมทั่วไปไม่ได้เลย เชฟระดับ Fine Dining ชอบกันมากครับ',
    faqEn: 'Q: What is the \'one-of-a-kind product with no market competition\'?\nAns: It\'s \'Organic Black Forest Pepper\'. These pepper seeds grow in the traditional rotational farming system of Karen communities deep in the forest — 100% chemical-free, with a uniquely bold aroma and heat that can\'t be found from industrial market suppliers. Fine dining chefs love it.',
    activityIds: ['ACT001', 'ACT002', 'ACT003', 'ACT004'],
    highlights: [
      { name: 'สวนมัชณิมา', nameEn: 'Suan Machhima', image: '/img/suanmachima.jpg',
        modal: {
          description: 'จากปณิธานความมุ่งมั่นในการรักษาผืนป่ามรดกโลกทุ่งใหญ่ตะวันตกอันกว้างใหญ่ มูลนิธิกระต่ายในดวงจันทร์ ร่วมกับ บริษัท เลิร์นดู วิสาหกิจเพื่อสังคม จำกัด จึงได้ส่งต่อโมเดลการเรียนรู้มาสู่ \'สวนมัชฌิมา อำเภอสวนผึ้ง จังหวัดราชบุรี\' พื้นที่เรียนรู้สิ่งแวดล้อมศึกษาและแปลงเกษตรตรรกวิทยาออร์แกนิกต้นแบบ เพื่อแก้ปัญหาภัยคุกคามรูปแบบใหม่จากกระแสสังคมเมือง ที่นี่ทำหน้าที่เป็นสะพานเชื่อมโยงคนรุ่นใหม่และคนเมืองเข้ากับรากเหง้าของธรรมชาติ พัฒนาศักยภาพผ่านผลผลิตออร์แกนิกและห้องเรียนสิ่งมีชีวิต เพื่อเปลี่ยนกรอบความคิดให้มนุษย์สามารถ \'รู้คิด รู้ทำ รู้อยู่\' และส่งต่อพลังการอนุรักษ์กลับคืนสู่ผืนป่ามรดกโลกร่วมกันอย่างยั่งยืน',
          descriptionEn: 'Inspired by the mission to preserve the vast Thung Yai Naresuan (West) World Heritage Forest, the Moon Rabbit Foundation together with Learndoo Social Enterprise Co., Ltd. has transferred the learning model to \'Suan Machhima, Suan Phueng District, Ratchaburi\' — a model environmental education and organic logic farm. This site bridges the new generation and urban dwellers back to their natural roots, developing potential through organic products and living classrooms — to shift mindsets so humans can \'think wisely, act wisely, and live wisely\' and together pass the power of conservation back to the World Heritage Forest.',
          image: '/img/suanmachimaa.jpg',
          exploreLabel: 'สำรวจสวนมัชณิมา',
          exploreLabelEn: 'Explore Suan Machhima',
          exploreLink: 'https://www.google.com/maps/place/%E0%B8%AA%E0%B8%A7%E0%B8%99%E0%B8%A1%E0%B8%B1%E0%B8%8A%E0%B8%8C%E0%B8%B4%E0%B8%A1%E0%B8%B2+%E0%B8%AA%E0%B8%A7%E0%B8%99%E0%B8%9C%E0%B8%B1%E0%B8%81%E0%B8%9C%E0%B8%A5%E0%B9%84%E0%B8%A1%E0%B9%89%E0%B8%9E%E0%B8%AD%E0%B8%94%E0%B8%B5(%E0%B8%AD%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%81%E0%B8%81%E0%B8%99%E0%B8%B4%E0%B8%81)/@13.5837527,99.2287555,3a,75y,39.54h,72.55t/data=!3m7!1e1!3m5!1sWu-0QDYTrH3VOInL2HWm5g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D17.45479352208939%26panoid%3DWu-0QDYTrH3VOInL2HWm5g%26yaw%3D39.53559686278986!7i16384!8i8192!4m6!3m5!1s0x30e359c821d5fcfd:0xf4e8ccc713643fa0!8m2!3d13.5837658!4d99.2288335!16s%2Fg%2F11pg_ntgg9?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { sectionHeader: 'กิจกรรม', sectionHeaderEn: 'Activities', title: 'Fruit Collect', description: 'สัมผัสความสดใหม่... ส่งตรงจาก \'สวนมัชณิมา\' สวนผึ้ง! มาฝึกสายตาคัดแยกผลไม้ออร์แกนิกและสินค้าแปรรูปที่เติบโตด้วยลมหายใจของผืนป่าตะวันตก!', descriptionEn: 'Experience the freshness... delivered straight from \'Suan Machhima\', Suan Phueng! Train your eyes to sort organic fruits and processed goods grown by the breath of the western forest!', image: '/img/machimagame.png',
              experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', gameLink: '/games/fruit-collect.html' },
          ],
        },
      },
      { name: 'ทุ่งใหญ่ตะวันตก', nameEn: 'Thung Yai Naresuan (West)', image: '/img/tungyai.jpg',
        modal: {
          description: 'ณ ผืนป่าลึกขนาดกว่า 1.3 ล้านไร่ ของเขตรักษาพันธุ์สัตว์ป่าทุ่งใหญ่นเรศวรด้านตะวันตก ซึ่งได้รับการยกย่องให้เป็นพื้นที่มรดกโลกทางธรรมชาติอันอุดมสมบูรณ์และเป็นต้นน้ำของแม่น้ำสายหลักของประเทศไทย ที่นี่คือบ้านของชุมชนชาวกะเหรี่ยงดั้งเดิมที่อยู่อาศัยร่วมกับป่ามานานนับร้อยปี ทว่าในปัจจุบัน ภัยคุกคามรูปแบบใหม่จากกระแสสังคมเมืองและความเจริญทางวัตถุ กำลังทำให้คนรุ่นใหม่เริ่มออกห่างจากป่าบ้านเกิด มองว่าวิถีทำกินและภูมิปัญญาดั้งเดิมของบรรพบุรุษไม่สามารถสร้างอนาคตได้ จนเริ่มสูญเสียความเข้าใจในกฎธรรมชาติและเสี่ยงต่อการเบียดเบียนผืนป่าโดยไม่รู้ตัว มูลนิธิกระต่ายในดวงจันทร์จึงร่วมกับ บริษัท เลิร์นดู วิสาหกิจเพื่อสังคม จำกัด เพื่อเป็นสะพานเชื่อมโยงคนรุ่นใหม่เข้ากับรากเหง้า พัฒนาศักยภาพและเปลี่ยนกรอบความคิดให้พวกเขาสามารถ "รู้คิด รู้ทำ รู้อยู่" ในโลกยุคปัจจุบัน เพื่อเปลี่ยนบทบาทจากผู้อยู่อาศัย ให้กลายเป็น "ผู้ร่วมรักษาผืนป่ามรดกโลกทุ่งใหญ่ตะวันตก" อย่างเต็มภาคภูมิ ภายใต้ปณิธานที่ว่า "เพราะเราคือมรดกโลกร่วมกัน"',
          descriptionEn: 'In the vast forest of over 1.3 million rai of Thung Yai Naresuan Wildlife Sanctuary (West) — recognized as a World Natural Heritage Site and headwaters of Thailand\'s major rivers — this is home to the traditional Karen community who have coexisted with this forest for hundreds of years. Today, new threats from urbanization are pulling the younger generation away from their forest homeland. The Moon Rabbit Foundation together with Learndoo Social Enterprise Co., Ltd. bridges the new generation back to their roots, developing their potential and shifting mindsets so they can \'think wisely, act wisely, and live wisely\' — transforming them from residents into proud \'co-guardians of Thung Yai Naresuan World Heritage Forest\' under the belief that \'because we are a shared world heritage.\'',
          image: '/img/westtungyai.jpg',
          exploreLabel: 'สำรวจทุ่งใหญ่ตะวันตก',
          exploreLabelEn: 'Explore Thung Yai Naresuan (West)',
          exploreLink: 'https://www.google.com/maps/place/%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%A3%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%B2%E0%B8%9E%E0%B8%B1%E0%B8%99%E0%B8%98%E0%B8%B8%E0%B9%8C%E0%B8%AA%E0%B8%B1%E0%B8%95%E0%B8%A7%E0%B9%8C%E0%B8%9B%E0%B9%88%E0%B8%B2%E0%B8%97%E0%B8%B8%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B8%8D%E0%B9%88%E0%B8%99%E0%B9%80%E0%B8%A3%E0%B8%A8%E0%B8%A7%E0%B8%A3/@15.3647688,98.8795248,10.5z/data=!4m6!3m5!1s0x30e6c3fa7e9a780b:0x76febcad4c39a70c!8m2!3d15.3333647!4d98.9164846!16zL20vMDQ3bG1w?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
          subSections: [
            { sectionHeader: 'กิจกรรม', sectionHeaderEn: 'Activities', title: 'Find Item', description: 'ภายในทุ่งใหญ่ตะวันตกมี ผลิตภัณฑ์ของกลุ่มเหม่ยละ ซ่อนอยู่ลองหาให้เจอสิ', descriptionEn: 'Hidden within Thung Yai Naresuan (West) are products from the Hmei La group — try to find them all!', image: '/img/tungyaiicon.jpg',
              experienceLabel: 'ร่วมกิจกรรม', experienceLabelEn: 'Join Activity', gameLink: '/games/find-item.html' },
          ],
        },
      },
    ],
    uncleAudioUrl: '/audio/uncle-moonrabbit.mp3',
    uncleAudioUrlEn: '/audio/uncle-moonrabbitEN.mp3',
  },
];

function parseFaq(raw: string): { q: string; a: string }[] {
  if (!raw) return [];
  const pattern = /Q\s*:\s*([\s\S]+?)(?=(?:\n\s*){0,3}Q\s*:|$)/gi;
  const results: { q: string; a: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw)) !== null) {
    const block = match[1].trim();
    const ansIdx = block.search(/Ans\s*:/i);
    if (ansIdx !== -1) {
      const q = block.slice(0, ansIdx).trim();
      const a = block.slice(ansIdx).replace(/^Ans\s*:\s*/i, '').trim();
      results.push({ q, a });
    } else {
      results.push({ q: block, a: '' });
    }
  }
  return results.filter(item => item.q);
}

export default function DiscoverPage({ lang = 'TH', onNavigate }: DiscoverPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlayingUncleAudio, setIsPlayingUncleAudio] = useState(false);

  // ฟังก์ชันสลับการ เล่น/หยุด เสียง
  const toggleUncleAudio = () => {
    if (audioRef.current) {
      if (isPlayingUncleAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingUncleAudio(!isPlayingUncleAudio);
    }
  };
  

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.action === 'shop') {
        const ids: string[] = e.data.featured ?? [];
        if (ids.length) sessionStorage.setItem('featuredProducts', JSON.stringify(ids));
        setGameUrl(null);
        onNavigate?.('products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (e.data?.action === 'experience') {
        const ids: string[] = e.data.featured ?? [];
        if (ids.length) sessionStorage.setItem('featuredActivities', JSON.stringify(ids));
        setGameUrl(null);
        onNavigate?.('experiences');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onNavigate]);

  useEffect(() => {
    if (!tabsRef.current) return;
    const tabs = tabsRef.current.querySelectorAll<HTMLElement>('.disc-tab');
    tabs.forEach(t => { t.style.width = ''; });
    const maxW = Math.max(...Array.from(tabs).map(t => t.offsetWidth));
    tabs.forEach(t => { t.style.width = maxW + 'px'; });
  }, [lang]);

  const isTH = lang === 'TH';
  const place = DISCOVER_PLACES[activeTab];
  const langSuffix = isTH ? '_TH' : '_EN';
  const activeUncleAudio = isTH ? place.uncleAudioUrl : (place.uncleAudioUrlEn || place.uncleAudioUrl);

  // สั่งให้เล่นเสียงทันทีเมื่อผู้ใช้งานเข้าหน้านี้ หรือกดเปลี่ยนแท็บมาเจอสถานที่ที่มีเสียง
  useEffect(() => {
    if (audioRef.current) {
      if (activeUncleAudio) {
        // พยายามสั่งเล่นเสียงทันที
        audioRef.current.play().catch(err => {
          // หากบราวเซอร์บล็อก จะแสดงข้อความนี้ใน Console
          console.log('บราวเซอร์บล็อก Autoplay ต้องคลิกที่หน้าเว็บก่อนถึงจะเล่นได้');
        });
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [activeTab, activeUncleAudio]);
  useEffect(() => {
    setImgIdx(0);
    setOpenFaq(null);
    if (place.activityIds.length === 0) return;
    const ids = place.activityIds.map(id => id + langSuffix);
    Promise.all(
      ids.map(id => api.activities.getOne(id).catch(() => null))
    ).then(results => setActivities(results.filter(Boolean)));
  }, [activeTab, lang]);

  const faqItems = parseFaq(isTH ? place.faq : (place.faqEn ?? place.faq));

  const actImages = activities
    .map(a => a?.image)
    .filter(Boolean);

  const IMGS_PER = 2;
  const maxImgIdx = Math.max(0, actImages.length - IMGS_PER);

  return (
    <>
      <div className="disc-page">
        {/* Hero */}
        <section className="disc-hero">
          <div className="disc-hero__overlay" />
          <div className="disc-hero__content">
            <h1 className="disc-hero__heading">Discover</h1>
          </div>
        </section>

        {/* Tabs */}
        <div className="disc-tabs-wrap">
          <div className="disc-tabs" ref={tabsRef}>
            {DISCOVER_PLACES.map((p, i) => (
              <button
                key={p.id}
                className={`disc-tab${activeTab === i ? ' disc-tab--active' : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {isTH ? p.name : p.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        {place.image ? (
          <div className="disc-main">

            {/* Staggered 2×2 grid:
                  [image1]  [empty]
                  [text]    [image2]           */}
            <div className="disc-stagger">
              <div className="disc-stagger__img1">
                <img src={driveThumb(place.image2)} alt={place.name} className="disc-strip-img" />
              </div>
              {/* 🟢 เอาโค้ดคุณลุงมาใส่แทนที่ disc-stagger__empty เดิม */}
            {place.uncleAudioUrl ? (
              <div className="disc-stagger__uncle">
                <img src="/img/uncle.png" alt="Uncle Storyteller" className="disc-uncle-img" />
                
                <button className={`disc-uncle-btn ${isPlayingUncleAudio ? 'playing' : ''}`} onClick={toggleUncleAudio}>
                  {isPlayingUncleAudio ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      {isTH ? 'หยุดฟังเรื่องเล่า' : 'Stop Story'}
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      {isTH ? 'ฟังเรื่องเล่าจากคุณลุง' : 'Listen to Uncle'}
                    </>
                  )}
                </button>

                <audio 
                  ref={audioRef} 
                  src={getDriveAudioUrl(activeUncleAudio)} 
                  autoPlay /* 🟢 สั่งให้เล่นอัตโนมัติ */
                  loop     /* 🟢 สั่งให้เล่นวนซ้ำเรื่อยๆ */
                  onPlay={() => setIsPlayingUncleAudio(true)}   /* 🟢 ซิงค์ปุ่มให้เป็นสถานะ "เล่น" */
                  onPause={() => setIsPlayingUncleAudio(false)} /* 🟢 ซิงค์ปุ่มให้เป็นสถานะ "หยุด" */
                />
              </div>
            ) : (
              <div className="disc-stagger__empty" />
            )}
            {/* 🟢 สิ้นสุดโค้ดคุณลุง */}
              <div className="disc-stagger__text">
                <h2 className="disc-place-name">{isTH ? place.name : place.nameEn}</h2>
                <div className="disc-place-detail">
                  {(isTH ? place.detail : (place.detailEn ?? place.detail)).split('\n').map((line, i) =>
                    line.trim() === '' ? <br key={i} /> : <p key={i}>{line}</p>
                  )}
                </div>
              </div>
              {place.image ? (
                <div className="disc-stagger__img2">
                  <img src={driveThumb(place.image)} alt={place.name} className="disc-strip-img" />
                </div>
              ) : (
                <div className="disc-stagger__empty" />
              )}
            </div>

            {/* Activity section */}
            {(activities.length > 0 || place.showActivityHeader) && (
              <div className="disc-section disc-activity">
                <div className="disc-activity__left">
                  <h3 className="disc-section-title">{isTH ? 'กิจกรรม' : 'Activity'}</h3>
                  <ol className="disc-act-list">
                    {activities.map((a, i) => (
                      <li key={i} className="disc-act-item">{a.name}</li>
                    ))}
                  </ol>
                  {onNavigate && (
                    <button className="disc-related-btn" onClick={() => onNavigate('experiences')}>
                      {isTH ? 'กิจกรรมที่เกี่ยวข้อง →' : 'Related Experiences →'}
                    </button>
                  )}
                </div>
                {actImages.length > 0 && (
                  <div className="disc-activity__right">
                    <div className="disc-act-img-single-wrap">
                      <img
                        src={driveThumb(actImages[imgIdx], 'w800')}
                        alt=""
                        className="disc-act-img-single"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      {/* Overlay arrows */}
                      <button
                        className="disc-arr-overlay disc-arr-overlay--left"
                        onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                        disabled={imgIdx === 0}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        className="disc-arr-overlay disc-arr-overlay--right"
                        onClick={() => setImgIdx(i => Math.min(actImages.length - 1, i + 1))}
                        disabled={imgIdx >= actImages.length - 1}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                      <div className="disc-act-img-counter">
                        {imgIdx + 1} / {actImages.length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Online Activity — text left, video right */}
            {(place.onlineActivity || place.onlineActivityVideo) && (
              <div className="disc-section disc-online">
                {(place.onlineActivity || place.onlineActivityEn) && (
                  <div className="disc-online__text">
                    <h3 className="disc-section-title">{isTH ? 'กิจกรรมออนไลน์' : 'Online Activity'}</h3>
                    <p className="disc-online-body">{isTH ? place.onlineActivity : (place.onlineActivityEn ?? place.onlineActivity)}</p>
                  </div>
                )}
                {place.onlineActivityVideo && (
                  <div className="disc-video-wrap">
                    <iframe
                      src={embedVideoUrl(place.onlineActivityVideo)}
                      className="disc-video"
                      allow="autoplay"
                      allowFullScreen
                      title="Online Activity Video"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Highlights grid */}
            {place.highlights && place.highlights.length > 0 && (
              <div className="disc-section disc-highlights">
                <h3 className="disc-section-title">{isTH ? 'ไฮไลท์' : 'Highlights'}</h3>
                <div className="disc-highlights-grid">
                  {place.highlights.map((h, i) => (
                    <div key={i} className="disc-highlight-card">
                      <img src={h.image} alt={isTH ? h.name : h.nameEn} className="disc-highlight-img" />
                      <button className="disc-highlight-btn" onClick={() => h.modal && setActiveHighlight(h)}>{isTH ? h.name : h.nameEn}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {faqItems.length > 0 && (
              <div className="disc-section disc-faq">
                <h3 className="disc-section-title">FAQ</h3>
                <div className="disc-faq-list">
                  {faqItems.map((item, i) => (
                    <div key={i} className="disc-faq-item">
                      <button
                        className="disc-faq-q"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span>Q : {item.q}</span>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {openFaq === i && (
                        <div className="disc-faq-a">
                          {item.a.split('\n').map((line, j) => (
                            <p key={j}>{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="disc-coming-soon">
            <p>{isTH ? 'กำลังเตรียมข้อมูล...' : 'Coming soon...'}</p>
          </div>
        )}

        {/* Discover More */}
        <div className="disc-more">
          <h3 className="disc-more-title">{isTH ? 'สำรวจเพิ่มเติม' : 'Discover More'}</h3>
          <div className="disc-more-cards">
            {DISCOVER_PLACES.filter((_, i) => i !== activeTab && DISCOVER_PLACES[i].image).map((p, i) => (
              <div key={p.id} className="disc-more-card" onClick={() => {
                const idx = DISCOVER_PLACES.findIndex(x => x.id === p.id);
                setActiveTab(idx);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>
                <div className="disc-more-card__img-wrap">
                  <img src={driveThumb(p.image, 'w400')} alt={p.name} className="disc-more-card__img"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <p className="disc-more-card__name">{isTH ? p.name : p.nameEn}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer data={c.footer[lang]} />

      {/* Highlight modal */}
      {activeHighlight?.modal && (
        <div className="hlmodal-overlay" onClick={() => setActiveHighlight(null)}>
          <div className="hlmodal" onClick={e => e.stopPropagation()}>
            <button className="hlmodal-back" onClick={() => setActiveHighlight(null)}>
              ‹ {isTH ? 'กลับ' : 'Back'}
            </button>
            <h2 className="hlmodal-title">{isTH ? activeHighlight.name : activeHighlight.nameEn}</h2>
            {activeHighlight.modal.subtitle && <p className="hlmodal-subtitle">📍 {isTH ? activeHighlight.modal.subtitle : (activeHighlight.modal.subtitleEn ?? activeHighlight.modal.subtitle)}</p>}
            <div className="hlmodal-divider" />

            {/* Main section */}
            <div className="hlmodal-main">
              {activeHighlight.modal.image && (
                <img src={activeHighlight.modal.image} alt={activeHighlight.name} className="hlmodal-main-img" />
              )}
              <div className="hlmodal-main-body">
                <p className="hlmodal-desc">{isTH ? activeHighlight.modal.description : (activeHighlight.modal.descriptionEn ?? activeHighlight.modal.description)}</p>
                <button className="hlmodal-explore-btn" onClick={() => activeHighlight.modal!.exploreLink && window.open(activeHighlight.modal!.exploreLink, '_blank')}>
                  <span className="hlmodal-explore-icon">📍</span>
                  {isTH ? activeHighlight.modal.exploreLabel : (activeHighlight.modal.exploreLabelEn ?? activeHighlight.modal.exploreLabel)}
                </button>
              </div>
            </div>

            {/* Sub-sections */}
            {activeHighlight.modal.subSections?.map((sub, i) => (
              <div key={i}>
                {sub.sectionHeader && <h3 className="hlmodal-section-header">{isTH ? sub.sectionHeader : (sub.sectionHeaderEn ?? sub.sectionHeader)}</h3>}
                <div className="hlmodal-sub">
                {sub.image && <img src={sub.image} alt={isTH ? sub.title : (sub.titleEn ?? sub.title)} className="hlmodal-sub-img" />}
                <div className="hlmodal-sub-body">
                  <h3 className="hlmodal-sub-title">{sub.icon ? `${sub.icon} ` : ''}{isTH ? sub.title : (sub.titleEn ?? sub.title)}</h3>
                  {(sub.description || sub.experienceLabel) && (
                    <div className="hlmodal-sub-row">
                      {sub.description && <p className="hlmodal-sub-desc">{isTH ? sub.description : (sub.descriptionEn ?? sub.description)}</p>}
                      {(isTH ? sub.experienceLabel : (sub.experienceLabelEn ?? sub.experienceLabel)) && (
                        <button className="hlmodal-exp-btn" onClick={() => {
                          if (sub.gameLink) { setActiveHighlight(null); setGameUrl(sub.gameLink + (!isTH ? '?lang=ENG' : '')); }
                          else if (sub.experienceLink) window.open(sub.experienceLink, '_blank');
                        }}>
                          {isTH ? sub.experienceLabel : (sub.experienceLabelEn ?? sub.experienceLabel)} ›
                        </button>
                      )}
                    </div>
                  )}
                  {(isTH ? sub.exploreLabel : (sub.exploreLabelEn ?? sub.exploreLabel)) && (
                    <button className="hlmodal-explore-btn" style={{width:'100%',marginTop:'.7rem'}} onClick={() => sub.exploreLink && window.open(sub.exploreLink, '_blank')}>{isTH ? sub.exploreLabel : (sub.exploreLabelEn ?? sub.exploreLabel)}</button>
                  )}
                </div>
                </div>
              </div>
            ))}

            <div className="hlmodal-footer">
              {onNavigate && (
                <button className="hlmodal-related-btn" onClick={() => { setActiveHighlight(null); onNavigate('experiences'); }}>
                  {isTH ? 'กิจกรรมที่เกี่ยวข้อง' : 'Related Experiences'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game overlay */}
      {gameUrl && (
        <div className="game-overlay">
          <div className="game-modal">
            <button className="game-back" onClick={() => setGameUrl(null)}>
              ‹ {isTH ? 'กลับ' : 'Back'}
            </button>
            <iframe
              src={gameUrl}
              className="game-frame"
              title="Mini Game"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    
    </>
  );
}

export const DISCOVER_CSS = `
.disc-page { padding-top: 64px; }

/* Hero */
.disc-hero {
  position: relative; height: 320px;
  background: url('/img/exp-cycling.jpg') center/cover no-repeat;
  background-color: #1b3a2d;
  display: flex; align-items: center; justify-content: flex-start;
}
.disc-hero__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1));
}
.disc-hero__content { position: relative; z-index: 1; padding: 0 8%; }
.disc-hero__heading {
  font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 800;
  color: #fff; letter-spacing: -.01em;
}

/* Tabs */
.disc-tabs-wrap {
  display: flex; justify-content: center;
  padding: 1.8rem 5% 0; background: #fff;
}
.disc-tabs {
  display: flex; flex-wrap: wrap; justify-content: center;
  border: 1.5px solid #c8b89a; border-radius: 4px; overflow: hidden;
}
.disc-tab {
  white-space: nowrap;
  padding: .55rem 1.8rem;
  border: none; border-right: 1.5px solid #c8b89a;
  background: #EDE8DE;
  color: #5a4a3a; font-size: .88rem; font-weight: 500;
  cursor: pointer; transition: all .2s;
  font-family: var(--font-th);
}
.disc-tab:last-child { border-right: none; }
.disc-tab--active {
  background: var(--forest); color: #fff; font-weight: 600;
}
.disc-tab:hover:not(.disc-tab--active) {
  background: #d8cfc2;
}

/* Main */
.disc-main { }

/* Staggered 2×2 grid */
.disc-stagger {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 440px auto;
  margin-top: 2rem; /* 2 cm gap from tabs */
}
.disc-stagger__img1 { grid-column: 1; grid-row: 1; overflow: hidden; }
.disc-stagger__empty { grid-column: 2; grid-row: 1; background: #fff; }
.disc-stagger__text {
  grid-column: 1; grid-row: 2;
  display: flex; flex-direction: column; justify-content: center;
  padding: 2.5rem 5% 2.5rem 8%;
  background: #fff;
}
.disc-stagger__img2 { grid-column: 2; grid-row: 2; overflow: hidden; min-height: 400px; }
.disc-strip-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.disc-place-name {
  font-size: 1.8rem; font-weight: 700; color: var(--text);
  font-family: var(--font-th); margin-bottom: .8rem;
}
.disc-place-detail {
  font-size: .95rem; color: #444; line-height: 1.9;
  font-family: var(--font-th);
}

/* Sections */
.disc-section {
  max-width: 1100px; margin: 0 auto;
  padding: 2rem 5%;
  border-top: 1px solid #eee;
}
.disc-section-title {
  font-size: 1.25rem; font-weight: 700; color: var(--text);
  margin-bottom: 1.2rem; padding-bottom: .5rem;
  border-bottom: 2px solid var(--forest);
  display: inline-block;
}

/* Activity */
.disc-activity {
  display: grid; grid-template-columns: 1fr 1.4fr; gap: 2rem;
  align-items: start;
}
.disc-activity__left { padding-top: 2cm; }
.disc-act-list {
  list-style: decimal; padding-left: 1.4rem;
  font-family: var(--font-th); font-size: .92rem;
  color: #444; line-height: 2;
}
.disc-act-item {}
.disc-related-btn {
  margin-top: 1rem; background: none; border: none;
  color: var(--forest); font-size: .88rem; font-weight: 600;
  cursor: pointer; padding: 0; font-family: var(--font-th);
  text-decoration: underline; text-underline-offset: 3px;
}
.disc-related-btn:hover { color: #1a3d2e; }

/* Activity carousel — single large image, arrows overlaid */
.disc-act-img-single-wrap {
  position: relative; border-radius: 14px; overflow: hidden;
  aspect-ratio: 16/9; background: #e0e8e0; width: 100%;
  margin-top: 0.3cm; margin-left: 2cm;
}
.disc-act-img-single { width: 100%; height: 100%; object-fit: cover; display: block; }
.disc-act-img-counter {
  position: absolute; bottom: .6rem; right: .8rem;
  background: rgba(0,0,0,.45); color: #fff;
  font-size: .78rem; padding: .2rem .6rem; border-radius: 20px;
  pointer-events: none;
}
.disc-arr-overlay {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,.7); border: none; border-radius: 50%;
  width: 38px; height: 38px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #333; transition: background .2s; z-index: 2;
}
.disc-arr-overlay:hover:not(:disabled) { background: rgba(255,255,255,.95); }
.disc-arr-overlay:disabled { opacity: .3; cursor: default; }
.disc-arr-overlay--left  { left: .7rem; }
.disc-arr-overlay--right { right: .7rem; }

.disc-arrow {
  background: none; border: 1.5px solid #ddd; border-radius: 50%;
  width: 36px; height: 36px; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #555; transition: all .2s;
}
.disc-arrow:hover:not(:disabled) { border-color: var(--forest); color: var(--forest); }
.disc-arrow:disabled { opacity: .3; cursor: default; }

/* Online Activity section — text beside video */
.disc-online {
  display: grid; grid-template-columns: 1fr 1.4fr;
  gap: 2.5rem; align-items: center;
}
.disc-online__text {}
.disc-online-body {
  font-size: .92rem; color: #444; line-height: 1.85;
  font-family: var(--font-th); margin-top: .8rem;
}
.disc-video-wrap {
  border-radius: 14px; overflow: hidden;
  aspect-ratio: 16/9; background: #111;
  margin-left: 2cm;
}
.disc-video { width: 100%; height: 100%; border: none; display: block; }

/* Highlights */
.disc-highlights-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem; margin-top: .5rem;
}
.disc-highlight-card {
  display: flex; flex-direction: column; align-items: center; gap: .8rem;
}
.disc-highlight-img {
  width: 100%; aspect-ratio: 1/1; object-fit: contain;
}
.disc-highlight-btn {
  background: none; border: 1.5px solid #c8b89a; border-radius: 50px;
  padding: .4rem 1.1rem; cursor: pointer;
  font-size: .9rem; font-weight: 600; color: var(--text);
  font-family: var(--font-th); text-align: center; line-height: 1.4;
  transition: background .2s, border-color .2s;
}
.disc-highlight-btn:hover { background: #EDE8DE; border-color: #a89880; }

/* FAQ */
.disc-faq-list { display: flex; flex-direction: column; gap: .5rem; }
.disc-faq-item {
  border: 1px solid #e0d8cc; border-radius: 10px; overflow: hidden;
}
.disc-faq-q {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.2rem; background: #faf8f4;
  border: none; cursor: pointer; text-align: left;
  font-size: .92rem; font-weight: 600; color: var(--text);
  font-family: var(--font-th); gap: 1rem;
}
.disc-faq-q:hover { background: #f0ece4; }
.disc-faq-a {
  padding: .9rem 1.2rem 1rem; background: #fff;
  border-top: 1px solid #e0d8cc;
  font-size: .88rem; color: #555; line-height: 1.8;
  font-family: var(--font-th);
}
.disc-faq-a p { margin: 0 0 .4rem; }
.disc-faq-a p:last-child { margin-bottom: 0; }

/* Coming soon */
.disc-coming-soon {
  text-align: center; padding: 5rem 2rem;
  font-size: 1.1rem; color: #888; font-family: var(--font-th);
}

/* Discover More */
.disc-more {
  max-width: 1100px; margin: 0 auto; padding: 3rem 5%;
  border-top: 1px solid #eee;
}
.disc-more-title {
  font-size: 1.4rem; font-weight: 700; color: var(--text);
  text-align: center; margin-bottom: 1.8rem;
}
.disc-more-cards {
  display: flex; gap: 1.2rem; justify-content: center; flex-wrap: wrap;
}
.disc-more-card {
  width: 200px; cursor: pointer; text-align: center;
  transition: transform .2s;
}
.disc-more-card:hover { transform: translateY(-4px); }
.disc-more-card__img-wrap {
  border-radius: 12px; overflow: hidden;
  aspect-ratio: 3/2; background: #e0e8e0; margin-bottom: .6rem;
}
.disc-more-card__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.disc-more-card__name {
  font-size: .9rem; font-weight: 600; color: var(--text);
  font-family: var(--font-th);
}

/* Game overlay */
.game-overlay {
  position: fixed; inset: 0; z-index: 1100;
  background: rgba(0,0,0,.7);
  display: flex; align-items: center; justify-content: center;
}
.game-modal {
  width: min(96vw, 520px);
  height: min(96vh, 700px);
  background: #0C0400;
  border-radius: 16px;
  overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 8px 40px rgba(0,0,0,.6);
}
.game-back {
  flex-shrink: 0;
  background: none; border: none;
  color: #FFE082; padding: .6rem 1rem;
  font-size: .9rem; cursor: pointer;
  text-align: left;
  font-family: var(--font-th);
}
.game-back:hover { color: #FFD54F; }
.game-frame {
  flex: 1; border: none; width: 100%;
}

/* Highlight Modal */
.hlmodal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.35);
  display: flex; align-items: flex-start; justify-content: center;
  overflow-y: auto; padding: 2rem 1rem;
}
.hlmodal {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 760px;
  padding: 2rem 2.5rem 2.5rem;
  position: relative;
}
.hlmodal-back {
  background: none; border: 1.5px solid #ccc; border-radius: 50px;
  padding: .35rem 1rem; cursor: pointer;
  font-size: .88rem; color: #555;
  display: flex; align-items: center; gap: .3rem;
  margin-bottom: 1.2rem;
}
.hlmodal-back:hover { border-color: var(--forest); color: var(--forest); }
.hlmodal-title {
  font-size: 1.5rem; font-weight: 700; color: var(--text);
  font-family: var(--font-th); margin-bottom: .3rem;
}
.hlmodal-subtitle {
  font-size: .88rem; color: #888; font-family: var(--font-th);
  margin-bottom: .8rem;
}
.hlmodal-divider { border: none; border-top: 1.5px solid #e0d8cc; margin-bottom: 1.5rem; }
.hlmodal-main {
  display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 2rem;
}
.hlmodal-main-img {
  width: 280px; flex-shrink: 0; border-radius: 10px;
  object-fit: cover; aspect-ratio: 4/3;
}
.hlmodal-main-body { flex: 1; }
.hlmodal-desc {
  font-size: .92rem; color: #444; line-height: 1.85;
  font-family: var(--font-th); margin-bottom: 1.2rem;
}
.hlmodal-explore-btn {
  width: 100%; padding: .85rem 1.5rem;
  background: var(--forest); color: #fff; border: none; border-radius: 50px;
  font-size: .95rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: .6rem;
  font-family: var(--font-th); transition: background .2s;
}
.hlmodal-explore-btn:hover { background: #1a3d2e; }
.hlmodal-sub {
  display: flex; gap: 1.5rem; align-items: flex-start;
  padding: 1.5rem 0; border-top: 1px solid #eee;
}
.hlmodal-sub-img {
  width: 180px; flex-shrink: 0; border-radius: 10px;
  object-fit: contain; background: #e0e8e0;
}
.hlmodal-section-header {
  font-size: 1rem; font-weight: 700; color: var(--forest);
  font-family: var(--font-th); margin: 1rem 0 .5rem;
  text-transform: uppercase; letter-spacing: .05em;
}
.hlmodal-sub-body { flex: 1; }
.hlmodal-sub-title {
  font-size: 1.1rem; font-weight: 700; color: var(--text);
  font-family: var(--font-th); margin-bottom: .6rem;
}
.hlmodal-sub-desc {
  font-size: .88rem; color: #666; line-height: 1.7;
  font-family: var(--font-th); margin-bottom: 1rem;
}
.hlmodal-sub-row {
  display: flex; align-items: center; gap: 1rem;
  justify-content: space-between;
}
.hlmodal-sub-row .hlmodal-sub-desc { margin-bottom: 0; flex: 1; }
.hlmodal-exp-btn {
  background: none; border: 1.5px solid var(--forest); border-radius: 50px;
  padding: .6rem 1.2rem; color: var(--forest);
  font-size: .88rem; font-weight: 600; cursor: pointer;
  font-family: var(--font-th); text-align: left;
  transition: background .2s;
}
.hlmodal-exp-btn:hover { background: #f0f5f0; }
.hlmodal-footer {
  display: flex; justify-content: flex-end; padding-top: 1.5rem;
  border-top: 1px solid #eee; margin-top: 1rem;
}
.hlmodal-related-btn {
  background: var(--forest); color: #fff; border: none; border-radius: 50px;
  padding: .75rem 1.8rem; font-size: .92rem; font-weight: 600;
  cursor: pointer; font-family: var(--font-th); transition: background .2s;
}
.hlmodal-related-btn:hover { background: #1a3d2e; }

/* Responsive */
@media (max-width: 768px) {
  .disc-stagger {
    grid-template-columns: 1fr;
    grid-template-rows: 280px auto auto 280px;
  }
  .disc-stagger__img1  { grid-column: 1; grid-row: 1; }
  .disc-stagger__empty { display: none; }
  .disc-stagger__text  { grid-column: 1; grid-row: 2; padding: 1.5rem 5%; }
  .disc-stagger__img2  { grid-column: 1; grid-row: 3; min-height: 280px; }
  .disc-activity { grid-template-columns: 1fr; }
  .disc-activity__left { padding-top: 0; }
  .disc-act-img-single-wrap { margin-left: 0; }
  .disc-online   { grid-template-columns: 1fr; }
  .disc-video-wrap { margin-left: 0; }
  .disc-highlights-grid { grid-template-columns: repeat(2, 1fr); }

  /* Highlight modal mobile */
  .hlmodal { padding: 1.2rem 1rem 1.5rem; }
  .hlmodal-main { flex-direction: column; gap: 1rem; }
  .hlmodal-main-img { width: 100%; max-height: 220px; }
  .hlmodal-sub { flex-direction: column; gap: .8rem; }
  .hlmodal-sub-img { width: 100%; max-height: 180px; object-fit: cover; }
  .hlmodal-sub-row { flex-direction: column; align-items: flex-start; gap: .6rem; }

  /* Game modal mobile */
  .game-modal { width: 100vw; height: 100dvh; border-radius: 0; }
}
@media (max-width: 480px) {
  .disc-tabs { gap: .4rem; }
  .disc-tab { padding: .45rem 1rem; font-size: .82rem; }
  .disc-highlights-grid { grid-template-columns: repeat(2, 1fr); gap: .8rem; }
}
/* ========================================================
   Uncle Storyteller Static (แบบฝังในหน้าเว็บตาม Figma)
   ======================================================== */
.disc-stagger__uncle {
  grid-column: 2; 
  grid-row: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  position: relative;
  padding: 1rem;
}

.disc-uncle-img {
  max-height: 340px; /* ปรับขนาดรูปลุงให้พอดีกับความสูงภาพซ้าย */
  object-fit: contain;
  margin-bottom: 1.5rem;
}

.disc-uncle-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--forest);
  color: #fff;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 50px;
  font-family: var(--font-th);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.disc-uncle-btn:hover {
  background: #1a3d2e;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

.disc-uncle-btn.playing {
  animation: unclePulse 2s infinite;
}

@keyframes unclePulse {
  0% { box-shadow: 0 0 0 0 rgba(27, 58, 45, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(27, 58, 45, 0); }
  100% { box-shadow: 0 0 0 0 rgba(27, 58, 45, 0); }
}

/* ปรับการเรียงลำดับให้สวยงามเวลาเปิดในหน้าจอมือถือ (จอเล็ก) */
@media (max-width: 768px) {
  .disc-stagger__uncle { grid-column: 1; grid-row: 2; padding: 2rem 0; }
  .disc-stagger__text  { grid-column: 1; grid-row: 3; padding: 1.5rem 5%; }
  .disc-stagger__img2  { grid-column: 1; grid-row: 4; min-height: 280px; }
}
`;
