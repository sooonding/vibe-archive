shadcn/ui 컴포넌트를 활용한 최신 트렌드 LMS 수강신청 페이지를 React로 만들어주세요.

**사용할 shadcn/ui 컴포넌트:**

- Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
- Button (variant: default, outline, ghost)
- Input (검색창)
- Badge (베스트셀러, 신규 등)
- Avatar, AvatarImage, AvatarFallback (강사 프로필)
- Separator
- Select (필터용)
- Slider (가격 범위)
- Checkbox (카테고리 필터)
- Dialog (코스 미리보기 모달)
- Skeleton (로딩 상태)
- Tabs (카테고리 탭)
- HoverCard (호버 시 상세정보)

**전체 레이아웃:**

1. 헤더 섹션

   - Container 안에 flex 레이아웃
   - 로고 + 네비게이션 메뉴
   - 검색 Input (w-full max-w-md, 아이콘 포함)
   - 다크모드 토글 + 유저 Avatar

2. 히어로 섹션

   - 그라디언트 배경 (bg-gradient-to-r from-purple-600 to-blue-600)
   - 대형 타이틀 (text-4xl font-bold text-white)
   - 서브텍스트 (text-xl text-white/90)
   - 검색 Input (큰 사이즈, shadow-2xl)
   - 인기 검색어 Badge 리스트

3. 필터 + 코스 그리드 레이아웃

   - Grid 2열: sidebar(w-64 sticky top-20) + main content(flex-1)

   **사이드바 필터:**

   - Card 컴포넌트로 감싸기
   - Select로 정렬 옵션 (인기순, 최신순, 평점순)
   - Checkbox로 카테고리 (디자인, 개발, 비즈니스 등)
   - Slider로 가격 범위 (0 - 100000원)
   - Checkbox로 난이도 (초급, 중급, 고급)
   - Button (variant="outline")로 필터 초기화

   **코스 카드 그리드:**

   - grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
   - 각 Card 구조:
     <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
     <CardHeader className="p-0">
     <div className="relative aspect-video overflow-hidden rounded-t-lg">
     <img /> (코스 썸네일, group-hover:scale-105)
     <Badge className="absolute top-2 right-2">베스트셀러</Badge>
     </div>
     </CardHeader>
     <CardContent className="p-4">
     <CardTitle className="line-clamp-2">강의 제목</CardTitle>
     <CardDescription className="flex items-center gap-2 mt-2">
     <Avatar className="w-6 h-6" />
     <span>강사명</span>
     </CardDescription>
     <div className="flex items-center gap-2 mt-2">
     <div className="flex">⭐⭐⭐⭐⭐</div>
     <span className="text-sm text-muted-foreground">4.8 (2.3k)</span>
     </div>
     </CardContent>
     <CardFooter className="p-4 pt-0 flex justify-between items-center">
     <div className="flex flex-col">
     <span className="text-2xl font-bold">₩39,000</span>
     <span className="text-sm text-muted-foreground line-through">₩99,000</span>
     </div>
     <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
     수강신청
     </Button>
     </CardFooter>
     </Card>

4. 추가 섹션들
   - Tabs로 "전체", "추천", "베스트", "신규" 탭
   - "추천 강의" 섹션 (AI 개인화, 슬라이더 효과)
   - "계속 수강하기" (Progress bar 포함)

**디자인 토큰 (Tailwind + shadcn/ui):**

- 색상은 shadcn/ui 기본 테마 사용
  - primary: hsl(var(--primary))
  - secondary: hsl(var(--secondary))
  - muted: hsl(var(--muted))
  - accent: hsl(var(--accent))
- 커스텀 그라디언트:

  - bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600
  - bg-gradient-to-br from-pink-500 to-orange-400 (CTA 버튼)

- 애니메이션:
  - hover:scale-105 transition-transform duration-300
  - hover:shadow-2xl transition-shadow
  - group-hover 효과 활용

**인터랙션 & 상태:**

- 검색 Input에 lucide-react 아이콘 (Search, X)
- 카드 클릭 → Dialog 모달로 코스 상세 (비디오 플레이어, 커리큘럼, 리뷰)
- 필터 변경 시 Skeleton 로딩 → 결과 표시
- 빈 결과 시 일러스트 + "검색 결과가 없습니다" 메시지
- 무한 스크롤 구현 (Intersection Observer)

**반응형:**

- 모바일: 사이드바 → Sheet 컴포넌트로 변경
- 그리드: lg:grid-cols-3 md:grid-cols-2 grid-cols-1
- 하단 네비게이션 (모바일 전용)

**추가 기능:**

- 다크모드 완벽 지원 (dark: 접두사 활용)
- 찜하기 버튼 (Heart 아이콘, lucide-react)
- 공유하기 (Share2 아이콘)
- Toast 알림 (수강신청 완료 시)
- HoverCard로 강사 프로필 미리보기

**참고:**

- Domestika의 비주얼 감성 + shadcn/ui의 모던한 컴포넌트 시스템
- 모든 컴포넌트는 @/components/ui에서 import
- Tailwind CSS의 유틸리티 클래스 최대 활용
- 접근성(a11y) 고려: aria-label, 키보드 네비게이션

다크모드에서도 완벽하게 작동하고, 애니메이션이 부드럽고, 사용자 경험이 최상인 프리미엄 LMS 페이지를 만들어주세요.
