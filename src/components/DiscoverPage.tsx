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
  title: string;
  description: string;
  image?: string;
  exploreLabel: string;
}

interface HighlightModal {
  description: string;
  image?: string;
  exploreLabel: string;
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
  activityIds: string[];
  showActivityHeader?: boolean;
  highlights?: Highlight[];
}

const DISCOVER_PLACES: PlaceData[] = [
  {
    id: 'bangkachao',
    name: 'บางกะเจ้า',
    nameEn: 'Bang Kachao',
    image: 'https://drive.google.com/file/d/1dzAeWnM4dR1JSQ13wsD-a0W2CbInr8gB/view?usp=drive_link',
    image2: 'https://drive.google.com/file/d/1RhST5yKE-pvc306zZJFVIO6_3kVEpult/view?usp=drive_link',
    detail: 'ใครเบื่อห้าง อยากหาที่รีเซ็ตสมอง แนะนำให้มาปั่นจักรยานชิลๆ ที่คุ้งบางกะเจ้าเลยครับ ตอนนี้เที่ยวโคตรง่ายเพราะเขามี แอปพลิเคชันช่วยเที่ยว คอยนำทางให้ เช็กพิกัด แพลนทริปได้ในมือถือเลย ไม่มีหลงแน่นอน รอบนี้จัดมาให้เลือกตามใจชอบถึง 3 เส้นทาง 3 สไตล์ ชอบแบบไหนเลือกเลย!\n\n📌 ไฮไลท์ห้ามพลาดในทริป:\n📱 โหลดแอปฯ เดียวจบ: นำทางแม่นยำ เช็กกิจกรรมชุมชนได้แบบเรียลไทม์\n\n🗺️ 3 เส้นทางเลือกได้ตามฟีล:\nสายธรรมชาติ: ปั่นรับลม สูดโอโซน ถ่ายรูปมุมมหาชนที่ สวนศรีนครเขื่อนขันธ์\nสายกิจกรรม: ไปดูชีวิต ผึ้งชันโรง (ผึ้งจิ๋วไม่มีเหล็กไน) น่ารักและเป็นมิตรมาก\nสายวัฒนธรรม: แวะเสพประวัติศาสตร์ที่ พิพิธภัณฑ์บ้านคลองบน แล้วเดินสายไหว้พระตามวัดในพื้นที่\n\n🎨 เวิร์กช้อปทำมือสุดคราฟต์: ได้ลองทำสบู่สมุนไพร, มัดย้อมผ้าสีธรรมชาติ และทำขนมพื้นถิ่นกินเอง สนุกมาก!',
    onlineActivity: 'นี่คือไฮไลท์ทิวทัศน์และวิถีชีวิตที่คุณจะได้สัมผัส ณ \'คุ้งบางกะเจ้า\' พื้นที่สีเขียวที่ไม่ได้มีเพียงแค่ต้นไม้ แต่ยังเป็นบ้านของวิถีชีวิตที่เกื้อกูลกับธรรมชาติ มาร่วมเป็นส่วนหนึ่งที่ช่วยรักษาความเขียวขจีเหล่านี้ให้คงอยู่ ผ่านการอุดหนุนสินค้าจากชุมชนกันนะคะ',
    onlineActivityVideo: 'https://drive.google.com/file/d/12TBZSZTENWerlFkd7AGOCLlB4bIzGLLB/view?usp=drive_link',
    faq: 'Q : เดินทางไปบางกะเจ้ายังไง?\n\nAns : สามารถเดินทางได้หลายวิธี\nรถสาธารณะ: นั่งรถไฟฟ้า BTS ลงสถานีบางนา แล้วต่อรถแท็กซี่หรือมอเตอร์ไซค์มาที่ "ท่าเรือวัดบางนานอก" เพื่อขึ้นเรือข้ามฟากไปฝั่งบางกะเจ้า (ท่าเรือวัดบางน้ำผึ้งนอก)\nรถยนต์ส่วนตัว: สามารถขับรถข้ามสะพานภูมิพล แล้ววิ่งตามป้ายบอกทางเข้ามายังพื้นที่บางกะเจ้าได้เลย',
    activityIds: ['ACT010', 'ACT011', 'ACT012', 'ACT014', 'ACT015', 'ACT016', 'ACT017', 'ACT018'],
    highlights: [
      { name: 'วัดโปรดเกศเชษฐาราม', nameEn: 'Wat Prodt Ket Chettharam', image: '/img/discover-wat.jpg',
        modal: {
          description: 'วัดโปรดเกศเชษฐาราม ตั้งอยู่ที่อำเภอพระประแดง จังหวัดสมุทรปราการ สร้างขึ้นโดยได้รับอิทธิพลจากศิลปะจีนผสมไทย ในวัดมีพระอุโบสถที่งดงามและพระพุทธรูปปางมารวิชัยที่เป็นพระประธานวัด นี้ยังเป็นศูนย์รวมจิตใจของชาวบ้านในชุมชนและจัดกิจกรรมทางศาสนาเป็นประจำ',
          image: '/img/watprodgate.jpg',
          exploreLabel: 'สำรวจวัดโปรดเกศเชษฐาราม',
          subSections: [
            { title: 'พระวิหาร', description: 'เสริมดวงชะตา มงคล ๑๐๘ กับพระพุทธไสยาสน์', image: '/img/pravihan.jpg', exploreLabel: 'สำรวจพระวิหาร' },
            { title: 'พระมณฑป', description: 'เลี้ยงเซียมซี กับปู่ฤาษีนาคลิทธิโคดม', image: '/img/pramontop.jpg', exploreLabel: 'สำรวจพระมณฑป' },
          ],
        },
      },
      { name: 'พิพิธภัณฑ์พื้นบ้านคลองบน', nameEn: 'Klong Bon Folk Museum', image: '/img/discover-museum.jpg' },
      { name: 'ผึ้งชันโรง', nameEn: 'Stingless Bee', image: '/img/discover-bee.jpg' },
      { name: 'ผ้ามัดย้อมบางกะเจ้า', nameEn: 'Bang Kachao Tie-Dye', image: '/img/discover-tiedye.jpg' },
    ],
  },
  {
    id: 'nakhonpathom',
    name: 'นครปฐม',
    nameEn: 'Nakhon Pathom',
    image: 'https://drive.google.com/file/d/1jtZBGbqNmgjEesiAIIAlAw5Bn1vXhre_/view?usp=drive_link',
    image2: 'https://drive.google.com/file/d/1SG17ycdENdQF2wqEuMDr1CSXnQjVGfzU/view?usp=sharing',
    detail: 'ใครบอกนครปฐมมีแค่วัดกับคาเฟ่โบราณ? ทริปนี้เราจะพาทุกคนไปสัมผัสเมืองนครปฐมในมุมใหม่ที่โฮมมี่ อบอุ่น แฝงไปด้วยความอาร์ต และที่สำคัญคือ "มาคนเดียวก็มีรูปคู่/รูปเผลอสวยๆ กลับไป" เพราะทริปนี้เรามีบริการสุดจึ้งอย่าง โปรแกรมเช่าเพื่อน (Rent a Friend) ที่จะมาเป็นทั้งตากล้อง เพื่อนคุย และคนนำเที่ยวให้เราตลอดทริป!\n\nมาดูกันว่า 1 วันในนครปฐมแบบสไตล์วินเทจ-โมเดิร์น เราไปเช็คอินที่ไหนกันบ้าง 👇\n\n🗺️ พิกัดฮีลใจ นครปฐม 1 วันเต็ม:\nมุมแรกของวัน ปักหมุดที่ พระปฐมเจดีย์ ตอนเช้า แสงสวย คนไม่เยอะ สตาร์ทวันแห่งความทรงจำได้ดีสุดๆ\n\nสายคาเฟ่ต้องเลิฟ แวะเติมความหวานที่ Ma-Toem Cafe (มาเติม คาเฟ่) และต่อด้วย Introvert Cafe กาแฟสายอาร์ตที่เต็มไปด้วยแรงบันดาลใจ\n\nเดินเล่นชิลๆ หน้า มอศิลปากร เสพศิลปะและสตรีทอาร์ตเก๋ๆ แถว กำแพงกราฟฟิตี้ ซ่อนแอบความเท่ในตัวเมืองนครปฐม\n\nตกเย็นไปนั่งตากลม ชมวิวริม แม่น้ำท่าจีน ปล่อยใจไปกับความเงียบสงบ\n\nปิดท้ายทริปด้วยการกลับมาดูแสงไฟสีทองยามค่ำคืนที่ พระปฐมเจดีย์ อีกครั้ง สวยสะกดตาจนไม่อยากกลับเลยครับ',
    onlineActivity: 'นี่คือไฮไลท์ทิวทัศน์และเรื่องราวที่คุณจะได้สัมผัส ณ \'นครปฐม\' เมืองแห่งความทรงจำที่ไม่ได้มีเพียงแค่วัดวาอาราม แต่ยังซ่อนมุมอาร์ต คาเฟ่โฮมมี่ และวิถีชีวิตผู้คนที่พร้อมโอบกอดคุณด้วยความอบอุ่น มาร่วมเติมเต็มชิ้นส่วนความทรงจำที่หายไป และออกเดินทางไปค้นหาความคิดถึงด้วยกันในทริปนี้กันนะคะ',
    onlineActivityVideo: 'https://youtu.be/-dKvtTxihgo?si=lzsBO5pxGx1Zs63-',
    faq: 'Q: สิ่งที่จะได้รับจากโปรแกรมนี้มีอะไรบ้าง?\nAns: บอกเลยว่าคุ้มสุดๆ สำหรับสายทำคอนเทนต์ เพราะคุณจะได้รับ:\nไฟล์รูปภาพสวยๆ 30+ รูป (คัดมาให้เน้นๆ)\nวิดีโอสั้นสำหรับทำ Reels / TikTok คอยเก็บโมเมนต์เผลอๆ ตลอดทริป',
    activityIds: [],
    showActivityHeader: true,
  },
  {
    id: 'khiriwong',
    name: 'บ้านคีรีวง',
    nameEn: 'Ban Khiriwong (Nakhon Si Thammarat)',
    image: 'https://drive.google.com/file/d/1hcoqE6vHhArhj0bpGrpqf9VuIqSd3u2E/view?usp=drive_link',
    image2: 'https://drive.google.com/file/d/1ljh0wqxRnoWJwDT_64zdHN30ZGhLgJAZ/view?usp=drive_link',
    detail: 'เปลี่ยนวันหยุดเดิมๆ มาพักผ่อนให้ธรรมชาติโอบกอดที่หมู่บ้านคีรีวง สัมผัสวิถีชีวิตสังคมเครือญาติสุดอบอุ่น สูดออกซิเจนให้เต็มปอดคู่กับคลองท่าดีและผืนป่าเขาหลวง ที่นี่คุณสามารถดีไซน์ความสุขได้ตามใจชอบถึง 3 เส้นทาง 3 สไตล์ ตอบโจทย์ทุกสายลุยและสายชิลแน่นอนครับ!\n\n📌 ไฮไลท์ห้ามพลาด:\n🏠 โฮมสเตย์เครือญาติ: นอนพักผ่อนรับไอหมอก ชมวิวภูเขา และกินอาหารพื้นบ้านปลอดสารเคมีกับชาวบ้านแท้ๆ\n\n🗺️ 3 เส้นทาง 3 สไตล์:\n\nสายชิลสัมผัสวิถี: ปั่นจักรยานรับลมเย็นๆ ชมทัศนียภาพรอบหมู่บ้าน แวะชิมผลไม้สดๆ จาก "สวนสมรม" สวนผลไม้ผสมผสานตามธรรมชาติ\n\nสายลุยท้าทาย: เดินป่าศึกษาธรรมชาติเชิงนิเวศ มุ่งสู่ "ยอดเขาหลวง" นำทางโดยอดีตพรานป่าท้องถิ่นตัวจริง\n\nสายเสพวัฒนธรรม: เรียนรู้ประวัติศาสตร์ท้องถิ่นและฟื้นฟูการร้อย "เครื่องประดับลูกปัดโบราณ" ของชุมชน\n\n🎨 เวิร์กช้อปชุมชนสุดคราฟต์: ลงมือทำ "ผ้ามัดย้อมสีธรรมชาติ" จากเปลือกมังคุดและใบไม้ในสวน พร้อมเรียนรู้การทำสบู่เปลือกมังคุดออร์แกนิก',
    onlineActivity: 'นี่คือไฮไลท์ทิวทัศน์และเรื่องราวที่คุณจะได้สัมผัส ณ \'บ้านคีรีวง\' พื้นที่สีเขียวท่ามกลางอ้อมกอดของป่าต้นน้ำเขาหลวงที่ไม่ได้มีเพียงแค่ธรรมชาติอันงดงาม แต่ยังเป็นบ้านของวิถีชีวิตแบบสังคมเครือญาติที่ร่วมกันดูแล \'สวนสมรม\' และพึ่งพาธรรมชาติอย่างเกื้อกูล มาร่วมเป็นส่วนหนึ่งที่ช่วยรักษาความเขียวขจีและต่อลมหายใจให้ป่าต้นน้ำแห่งนี้คงอยู่ ผ่านการเดินทางมาพักผ่อนในโฮมสเตย์ชุมชน แวะทำเวิร์กช้อปผ้ามัดย้อมธรรมชาติ และอุดหนุนผลิตภัณฑ์ท้องถิ่นร่วมกันนะคะ',
    onlineActivityVideo: 'https://youtu.be/e55u2kzZEFk?si=FGIkrwaRxvsKV_I-',
    faq: 'Q: บริการเดินป่า "ยอดเขาหลวง" มีการจัดการอย่างไร?\nAns: เส้นทางนี้จะนำทางโดย อดีตพรานป่าท้องถิ่น และมีทีมลูกหาบชุมชนคอยดูแลสัมภาระตลอดเส้นทางครับ ความเจ๋งคือกลุ่มลูกหาบจะเข้มงวดเรื่องสิ่งแวดล้อมมาก โดยจะคอยควบคุมและขนขยะของนักท่องเที่ยวกลับลงมาทั้งหมดเพื่อไม่ให้ทำลายป่าต้นน้ำ (ราคาประมาณ 4,500 – 7,200 บาท/ท่าน รวมคนนำทาง ลูกหาบ อาหารทุกมื้อในป่า และค่าธรรมเนียมอุทยานแล้ว)',
    activityIds: ['ACT005_B2C', 'ACT006_B2C', 'ACT007_B2C', 'ACT008', 'ACT009'],
    highlights: [
      { name: 'สวนสมรม', nameEn: 'Suan Somrom', image: '/img/suansomrom.jpg' },
      { name: 'ที่เที่ยวเขาหลวง', nameEn: 'Khao Luang', image: '/img/kaoluang.jpg' },
    ],
  },
  {
    id: 'moonrabbit',
    name: 'มูลนิธิกระต่ายในดวงจันทร์',
    nameEn: 'Moon Rabbit Foundation (Ratchaburi)',
    image: 'https://drive.google.com/file/d/1MU8r1Xp2fkSEb2Dujk6VQywh1TzcIR6C/view?usp=drive_link',
    image2: 'https://drive.google.com/file/d/1y26hSfv9Eho25A5deQSmzbRnFv9zTDZS/view?usp=drive_link',
    detail: 'รอบนี้มูลนิธิกระต่ายในดวงจันทร์อยากชวนทุกคนเปิดใจ ลองเข้าไปสัมผัสวิถีชีวิตของชาวกะเหรี่ยงดั้งเดิมที่บ้านเกาะสะเดิ่งดูสักครั้ง ที่นี่ไม่ใช่แค่ที่เที่ยวธรรมชาติทั่วไป แต่เป็นเหมือนห้องเรียนชีวิตที่ทำให้เราเข้าใจคำว่า "คนอยู่กับป่า" ของจริง ใครที่อยากหาที่รีเซ็ตตัวเอง ตัดขาดความวุ่นวาย แล้วมาลองใช้ชีวิตช้าๆ แนะนำเลยครับ\n\n☕ ผลผลิตจากป่าลึกที่คุณจะได้ลอง (และช่วยต่อลมหายใจให้ชุมชน):\nกาแฟคราฟต์ออร์แกนิกป่ามรดกโลก: กาแฟตัวนี้ได้รางวัลประกวดมาด้วยนะคราฟต์ พี่ๆ ชาวบ้านต้องเดินเท้าเข้าไปเก็บด้วยมือทีละเมล็ดใต้ร่มไม้ใหญ่ (ไม่ใช้วิธีรูดต้นให้ช้ำ) แล้วเอากลับมาคั่วเองในชุมชน ทุกจิบคือรายได้ที่ช่วยส่งน้องๆ เรียนหนังสือโดยไม่ต้องตัดไม้ทำลายป่าเพิ่มครับ\n\nพริกไทยดำป่าออร์แกนิก: ของดีที่มาจากระบบ "ไร่หมุนเวียน" ในป่าลึก ปลอดสารเคมีแบบ 100% ตัวนี้บอกเลยว่ากลิ่นหอมและรสชาติร้อนแรงเป็นเอกลักษณ์มาก เชฟร้านดังๆ แย่งกันจองเพราะไม่มีคู่แข่งในตลาดทั่วไปเลย\n\nเครื่องเทศตามฤดูกาล: มีทั้งงาขี้ม่อนดิบออร์แกนิก และขมิ้นชันผงแท้กลิ่นหอมๆ ที่ชาวบ้านเก็บเกี่ยวตามฤดูกาลและกฎของธรรมชาติแท้ๆ เอามาทำอาหารหรือดูแลสุขภาพคือดีต่อใจมากครับ',
    onlineActivity: 'นี่คือไฮไลท์ทิวทัศน์และเรื่องราวที่คุณจะได้สัมผัส ณ \'ผืนป่ามรดกโลกทุ่งใหญ่ตะวันตก\' พื้นที่สีเขียวขจีขนาดใหญ่ที่ไม่ได้มีเพียงแค่ความอุดมสมบูรณ์ของป่าต้นน้ำ แต่ยังเป็นบ้านของวิถีชีวิตชาวกะเหรี่ยงดั้งเดิมที่อยู่ร่วมกับธรรมชาติมาอย่างเกื้อกูลผ่านระบบไร่หมุนเวียน มาร่วมเป็นส่วนหนึ่งในการปกป้องผืนป่าและส่งต่อโอกาสทางการศึกษาให้เด็กๆ ในชุมชน ผ่านการเดินทางมาเปิดโลกกับทริปสำรวจสิ่งมีชีวิตยามค่ำคืน (Herping Trip) พร้อมร่วมอุดหนุนกาแฟคราฟต์ป่าและพริกไทยดำออร์แกนิกด้วยกันนะคะ',
    onlineActivityVideo: 'https://www.facebook.com/share/v/18keGyzvdM/?mibextid=wwXIfr',
    faq: 'Q: สินค้าเด็ดที่บอกว่า "ไม่มีคู่แข่งในตลาดเลย" คืออะไร?\nAns: คือ "พริกไทยดำป่าออร์แกนิก" ครับ เม็ดพริกไทยเหล่านี้เติบโตในระบบไร่หมุนเวียนดั้งเดิมของชาวกะเหรี่ยงในเขตป่าลึก ปลอดสารเคมี 100% มีกลิ่นและรสชาติร้อนแรงเป็นเอกลักษณ์เฉพาะตัวแบบที่หาซื้อจากตลาดอุตสาหกรรมทั่วไปไม่ได้เลย เชฟระดับ Fine Dining ชอบกันมากครับ',
    activityIds: ['ACT001', 'ACT002', 'ACT003', 'ACT004'],
    highlights: [
      { name: 'สวนมัชณิมา', nameEn: 'Suan Machhima', image: '/img/suanmachima.jpg' },
      { name: 'ทุ่งใหญ่ตะวันตก', nameEn: 'Thung Yai Naresuan (West)', image: '/img/tungyai.jpg' },
    ],
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

  useEffect(() => {
    setImgIdx(0);
    setOpenFaq(null);
    if (place.activityIds.length === 0) return;
    const ids = place.activityIds.map(id => id + langSuffix);
    Promise.all(
      ids.map(id => api.activities.getOne(id).catch(() => null))
    ).then(results => setActivities(results.filter(Boolean)));
  }, [activeTab, lang]);

  const faqItems = parseFaq(place.faq);

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
              <div className="disc-stagger__empty" />
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
      <Footer data={c.footer} />

      {/* Highlight modal */}
      {activeHighlight?.modal && (
        <div className="hlmodal-overlay" onClick={() => setActiveHighlight(null)}>
          <div className="hlmodal" onClick={e => e.stopPropagation()}>
            <button className="hlmodal-back" onClick={() => setActiveHighlight(null)}>
              ‹ {isTH ? 'กลับ' : 'Back'}
            </button>
            <h2 className="hlmodal-title">{isTH ? activeHighlight.name : activeHighlight.nameEn}</h2>
            <div className="hlmodal-divider" />

            {/* Main section */}
            <div className="hlmodal-main">
              {activeHighlight.modal.image && (
                <img src={activeHighlight.modal.image} alt={activeHighlight.name} className="hlmodal-main-img" />
              )}
              <div className="hlmodal-main-body">
                <p className="hlmodal-desc">{activeHighlight.modal.description}</p>
                <button className="hlmodal-explore-btn">
                  <span className="hlmodal-explore-icon">📍</span>
                  {activeHighlight.modal.exploreLabel}
                </button>
              </div>
            </div>

            {/* Sub-sections */}
            {activeHighlight.modal.subSections?.map((sub, i) => (
              <div key={i} className="hlmodal-sub">
                {sub.image && <img src={sub.image} alt={sub.title} className="hlmodal-sub-img" />}
                <div className="hlmodal-sub-body">
                  <h3 className="hlmodal-sub-title">{sub.title}</h3>
                  <div className="hlmodal-sub-row">
                    <p className="hlmodal-sub-desc">{sub.description}</p>
                    <button className="hlmodal-exp-btn">{isTH ? 'สัมผัสประสบการณ์' : 'Experience'} ›</button>
                  </div>
                  <button className="hlmodal-explore-btn" style={{width:'100%',marginTop:'.7rem'}}>{sub.exploreLabel}</button>
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
  font-family: var(--font-th); margin-bottom: .8rem;
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
  object-fit: cover; aspect-ratio: 4/3; background: #e0e8e0;
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
  .disc-online   { grid-template-columns: 1fr; }
  .disc-highlights-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .disc-tabs { gap: .4rem; }
  .disc-tab { padding: .45rem 1rem; font-size: .82rem; }
}
`;
