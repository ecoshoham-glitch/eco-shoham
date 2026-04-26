import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { ArrowRight, ArrowLeft, BookOpen, Clock, ExternalLink, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { ALL_POSTS } from './Blog';
import RelatedPosts from '../components/blog/RelatedPosts';

const FULL_CONTENT = {
  1: {
    sections: [
      {
        type: 'intro',
        text: 'כשמסתכלים על נתוני ההצלחה של תלמידים במקצועות STEM — מדעים, טכנולוגיה, הנדסה ומתמטיקה — קשה להתעלם מהתמונה המדאיגה: שיעורי הכישלון גבוהים, רמת המעורבות נמוכה, ורבים מהתלמידים מרגישים שהחומר "לא נגיש" להם. אבל מחקר מקיף שפורסם ב-PNAS שינה את מה שאנחנו חושבים על הוראת STEM — ומה שאנחנו יכולים לעשות כדי לשפר אותה.',
      },
      { type: 'heading', number: '1', text: 'המחקר שהזעזע את עולם החינוך' },
      {
        type: 'paragraph',
        text: 'מטא-אנליזה שביצעו Freeman ועמיתיו בשנת 2014 ופורסמה בכתב העת PNAS בחנה 225 מחקרים שונים שכללו יותר מ-46,000 תלמידים. הממצא המרכזי היה דרמטי: תלמידים בכיתות עם הרצאה מסורתית פרונטלית בלבד היו בסיכון גבוה ב-55% להיכשל בהשוואה לתלמידים שלמדו בשיטת למידה אקטיבית. בנוסף, ציוני המבחנים של תלמידים בלמידה אקטיבית היו גבוהים בממוצע של 6% — שווה ערך לשנת לימוד נוספת שלמה.',
      },
      { type: 'heading', number: '2', text: 'מה זה בכלל למידה אקטיבית?' },
      {
        type: 'paragraph',
        text: 'למידה אקטיבית היא כל גישה פדגוגית שבה התלמיד אינו רק מאזין — אלא עושה. זה יכול להיות פתרון בעיות בזוגות, ניסויים מוחשיים, בניית מודלים פיזיים, דיון קבוצתי, או כל פעילות שמעוררת מעורבות קוגניטיבית אקטיבית. כשתלמיד בונה בידיים מודל של מולקולת DNA, הוא לא רק רואה את הצורה — הוא מבין את הלוגיקה מאחוריה.',
      },
      { type: 'heading', number: '3', text: 'מדוע הלמידה הפרונטלית פחות אפקטיבית?' },
      {
        type: 'paragraph',
        text: 'מחקרים בתחום מדעי הקוגניציה מסבירים את הפער: הרצאה פרונטלית מייצרת עומס קוגניטיבי גבוה מדי כשהחומר מורכב, ומעמידה את התלמיד במצב פסיבי שלא מאתגר את הזיכרון לטווח ארוך. ללא "עוגנים" חושיים — ריח, מגע, תנועה — המידע נשמר בזיכרון לטווח קצר ונשכח תוך שעות ספורות. לעומת זאת, למידה שמערבת את הגוף יוצרת ייצוגים עשירים יותר במוח.',
      },
      {
        type: 'conclusion',
        title: 'השלכות מעשיות לכיתה',
        text: 'הממצאים של Freeman ועמיתיו אינם תיאורטיים — הם קוראים לפעולה מיידית. כל דקה שבה תלמיד עובר ממאזין פסיבי לחוקר אקטיבי מגדילה את הסיכוי שהוא יצליח, יבין לעומק, ויזכור לאורך זמן. ערכות הלמידה המוחשיות של EcoShoham תוכננו בדיוק לפי העקרונות האלה.',
      },
      {
        type: 'sources',
        items: [
          { label: 'Freeman et al. (2014): Active learning increases student performance in science, engineering, and mathematics. PNAS', href: 'https://www.pnas.org/doi/10.1073/pnas.1319030111' },
        ],
      },
    ],
  },
  2: {
    sections: [
      {
        type: 'intro',
        text: 'ביולוגיה מולקולרית מלאה במבנים בלתי נראים: חלבונים, ריבוזומים, קרומי תא. כשתלמיד מסתכל על תרשים בספר, הוא רואה קווים וחיצים — לא מבנה אמיתי. שאלה פשוטה: כמה זמן לוקח לו להבין מה מצגת בשקף לא יכולה ללמד אותו? המחקר האקדמי ענה על השאלה הזו בצורה חד-משמעית.',
      },
      { type: 'heading', number: '1', text: 'המגבלה של הדו-ממד' },
      {
        type: 'paragraph',
        text: 'כשתלמיד מסתכל על תמונה של ריבוזום בספר, המוח שלו נדרש לבצע תרגום מורכב: להמיר את הצורה הדו-מימדית למבנה מרחבי תלת-מימדי, ולהבין כיצד הרכיבים השונים נעים ביחס זה לזה. מיומנות זו, הנקראת "חשיבה מרחבית", אינה שווה בין כל התלמידים — ותלמידים עם חשיבה מרחבית חלשה יתקשו הרבה יותר ללמוד ביולוגיה מולקולרית דרך ספרים.',
      },
      { type: 'heading', number: '2', text: 'מה מוכיח המחקר של CBE-LSE?' },
      {
        type: 'paragraph',
        text: 'מחקר שפורסם בכתב העת CBE—Life Sciences Education בחן כיתות שלמדו שעתוק ותרגום עם מודלים פיזיים תלת-מימדיים לעומת כיתות שלמדו ללא מודלים. התוצאות היו בולטות: כיתות עם מודלים הראו שיפור של 40% בבחינות הבנה. יותר מזה — הפערים בין תלמידים חלשים לחזקים הצטמצמו משמעותית, כלומר המודלים עזרו במיוחד לתלמידים שמתקשים בחשיבה מרחבית.',
      },
      { type: 'heading', number: '3', text: 'מגע שמשנה הבנה' },
      {
        type: 'paragraph',
        text: 'תיאוריית Embodied Cognition (למידה מעוגנת גוף) מסבירה מדוע המגע הפיזי הוא כל כך חשוב: המוח שלנו מעבד מידע טוב יותר כשהוא מחובר לחוויה גופנית. כשתלמיד מחזיק מולקולת RNA בידיים, מסובב אותה ורואה כיצד ריבוזום "נע" לאורכה, הוא לא רק לומד — הוא מבין. החוויה החושית יוצרת "עוגן" זיכרון שמחזיק את המידע הרבה יותר זמן מאשר קריאה בלבד.',
      },
      {
        type: 'conclusion',
        title: 'כשהבלתי נראה הופך נראה',
        text: 'הכוח האמיתי של מודלים תלת-מימדיים אינו רק בהמחשה — הוא ביצירת הבנה. כשתלמיד מחזיק בידיו מבנה שלפני כן ראה רק בתרשים, משהו משתנה בהבנה שלו. זו לא רק שיטת לימוד — זו מהפכה בדרך שבה אנחנו מאפשרים לילדים להבין את העולם.',
      },
      {
        type: 'sources',
        items: [
          { label: 'CBE—Life Sciences Education: Modeling in the Classroom: Making Relationships and Systems Visible', href: 'https://www.lifescied.org/doi/10.1187/cbe.19-11-0255' },
        ],
      },
    ],
  },
  3: {
    sections: [
      {
        type: 'intro',
        text: 'שאלו כל מורה מדעים ותקבלו את אותה תשובה: תלמידים שוננים, עוברים מבחן, ושבועיים לאחר מכן — הכל נשכח. השינון אינו למידה. אבל מה בדיוק גורם לכך, ואיך אפשר לשנות זאת? התשובה נמצאת בתיאוריה פסיכולוגית חשובה שכדאי לכל מורה מדעים להכיר.',
      },
      { type: 'heading', number: '1', text: 'מהו עומס קוגניטיבי?' },
      {
        type: 'paragraph',
        text: "תיאוריית העומס הקוגניטיבי (Cognitive Load Theory), שפותחה על ידי ג'ון סוולר, מסבירה שלזיכרון העבודה של המוח יש קיבולת מוגבלת. כשתלמיד מסתכל על תרשים מורכב של מולקולה, המוח שלו צריך לבצע בו-זמנית מספר משימות: לזהות את הצורות, לתרגם מדו-ממד לתלת-ממד, לשייך כל חלק לשמו, ולהבין את היחסים ביניהם. כשהעומס עולה מדי — המוח 'קורס' ואין שום למידה אמיתית.",
      },
      { type: 'heading', number: '2', text: 'כיצד מודלים פיזיים פותרים את הבעיה?' },
      {
        type: 'paragraph',
        text: 'פרסומים של Journal of Chemical Education הראו כי מודלים מוחשיים תלת-מימדיים מפחיתים את העומס הקוגניטיבי הכרוך בלמידה של כימיה ומדעי חיים. איך? הם מבצעים את ה"עבודה המרחבית" עבור התלמיד. במקום שהמוח יצטרך לתרגם ציור שטוח למבנה מרחבי, התלמיד פשוט מחזיק את המבנה בידיו ורואה אותו כפי שהוא. זה משחרר מקום בזיכרון העבודה להבנת הרעיונות המדעיים עצמם.',
      },
      { type: 'heading', number: '3', text: 'הפחתת תפיסות שגויות' },
      {
        type: 'paragraph',
        text: 'אחת הבעיות הגדולות בהוראת כימיה וביולוגיה מולקולרית היא תפיסות שגויות (misconceptions) שנוצרות כשתלמידים מנסים "להמציא" את המבנה התלת-מימדי בדמיונם מתוך ציור שטוח. מחקרים הראו כי תלמידים שלמדו עם מודלים פיזיים פיתחו משמעותית פחות תפיסות שגויות — כיוון שהמציאות הפיזית של המודל מתקנת את הדמיון השגוי בזמן אמת.',
      },
      {
        type: 'conclusion',
        title: 'סוף לשינון — תחילת ההבנה',
        text: 'כשמורה מביא מודלים מוחשיים לכיתה, הוא אינו רק מוסיף עזר הוראה — הוא משנה מהותית את האופן שבו מוח התלמיד מעבד מידע. זו לא בידור — זו פדגוגיה מוכחת מחקרית שמייצרת הבנה אמיתית.',
      },
      {
        type: 'sources',
        items: [
          { label: 'Journal of Chemical Education: 3D-Printed Models in Chemistry Education', href: 'https://pubs.acs.org/journal/jceda8' },
          { label: 'Sweller, J. (1988): Cognitive Load During Problem Solving. Cognitive Science', href: 'https://onlinelibrary.wiley.com/doi/abs/10.1207/s15516709cog1202_4' },
        ],
      },
    ],
  },
  4: {
    sections: [
      {
        type: 'intro',
        text: 'שנת 2026 מציבה בפני מערכת החינוך הישראלית אתגרים ייחודיים. שוק העבודה דורש מיומנויות STEM ברמה גבוהה יותר מאי פעם, אבל הנתונים מראים פערים עמוקים בין בתי ספר שונים, בין אזורים גיאוגרפיים, ובין אוכלוסיות שונות. מה המצב בשטח, ואיפה נמצאות ההזדמנויות לשיפור?',
      },
      { type: 'heading', number: '1', text: 'הנתונים: פערים עמוקים' },
      {
        type: 'paragraph',
        text: 'על פי נתוני משרד החינוך לשנת 2026, פחות מ-40% מתלמידי ישראל בוחרים ללמוד מקצועות מדעים ברמה של 5 יחידות. בפריפריה הגיאוגרפית, שיעור זה יורד לפחות מ-25%. יותר מזה — הפערים בציוני הבגרות בין מרכז לפריפריה ממשיכים לגדול. בתי הספר עם הישגים גבוהים ב-STEM מרוכזים בעיקר במרכז הארץ.',
      },
      { type: 'heading', number: '2', text: 'מה חסר לבתי הספר?' },
      {
        type: 'paragraph',
        text: 'סקר שנערך בקרב מורי מדעים בישראל חשף שלושה גורמים עיקריים לקשיים: עומס על המורים, מחסור בחומרי הוראה אפקטיביים, ותחושת חוסר אמון ביכולת התלמידים לעמוד בחומר המתקדם. כ-65% מהמורים ציינו שיש להם זמן מוגבל להכין שיעורים עשירים, ורבים הסתמכו על ספר הלימוד בלבד כמקור העיקרי.',
      },
      { type: 'heading', number: '3', text: 'ההזדמנות: כלים נגישים לכל מורה' },
      {
        type: 'paragraph',
        text: 'הפתרון אינו בתוספת שעות לימוד — אלא בשינוי איכות ההוראה. בתי ספר שאימצו גישות של למידה אקטיבית עם חומרים מוחשיים ראו שיפורים משמעותיים בתוך סמסטר אחד בלבד. הטכנולוגיה והידע הפדגוגי קיימים — האתגר הוא להנגיש אותם לכל מורה בכל בית ספר, גם בפריפריה.',
      },
      {
        type: 'conclusion',
        title: 'שיוויון הזדמנויות מתחיל בכיתה',
        text: 'הדרך לצמצם פערים אינה דרך תגבורים ושיעורים נוספים — אלא דרך שינוי שיטת ההוראה עצמה. כשכל תלמיד, בכל בית ספר, יכול לגעת ולחקור בידיו — האפשרות להצליח נהיית שווה יותר.',
      },
      {
        type: 'sources',
        items: [
          { label: 'משרד החינוך ישראל: נתוני בגרויות ומגמות 2026', href: 'https://edu.gov.il' },
          { label: 'PISA 2022: Results in Focus', href: 'https://www.oecd.org/pisa/' },
        ],
      },
    ],
  },
  5: {
    sections: [
      {
        type: 'intro',
        text: 'ביולוגיה מולקולרית היא אחד המקצועות המרתקים ביותר — ואחד הקשים ביותר ללמד. שעתוק, תרגום, שכפול DNA — מדובר בתהליכים אלגנטיים ומורכבים שמתרחשים בסדר גודל של ננומטרים. שאלת מיליון הדולר היא: איך גורמים לתלמיד ב-2026 להבין ולאהוב חומר שבלתי נראה לעין?',
      },
      { type: 'heading', number: '1', text: 'שיטת ההרצאה: מה לא עובד' },
      {
        type: 'paragraph',
        text: 'מחקרים אחדים שניתחו כיתות ביולוגיה מצאו שתלמידים שלומדים שעתוק ותרגום רק דרך ספרים ומצגות נוטים לפתח "ידע פרוצדורלי" — הם יודעים את הסדר של השלבים, אבל לא מבינים מדוע כל שלב מתרחש. בבחינות פתוחות שדורשות הסברים ויישום, תלמידים אלה מתקשים משמעותית לעומת עמיתיהם שלמדו עם מודלים.',
      },
      { type: 'heading', number: '2', text: 'מה כן עובד: מודלים פיזיים' },
      {
        type: 'paragraph',
        text: 'ניתוח של תוצאות בגרות בביולוגיה הראה שבתי ספר שהטמיעו שימוש במודלים פיזיים של DNA ו-RNA רשמו עלייה ממוצעת של 12% בציוני הבגרות בשאלות ביולוגיה מולקולרית. יותר מזה — תלמידים שלמדו עם מודלים הצליחו לענות נכון על שאלות שדרשו "מה יקרה אם" — שאלות הבנה שדורשות הפנמת העקרון ולא שינון.',
      },
      { type: 'heading', number: '3', text: 'הכלל הזהב: הבנה לפני שינון' },
      {
        type: 'paragraph',
        text: 'המסקנה המתבקשת מהמחקרים: בביולוגיה מולקולרית, השינון עובד רק אחרי ההבנה — ולא לפניה. כשתלמיד מחזיק מודל של ריבוזום ו"מעביר" עליו רצועת RNA בידיו, הוא מבין איך התהליך עובד ברמה שלא ניתן להשיג דרך שינון. לאחר ההבנה הזו, שינון הפרטים הופך הרבה יותר קל ומחזיק לאורך זמן.',
      },
      {
        type: 'conclusion',
        title: 'המתכון להצלחה בביולוגיה',
        text: 'בניגוד לאמונה הרווחת, הבעיה בהוראת ביולוגיה מולקולרית אינה כמות החומר — אלא שיטת ההוראה. עם הכלים הנכונים, תלמידים יכולים להבין שעתוק ותרגום בשיעור אחד בצורה שתישאר איתם לכל החיים.',
      },
      {
        type: 'sources',
        items: [
          { label: 'International Journal of Science Education: Teaching Molecular Biology', href: 'https://www.tandfonline.com/journals/tsed20' },
          { label: 'CBE-LSE: Models and Modeling in Biology Education', href: 'https://www.lifescied.org' },
        ],
      },
    ],
  },
  6: {
    sections: [
      {
        type: 'intro',
        text: 'במשך עשרות שנים, תפקיד המורה היה ברור: עמוד מול הכיתה, הסבר, ענה על שאלות, תן עבודה. אבל המחקר הפדגוגי של העשור האחרון מציע מודל שונה לחלוטין — ושינוי התפקיד הזה לא רק משפר את הישגי התלמידים, הוא גם גורם למורים לאהוב את עבודתם יותר.',
      },
      { type: 'heading', number: '1', text: 'ממרצה למנחה: מה זה אומר בפועל?' },
      {
        type: 'paragraph',
        text: 'מורה כמנחה (facilitator) אינו עוזב את הכיתה לחוויה בלתי מנוהלת — להיפך. הוא מתכנן חוויות למידה, מציב שאלות שמעוררות סקרנות, ומסתובב בין הקבוצות כשהתלמידים עובדים. במקום להיות מקור הידע היחיד, הוא הופך לדמות שמכוונת ומעמיקה. מחקרים מ-Edutopia ומהרווארד מראים שבמודל זה תלמידים מגיעים לרמות הבנה גבוהות יותר ומפתחים מיומנויות חשיבה עצמאית.',
      },
      { type: 'heading', number: '2', text: 'מה הכרחי כדי שהמעבר יצליח?' },
      {
        type: 'paragraph',
        text: 'המעבר ממרצה למנחה אינו טריוויאלי. הוא דורש שלושה דברים מרכזיים: ראשית, חומרי למידה מובנים שמאפשרים לתלמידים לעבוד עצמאית בקבוצות. שנית, אמון שהתלמידים אכן יכולים לגלות ידע בעצמם. ושלישית — ויתור על הצורך לשלוט בכל מה שנאמר בכיתה. זה קשה לרבים מהמורים, אבל פירות ההתאמה שווים.',
      },
      { type: 'heading', number: '3', text: 'כלים שהופכים את המעבר לאפשרי' },
      {
        type: 'paragraph',
        text: 'ערכות למידה Plug & Play כמו אלה של EcoShoham תוכננו בדיוק כדי לסייע בטרנזיציה הזו. כשלמורה יש ערכה מוכנה עם מודלים ועם הנחיות ברורות לעבודת קבוצות, הוא יכול להתרכז בתפקיד המנחה — לשוטט בין הקבוצות, לשאול שאלות, ולעמיק הבנה — במקום לבזבז אנרגיה על הכנה לוגיסטית.',
      },
      {
        type: 'conclusion',
        title: 'מורה כמנחה = כיתה שחוקרת',
        text: 'כשמורה עובר לתפקיד מנחה, משהו קסום קורה בכיתה: התלמידים מתחילים לשאול שאלות שלא נשאלו. הם מתווכחים, מנחשים, מגלים — ולומדים הרבה יותר. זה לא רק טוב לתלמידים — זה גם הופך את ההוראה למשמעותית יותר עבור המורה עצמו.',
      },
      {
        type: 'sources',
        items: [
          { label: 'Edutopia: The Role of the Teacher as Facilitator', href: 'https://www.edutopia.org/active-learning' },
          { label: 'Harvard Education Review: Student-Centered Learning', href: 'https://hepg.org/her-home/home' },
        ],
      },
    ],
  },
  7: {
    sections: [
      {
        type: 'intro',
        text: 'אחת התיאוריות החשובות ביותר בפסיכולוגיה חינוכית — שמשפיעה ישירות על כיצד כדאי לעצב שיעורים ולבחור חומרי לימוד — היא תיאוריית העומס הקוגניטיבי. כדאי שכל מורה מדעים יכיר אותה, כי היא מסבירה מדוע כל כך הרבה תלמידים מתקשים, ומראה את הדרך לשפר זאת.',
      },
      { type: 'heading', number: '1', text: 'שלושת סוגי העומס הקוגניטיבי' },
      {
        type: 'paragraph',
        text: "ג'ון סוולר, שפיתח את התיאוריה בשנות ה-80, הגדיר שלושה סוגי עומס: עומס פנימי (intrinsic) — המורכבות הטבועה בחומר עצמו; עומס זר (extraneous) — מורכבות הנגרמת מאופן הצגת החומר; ועומס גרמני (germane) — עומס שתורם ללמידה. המטרה של פדגוגיה טובה היא להפחית את העומס הזר ולמקד את המשאבים הקוגניטיביים בחומר עצמו.",
      },
      { type: 'heading', number: '2', text: 'יישום בשיעורי מדעים' },
      {
        type: 'paragraph',
        text: 'בשיעורי ביולוגיה וכימיה, העומס הזר הוא אחת הבעיות הגדולות ביותר. כשתלמיד מסתכל על תרשים מורכב ומנסה להבין אותו, חלק גדול מהמשאבים הקוגניטיביים שלו מתנקזים לניסיון לפענח את הייצוג הגרפי — ולא להבין את הרעיון המדעי. מודלים תלת-מימדיים מפחיתים את העומס הזר מאוד: הם מוחשיים, ישירים, וניתנים לסיבוב וחקירה ידנית.',
      },
      { type: 'heading', number: '3', text: 'הוכחות מהשטח' },
      {
        type: 'paragraph',
        text: 'מחקרים שמדדו את יעילות הלמידה עם ובלי מודלים מוחשיים מצאו עקביות בתוצאות: הפחתה בעומס הקוגניטיבי הזר מובילה לעלייה בציוני ההבנה. כיתות שלמדו כימיה אורגנית עם מודלים מולקולריים השיגו ציונים גבוהים ב-28% בבחינות הבנה לעומת כיתות שלמדו ללא מודלים — עם אותו מורה ואותו חומר לימוד.',
      },
      {
        type: 'conclusion',
        title: 'תכנון שיעור לפי עומס קוגניטיבי',
        text: 'כשמורה מתכנן שיעור, שאלה מרכזית שכדאי לשאול היא: "מה יגרום לתלמידי לעבוד קשה — החומר עצמו, או הדרך שבה אני מציג אותו?" אם התשובה היא השנייה — יש מקום לשיפור. ערכות מוחשיות הן אחת הדרכים האפקטיביות ביותר להפחית עומס זר ולאפשר ללמידה האמיתית לקרות.',
      },
      {
        type: 'sources',
        items: [
          { label: 'Sweller et al. (1998): Cognitive Architecture and Instructional Design. Educational Psychology Review', href: 'https://link.springer.com/article/10.1023/A:1022193728205' },
          { label: 'Cognitive Science: Cognitive Load Theory in Practice', href: 'https://onlinelibrary.wiley.com/journal/15516709' },
        ],
      },
    ],
  },
  8: {
    sections: [
      {
        type: 'intro',
        text: 'מבחני PISA הבינלאומיים חושפים שוב ושוב מגמה אחת ברורה: המדינות המובילות בהישגים מדעיים חולקות דפוס הוראה שונה מהמקובל. פינלנד, סינגפור ואסטוניה — שלוש מדינות שונות מאוד תרבותית — מיישמות עיקרון אחד משותף שממנו ישראל יכולה ללמוד הרבה.',
      },
      { type: 'heading', number: '1', text: 'פינלנד: פחות שעות, יותר הבנה' },
      {
        type: 'paragraph',
        text: 'פינלנד מפורסמת בכך שתלמידיה לומדים פחות שעות מאשר במרבית המדינות המפותחות — ועם זאת מובילים בהישגים. הסוד? הוראה ממוקדת בעומק ולא ברוחב. כל נושא נלמד לעומק, עם פעילויות חקרניות, ניסויים ידניים, ועבודה קבוצתית. המורים בפינלנד נהנים מאוטונומיה פדגוגית גבוהה ומדגישים הבנה מעל כל דבר אחר.',
      },
      { type: 'heading', number: '2', text: 'סינגפור: מודלים ומשמעות' },
      {
        type: 'paragraph',
        text: 'מערכת החינוך של סינגפור ידועה בשיטת "Model Method" — גישה שבה תלמידים מציגים בעיות מתמטיות ומדעיות באמצעות ייצוגים חזותיים ומוחשיים לפני שמפרקים אותן לנוסחאות. הגישה מקדמת הבנה מושגית לפני האלגוריתמי. כשתלמיד יכול לצייר או לבנות מודל של בעיה — הוא הבין אותה.',
      },
      { type: 'heading', number: '3', text: 'אסטוניה: שילוב טכנולוגיה חכמה' },
      {
        type: 'paragraph',
        text: 'אסטוניה, המדינה הקטנה שמדורגת גבוה מאוד ב-PISA, השקיעה מאסיבית בחינוך מדעי שמשלב עשייה ידנית עם טכנולוגיה. כל בית ספר באסטוניה מחויב לכלול ניסויים מעשיים בכל שיעורי המדע. התוצאה: תלמידים עם הבנה מעמיקה, סקרנות גבוהה, ורצון להמשיך ולעסוק במדע.',
      },
      {
        type: 'conclusion',
        title: 'מה ישראל יכולה ללמוד?',
        text: 'שלוש המדינות מלמדות אותנו שהצלחה בחינוך מדעי אינה תלויה בתקציב גבוה או בכמות שעות הלימוד — אלא באיכות הלמידה. כשכל תלמיד יכול לגעת, לחקור ולהבין בידיו, הוא הופך לסטודנט מוצלח ולאזרח סקרן.',
      },
      {
        type: 'sources',
        items: [
          { label: 'PISA 2022 Results: Insights into Education Systems', href: 'https://www.oecd.org/pisa/' },
          { label: 'Finnish National Core Curriculum: Science Education Approach', href: 'https://www.oph.fi/en' },
          { label: 'Singapore Ministry of Education: Science Curriculum Framework', href: 'https://www.moe.gov.sg' },
        ],
      },
    ],
  },
  9: {
    sections: [
      {
        type: 'intro',
        text: 'הוראת מקצועות ה-STEM (מדעים, טכנולוגיה, הנדסה ומתמטיקה) מציבה בפנינו אתגר קבוע: איך מסבירים לתלמידים תהליכים מורכבים ובלתי נראים? בין אם מדובר בסינתזת חלבונים בתא או במבנה מולקולרי בכימיה, הניסיון להעביר חומר תלת-מימדי ודינמי דרך דפים דו-מימדיים בספר לימוד מוביל לרוב לתסכול ולשינון ריק מתוכן.\n\nבשנים האחרונות, המחקר האקדמי מצביע בבירור על פתרון אפקטיבי אחד: מעבר ללמידה פעילה באמצעות מודלים מוחשיים. הנה מה שיש למדע להגיד על הדרך שבה תלמידים צריכים ללמוד מדעים:',
      },
      { type: 'heading', number: '1', text: 'צמצום דרמטי של אחוזי הכישלון' },
      {
        type: 'paragraph',
        text: 'האם ידעתם שתלמידים שלומדים מדעים בשיטת ההרצאה המסורתית (פרונטלית) נמצאים בסיכון גבוה ב-55% להיכשל לעומת חבריהם? מטא-אנליזה מקיפה שפורסמה בכתב העת היוקרתי של האקדמיה הלאומית למדעים בארה"ב (PNAS), בחנה מאות כיתות לימוד וקבעה נחרצות: למידה אקטיבית אינה בגדר מותרות, היא הכרח. כאשר תלמידים מפסיקים להיות מאזינים פסיביים ומתחילים לגעת, לחקור ולהרכיב מודלים בידיים, רמת המעורבות שלהם עולה והישגיהם האקדמיים מזנקים בהתאמה.',
      },
      { type: 'heading', number: '2', text: 'להבין את הבלתי נראה' },
      {
        type: 'paragraph',
        text: 'אחד הקשיים הגדולים בביולוגיה הוא בניית מודל מנטלי של מערכות מיקרוסקופיות. מחקר שפורסם בכתב העת להוראת מדעי החיים (CBE-LSE) הראה שכאשר תלמידים משתמשים במודלים פיזיים ותלת-מימדיים, הם מצליחים לתפוס את המערכת הרבה יותר טוב. המגע הפיזי וההרכבה של חלקים (כמו התאמת קודונים של RNA) מאפשרים להם להבין את ה"איך" וה"למה" של תהליכים תאיים, במקום פשוט לשנן את סדר הפעולות למבחן.',
      },
      { type: 'heading', number: '3', text: 'הורדת העומס הקוגניטיבי' },
      {
        type: 'paragraph',
        text: 'כשתלמיד מסתכל על תרשים של מולקולה בספר, המוח שלו צריך לעבוד קשה מאוד כדי לתרגם את הציור השטוח למבנה מרחבי תלת-מימדי. התהליך הזה יוצר "עומס קוגניטיבי" שגוזל משאבי קשב ומוביל לתפיסות שגויות. פרסומים של האגודה האמריקאית לכימיה (Journal of Chemical Education) מדגימים כיצד מודלים מודפסים בתלת-מימד הניתנים למישוש פותרים את הבעיה הזו לחלוטין. המודל הפיזי עושה את "העבודה המרחבית" עבור התלמיד, ומפנה את המוח שלו להבנת העקרונות המדעיים עצמם.',
      },
      {
        type: 'conclusion',
        title: 'השורה התחתונה: מדע מורכב, פשוט בידיים',
        text: 'המסקנה מהספרות המחקרית ברורה – כדי שתלמידים יבינו מדע באמת, הם צריכים לחוות אותו. זו בדיוק הפילוסופיה שעומדת מאחורי הערכות של EcoShoham. על ידי הפיכת התיאוריה למודלים תלת-מימדיים ואינטראקטיביים, אנחנו מעניקים למורים את הכלים ליישם פדגוגיה מוכחת מחקרית, ולהפוך כל שיעור לחוויית גילוי משמעותית.',
      },
      {
        type: 'sources',
        items: [
          { label: 'PNAS: Active learning increases student performance in science, engineering, and mathematics', href: 'https://www.pnas.org/doi/10.1073/pnas.1319030111' },
          { label: 'CBE—Life Sciences Education: Modeling in the Classroom: Making Relationships and Systems Visible', href: 'https://www.lifescied.org/doi/10.1187/cbe.19-11-0255' },
          { label: 'Journal of Chemical Education: Accessible Molecular Models: A Modular 3D-Printed Space-Filling Atomic Model Set', href: 'https://pubs.acs.org/doi/10.1021/acs.jchemed.5c00518' },
        ],
      },
    ],
  },
  10: {
    sections: [
      {
        type: 'intro',
        text: 'שיעור בנושא מבנה קרום התא. אני מקרין על הלוח פוספוליפיד ומבקש מתלמידים להעתיק אותו על הלוח בעזרת עט תלת-ממד המחובר למטען נייד. לאחר מכן אני סוגר את המקרן, תולש מהלוח את דגם הפוספוליפיד שהתלמידים יצרו וממשיך להסביר עליו כשאני אוחז אותו בידי.\n\nבסוף השיעור אני מבקש מתלמידים להסביר לי את מה שלמדו בשיעור תוך כדי שהם מחזיקים בפוספוליפיד – ואכן, התלמידים הבינו והטמיעו את החומר, ואפילו נהנו מהשיעור. כחודשיים לאחר מכן התלמידים נשאלו לגבי השיעור המתואר ורובם תיארו אותו כשיעור חווייתי ומובן.',
      },
      { type: 'heading', number: '1', text: 'למה תלת-ממד בשיעורי ביולוגיה?' },
      {
        type: 'paragraph',
        text: 'המחשה (ויזואליזציה) היא חלק בלתי-נפרד משיעורי הביולוגיה. במיוחד בנושאים כמו ביולוגיה של התא וביולוגיה מולקולרית, מגוון האפשרויות להמחיש לתלמידים את הרכיבים הבלתי-נראים הוא אדיר. אבל גם עם כל עזרי ההוראה הדיגיטליים – ההמחשה נשארת בשני ממדים בלבד. מהתלמידים תידרש מיומנות של העברת התמונות, האנימציות או הסימולציות למרחב שבו הם פועלים במציאות – לתלת-ממד (Horowitz & Schultz, 2014). טכנולוגיית ההדפסה בתלת-ממד פותרת את הבעיה הזו.',
      },
      { type: 'heading', number: '2', text: 'מה אומר המחקר על למידה בתלת-ממד?' },
      {
        type: 'paragraph',
        text: 'מחקרים על למידה באמצעות הדפסת תלת-ממד מראים שרוב היישומים שלה בהוראת מדעים נעשים בהקשר של STEM. הטמעת הדפסה בתלת-ממד בשיעורי כימיה על מבנה האטום הראתה קשר בינה לבין שיפור בהישגי התלמידים (Chery et al., 2015), ויש עדויות לכך שהטמעת הדפסה בתלת-ממד בהוראה תורמת לשיפור הישגים במתמטיקה (Stansell et al., 2016). תלמידים יכולים לסובב את הרכיב המודפס במרחב וללמוד את מבנהו ואת היחסים שבינו לבין רכיבים אחרים.',
      },
      { type: 'heading', number: '3', text: 'יישום בכיתה: ממודל ריבוזום לתרופה אנטיביוטית' },
      {
        type: 'paragraph',
        text: 'אחת האפשרויות ליישום הטכנולוגיה במהלך ההוראה יכולה להיות באמצעות בניית מודל תלת-ממד של ריבוזום המבוסס על מקורות מדעיים, במטרה לשלב בו תרופות אנטיביוטיות ממוקדות ריבוזום. בשיטה זו התלמידים יכולים "לתכנן" תרופות הפוגעות בפעולת הריבוזום בחיידקים – בדומה לדרך שבה עבדה פרופסור עדה יונת במחקרה. בניית מודל ביולוגי בטכנולוגיית תלת-ממד מחייבת התעסקות בעקרונות ביולוגיים בשילוב סקירה מדוקדקת של המודל עד לרמת הפרטים הקטנים – ובדיוק בשל כך היא מעמיקה את ההבנה.',
      },
      {
        type: 'conclusion',
        title: 'לסיכום: מדע מורכב, פשוט בידיים',
        text: 'לשימוש במודלים תלת-ממדיים יכולה להיות תרומה רבה ללמידה אפקטיבית. בשיטת לימוד זו התלמיד חווה באופן ויזואלי תהליכים ורכיבים מבניים, וכמו כן זוכה לעסוק בשאלות המצריכות חשיבה מסדר גבוה והבנה מעמיקה של המודל המדובר. שיטת לימוד זו עדיין נמצאת בתחילת דרכה – ויש הזדמנות אמיתית למורים לעצב את עתיד הוראת המדעים.',
      },
      {
        type: 'sources',
        items: [
          { label: 'מוטי אשר (2023): בניית מודל לימודי באמצעות טכנולוגיות תלת-ממד. שמורת טבע – עלון מורי הביולוגיה, גיליון 202', href: '/files/de384bc16_18423copy.pdf' },
          { label: 'Chery et al. (2015): Integration of the arts and technology in GK-12 science courses. IEEE FIE 2015', href: 'https://doi.org/10.1109/FIE.2015.7344165' },
          { label: 'Horowitz & Schultz (2014): Printing space: using 3D printing of digital terrain models in geosciences education. Journal of Geoscience Education 62', href: 'https://doi.org/10.5408/13-031.1' },
        ],
      },
    ],
  },
};

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = parseInt(id);

  const post = ALL_POSTS.find((p) => p.id === postId);
  const content = FULL_CONTENT[postId];

  const sortedPosts = [...ALL_POSTS].sort((a, b) => b.id - a.id);
  const currentIndex = sortedPosts.findIndex((p) => p.id === postId);
  const prevPost = sortedPosts[currentIndex + 1] || null;
  const nextPost = sortedPosts[currentIndex - 1] || null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background font-heebo" dir="rtl">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-40 text-center">
          <span className="text-6xl">📄</span>
          <h2 className="text-2xl font-black text-primary mt-4">המאמר לא נמצא</h2>
          <Link to="/blog" className="mt-6 inline-block text-secondary font-semibold hover:underline">
            חזרה למגזין
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-heebo" dir="rtl">
      <Navbar />

      {/* Header */}
      <section className="relative pt-24 sm:pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] to-background" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Navigation bar */}
            <div className="flex items-center justify-between mb-8 gap-2">
              <div className="flex items-center gap-2">
                {prevPost && (
                  <button onClick={() => navigate(`/blog/${prevPost.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border text-sm font-medium text-foreground/70 hover:text-primary hover:border-primary/40 transition-all shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                    הקודם
                  </button>
                )}
                {nextPost && (
                  <button onClick={() => navigate(`/blog/${nextPost.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border text-sm font-medium text-foreground/70 hover:text-primary hover:border-primary/40 transition-all shadow-sm">
                    הבא
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link to="/"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
                  <Home className="w-4 h-4" />
                  דף הבית
                </Link>
                <Link to="/blog" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border text-sm font-medium text-foreground/70 hover:text-primary hover:border-primary/40 transition-all shadow-sm">
                  <BookOpen className="w-4 h-4" />
                  מגזין
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{post.emoji}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.categoryColor}`}>{post.category}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primary leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-t border-border pt-4 mt-4">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime}</span>
              {post.sourceUrl ? (
                <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 min-w-0 hover:text-secondary transition-colors">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{post.source}</span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              ) : (
                <span className="flex items-center gap-1.5 min-w-0"><BookOpen className="w-4 h-4 flex-shrink-0" /><span className="truncate">{post.source}</span></span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-3xl shadow-lg border border-border/50 overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-l from-secondary via-accent to-primary" />
          <div className="p-5 sm:p-10 space-y-6 text-base sm:text-lg leading-relaxed text-foreground/85">
            {content ? (
              content.sections.map((sec, i) => {
                if (sec.type === 'intro') return (
                  <p key={i} className="text-foreground/70 whitespace-pre-line">{sec.text}</p>
                );
                if (sec.type === 'heading') return (
                  <div key={i} className="flex items-start gap-4 pt-2">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary font-black text-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      {sec.number}
                    </div>
                    <h2 className="text-2xl font-black text-primary">{sec.text}</h2>
                  </div>
                );
                if (sec.type === 'paragraph') return (
                  <div key={i} className="sm:pr-14">
                    <p>{sec.text}</p>
                    {sec.sourceLink && (
                      <a href={sec.sourceLink.href} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-secondary hover:text-accent transition-colors font-medium">
                        <ExternalLink className="w-3.5 h-3.5" />
                        מקור: {sec.sourceLink.label}
                      </a>
                    )}
                  </div>
                );
                if (sec.type === 'conclusion') return (
                  <div key={i} className="bg-primary/5 border-r-4 border-primary rounded-2xl p-6 mt-6">
                    <h3 className="text-xl font-black text-primary mb-3">{sec.title}</h3>
                    <p className="text-foreground/80">{sec.text}</p>
                  </div>
                );
                if (sec.type === 'sources') return (
                  <div key={i} className="border-t border-border pt-8 mt-8">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">מקורות לקריאה נוספת</h4>
                    <ul className="space-y-3">
                      {sec.items.map((src, j) => (
                        <li key={j}>
                          <a href={src.href} target="_blank" rel="noopener noreferrer"
                            className="flex items-start gap-2 text-sm text-secondary hover:text-accent transition-colors font-medium">
                            <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {src.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
                return null;
              })
            ) : (
              <div className="space-y-6">
                <p className="text-foreground/75 leading-relaxed">{post.excerpt}</p>
                <div className="bg-primary/5 border-r-4 border-primary rounded-2xl p-6">
                  <p className="text-base text-foreground/70">
                    המאמר המלא זמין במקור:{' '}
                    {post.sourceUrl ? (
                      <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-secondary hover:text-accent transition-colors inline-flex items-center gap-1">
                        {post.source}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="font-bold text-primary">{post.source}</span>
                    )}
                  </p>
                </div>
                <div className="text-center pt-4">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-secondary font-bold hover:text-accent transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    חזרה לכל המאמרים
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </article>

      <RelatedPosts currentPost={post} allPosts={ALL_POSTS} />
      <Footer />
    </div>
  );
}