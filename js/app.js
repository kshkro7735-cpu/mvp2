document.addEventListener("DOMContentLoaded", () => {
    // 1. 공통 헤더 및 하단 내비게이션 바 주입
    injectCommonUI();

    // 2. 페이지별 초기화 코드 실행 (body의 data-page 속성 기준)
    const pageType = document.body.dataset.page;
    if (pageType === "home") {
        initHome();
    } else if (pageType === "courses") {
        initCourses();
    } else if (pageType === "course-detail") {
        initCourseDetail();
    } else if (pageType === "directory") {
        initDirectory();
    } else if (pageType === "contact") {
        initContact();
    }

    // Lucide 아이콘 활성화
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
});

/**
 * 헤더 및 하단 바 동적 생성
 */
function injectCommonUI() {
    const currentPage = document.body.dataset.page;

    // 헤더 주입
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = `
            <header class="app-header">
                <a href="index.html" class="logo">
                    <i data-lucide="map-pin"></i> 양구온길<span>.</span>
                </a>
                <nav class="desktop-nav">
                    <a href="index.html" class="${currentPage === 'home' ? 'active' : ''}">홈</a>
                    <a href="courses.html" class="${currentPage === 'courses' || currentPage === 'course-detail' ? 'active' : ''}">추천코스</a>
                    <a href="directory.html" class="${currentPage === 'directory' ? 'active' : ''}">주변정보</a>
                    <a href="contact.html" class="${currentPage === 'contact' ? 'active' : ''}">제휴·문의</a>
                </nav>
                <a href="directory.html" class="header-action">
                    <i data-lucide="percent" style="color: var(--accent); width: 18px; height: 18px;"></i>
                    <span style="color: var(--accent)">군인혜택 찾기</span>
                </a>
            </header>
        `;
    }

    // 하단 내비게이션 바 주입
    const navPlaceholder = document.getElementById("nav-placeholder");
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
            <nav class="bottom-nav">
                <a href="index.html" class="bottom-nav-item ${currentPage === 'home' ? 'active' : ''}">
                    <i data-lucide="home"></i>
                    <span>홈</span>
                </a>
                <a href="courses.html" class="bottom-nav-item ${currentPage === 'courses' || currentPage === 'course-detail' ? 'active' : ''}">
                    <i data-lucide="route"></i>
                    <span>추천코스</span>
                </a>
                <a href="directory.html" class="bottom-nav-item ${currentPage === 'directory' ? 'active' : ''}">
                    <i data-lucide="search"></i>
                    <span>주변정보</span>
                </a>
                <a href="contact.html" class="bottom-nav-item ${currentPage === 'contact' ? 'active' : ''}">
                    <i data-lucide="message-square"></i>
                    <span>제휴·문의</span>
                </a>
            </nav>
        `;
    }
}

/**
 * 1. 홈 페이지 초기화
 */
function initHome() {
    const checklistContainer = document.getElementById("checklist-container");
    if (!checklistContainer) return;

    // 로컬스토리지 저장된 체크 상태 불러오기
    let checkedStates = JSON.parse(localStorage.getItem("yanggu_checklist_states")) || {};

    // 체크리스트 렌더링
    YANGGU_DATA.checklists.forEach(item => {
        const isChecked = checkedStates[item.id] ? "checked" : "";
        const itemClass = checkedStates[item.id] ? "checklist-item checked" : "checklist-item";
        
        const div = document.createElement("div");
        div.className = itemClass;
        div.id = `item-parent-${item.id}`;
        div.innerHTML = `
            <input type="checkbox" id="${item.id}" ${isChecked}>
            <label for="${item.id}" class="cursor-pointer">
                <span>[${item.category === 'essential' ? '★필수' : '추천'}] ${item.text}</span>
            </label>
        `;
        checklistContainer.appendChild(div);

        // 이벤트 리스너 바인딩
        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.addEventListener("change", (e) => {
            const parent = document.getElementById(`item-parent-${item.id}`);
            if (e.target.checked) {
                parent.classList.add("checked");
                checkedStates[item.id] = true;
            } else {
                parent.classList.remove("checked");
                checkedStates[item.id] = false;
            }
            localStorage.setItem("yanggu_checklist_states", JSON.stringify(checkedStates));
        });
    });

    // 21사단 신교대 수료 꿀팁 카드 채우기
    const tipsList = document.getElementById("military-tips-list");
    if (tipsList) {
        YANGGU_DATA.militaryCenter.tips.forEach(tip => {
            const li = document.createElement("li");
            li.style.marginBottom = "10px";
            li.style.fontSize = "1.02rem";
            li.style.lineHeight = "1.5";
            li.style.color = "var(--text-main)";
            li.innerText = tip;
            tipsList.appendChild(li);
        });
    }
}

/**
 * 2. 코스 추천 플래너 페이지 초기화
 */
function initCourses() {
    let answers = {
        companion: null, // 동반자 정보
        preference: null, // 선호 스타일
        transport: null // 교통수단
    };

    const steps = ["step-companion", "step-preference", "step-transport", "step-result-calculating"];
    let currentStepIndex = 0;

    // 설문 버튼 클릭 리스너 설정
    const optionButtons = document.querySelectorAll(".option-btn");
    optionButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            const stepId = this.dataset.step;
            const value = this.dataset.value;

            // 현재 스텝 내의 다른 버튼 선택 해제
            const siblings = this.parentElement.querySelectorAll(".option-btn");
            siblings.forEach(s => s.classList.remove("selected"));
            
            this.classList.add("selected");
            answers[stepId] = value;

            // 잠시 딜레이를 주어 터치 효과를 보여준 후 다음 단계로 자동 이동
            setTimeout(() => {
                goToNextStep();
            }, 300);
        });
    });

    function goToNextStep() {
        if (currentStepIndex < steps.length - 1) {
            // 현재 스텝 숨기기
            document.getElementById(steps[currentStepIndex]).classList.remove("active");
            currentStepIndex++;
            // 다음 스텝 보여주기
            const nextStepEl = document.getElementById(steps[currentStepIndex]);
            nextStepEl.classList.add("active");

            // 결과 계산 단계인 경우 결과 산출 실행
            if (steps[currentStepIndex] === "step-result-calculating") {
                calculateResult();
            }
        }
    }

    // 이전 단계로 가기 버튼 바인딩
    const prevButtons = document.querySelectorAll(".btn-prev");
    prevButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStepIndex > 0) {
                document.getElementById(steps[currentStepIndex]).classList.remove("active");
                currentStepIndex--;
                document.getElementById(steps[currentStepIndex]).classList.add("active");
            }
        });
    });

    // 결과 계산 로직
    function calculateResult() {
        setTimeout(() => {
            let matchedCourseId = "course-healing"; // 기본값

            // 매칭 알고리즘
            if (answers.preference === "eating") {
                matchedCourseId = "course-eating";
            } else if (answers.preference === "scenic" || answers.companion === "girlfriend") {
                matchedCourseId = "course-scenic";
            } else {
                matchedCourseId = "course-healing";
            }

            const matchedCourse = YANGGU_DATA.courses.find(c => c.id === matchedCourseId);

            // 로딩 스텝 숨기고 최종 결과 렌더링
            document.getElementById("step-result-calculating").classList.remove("active");
            
            const resultEl = document.getElementById("step-result-ready");
            resultEl.classList.add("active");

            // 결과 데이터 반영
            document.getElementById("res-title").innerText = matchedCourse.title;
            document.getElementById("res-summary").innerText = matchedCourse.summary;
            document.getElementById("res-target").innerText = `추천 대상: ${matchedCourse.target}`;
            document.getElementById("res-duration").innerText = matchedCourse.duration;

            // 결과 경로 리스트 만들기
            const pathContainer = document.getElementById("res-path-container");
            pathContainer.innerHTML = "";
            matchedCourse.path.forEach((p, idx) => {
                const badge = document.createElement("span");
                badge.className = "badge badge-tag";
                badge.style.margin = "4px";
                badge.style.fontSize = "0.95rem";
                badge.style.padding = "8px 14px";
                badge.innerText = `${idx + 1}. ${p}`;
                pathContainer.appendChild(badge);
            });

            // 상세 페이지 바로가기 링크 설정
            const detailLink = document.getElementById("res-detail-btn");
            detailLink.href = `course-detail.html?id=${matchedCourse.id}`;

        }, 1200); // 1.2초간 애니메이션 효과
    }
}

/**
 * 3. 코스 상세 페이지 초기화
 */
function initCourseDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id") || "course-healing"; // 기본 힐링 코스

    const course = YANGGU_DATA.courses.find(c => c.id === courseId);
    if (!course) {
        document.getElementById("course-detail-container").innerHTML = `
            <div class="card text-center" style="margin-top: 50px;">
                <p>죄송합니다. 코스 정보를 찾을 수 없습니다.</p>
                <a href="courses.html" class="btn btn-primary mt-20">다시 추천 받기</a>
            </div>
        `;
        return;
    }

    // 기본 헤더 타이틀 및 설명 반영
    document.getElementById("course-title").innerText = course.title;
    document.getElementById("course-summary").innerText = course.summary;
    document.getElementById("course-target").innerText = course.target;
    document.getElementById("course-duration").innerText = course.duration;

    // 타임라인 생성
    const timelineEl = document.getElementById("timeline-container");
    timelineEl.innerHTML = "";

    course.timeline.forEach((item, index) => {
        const itemEl = document.createElement("div");
        itemEl.className = "timeline-item";

        // 이 장소명과 매칭되는 상점이 있는지 확인 (길찾기 및 전화 버튼 제공 목적)
        const shop = YANGGU_DATA.shops.find(s => item.place.includes(s.name) || s.name.includes(item.place.replace(" (식당)", "").replace(" (카페)", "").replace(" (숙소 대실)", "").trim()));
        
        let actionButtonsHtml = "";
        let benefitHtml = "";
        
        if (shop) {
            benefitHtml = `
                <div style="margin-top: 10px; padding: 10px; background-color: #FFF0ED; border-radius: var(--radius-sm); border: 1px dashed #FFE0D9;">
                    <span style="color: var(--accent); font-weight: 700; font-size: 0.9rem;">🎁 면회 장병 단독 혜택</span>
                    <p style="font-size: 0.9rem; color: var(--text-main); margin-top: 4px; line-height: 1.4;">${shop.benefitDesc}</p>
                </div>
            `;

            actionButtonsHtml = `
                <div class="flex-gap-10 mt-10">
                    <a href="tel:${shop.phone}" class="btn btn-outline" style="padding: 10px 14px; font-size: 0.9rem; flex: 1;">
                        <i data-lucide="phone" style="width: 16px; height: 16px;"></i> 전화문의
                    </a>
                    <a href="${shop.mapLink}" target="_blank" class="btn btn-secondary" style="padding: 10px 14px; font-size: 0.9rem; flex: 1;">
                        <i data-lucide="map" style="width: 16px; height: 16px;"></i> 길찾기
                    </a>
                </div>
            `;
        } else if (item.place.includes("신병교육대")) {
            actionButtonsHtml = `
                <div class="mt-10">
                    <a href="${YANGGU_DATA.militaryCenter.mapLink}" target="_blank" class="btn btn-secondary" style="padding: 10px 14px; font-size: 0.9rem; width: 100%;">
                        <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i> 신교대 지도 위치 보기
                    </a>
                </div>
            `;
        }

        itemEl.innerHTML = `
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-content">
                <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--primary); margin-bottom: 6px;">📍 ${item.place}</h4>
                <p style="font-size: 0.98rem; line-height: 1.5; color: var(--text-main);">${item.desc}</p>
                ${benefitHtml}
                ${actionButtonsHtml}
            </div>
        `;
        
        timelineEl.appendChild(itemEl);
    });
}

/**
 * 4. 주변 정보 디렉토리 페이지 초기화
 */
function initDirectory() {
    const urlParams = new URLSearchParams(window.location.search);
    let currentCategory = urlParams.get("category") || "all";
    let searchQuery = urlParams.get("q") || "";
    let currentSort = "default";

    const cardListEl = document.getElementById("shop-list-container");
    const searchInput = document.getElementById("shop-search-input");
    const sortSelect = document.getElementById("shop-sort-select");
    const tabButtons = document.querySelectorAll(".tab-btn");

    // URL 파라미터에 맞는 탭 활성화 상태 처리
    if (currentCategory !== "all") {
        tabButtons.forEach(btn => {
            if (btn.dataset.category === currentCategory) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    // URL 파라미터로 전달된 검색어가 있으면 인풋에 입력
    if (searchQuery) {
        searchInput.value = searchQuery;
    }

    // 북마크 목록 초기화
    let bookmarks = JSON.parse(localStorage.getItem("yanggu_bookmarks")) || [];

    // 초기 렌더링
    renderShops();

    // 탭 클릭 이벤트 바인딩
    tabButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            tabButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentCategory = this.dataset.category;
            renderShops();
        });
    });

    // 검색 이벤트 바인딩
    searchInput.addEventListener("input", function() {
        searchQuery = this.value.trim().toLowerCase();
        renderShops();
    });

    // 정렬 이벤트 바인딩
    if (sortSelect) {
        sortSelect.addEventListener("change", function() {
            currentSort = this.value;
            renderShops();
        });
    }

    function renderShops() {
        cardListEl.innerHTML = "";

        // 북마크 로드
        bookmarks = JSON.parse(localStorage.getItem("yanggu_bookmarks")) || [];

        // 1. 카테고리 & 검색어 필터링 적용
        let filtered = YANGGU_DATA.shops.filter(shop => {
            // 카테고리 필터링 (저장한 곳 분기 포함)
            let matchesCategory = false;
            if (currentCategory === "all") {
                matchesCategory = true;
            } else if (currentCategory === "bookmarked") {
                matchesCategory = bookmarks.includes(shop.id);
            } else {
                matchesCategory = shop.category === currentCategory;
            }

            const matchesSearch = shop.name.toLowerCase().includes(searchQuery) ||
                                  shop.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
                                  shop.desc.toLowerCase().includes(searchQuery) ||
                                  shop.location.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        // 2. 정렬 적용
        if (currentSort === "rating") {
            // 별점 높은 순
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (currentSort === "distance") {
            // 거리 가까운 순 (분 파싱 비교)
            const getMinutes = (distStr) => {
                const matches = distStr.match(/\d+/);
                return matches ? parseInt(matches[0], 10) : 999;
            };
            filtered.sort((a, b) => getMinutes(a.distance) - getMinutes(b.distance));
        }

        if (filtered.length === 0) {
            cardListEl.innerHTML = `
                <div class="card text-center" style="padding: 40px 20px; grid-column: 1 / -1;">
                    <p style="font-size: 1.1rem; color: var(--text-muted);">조건에 맞는 업체 정보가 없습니다.</p>
                    <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 6px;">상호명이나 키워드를 다시 확인해 보세요.</p>
                </div>
            `;
            return;
        }

        // 카드 렌더링
        filtered.forEach(shop => {
            const card = document.createElement("div");
            card.className = "card shop-card";
            card.style.position = "relative";

            // 카테고리별 아이콘 결정
            let categoryIcon = "map-pin";
            let categoryName = "기타";
            if (shop.category === "lodging") {
                categoryIcon = "home";
                categoryName = "숙소";
            } else if (shop.category === "restaurant") {
                categoryIcon = "utensils";
                categoryName = "식당";
            } else if (shop.category === "cafe") {
                categoryIcon = "coffee";
                categoryName = "카페";
            }

            // 군 장병 혜택 뱃지 리스트 만들기
            const benefitBadgesHtml = shop.benefits.map(b => `<span class="badge badge-benefit"><i data-lucide="gift" style="width:12px; height:12px;"></i> ${b}</span>`).join("");
            // 태그 리스트 만들기
            const tagsHtml = shop.tags.map(t => `<span class="badge badge-tag">#${t}</span>`).join("");

            // 이미지가 지정되어 있으면 배경 이미지로 사용하고, 없으면 카테고리별 그라데이션 사용
            const hasImage = shop.image ? `background-image: url('${shop.image}'); background-size: cover; background-position: center;` : '';
            const gradColor = shop.category === 'lodging' ? 'linear-gradient(135deg, #2C5E43, #D4AF37)' : (shop.category === 'restaurant' ? 'linear-gradient(135deg, #4A7A96, #2C5E43)' : 'linear-gradient(135deg, #8E7A6B, #2C5E43)');
            const backgroundStyle = shop.image ? hasImage : `background: ${gradColor}`;
            const iconOpacity = shop.image ? '0.15' : '0.9';

            const isBookmarked = bookmarks.includes(shop.id);
            
            card.innerHTML = `
                <div class="shop-img-container" style="${backgroundStyle}">
                    <div class="card-action-btns">
                        <button class="btn-card-action btn-share" data-id="${shop.id}" data-name="${shop.name}" data-category="${shop.category}" title="공유하기">
                            <i data-lucide="share-2" style="width: 15px; height: 15px;"></i>
                        </button>
                        <button class="btn-card-action btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-id="${shop.id}" title="저장하기">
                            <i data-lucide="heart" style="width: 15px; height: 15px;"></i>
                        </button>
                    </div>
                    <div class="shop-img-placeholder">
                        <i data-lucide="${categoryIcon}" style="color: #ffffff; width: 42px; height: 42px; opacity: ${iconOpacity};"></i>
                        <span style="position: absolute; bottom: 12px; right: 12px; color: rgba(255,255,255,0.85); font-size: 0.85rem; font-weight: 700; background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 4px;">${categoryName}</span>
                    </div>
                    <div class="shop-badge-container">
                        <span class="badge badge-distance" style="background-color: var(--primary); color: #ffffff; border: none; font-size:0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.15)">
                            <i data-lucide="navigation" style="width: 10px; height: 10px;"></i> ${shop.distance}
                        </span>
                    </div>
                </div>
                <div class="shop-info">
                    <div class="shop-title">
                        <span>${shop.name}</span>
                        <span class="shop-rating"><i data-lucide="star" style="width:16px; height:16px; fill:#F59E0B; stroke:#F59E0B;"></i> ${shop.rating.toFixed(1)}</span>
                    </div>
                    <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 8px;">📍 ${shop.location}</p>
                    <div style="margin-bottom: 12px;">
                        ${benefitBadgesHtml}
                        ${tagsHtml}
                    </div>
                    
                    <!-- 대표 메뉴 정보 노출 -->
                    <div class="shop-menu-box">
                        <span>📋 대표 상품/메뉴</span>
                        <p>${shop.menu}</p>
                    </div>

                    <p class="shop-desc">${shop.desc}</p>
                    
                    <div style="background-color: #FFF0ED; padding: 12px; border-radius: var(--radius-sm); border: 1px dashed #FFE0D9; margin-bottom: 16px;">
                        <span style="color: var(--accent); font-weight: 700; font-size: 0.9rem;">🎁 군장병 혜택 상세</span>
                        <p style="font-size: 0.9rem; color: var(--text-main); margin-top: 3px; line-height: 1.4;">${shop.benefitDesc}</p>
                    </div>

                    <div class="shop-actions">
                        <a href="tel:${shop.phone}" class="btn btn-outline" style="flex: 1;">
                            <i data-lucide="phone"></i> 전화걸기
                        </a>
                        <a href="${shop.mapLink}" target="_blank" class="btn btn-primary" style="flex: 1;">
                            <i data-lucide="map"></i> 길찾기
                        </a>
                    </div>
                </div>
            `;
            cardListEl.appendChild(card);
        });

        // 즐겨찾기 클릭 이벤트 연결
        const bookmarkBtns = cardListEl.querySelectorAll(".btn-bookmark");
        bookmarkBtns.forEach(btn => {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                const id = this.dataset.id;
                let currentBookmarks = JSON.parse(localStorage.getItem("yanggu_bookmarks")) || [];
                
                if (currentBookmarks.includes(id)) {
                    currentBookmarks = currentBookmarks.filter(item => item !== id);
                    this.classList.remove("bookmarked");
                    showToast("즐겨찾기에서 해제되었습니다.");
                } else {
                    currentBookmarks.push(id);
                    this.classList.add("bookmarked");
                    showToast("즐겨찾기에 추가되었습니다!");
                }
                
                localStorage.setItem("yanggu_bookmarks", JSON.stringify(currentBookmarks));
                
                // 만약 '저장한 곳' 탭에서 클릭했다면 즉시 카드 삭제
                if (currentCategory === "bookmarked") {
                    renderShops();
                }
            });
        });

        // 공유하기 클릭 이벤트 연결
        const shareBtns = cardListEl.querySelectorAll(".btn-share");
        shareBtns.forEach(btn => {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                const id = this.dataset.id;
                const name = this.dataset.name;
                const category = this.dataset.category;
                
                // 공유 주소 생성 ( directory.html?category=...&q=상점명 )
                const shareUrl = `${window.location.origin}${window.location.pathname}?category=${category}&q=${encodeURIComponent(name)}`;
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        showToast("상점 링크가 복사되었습니다!");
                    }).catch(err => {
                        console.error("클립보드 복사 실패", err);
                        fallbackCopyTextToClipboard(shareUrl);
                    });
                } else {
                    fallbackCopyTextToClipboard(shareUrl);
                }
            });
        });

        // 주입 후 다시 한 번 아이콘 생성 (동적 주입된 요소 적용)
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }
}

