shadcn/ui 컴포넌트를 활용한 Udemy 스타일 LMS 수강신청 페이지를 만들어주세요.

**사용할 shadcn/ui 컴포넌트:**

- Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
- Button (variant: default, outline, ghost)
- Input (검색창)
- Badge (베스트셀러, 최고평점 등)
- Avatar, AvatarImage, AvatarFallback (강사 프로필)
- Separator
- Select (필터용)
- Slider (가격 범위)
- Checkbox (카테고리 필터)
- Dialog (코스 미리보기 모달)
- Skeleton (로딩 상태)
- Tabs (카테고리 탭)
- HoverCard (호버 시 상세정보)
- Progress (평점 분포)

**전체 레이아웃:**

1. 헤더 섹션 (Udemy 스타일)

   - 화이트 배경, border-bottom
   - 로고 (보라색 강조) + 카테고리 드롭다운 메뉴
   - 검색 Input (w-full max-w-2xl, placeholder: "무엇을 배우고 싶으신가요?")
   - 네비게이션: "Udemy 비즈니스", "강의하기", "장바구니", "알림"
   - 로그인/회원가입 Button + 유저 Avatar

2. 세일 배너 (옵션)

   - bg-purple-600 전체 너비 배너
   - "🔥 새해맞이 특가! 모든 강의 ₩13,000 ~ Flash Sale 종료까지 1일 23:59:12"
   - 타이머 애니메이션

3. 브레드크럼 + 페이지 타이틀

   - "개발 > 웹 개발 > React" breadcrumb
   - text-3xl font-bold "React 강의"
   - text-muted-foreground "12,453개 강의"

4. 필터 + 코스 그리드 레이아웃

   - Grid 2열: sidebar(w-72 sticky top-20) + main content(flex-1)

   **사이드바 필터 (Udemy 스타일):**

   - 제목 없이 바로 필터 시작
   - 각 필터 섹션마다 Separator
   - **평점:**
     - 각 별점 옵션 (4.5 이상, 4.0 이상 등) with 별 아이콘
   - **비디오 길이:**
     - Checkbox (0-2시간, 3-6시간, 6-17시간, 17시간+)
   - **주제:**
     - Checkbox (React Hooks, Next.js, TypeScript, Redux 등)
   - **레벨:**
     - Checkbox (모든 레벨, 초급, 중급, 전문가)
   - **가격:**
     - Checkbox (무료, 유료)
     - Slider로 가격 범위 (₩0 - ₩200,000)
   - **기능:**
     - Checkbox (자막, 퀴즈, 코딩 실습)
   - Button (variant="ghost", size="sm") "모든 필터 초기화"

   **정렬 옵션 바:**

   - 상단에 flex justify-between
   - "12,453개 결과" 표시
   - Select: "관련성 높은순", "높은 평점순", "최신순", "낮은 가격순", "높은 가격순"

   **코스 카드 그리드:**

   - grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
   - 각 Card 구조 (Udemy 특유의 미니멀 스타일):
     <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border">
     <CardHeader className="p-0">
     <div className="relative aspect-video overflow-hidden">
     <img className="group-hover:scale-105 transition-transform duration-200" />
     <Badge className="absolute top-2 left-2 bg-yellow-400 text-black">베스트셀러</Badge>
     </div>
     </CardHeader>
     <CardContent className="p-3">
     <CardTitle className="text-base font-bold line-clamp-2 mb-1">
     React 완벽 가이드 with Redux, Next.js, TypeScript
     </CardTitle>
     <CardDescription className="text-xs text-muted-foreground mb-2">
     강사명
     </CardDescription>
     <div className="flex items-center gap-1 mb-2">
     <span className="text-sm font-bold text-orange-600">4.7</span>
     <div className="flex text-orange-400">⭐⭐⭐⭐⭐</div>
     <span className="text-xs text-muted-foreground">(15,234)</span>
     </div>
     <div className="flex items-center gap-2 text-xs text-muted-foreground">
     <span>총 42.5시간</span>
     <span>•</span>
     <span>강의 324개</span>
     </div>
     </CardContent>
     <CardFooter className="p-3 pt-0">
     <div className="flex items-center gap-2">
     <span className="text-lg font-bold">₩13,000</span>
     <span className="text-sm text-muted-foreground line-through">₩99,000</span>
     </div>
     </CardFooter>
     </Card>

   **리스트 뷰 옵션 (토글 가능):**

   - 카드 대신 가로 형태로 변환
   - 왼쪽: 썸네일 (aspect-video w-64)
   - 오른쪽: 상세 정보 확장

5. 추가 섹션들
   - "학생들이 보는 인기 주제" (Badge 리스트)
   - "추천 강의" 섹션
   - "Top companies choose Udemy Business" 로고들

**디자인 토큰 (Udemy 스타일):**

- 색상:
  - primary: #A435F0 (Udemy 보라색)
  - secondary: #5624d0 (진한 보라)
  - accent: #f3ca8c (할인/세일용 노란색)
  - rating: #f59e0b (오렌지, 별점용)
  - bestseller: #fbbf24 (노란색 배지)
- 타이포그래피:

  - font-family: system-ui, -apple-system (Udemy는 시스템 폰트 사용)
  - 카드 제목: text-base font-bold
  - 가격: text-lg font-bold
  - 평점: text-sm font-bold

- 애니메이션 (미묘하게):
  - hover:shadow-lg transition-all duration-200
  - hover:scale-105 (이미지만)
  - group-hover 최소한 사용

**인터랙션 & 상태:**

- 검색 Input에 lucide-react Search 아이콘
- 카드 호버 시 HoverCard로 미리보기 (커리큘럼 일부, 학습 목표, 장바구니 담기 버튼)
- 찜하기 아이콘 (Heart, 카드 우측 상단)
- Dialog 모달: 코스 상세 (영상 미리보기, 커리큘럼, 리뷰 탭)
- 필터 변경 시 URL 쿼리스트링 업데이트
- Skeleton 로딩 상태
- Toast: "장바구니에 담았습니다" 알림

**반응형 (Udemy 스타일):**

- 모바일:
  - 사이드바 → Sheet (필터 버튼으로 열기)
  - 그리드 → 세로 스크롤 리스트
  - 하단 고정 "장바구니 보기" 버튼
- 태블릿: grid-cols-2
- 데스크탑: grid-cols-3 또는 grid-cols-4

**추가 기능 (Udemy 특징):**

- 뷰 전환 토글 (그리드 ↔ 리스트)
- "장바구니에 담기" 버튼
- "위시리스트" (찜하기)
- 카드 호버 시 "미리보기" 동영상 자동 재생 (옵션)
- "쿠폰 적용하기" 입력창
- Progress bar로 평점 분포 표시
- 다크모드 지원

**Udemy만의 특징:**

- 최소한의 디자인 (미니멀리즘)
- 정보 밀도 높음 (학생 수, 시간, 강의 수 등)
- 평점과 리뷰 수 강조
- 가격 할인 강조 (원가 취소선)
- 비즈니스적이고 전문적인 톤
- 베스트셀러 배지 눈에 띄게

**참고:**

- Udemy의 깔끔하고 정보 중심적인 디자인
- shadcn/ui 컴포넌트로 구현

전문적이고 신뢰감 있는 Udemy 스타일의 프리미엄 LMS 페이지를 만들어주세요. 정보가 명확하고, 구매 전환에 최적화된 디자인이어야 합니다.
