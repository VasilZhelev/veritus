"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "bg";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "veritus-language";

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.yourListings": "Your Listings",
    "nav.compare": "Compare",
    "nav.aboutUs": "About us",
    "nav.signIn": "Sign In",
    "nav.getStarted": "Get Started",
    "nav.settings": "Settings",
    "nav.signOut": "Sign Out",
    "nav.vinCheck": "VIN Check",
    
    // Home page
    "home.badge": "Introducing",
    "home.badgeAction": "Read more",
    "home.title": "Choosing a car made easy",
    "home.description": "We'll help you find the perfect car for your needs.",
    "home.getStarted": "Get Started",
    "home.viewDocs": "View Docs",
    "home.inputPlaceholder": "Paste a car URL",
    "home.inputHelperText": "Paste a link to any listing and we'll surface the specs that matter.",
    
    // Listings page
    "listings.title": "Your Listings",
    "listings.empty": "No listings yet. Add your first car listing from the home page!",
    "listings.count": "You have {count} {plural}",
    "listings.count.one": "listing",
    "listings.count.other": "listings",
    "listings.clearAll": "Clear All",
    "listings.addListing": "Add Listing",
    "listings.noListings": "No listings yet",
    "listings.emptyDescription": "Start by adding a car listing from the home page. Paste a car URL and we'll extract all the important details for you.",
    "listings.addFirst": "Add Your First Listing",
    
    // About page
    "about.badge": "About Veritus",
    "about.heroTitle": "Making Car Buying Simple & Smart",
    "about.heroDescription": "We're on a mission to revolutionize how people buy cars. By combining cutting-edge technology with deep automotive expertise, we help you find the perfect vehicle with confidence and ease.",
    "about.mission": "Our Mission",
    "about.missionDescription": "To empower car buyers with the tools and information they need to make confident, informed decisions. We believe buying a car shouldn't be complicated or stressful.",
    "about.values": "What We Stand For",
    "about.valuesDescription": "Our core values guide everything we do and shape the experience we create for our users.",
    "about.values.smartAnalysis": "Smart Analysis",
    "about.values.smartAnalysisDesc": "Advanced algorithms extract and analyze car specifications from any listing, saving you hours of research.",
    "about.values.trustedData": "Trusted Data",
    "about.values.trustedDataDesc": "We verify information from multiple sources to ensure you get accurate, reliable car details.",
    "about.values.marketInsights": "Market Insights",
    "about.values.marketInsightsDesc": "Compare prices, features, and specifications across listings to make informed decisions.",
    "about.values.lightningFast": "Lightning Fast",
    "about.values.lightningFastDesc": "Get comprehensive car information in seconds, not hours. Your time is valuable.",
    "about.stats.listings": "Listings Analyzed",
    "about.stats.users": "Happy Users",
    "about.stats.dataPoints": "Data Points",
    "about.stats.accuracy": "Accuracy Rate",
    "about.features": "What We Offer",
    "about.featuresTitle": "Everything You Need to Find Your Perfect Car",
    "about.featuresDescription": "Our platform provides comprehensive tools and insights to help you navigate the car buying process with ease and confidence.",
    "about.feature1": "Extract car specifications from any listing URL",
    "about.feature2": "Compare multiple listings side-by-side",
    "about.feature3": "Save and organize your favorite cars",
    "about.feature4": "Get detailed insights on pricing and features",
    "about.feature5": "Access comprehensive car history and data",
    "about.feature6": "Make informed decisions with confidence",
    "about.ctaTitle": "Ready to Find Your Perfect Car?",
    "about.ctaDescription": "Join thousands of smart car buyers who use Veritus to make informed decisions.",
    "about.startSearching": "Start Searching",
    "about.viewListings": "View Your Listings",
    "about.story": "Our Story",
    "about.storyDescription": "Veritus was born from a simple observation: buying a car shouldn't be complicated. We saw people spending countless hours researching, comparing, and analyzing car listings, often missing crucial details or making uninformed decisions. Our team of automotive enthusiasts and technology experts came together to solve this problem.",
    "about.storyMore": "Today, Veritus helps thousands of car buyers make confident decisions by providing instant access to comprehensive car data, intelligent analysis, and powerful comparison tools. We're constantly evolving our platform to make car buying even smarter and more accessible.",
    "about.technology": "Powered by Advanced Technology",
    "about.technologyDescription": "We leverage cutting-edge AI and machine learning algorithms to extract, analyze, and verify car information from multiple sources. Our technology ensures accuracy, speed, and reliability in every analysis.",
    "about.whyChoose": "Why Choose Veritus?",
    "about.whyChooseDescription": "We're not just another car listing aggregator. We're your intelligent car buying companion, designed to save you time, money, and stress. Our platform combines the power of technology with deep automotive expertise to deliver insights you can trust.",
    "about.trust": "Trusted by Car Buyers",
    "about.trustDescription": "Join a growing community of smart car buyers who trust Veritus to help them find their perfect vehicle. Our commitment to accuracy, transparency, and user satisfaction drives everything we do.",
    
    // Scrape page
    "scrape.noUrl": "No URL provided. Please go back and enter a URL to scrape.",
    "scrape.error": "Error:",
    
    // Compare page
    "compare.title": "Compare Cars",
    "compare.selectTwo": "Select 2 cars to compare",
    "compare.goToListings": "Go to Listings",
    "compare.specifications": "Specifications",
    "compare.year": "Year",
    "compare.mileage": "Mileage",
    "compare.fuel": "Fuel",
    "compare.transmission": "Transmission",
    "compare.location": "Location",
    "compare.featuresAnalysis": "Features Analysis",
    "compare.uniqueTo": "Unique to {brand}",
    "compare.checkDetails": "Check full details in listing",
    "compare.aiAssistant": "AI Comparison Assistant",
    "compare.aiHelp": "Ask me to help you choose between these two.",
    "compare.notSure": "Not sure which one to pick?",
    "compare.analyzeHelp": "I can analyze the price, mileage, and specs to give you a recommendation.",
    "compare.betterValue": "Which car is better value?",
    "compare.maintenanceCosts": "Compare maintenance costs",
    "compare.askRecommendation": "Ask for a recommendation...",
    "compare.noImage": "No Image",
    
    // Dashboard
    "dashboard.mainInfo": "Main Info",
    "dashboard.damageDetection": "Damage Detection",
    "dashboard.vinCheckup": "VIN Checkup",
    "dashboard.askAnything": "Ask anything",
    "dashboard.getInsights": "Get instant insights about this car",
    "dashboard.startConversation": "Start a conversation",
    "dashboard.askAboutListing": "Ask me anything about this listing",
    "dashboard.askAboutCar": "Ask about this car...",
    "dashboard.chatError": "I'm sorry, I'm having trouble connecting right now. Please try again later.",
    "dashboard.suggestions.beforeBuying": "What should I know before buying?",
    "dashboard.suggestions.commonIssues": "Common issues with this model?",
    "dashboard.suggestions.fairPrice": "Is the price fair?",
    "dashboard.suggestions.maintenance": "What maintenance to expect?",
    
    // Main Info Tab
    "mainInfo.year": "Year",
    "mainInfo.mileage": "Mileage",
    "mainInfo.engine": "Engine",
    "mainInfo.transmission": "Transmission",
    "mainInfo.photoGallery": "Photo Gallery",
    "mainInfo.description": "Description",
    "mainInfo.showLess": "Show Less",
    "mainInfo.expandDescription": "Expand Description",
    "mainInfo.technicalSpecs": "Technical Specifications",
    "mainInfo.viewOriginal": "View Original Listing",
    "mainInfo.features": "Features & Equipment",
    "mainInfo.closeGallery": "Close gallery",
    
    // Damage Detection Tab
    "damage.title": "AI Damage Detection",
    "damage.analyzing": "Analyzing first {count} image(s) for visible damages",
    "damage.analyzingImages": "Analyzing images for damages...",
    "damage.analysisFailed": "Analysis Failed",
    "damage.overallCondition": "Overall Condition",
    "damage.imagesAnalyzed": "{count} image{plural} analyzed",
    "damage.imagesAnalyzed.one": "",
    "damage.imagesAnalyzed.other": "s",
    "damage.severityLevel": "Severity Level",
    "damage.issuesDetected": "Issues Detected",
    "damage.noDamages": "No damages",
    "damage.itemsFound": "Item{plural} found",
    "damage.itemsFound.one": "",
    "damage.itemsFound.other": "s",
    "damage.itemsFound2.one": "",
    "damage.itemsFound2.other": "",
    "damage.assessmentSummary": "Assessment Summary",
    "damage.detectedDamages": "Detected Damages",
    "damage.issuesRequiring": "{count} issue{plural} requiring attention",
    "damage.issuesRequiring.one": "",
    "damage.issuesRequiring.other": "s",
    "damage.issuesRequiring2.one": "",
    "damage.issuesRequiring2.other": "",
    "damage.noDamagesDetected": "No Damages Detected",
    "damage.noSignificantDamages": "The analyzed images show no significant visible damages or defects",
    "damage.expertRecommendations": "Expert Recommendations",
    "damage.important": "Important:",
    "damage.disclaimer": "This AI analysis is based solely on visible damage in the provided photos. Always conduct a thorough physical inspection and professional assessment before making any purchase decision.",
    
    // VIN Checkup Tab
    "vin.listed": "VIN Listed",
    "vin.verified": "Verified",
    "vin.publiclyListed": "VIN number publicly listed.",
    "vin.detailedVerification": "Detailed verification below.",
    "vin.checkingDatabase": "Checking database...",
    "vin.enableVerification": "Enable verification for full history.",
    "vin.verificationReport": "VIN Verification Report",
    "vin.databaseCrossRef": "Database cross-reference • db.vin",
    "vin.vinNumber": "VIN Number",
    "vin.imported": "Imported",
    "vin.domestic": "Domestic",
    "vin.make": "Make",
    "vin.model": "Model",
    "vin.year": "Year",
    "vin.fuel": "Fuel",
    "vin.mileageCheck": "Mileage Check",
    "vin.insufficientData": "Insufficient data",
    "vin.noMileageEntry": "VIN report had no mileage entry to compare.",
    "vin.vinMileageNewer": "VIN mileage is newer",
    "vin.lowerThanRecorded": "Listing mileage is lower than the last recorded reading—ask for service proof.",
    "vin.looksConsistent": "Looks consistent",
    "vin.grewAsExpected": "Mileage grew as expected since the last inspection.",
    "vin.possibleDiscrepancy": "Possible discrepancy",
    "vin.jumpedAlot": "Mileage jumped a lot after the last VIN record—request maintenance logs.",
    "vin.origin": "Origin:",
    "vin.loadingMap": "Loading Map...",
    
    // Car Listing Card
    "card.priceNotAvailable": "Price not available",
    "card.saved": "Saved",
    "card.compare": "Compare",
    "card.noImageAvailable": "No image available",
    "card.viewDetails": "View Details",
    
    // Common
    "common.loading": "Loading...",
  },
  bg: {
    // Navigation
    "nav.yourListings": "Вашите обяви",
    "nav.compare": "Сравнение",
    "nav.aboutUs": "За нас",
    "nav.signIn": "Вход",
    "nav.getStarted": "Започнете",
    "nav.settings": "Настройки",
    "nav.signOut": "Изход",
    "nav.vinCheck": "Проверка на VIN",
    
    // Home page
    "home.badge": "Представяме",
    "home.badgeAction": "Прочетете повече",
    "home.title": "Изборът на кола става лесен",
    "home.description": "Ще ви помогнем да намерите перфектната кола за вашите нужди.",
    "home.getStarted": "Започнете",
    "home.viewDocs": "Вижте документацията",
    "home.inputPlaceholder": "Поставете URL на кола",
    "home.inputHelperText": "Поставете линк към всяка обява и ще извлечем спецификациите, които имат значение.",
    
    // Listings page
    "listings.title": "Вашите обяви",
    "listings.empty": "Все още няма обяви. Добавете първата си обява за кола от началната страница!",
    "listings.count": "Имате {count} {plural}",
    "listings.count.one": "обява",
    "listings.count.other": "обяви",
    "listings.clearAll": "Изчисти всички",
    "listings.addListing": "Добави обява",
    "listings.noListings": "Все още няма обяви",
    "listings.emptyDescription": "Започнете като добавите обява за кола от началната страница. Поставете URL на кола и ще извлечем всички важни детайли за вас.",
    "listings.addFirst": "Добавете първата си обява",
    
    // About page
    "about.badge": "За Veritus",
    "about.heroTitle": "Покупката на кола става проста и умна",
    "about.heroDescription": "Нашата мисия е да революционизираме начина, по който хората купуват коли. Чрез комбиниране на най-новите технологии с дълбоки автомобилни познания, ви помагаме да намерите перфектното превозно средство с увереност и лекота.",
    "about.mission": "Нашата мисия",
    "about.missionDescription": "Да дадем на купувачите на коли инструментите и информацията, от които се нуждаят, за да вземат уверени, информирани решения. Вярваме, че покупката на кола не трябва да е сложна или стресираща.",
    "about.values": "За какво се борим",
    "about.valuesDescription": "Нашите основни ценности ръководят всичко, което правим, и оформят преживяването, което създаваме за нашите потребители.",
    "about.values.smartAnalysis": "Умна анализа",
    "about.values.smartAnalysisDesc": "Напреднали алгоритми извличат и анализират спецификации на коли от всяка обява, спестявайки ви часове изследване.",
    "about.values.trustedData": "Доверени данни",
    "about.values.trustedDataDesc": "Проверяваме информацията от множество източници, за да гарантираме, че получавате точни и надеждни детайли за колите.",
    "about.values.marketInsights": "Пазарни прозрения",
    "about.values.marketInsightsDesc": "Сравнявайте цени, характеристики и спецификации между обяви, за да вземате информирани решения.",
    "about.values.lightningFast": "Мълниеносна скорост",
    "about.values.lightningFastDesc": "Получете цялостна информация за колата за секунди, а не часове. Вашето време е ценно.",
    "about.stats.listings": "Анализирани обяви",
    "about.stats.users": "Доволни потребители",
    "about.stats.dataPoints": "Точки данни",
    "about.stats.accuracy": "Точност",
    "about.features": "Какво предлагаме",
    "about.featuresTitle": "Всичко, от което се нуждаете, за да намерите перфектната си кола",
    "about.featuresDescription": "Нашата платформа предоставя цялостни инструменти и прозрения, които ви помагат да навигирате в процеса на покупка на кола с лекота и увереност.",
    "about.feature1": "Извличане на спецификации на коли от всеки URL на обява",
    "about.feature2": "Сравняване на множество обяви една до друга",
    "about.feature3": "Запазване и организиране на любимите си коли",
    "about.feature4": "Получаване на подробни прозрения за цени и характеристики",
    "about.feature5": "Достъп до цялостна история и данни за колите",
    "about.feature6": "Вземане на информирани решения с увереност",
    "about.ctaTitle": "Готови ли сте да намерите перфектната си кола?",
    "about.ctaDescription": "Присъединете се към хиляди умни купувачи на коли, които използват Veritus, за да вземат информирани решения.",
    "about.startSearching": "Започнете търсене",
    "about.viewListings": "Вижте вашите обяви",
    "about.story": "Нашата история",
    "about.storyDescription": "Veritus се роди от просто наблюдение: покупката на кола не трябва да е сложна. Видяхме хора, които прекарват безброй часове в изследване, сравняване и анализ на обяви за коли, често пропускайки важни детайли или вземайки неинформирани решения. Нашият екип от автомобилни ентусиасти и технологични експерти се събра, за да реши този проблем.",
    "about.storyMore": "Днес Veritus помага на хиляди купувачи на коли да вземат уверени решения, като предоставя незабавен достъп до цялостни данни за коли, интелигентен анализ и мощни инструменти за сравнение. Постоянно развиваме нашата платформа, за да направим покупката на коли още по-умна и по-достъпна.",
    "about.technology": "Задвижвано от напреднала технология",
    "about.technologyDescription": "Използваме най-новите AI и машинно обучение алгоритми, за да извличаме, анализираме и проверяваме информация за коли от множество източници. Нашата технология гарантира точност, скорост и надеждност във всеки анализ.",
    "about.whyChoose": "Защо да изберете Veritus?",
    "about.whyChooseDescription": "Не сме просто още един агрегатор на обяви за коли. Ние сме вашият интелигентен спътник при покупка на кола, проектиран да ви спести време, пари и стрес. Нашата платформа комбинира силата на технологията с дълбоки автомобилни познания, за да достави прозрения, на които можете да се доверите.",
    "about.trust": "Доверен от купувачи на коли",
    "about.trustDescription": "Присъединете се към растяща общност от умни купувачи на коли, които се доверяват на Veritus да им помогне да намерят перфектното превозно средство. Нашето ангажиране към точност, прозрачност и удовлетвореност на потребителите ръководи всичко, което правим.",
    
    // Scrape page
    "scrape.noUrl": "Не е предоставен URL. Моля, върнете се и въведете URL за извличане.",
    "scrape.error": "Грешка:",
    
    // Compare page
    "compare.title": "Сравнете коли",
    "compare.selectTwo": "Изберете 2 коли за сравнение",
    "compare.goToListings": "Към обявите",
    "compare.specifications": "Спецификации",
    "compare.year": "Година",
    "compare.mileage": "Пробег",
    "compare.fuel": "Гориво",
    "compare.transmission": "Скоростна кутия",
    "compare.location": "Местоположение",
    "compare.featuresAnalysis": "Анализ на характеристики",
    "compare.uniqueTo": "Уникални за {brand}",
    "compare.checkDetails": "Проверете пълните детайли в обявата",
    "compare.aiAssistant": "AI Асистент за сравнение",
    "compare.aiHelp": "Попитайте ме да ви помогна да изберете между тези две.",
    "compare.notSure": "Не сте сигурни кое да изберете?",
    "compare.analyzeHelp": "Мога да анализирам цената, пробега и спецификациите, за да ви дам препоръка.",
    "compare.betterValue": "Коя кола е по-добра стойност?",
    "compare.maintenanceCosts": "Сравнете разходите за поддръжка",
    "compare.askRecommendation": "Попитайте за препоръка...",
    "compare.noImage": "Няма изображение",
    
    // Dashboard
    "dashboard.mainInfo": "Основна информация",
    "dashboard.damageDetection": "Откриване на повреди",
    "dashboard.vinCheckup": "VIN проверка",
    "dashboard.askAnything": "Попитайте каквото искате",
    "dashboard.getInsights": "Получете незабавни прозрения за тази кола",
    "dashboard.startConversation": "Започнете разговор",
    "dashboard.askAboutListing": "Попитайте ме нещо за тази обява",
    "dashboard.askAboutCar": "Попитайте за тази кола...",
    "dashboard.chatError": "Съжалявам, имам проблеми със свързването в момента. Моля, опитайте отново по-късно.",
    "dashboard.suggestions.beforeBuying": "Какво трябва да знам преди покупка?",
    "dashboard.suggestions.commonIssues": "Често срещани проблеми с този модел?",
    "dashboard.suggestions.fairPrice": "Справедлива ли е цената?",
    "dashboard.suggestions.maintenance": "Каква поддръжка да очаквам?",
    
    // Main Info Tab
    "mainInfo.year": "Година",
    "mainInfo.mileage": "Пробег",
    "mainInfo.engine": "Двигател",
    "mainInfo.transmission": "Скоростна кутия",
    "mainInfo.photoGallery": "Фото галерия",
    "mainInfo.description": "Описание",
    "mainInfo.showLess": "Покажи по-малко",
    "mainInfo.expandDescription": "Разгънете описанието",
    "mainInfo.technicalSpecs": "Технически спецификации",
    "mainInfo.viewOriginal": "Вижте оригиналната обява",
    "mainInfo.features": "Характеристики и оборудване",
    "mainInfo.closeGallery": "Затворете галерията",
    
    // Damage Detection Tab
    "damage.title": "AI Откриване на повреди",
    "damage.analyzing": "Анализиране на първите {count} изображения за видими повреди",
    "damage.analyzingImages": "Анализиране на изображения за повреди...",
    "damage.analysisFailed": "Анализът се провали",
    "damage.overallCondition": "Общо състояние",
    "damage.imagesAnalyzed": "{count} изображение{plural} анализирано",
    "damage.imagesAnalyzed.one": "",
    "damage.imagesAnalyzed.other": "я",
    "damage.severityLevel": "Ниво на тежест",
    "damage.issuesDetected": "Открити проблеми",
    "damage.noDamages": "Няма повреди",
    "damage.itemsFound": "Елемент{plural} намерен{plural2}",
    "damage.itemsFound.one": "",
    "damage.itemsFound.other": "и",
    "damage.itemsFound2.one": "",
    "damage.itemsFound2.other": "и",
    "damage.assessmentSummary": "Обобщение на оценката",
    "damage.detectedDamages": "Открити повреди",
    "damage.issuesRequiring": "{count} проблем{plural}, изискващ{plural2} внимание",
    "damage.issuesRequiring.one": "",
    "damage.issuesRequiring.other": "а",
    "damage.issuesRequiring2.one": "",
    "damage.issuesRequiring2.other": "и",
    "damage.noDamagesDetected": "Не са открити повреди",
    "damage.noSignificantDamages": "Анализираните изображения не показват значителни видими повреди или дефекти",
    "damage.expertRecommendations": "Експертни препоръки",
    "damage.important": "Важно:",
    "damage.disclaimer": "Този AI анализ се основава единствено на видимите повреди в предоставените снимки. Винаги извършвайте задълбочена физическа проверка и професионална оценка преди да вземете решение за покупка.",
    
    // VIN Checkup Tab
    "vin.listed": "VIN посочен",
    "vin.verified": "Потвърден",
    "vin.publiclyListed": "VIN номер публично посочен.",
    "vin.detailedVerification": "Подробна проверка по-долу.",
    "vin.checkingDatabase": "Проверка на базата данни...",
    "vin.enableVerification": "Активирайте проверката за пълна история.",
    "vin.verificationReport": "VIN Доклад за проверка",
    "vin.databaseCrossRef": "Кръстосана справка с база данни • db.vin",
    "vin.vinNumber": "VIN номер",
    "vin.imported": "Внос",
    "vin.domestic": "Местен",
    "vin.make": "Марка",
    "vin.model": "Модел",
    "vin.year": "Година",
    "vin.fuel": "Гориво",
    "vin.mileageCheck": "Проверка на пробега",
    "vin.insufficientData": "Недостатъчни данни",
    "vin.noMileageEntry": "VIN докладът няма запис за пробег за сравнение.",
    "vin.vinMileageNewer": "VIN пробегът е по-нов",
    "vin.lowerThanRecorded": "Пробегът в обявата е по-нисък от последното записано показание—поискайте доказателство за обслужване.",
    "vin.looksConsistent": "Изглежда последователно",
    "vin.grewAsExpected": "Пробегът нарасна както се очаква от последната проверка.",
    "vin.possibleDiscrepancy": "Възможно несъответствие",
    "vin.jumpedAlot": "Пробегът скочи много след последния VIN запис—поискайте дневници за поддръжка.",
    "vin.origin": "Произход:",
    "vin.loadingMap": "Зареждане на карта...",
    
    // Car Listing Card
    "card.priceNotAvailable": "Цената не е налична",
    "card.saved": "Запазено",
    "card.compare": "Сравнете",
    "card.noImageAvailable": "Няма налично изображение",
    "card.viewDetails": "Вижте детайли",
    
    // Common
    "common.loading": "Зареждане...",
  },
};

function getTranslation(lang: Language, key: string): string {
  const translation = translations[lang]?.[key];
  if (!translation) {
    // Fallback to English if translation not found
    return translations.en[key] || key;
  }
  
  // Simple pluralization support
  if (translation.includes("{count}")) {
    return translation; // Return as-is, caller should handle replacement
  }
  
  return translation;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && (stored === "en" || stored === "bg")) {
          setLanguageState(stored as Language);
        }
      } catch (error) {
        console.error("Error loading language from localStorage:", error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, language);
      } catch (error) {
        console.error("Error saving language to localStorage:", error);
      }
    }
  }, [language, isLoaded]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let translation = getTranslation(language, key);
    
    // Handle pluralization
    if (params?.count !== undefined && translation.includes("{plural}")) {
      const count = Number(params.count);
      const pluralKey = count === 1 ? `${key}.one` : `${key}.other`;
      const plural = getTranslation(language, pluralKey);
      translation = translation.replace("{plural}", plural);
    }
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        translation = translation.replace(`{${key}}`, String(value));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

