# Translation Implementation Guide

This document outlines all the components that need to be updated to use the new translation system.

## Files to Update

### 1. Scrape Page (`src/app/scrape/page.tsx`)
- Line 108: "No URL provided..." → `t('scrape.noUrl')`
- Line 125: "Error:" → `t('scrape.error')`

### 2. Compare Page (`src/app/compare/page.tsx`)
- Line 145: "Select 2 cars to compare" → `t('compare.selectTwo')`
- Line 147: "Go to Listings" → `t('compare.goToListings')`
- Line 176: "Compare Cars" → `t('compare.title')`
- Line 223: "Specifications" → `t('compare.specifications')`
- Line 228-232: Year, Mileage, Fuel, Transmission, Location → Use translation keys
- Line 250: "Features Analysis" → `t('compare.featuresAnalysis')`
- Line 255, 265: "Unique to {brand}" → `t('compare.uniqueTo', { brand })`
- Line 260, 269: "Check full details..." → `t('compare.checkDetails')`
- Line 286: "AI Comparison Assistant" → `t('compare.aiAssistant')`
- Line 288: "Ask me to help..." → `t('compare.aiHelp')`
- Line 297: "Not sure which one to pick?" → `t('compare.notSure')`
- Line 298: "I can analyze..." → `t('compare.analyzeHelp')`
- Line 310, 318: Suggestion buttons → Use translation keys
- Line 359: "Ask for a recommendation..." → `t('compare.askRecommendation')`
- Line 191, 208: "No Image" → `t('compare.noImage')`

### 3. Dashboard (`src/components/dashboard/ListingDashboard.tsx`)
- Line 69-73: Suggestion questions → Use `dashboard.suggestions.*` keys
- Line 219: "Main Info" → `t('dashboard.mainInfo')`
- Line 231: "Damage Detection" → `t('dashboard.damageDetection')`
- Line 243: "VIN Checkup" → `t('dashboard.vinCheckup')`
- Line 265: "Ask anything" → `t('dashboard.askAnything')`
- Line 267: "Get instant insights..." → `t('dashboard.getInsights')`
- Line 277: "Start a conversation" → `t('dashboard.startConversation')`
- Line 278: "Ask me anything..." → `t('dashboard.askAboutListing')`
- Line 338: "Ask about this car..." → `t('dashboard.askAboutCar')`
- Line 163: Error message → `t('dashboard.chatError')`

### 4. Main Info Tab (`src/components/dashboard/tabs/MainInfoTab.tsx`)
- Line 69-72: Year, Mileage, Engine, Transmission → Use `mainInfo.*` keys
- Line 95: "Photo Gallery" → `t('mainInfo.photoGallery')`
- Line 131: "Description" → `t('mainInfo.description')`
- Line 144: "Show Less" / "Expand Description" → Use translation keys
- Line 156: "Technical Specifications" → `t('mainInfo.technicalSpecs')`
- Line 178, 215: "View Original Listing" → `t('mainInfo.viewOriginal')`
- Line 190: "Features & Equipment" → `t('mainInfo.features')`
- Line 233: "Close gallery" → `t('mainInfo.closeGallery')`

### 5. Damage Detection Tab (`src/components/dashboard/tabs/DamageDetectionTab.tsx`)
- Line 81: "AI Damage Detection" → `t('damage.title')`
- Line 82: "Analyzing first..." → `t('damage.analyzing', { count })`
- Line 90: "Analyzing images..." → `t('damage.analyzingImages')`
- Line 99: "Analysis Failed" → `t('damage.analysisFailed')`
- Line 116: "Overall Condition" → `t('damage.overallCondition')`
- Line 119: Images analyzed text → Use translation with pluralization
- Line 139: "Severity Level" → `t('damage.severityLevel')`
- Line 153: "Issues Detected" → `t('damage.issuesDetected')`
- Line 157: "No damages" / "Items found" → Use translation keys
- Line 171: "Assessment Summary" → `t('damage.assessmentSummary')`
- Line 186: "Detected Damages" → `t('damage.detectedDamages')`
- Line 187: Issues requiring attention → Use translation with pluralization
- Line 269: "No Damages Detected" → `t('damage.noDamagesDetected')`
- Line 270: Description → `t('damage.noSignificantDamages')`
- Line 284: "Expert Recommendations" → `t('damage.expertRecommendations')`
- Line 304: "Important:" → `t('damage.important')`
- Line 304: Disclaimer → `t('damage.disclaimer')`

### 6. VIN Checkup Tab (`src/components/dashboard/tabs/VinCheckupTab.tsx`)
- Line 115: "VIN Listed" → `t('vin.listed')`
- Line 117: "Verified" → `t('vin.verified')`
- Line 122: VIN description → Use translation keys
- Line 144: "VIN Verification Report" → `t('vin.verificationReport')`
- Line 145: "Database cross-reference..." → `t('vin.databaseCrossRef')`
- Line 152: "VIN Number" → `t('vin.vinNumber')`
- Line 158: "Imported" → `t('vin.imported')`
- Line 162: "Domestic" → `t('vin.domestic')`
- Line 171-174: Make, Model, Year, Fuel → Use `vin.*` keys
- Line 190: "Mileage Check" → `t('vin.mileageCheck')`
- Line 79-98: Mileage assessment labels → Use translation keys
- Line 209: "Origin:" → `t('vin.origin')`
- Line 22: "Loading Map..." → `t('vin.loadingMap')`

### 7. Car Listing Card (`src/components/ui/car-listing-card.tsx`)
- Line 64: "Price not available" → `t('card.priceNotAvailable')`
- Line 112: "No image available" → `t('card.noImageAvailable')`
- Line 130: "Saved" → `t('card.saved')`
- Line 177: "Compare" → `t('card.compare')`
- Line 239: "View Details" → `t('card.viewDetails')`

## Implementation Notes

1. Add `import { useLanguage } from '@/contexts/LanguageContext';` to each file
2. Add `const { t } = useLanguage();` at the beginning of each component
3. Replace hardcoded strings with `t('key')` calls
4. For strings with variables, use `t('key', { variable: value })`
5. For pluralization, use the pattern already established in the context

## Priority Order

1. Dashboard components (most visible)
2. Compare page (frequently used)
3. Main Info Tab (default view)
4. Damage Detection Tab
5. VIN Checkup Tab
6. Car Listing Card
7. Scrape page