/**
 * 5. 제휴 문의 페이지 초기화
 */
function initContact() {
    const form = document.getElementById("partner-contact-form");
    const modal = document.getElementById("contact-success-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    if (!form) return;

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        // 폼 유효성 검사 및 데이터 확보
        const shopName = document.getElementById("partner-shop-name").value.trim();
        const shopCategory = document.getElementById("partner-category").value;
        const shopPhone = document.getElementById("partner-phone").value.trim();
        const shopBenefit = document.getElementById("partner-benefit").value.trim();
        const shopDesc = document.getElementById("partner-desc").value.trim();

        if (!shopName || !shopPhone || !shopBenefit) {
            alert("필수 입력 항목(*표시)을 모두 입력해 주세요.");
            return;
        }

        const submission = {
            id: "sub-" + Date.now(),
            shopName,
            shopCategory,
            shopPhone,
            shopBenefit,
            shopDesc,
            date: new Date().toLocaleString()
        };

        // 로컬스토리지 저장
        const currentSubmissions = JSON.parse(localStorage.getItem("yanggu_partner_submissions")) || [];
        currentSubmissions.push(submission);
        localStorage.setItem("yanggu_partner_submissions", JSON.stringify(currentSubmissions));

        // 모달 띄우기
        if (modal) {
            modal.classList.add("active");
        }

        // 폼 초기화
        form.reset();
    });

    if (modalCloseBtn && modal) {
        modalCloseBtn.addEventListener("click", () => {
            modal.classList.remove("active");
        });
    }
}

/**
 * 커스텀 토스트 알림 띄우기
 */
function showToast(message) {
    let toast = document.getElementById("toast-msg");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-msg";
        toast.className = "toast-msg";
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i data-lucide="check-circle" style="width:18px; height:18px; color: #FFFFFF;"></i> <span>${message}</span>`;
    
    if (typeof lucide !== "undefined") {
        lucide.createIcons({
            attrs: {
                style: "width:18px; height:18px; color:#FFFFFF; stroke-width: 2.5px;"
            },
            node: toast
        });
    }
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

/**
 * 구형 브라우저 대응 클립보드 복사 헬퍼
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast("상점 링크가 복사되었습니다!");
        } else {
            console.error('클립보드 복사 실패(fallback unsuccessful)');
        }
    } catch (err) {
        console.error('클립보드 복사 실패(fallback error)', err);
    }
    document.body.removeChild(textArea);
}

