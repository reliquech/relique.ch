# Graph Report - c:\Users\minhmice\Documents\projects\relique.co  (2026-06-15)

## Corpus Check
- 541 files · ~467,796 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1054 nodes · 1766 edges · 56 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `GET()` - 15 edges
2. `MarketplaceAPIService` - 13 edges
3. `listingToCardItem()` - 9 edges
4. `parseMetaContent()` - 7 edges
5. `parseError()` - 7 edges
6. `AttachmentsAPIService` - 7 edges
7. `parseError()` - 7 edges
8. `CustomersAPIService` - 7 edges
9. `parseError()` - 7 edges
10. `DealsAPIService` - 7 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `parseDateParam()`  [EXTRACTED]
  c:\Users\minhmice\Documents\projects\relique.co\src\app\api\users\route.ts → c:\Users\minhmice\Documents\projects\relique.co\src\app\api\dashboard\route.ts
- `GET()` --calls--> `toDateString()`  [EXTRACTED]
  c:\Users\minhmice\Documents\projects\relique.co\src\app\api\users\route.ts → c:\Users\minhmice\Documents\projects\relique.co\src\app\api\dashboard\route.ts
- `GET()` --calls--> `publicGet()`  [EXTRACTED]
  c:\Users\minhmice\Documents\projects\relique.co\src\app\api\users\route.ts → c:\Users\minhmice\Documents\projects\relique.co\src\app\api\marketplace\route.ts
- `GET()` --calls--> `getSessionUser()`  [EXTRACTED]
  c:\Users\minhmice\Documents\projects\relique.co\src\app\api\users\route.ts → c:\Users\minhmice\Documents\projects\relique.co\src\app\api\marketplace\[param]\route.ts
- `GET()` --calls--> `isUuid()`  [EXTRACTED]
  c:\Users\minhmice\Documents\projects\relique.co\src\app\api\users\route.ts → c:\Users\minhmice\Documents\projects\relique.co\src\app\api\marketplace\[param]\route.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.02
Nodes (8): formatTimeAgo(), getStatusText(), generateMockTraceability(), TrustPanel(), capArray(), mapRowToListing(), parseJson(), pruneByLimit()

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (4): CrmSearchesAPIService, parseError(), fetchUsers(), handleInvite()

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (14): AttachmentsAPIService, parseError(), AuditLogsAPIService, parseError(), DashboardAPIService, parseError(), MessagesAPIService, parseError() (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (21): isCurrency(), loadCurrency(), addMarketplaceFavorite(), addSavedSearch(), getStatusBadgeClasses(), getStatusColor(), getListingAuthStatus(), getListingCategory() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (5): FormControl(), FormDescription(), FormLabel(), FormMessage(), useFormField()

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (38): parseFetchError(), sanitizeErrorMessage(), lookupMarketplaceItemByCode(), parseJson(), formatIsoDate(), mapAuthStatusToVerifyStatus(), mapMarketplaceToVerifyResult(), parseJson() (+30 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (20): ActivityAPIService, parseError(), checkRule(), createNotification(), addConsignDraft(), addConsignSubmission(), getConsignDrafts(), getConsignSubmissions() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (15): handleConfirm(), runBulk(), MarketplaceItemsBulkBar(), selectionLifecycleState(), buildChips(), MarketplaceItemsFilterChips(), parseDensity(), parseFeatured() (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (15): createSession(), generateUsername(), login(), ConsignedAPIService, parseError(), handleLinkPaste(), handlePaste(), validateCode() (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (2): handleSubmit(), handleVerify()

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (7): addVerifyHistoryEntry(), getVerifyHistory(), getVerifyPinned(), pinVerifyItem(), setVerifyHistory(), setVerifyPinned(), unpinVerifyItem()

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (5): createMarketplaceDraft(), parseSaveResponse(), slugify(), toPayload(), updateMarketplaceItem()

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (2): initializeActions(), registerActions()

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (6): getStatusBadge(), getStatusClasses(), isDisqualified(), isNegativeStatus(), isPositiveStatus(), isQualified()

### Community 16 - "Community 16"
Cohesion: 0.19
Nodes (10): isLegacyTempUploadPath(), isMarketplaceTempPath(), isStagingUploadPath(), parseLegacyTempUploadPath(), parseStagingUploadPath(), parseTempUploadPath(), createSessionId(), isSessionActive() (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.23
Nodes (1): MarketplaceAPIService

### Community 18 - "Community 18"
Cohesion: 0.4
Nodes (7): mapLegacyCategory(), mapLegacyStatus(), mergeFeatured(), normalizeMarketplaceCreate(), normalizeMarketplaceUpdate(), parseCommaList(), slugify()

### Community 19 - "Community 19"
Cohesion: 0.39
Nodes (2): CustomersAPIService, parseError()

### Community 20 - "Community 20"
Cohesion: 0.39
Nodes (2): LeadsAPIService, parseError()

### Community 21 - "Community 21"
Cohesion: 0.43
Nodes (2): DealsAPIService, parseError()

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 0.38
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 0.53
Nodes (2): CrmFiltersAPIService, parseError()

### Community 26 - "Community 26"
Cohesion: 0.53
Nodes (2): CrmViewsAPIService, parseError()

### Community 27 - "Community 27"
Cohesion: 0.53
Nodes (2): parseError(), UsersAPIService

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (2): createDeepLink(), getWebUrl()

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 31`** (2 nodes): `apple-icon.tsx`, `AppleIcon()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `icon.tsx`, `Icon()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `VerifyPage.tsx`, `VerifyPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `SettingsPage.tsx`, `SettingsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `AnchorSection.tsx`, `AnchorSection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `partners.data.ts`, `PartnersSection.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `clientErrorLog.ts`, `logClientError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `verify.supabase.ts`, `fetchVerifyResult()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `code.tsx`, `Code()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `next.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `base.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `boundaries.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `react-internal.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `opengraph-image.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `twitter-image.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `FeatureSection.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `team.data(backup).ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `consign.local.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `verify.local.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `contactSchema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MarketplaceAPIService` connect `Community 17` to `Community 7`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._