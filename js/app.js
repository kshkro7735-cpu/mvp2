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
    } else if (pageType === "video-generator") {
        initVideoGenerator();
    } else if (pageType === "contact") {
        initContact();
    }

    // 전화번호(tel:) 클릭 시 커스텀 처리 (데스크톱 및 모바일에서 모달 형식으로 명확히 노출 + 자동 복사)
    document.addEventListener("click", (e) => {
        const telLink = e.target.closest("a[href^='tel:']");
        if (telLink) {
            // 모달 안의 진짜 전화걸기 단추인 경우 이벤트를 차단하지 않고 실제 발신 처리
            if (telLink.id === "phone-modal-call-btn") {
                return;
            }

            e.preventDefault();
            const phoneNum = telLink.getAttribute("href").replace("tel:", "");
            
            // 링크의 data-name 속성 또는 인접 카드 요소를 통해 상호명 확보
            let shopName = telLink.getAttribute("data-name");
            if (!shopName) {
                const card = telLink.closest(".card");
                if (card) {
                    const titleSpan = card.querySelector(".shop-title span");
                    if (titleSpan) {
                        shopName = titleSpan.innerText;
                    }
                }
            }

            // 클립보드 복사 실행 (실패하더라도 모달이 보이기 때문에 사용성 유지)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(phoneNum).catch(() => {
                    fallbackCopyTextToClipboardSilently(phoneNum);
                });
            } else {
                fallbackCopyTextToClipboardSilently(phoneNum);
            }

            // 커스텀 폰 팝업 모달 노출
            showPhoneModal(phoneNum, shopName);
        }
    });

    // 복귀 안심 타이머 초기화 (전 페이지 공통)
    initReturnTimer();

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

    // 다크모드 설정 적용
    const isDarkMode = localStorage.getItem("yanggu_dark_mode") === "enabled";
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    // 헤더 주입
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (headerPlaceholder) {
        const darkIcon = isDarkMode ? "sun" : "moon";
        headerPlaceholder.innerHTML = `
            <header class="app-header">
                <a href="index.html" class="logo">
                    <i data-lucide="map-pin"></i> 양구온길<span>.</span>
                </a>
                <nav class="desktop-nav">
                    <a href="index.html" class="${currentPage === 'home' ? 'active' : ''}">홈</a>
                    <a href="courses.html" class="${currentPage === 'courses' || currentPage === 'course-detail' ? 'active' : ''}">추천코스</a>
                    <a href="directory.html" class="${currentPage === 'directory' ? 'active' : ''}">주변정보</a>
                    <a href="video-generator.html" class="${currentPage === 'video-generator' ? 'active' : ''}">5초 영상</a>
                    <a href="contact.html" class="${currentPage === 'contact' ? 'active' : ''}">제휴·문의</a>
                </nav>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button id="btn-dark-toggle" style="background: none; border: none; cursor: pointer; color: var(--text-main); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; transition: var(--transition);" title="야간 테마 토글">
                        <i data-lucide="${darkIcon}" style="width: 20px; height: 20px;"></i>
                    </button>
                    <a href="directory.html" class="header-action" style="padding-left: 0;">
                        <i data-lucide="percent" style="color: var(--accent); width: 18px; height: 18px;"></i>
                        <span style="color: var(--accent)">군인혜택 찾기</span>
                    </a>
                </div>
            </header>
        `;

        // 다크모드 토글 바인딩
        const darkBtn = headerPlaceholder.querySelector("#btn-dark-toggle");
        if (darkBtn) {
            darkBtn.addEventListener("click", () => {
                const nowDark = document.body.classList.toggle("dark-mode");
                localStorage.setItem("yanggu_dark_mode", nowDark ? "enabled" : "disabled");
                
                const icon = darkBtn.querySelector("i");
                if (icon) {
                    if (nowDark) {
                        icon.setAttribute("data-lucide", "sun");
                    } else {
                        icon.setAttribute("data-lucide", "moon");
                    }
                    if (typeof lucide !== "undefined") {
                        lucide.createIcons({ node: darkBtn });
                    }
                }
            });
        }
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
                <a href="video-generator.html" class="bottom-nav-item ${currentPage === 'video-generator' ? 'active' : ''}">
                    <i data-lucide="film"></i>
                    <span>5초 영상</span>
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

    // D-Day 타이머 초기화
    initDDay();

    function initDDay() {
        const picker = document.getElementById("dday-date-picker");
        const btnSave = document.getElementById("btn-save-dday");
        const btnReset = document.getElementById("btn-reset-dday");
        const inputZone = document.getElementById("dday-input-zone");
        const displayZone = document.getElementById("dday-display-zone");
        const timerText = document.getElementById("dday-timer");
        const targetText = document.getElementById("dday-target-text");

        if (!picker || !btnSave) return;

        let intervalId = null;

        // 미래 날짜만 선택 가능하도록 제한
        const todayStr = new Date().toISOString().split("T")[0];
        picker.min = todayStr;

        const savedDDay = localStorage.getItem("yanggu_dday");
        if (savedDDay) {
            startCountdown(savedDDay);
        } else {
            inputZone.style.display = "block";
            displayZone.style.display = "none";
        }

        btnSave.addEventListener("click", () => {
            const dateVal = picker.value;
            if (!dateVal) {
                alert("수료식 날짜를 선택해 주세요!");
                return;
            }
            localStorage.setItem("yanggu_dday", dateVal);
            startCountdown(dateVal);
        });

        btnReset.addEventListener("click", () => {
            localStorage.removeItem("yanggu_dday");
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            picker.value = "";
            inputZone.style.display = "block";
            displayZone.style.display = "none";
        });

        const btnStartReturn = document.getElementById("btn-start-return-timer");
        if (btnStartReturn) {
            btnStartReturn.addEventListener("click", () => {
                showReturnTimerSetupModal();
            });
        }

        function startCountdown(targetDateStr) {
            inputZone.style.display = "none";
            displayZone.style.display = "block";

            const targetDate = new Date(targetDateStr + "T10:00:00");
            const daysOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
            targetText.innerText = `${targetDate.toLocaleDateString("ko-KR", daysOptions)} 오전 10:00 수료식`;

            if (intervalId) {
                clearInterval(intervalId);
            }

            updateTimer();
            intervalId = setInterval(updateTimer, 1000);

            function updateTimer() {
                const now = new Date();
                const diffMs = targetDate - now;

                if (diffMs <= 0) {
                    timerText.innerText = "수료식 당일입니다! 🎉";
                    timerText.style.fontSize = "1.5rem";
                    clearInterval(intervalId);
                    intervalId = null;
                    return;
                }

                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

                const pad = num => String(num).padStart(2, "0");
                timerText.innerText = `D-${diffDays}일 ${pad(diffHours)}:${pad(diffMinutes)}:${pad(diffSeconds)}`;
                timerText.style.fontSize = "1.8rem";
            }
        }
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
                    <a href="tel:${shop.phone}" data-name="${shop.name}" class="btn btn-outline" style="padding: 10px 14px; font-size: 0.9rem; flex: 1;">
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

    // 요약 복사 및 인쇄 버튼 바인딩
    const btnExportText = document.getElementById("btn-export-text");
    const btnPrintPage = document.getElementById("btn-print-page");

    if (btnExportText) {
        btnExportText.addEventListener("click", () => {
            let summaryText = `[양구온길] ${course.title}\n`;
            summaryText += `소요시간: ${course.duration}\n`;
            summaryText += `설명: ${course.summary}\n\n`;
            summaryText += `◆ 상세 일정표 ◆\n`;
            
            course.timeline.forEach((item, idx) => {
                summaryText += `${idx + 1}. [${item.time}] ${item.title}\n   장소: ${item.place}\n   내용: ${item.desc}\n\n`;
            });
            
            summaryText += `* 복귀 마감 시간(17:00~17:30)을 준수해 안전하게 복귀해 주세요.`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(summaryText).then(() => {
                    showToast("일정 텍스트가 복사되었습니다!");
                }).catch(err => {
                    fallbackCopyTextToClipboard(summaryText);
                });
            } else {
                fallbackCopyTextToClipboard(summaryText);
            }
        });
    }

    if (btnPrintPage) {
        btnPrintPage.addEventListener("click", () => {
            window.print();
        });
    }
}

/**
 * 4. 주변 정보 디렉토리 페이지 초기화
 */
function initDirectory() {
    const urlParams = new URLSearchParams(window.location.search);
    let currentCategory = urlParams.get("category") || "all";
    let searchQuery = urlParams.get("q") || "";
    let currentSort = "default";
    let renderTimeout = null;

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
        if (renderTimeout) {
            clearTimeout(renderTimeout);
        }

        // 펄스 형태의 스켈레톤 로더 카드 우선 노출
        cardListEl.innerHTML = `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-info">
                    <div class="skeleton-text title"></div>
                    <div class="skeleton-text subtitle"></div>
                    <div class="skeleton-text menu"></div>
                    <div class="skeleton-text desc"></div>
                    <div class="skeleton-text btn"></div>
                </div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-info">
                    <div class="skeleton-text title"></div>
                    <div class="skeleton-text subtitle"></div>
                    <div class="skeleton-text menu"></div>
                    <div class="skeleton-text desc"></div>
                    <div class="skeleton-text btn"></div>
                </div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-info">
                    <div class="skeleton-text title"></div>
                    <div class="skeleton-text subtitle"></div>
                    <div class="skeleton-text menu"></div>
                    <div class="skeleton-text desc"></div>
                    <div class="skeleton-text btn"></div>
                </div>
            </div>
        `;

        renderTimeout = setTimeout(() => {
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

            // 레이더 드로잉 실행
            drawRadar(filtered);

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
                    <div class="shop-img-container">
                        <div class="shop-img-bg-layer" style="${backgroundStyle}"></div>
                        <div class="card-action-btns">
                            <button class="btn-card-action btn-video-loop" data-id="${shop.id}" title="5초 영상 시뮬레이션">
                                <i data-lucide="video" style="width: 15px; height: 15px;"></i>
                            </button>
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
                            <a href="tel:${shop.phone}" data-name="${shop.name}" class="btn btn-outline" style="flex: 1;">
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

            // 비디오 시뮬레이션 토글 이벤트 연결
            const videoBtns = cardListEl.querySelectorAll(".btn-video-loop");
            videoBtns.forEach(btn => {
                btn.addEventListener("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const shopCard = this.closest(".shop-card");
                    if (shopCard) {
                        const isLooping = shopCard.classList.toggle("cinematic-loop");
                        this.classList.toggle("video-active", isLooping);
                        if (isLooping) {
                            showToast("5초 시네마틱 영상 루프를 재생합니다.");
                        } else {
                            showToast("영상 재생을 일시정지합니다.");
                        }
                    }
                });
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
        }, 350);
    }

    function drawRadar(filtered) {
        const container = document.getElementById("radar-markers-container");
        if (!container) return;
        container.innerHTML = "";

        const centerX = 110;
        const centerY = 110;

        filtered.forEach((shop, index) => {
            const matches = shop.distance.match(/\d+/);
            const mins = matches ? parseInt(matches[0], 10) : 999;

            let r = 90;
            if (mins <= 5) {
                r = 30;
            } else if (mins <= 10) {
                r = 60;
            } else if (mins <= 15) {
                r = 90;
            } else {
                r = 100;
            }

            const theta = (index * (2 * Math.PI / filtered.length)) - (Math.PI / 2);
            const x = centerX + r * Math.cos(theta);
            const y = centerY + r * Math.sin(theta);

            let categoryIcon = "map-pin";
            if (shop.category === "lodging") {
                categoryIcon = "home";
            } else if (shop.category === "restaurant") {
                categoryIcon = "utensils";
            } else if (shop.category === "cafe") {
                categoryIcon = "coffee";
            }

            const marker = document.createElement("div");
            marker.className = "radar-marker";
            marker.style.left = `${x}px`;
            marker.style.top = `${y}px`;
            marker.title = `${shop.name} (${shop.distance})`;
            marker.dataset.id = shop.id;
            marker.innerHTML = `<i data-lucide="${categoryIcon}"></i>`;

            marker.addEventListener("click", (e) => {
                e.stopPropagation();
                searchInput.value = shop.name;
                searchQuery = shop.name.toLowerCase();
                renderShops();

                setTimeout(() => {
                    const card = document.querySelector(`.shop-card`);
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        card.style.borderColor = 'var(--accent)';
                        card.style.boxShadow = '0 0 15px rgba(231, 111, 81, 0.3)';
                        setTimeout(() => {
                            card.style.borderColor = '';
                            card.style.boxShadow = '';
                        }, 2000);
                    }
                }, 400);
            });

            container.appendChild(marker);
        });

        if (typeof lucide !== "undefined") {
            lucide.createIcons({ node: container });
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
        try {
            lucide.createIcons({
                attrs: {
                    style: "width:18px; height:18px; color:#FFFFFF; stroke-width: 2.5px;"
                },
                node: toast
            });
        } catch (e) {
            console.error("Lucide icon creation failed inside toast", e);
        }
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
            showToast("클립보드에 복사되었습니다!");
        } else {
            console.error('클립보드 복사 실패(fallback unsuccessful)');
        }
    } catch (err) {
        console.error('클립보드 복사 실패(fallback error)', err);
    }
    document.body.removeChild(textArea);
}

/**
 * 조용한 클립보드 복사 헬퍼 (알림창 없음)
 */
function fallbackCopyTextToClipboardSilently(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('클립보드 복사 실패', err);
    }
    document.body.removeChild(textArea);
}

/**
 * 전화번호 확인용 팝업 모달 띄우기
 */
function showPhoneModal(phoneNum, shopName) {
    let modal = document.getElementById("phone-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "phone-modal";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.right = "0";
        modal.style.bottom = "0";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        modal.style.zIndex = "3000";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.padding = "20px";
        modal.style.opacity = "0";
        modal.style.pointerEvents = "none";
        modal.style.transition = "all 0.25s ease";

        modal.innerHTML = `
            <div style="background-color: var(--card-bg, #ffffff); border-radius: var(--radius-lg, 24px); padding: 24px; width: 100%; max-width: 360px; box-shadow: var(--shadow-lg); text-align: center; transform: scale(0.9); transition: all 0.25s ease;" id="phone-modal-content">
                <div style="background-color: var(--primary-light, #EBF2ED); width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <i data-lucide="phone" style="color: var(--primary, #2C5E43); width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px; color: var(--text-main, #1C2D24);" id="phone-modal-title">업체 연락처</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted, #6B7C72); margin-bottom: 16px;">아래 전화번호로 바로 연결하거나 복사할 수 있습니다.</p>
                
                <div style="font-size: 1.55rem; font-weight: 900; color: var(--accent, #E76F51); background-color: var(--bg-app, #FAF9F6); padding: 14px; border-radius: var(--radius-md, 16px); border: 1px solid var(--border, #E8EDE9); letter-spacing: 1px; margin-bottom: 20px;" id="phone-modal-number">
                    010-0000-0000
                </div>

                <div style="display: flex; gap: 8px;">
                    <button id="phone-modal-copy-btn" class="btn btn-outline" style="flex: 1; padding: 12px; font-size: 0.95rem;">번호 복사</button>
                    <a id="phone-modal-call-btn" href="#" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 0.95rem; text-decoration: none;">전화 걸기</a>
                </div>
                <button id="phone-modal-close-btn" class="btn btn-outline" style="width: 100%; margin-top: 8px; padding: 10px; font-size: 0.9rem; border: none; background: none; color: var(--text-muted);">닫기</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Close functions
        const closeModal = () => {
            modal.style.opacity = "0";
            modal.style.pointerEvents = "none";
            modal.querySelector("#phone-modal-content").style.transform = "scale(0.9)";
            setTimeout(() => {
                modal.style.display = "none";
            }, 250);
        };

        modal.querySelector("#phone-modal-close-btn").addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Copy event
        modal.querySelector("#phone-modal-copy-btn").addEventListener("click", () => {
            const num = modal.querySelector("#phone-modal-number").innerText;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(num).then(() => {
                    showToast("전화번호가 복사되었습니다!");
                }).catch(() => {
                    fallbackCopyTextToClipboard(num);
                });
            } else {
                fallbackCopyTextToClipboard(num);
            }
        });
    }

    // Update dynamic contents
    const titleEl = modal.querySelector("#phone-modal-title");
    const numEl = modal.querySelector("#phone-modal-number");
    const callBtn = modal.querySelector("#phone-modal-call-btn");

    titleEl.innerText = shopName ? `${shopName} 연락처` : "업체 연락처";
    numEl.innerText = phoneNum;
    callBtn.setAttribute("href", `tel:${phoneNum}`);

    if (typeof lucide !== "undefined") {
        try {
            lucide.createIcons({ node: modal });
        } catch (e) {
            console.error("Lucide creation inside phone modal failed:", e);
        }
    }

    // Show modal
    modal.style.display = "flex";
    // Force reflow
    modal.offsetHeight;
    modal.style.pointerEvents = "all";
    modal.style.opacity = "1";
    modal.querySelector("#phone-modal-content").style.transform = "scale(1)";
}

let returnTimerInterval = null;

/**
 * 복귀 안심 타이머 설정 모달 노출
 */
function showReturnTimerSetupModal() {
    let modal = document.getElementById("return-setup-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "return-setup-modal";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.right = "0";
        modal.style.bottom = "0";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        modal.style.zIndex = "3000";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.padding = "20px";
        modal.style.opacity = "0";
        modal.style.pointerEvents = "none";
        modal.style.transition = "all 0.25s ease";

        modal.innerHTML = `
            <div style="background-color: var(--card-bg, #ffffff); border-radius: var(--radius-lg, 24px); padding: 24px; width: 100%; max-width: 380px; box-shadow: var(--shadow-lg); text-align: center; transform: scale(0.9); transition: all 0.25s ease;" id="return-setup-content">
                <div style="background-color: var(--primary-light, #EBF2ED); width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <i data-lucide="bell" style="color: var(--primary, #2C5E43); width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; color: var(--text-main, #1C2D24);">복귀 안심 타이머 설정</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted, #6B7C72); margin-bottom: 20px; line-height: 1.45;">장병 복귀 마감 시간(오후 17:00)까지 남은 시간을 모든 페이지 상단에 띄우고 실시간 안내 및 경보 알람을 지원합니다.</p>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
                    <button id="setup-btn-standard" class="btn btn-primary" style="padding: 12px 16px; font-size: 0.95rem; text-align: left; justify-content: flex-start; width: 100%;">
                        🕒 오후 5시(17:00) 복귀 타이머 시작
                    </button>
                    <button id="setup-btn-test-1hr" class="btn btn-secondary" style="padding: 12px 16px; font-size: 0.95rem; text-align: left; justify-content: flex-start; color: var(--text-main); width: 100%;">
                        ⚠️ 1시간 전 경보 테스트 (61분 뒤 복귀)
                    </button>
                    <button id="setup-btn-test-30min" class="btn btn-secondary" style="padding: 12px 16px; font-size: 0.95rem; text-align: left; justify-content: flex-start; color: var(--text-main); width: 100%;">
                        🚨 30분 전 경보 테스트 (31분 뒤 복귀)
                    </button>
                    <button id="setup-btn-test-immediate" class="btn btn-secondary" style="padding: 12px 16px; font-size: 0.95rem; text-align: left; justify-content: flex-start; color: var(--text-main); width: 100%;">
                        💥 즉시 경보 테스트 (3분 뒤 복귀)
                    </button>
                </div>
                <button id="setup-btn-close" class="btn btn-outline" style="width: 100%; border: none; background: none; color: var(--text-muted);">취소</button>
            </div>
        `;
        document.body.appendChild(modal);

        const closeSetup = () => {
            modal.style.opacity = "0";
            modal.style.pointerEvents = "none";
            modal.querySelector("#return-setup-content").style.transform = "scale(0.9)";
            setTimeout(() => {
                modal.style.display = "none";
            }, 250);
        };

        modal.querySelector("#setup-btn-close").addEventListener("click", closeSetup);
        
        // Setup clicks
        modal.querySelector("#setup-btn-standard").addEventListener("click", () => {
            const now = new Date();
            const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);
            if (target < now) {
                target.setDate(target.getDate() + 1);
            }
            startTimer(target.getTime());
            closeSetup();
        });

        modal.querySelector("#setup-btn-test-1hr").addEventListener("click", () => {
            const targetTime = Date.now() + (61 * 60 * 1000);
            startTimer(targetTime);
            closeSetup();
        });

        modal.querySelector("#setup-btn-test-30min").addEventListener("click", () => {
            const targetTime = Date.now() + (31 * 60 * 1000);
            startTimer(targetTime);
            closeSetup();
        });

        modal.querySelector("#setup-btn-test-immediate").addEventListener("click", () => {
            const targetTime = Date.now() + (3 * 60 * 1000);
            startTimer(targetTime);
            closeSetup();
        });

        function startTimer(timestamp) {
            localStorage.setItem("yanggu_return_timer_target", timestamp);
            localStorage.removeItem("yanggu_alert_1hr_shown");
            localStorage.removeItem("yanggu_alert_30min_shown");
            initReturnTimer();
            showToast("복귀 안심 타이머가 활성화되었습니다!");
        }
    }

    if (typeof lucide !== "undefined") {
        try {
            lucide.createIcons({ node: modal });
        } catch (e) {
            console.error("Lucide creation in return setup modal failed:", e);
        }
    }

    modal.style.display = "flex";
    modal.offsetHeight;
    modal.style.pointerEvents = "all";
    modal.style.opacity = "1";
    modal.querySelector("#return-setup-content").style.transform = "scale(1)";
}

/**
 * 복귀 타이머 상태 관리 및 바 렌더링
 */
function initReturnTimer() {
    const targetStr = localStorage.getItem("yanggu_return_timer_target");
    if (!targetStr) {
        const banner = document.getElementById("return-timer-banner");
        if (banner) {
            banner.remove();
        }
        if (returnTimerInterval) {
            clearInterval(returnTimerInterval);
            returnTimerInterval = null;
        }
        return;
    }

    const targetTime = parseInt(targetStr, 10);

    const updateBanner = () => {
        const container = document.querySelector(".app-container");
        if (!container) return;

        let banner = document.getElementById("return-timer-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "return-timer-banner";
            banner.className = "return-timer-banner";
            container.insertBefore(banner, container.firstChild);
        }

        const now = Date.now();
        const diffMs = targetTime - now;

        if (diffMs <= 0) {
            banner.className = "return-timer-banner";
            banner.innerHTML = `
                <i data-lucide="check-circle" style="width:16px; height:16px;"></i>
                <span>복귀 마감 시간이 경과했습니다. 아들의 안전 귀대를 기원합니다! 🎉</span>
                <button id="btn-close-return-banner" style="background:none; border:none; color:#FFFFFF; cursor:pointer; font-size:1rem; margin-left:12px; display:inline-flex; align-items:center;">
                    <i data-lucide="x" style="width:14px; height:14px; stroke-width: 2.5px;"></i>
                </button>
            `;
            const closeBtn = banner.querySelector("#btn-close-return-banner");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    localStorage.removeItem("yanggu_return_timer_target");
                    localStorage.removeItem("yanggu_alert_1hr_shown");
                    localStorage.removeItem("yanggu_alert_30min_shown");
                    banner.remove();
                    if (returnTimerInterval) {
                        clearInterval(returnTimerInterval);
                        returnTimerInterval = null;
                    }
                });
            }
            if (typeof lucide !== "undefined") {
                lucide.createIcons({ node: banner });
            }
            return;
        }

        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        const diffHours = Math.floor(diffMins / 60);
        const displayMins = diffMins % 60;

        const pad = num => String(num).padStart(2, "0");
        const timeText = `${pad(diffHours)}:${pad(displayMins)}:${pad(diffSecs)}`;

        let icon = "clock";
        let bannerClass = "return-timer-banner";

        if (diffMins < 30) {
            icon = "alert-octagon";
            bannerClass = "return-timer-banner warning-red";
            
            // Trigger 30-min alert modal
            if (localStorage.getItem("yanggu_alert_30min_shown") !== "true") {
                localStorage.setItem("yanggu_alert_30min_shown", "true");
                showAlarmModal("red", "🚨 복귀 30분 전 비상!", "복귀 마감 시간까지 30분 미만으로 남았습니다. 지각 복귀가 되지 않도록 지금 즉시 신병교육대로 출발 및 아들의 짐을 최종 확인해 주시기 바랍니다.");
            }
        } else if (diffMins < 60) {
            icon = "alert-triangle";
            bannerClass = "return-timer-banner warning-orange";

            // Trigger 1-hour alert modal
            if (localStorage.getItem("yanggu_alert_1hr_shown") !== "true") {
                localStorage.setItem("yanggu_alert_1hr_shown", "true");
                showAlarmModal("orange", "⚠️ 복귀 1시간 전 알림", "복귀 마감 시각까지 1시간 남았습니다. 아들의 소지품(나라사랑카드, 신분증, 휴대폰 등)을 챙겨주시고 부대로 이동할 준비를 차분히 시작하세요.");
            }
        }

        banner.className = bannerClass;
        banner.innerHTML = `
            <i data-lucide="${icon}" style="width:16px; height:16px;"></i>
            <span>장병 복귀 마감까지 <strong>${timeText}</strong> 남음</span>
            <button id="btn-close-return-banner" style="background:none; border:none; color:inherit; cursor:pointer; font-size:1rem; margin-left:12px; display:inline-flex; align-items:center; opacity:0.85;" title="타이머 끄기">
                <i data-lucide="x" style="width:14px; height:14px; stroke-width: 2.5px;"></i>
            </button>
        `;

        const closeBtn = banner.querySelector("#btn-close-return-banner");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                localStorage.removeItem("yanggu_return_timer_target");
                localStorage.removeItem("yanggu_alert_1hr_shown");
                localStorage.removeItem("yanggu_alert_30min_shown");
                banner.remove();
                if (returnTimerInterval) {
                    clearInterval(returnTimerInterval);
                    returnTimerInterval = null;
                }
            });
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons({ node: banner });
        }
    };

    updateBanner();
    if (returnTimerInterval) {
        clearInterval(returnTimerInterval);
    }
    returnTimerInterval = setInterval(updateBanner, 1000);
}

/**
 * 복귀 알람 모달 노출 (경고음 비프 사운드 연동)
 */
function showAlarmModal(type, title, message) {
    let modal = document.getElementById("alarm-alert-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "alarm-alert-modal";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.right = "0";
        modal.style.bottom = "0";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
        modal.style.zIndex = "10005";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.padding = "20px";
        modal.style.opacity = "0";
        modal.style.pointerEvents = "none";
        modal.style.transition = "all 0.3s ease";

        modal.innerHTML = `
            <div id="alarm-alert-content" class="alarm-modal-content">
                <div id="alarm-alert-icon-bg" style="width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 18px;">
                    <i id="alarm-alert-icon" style="width: 32px; height: 32px;"></i>
                </div>
                <h3 id="alarm-alert-title" style="font-size: 1.35rem; font-weight: 900; margin-bottom: 10px;">경보 타이틀</h3>
                <p id="alarm-alert-msg" style="font-size: 0.98rem; line-height: 1.55; margin-bottom: 24px; color: var(--text-main);">경보 메시지 본문</p>
                <button id="alarm-alert-close-btn" class="btn" style="width: 100%;">확인 (알람 끄기)</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector("#alarm-alert-close-btn").addEventListener("click", () => {
            modal.style.opacity = "0";
            modal.style.pointerEvents = "none";
            modal.querySelector("#alarm-alert-content").style.transform = "scale(0.9)";
            setTimeout(() => {
                modal.style.display = "none";
            }, 300);
        });
    }

    const contentBox = modal.querySelector("#alarm-alert-content");
    const iconBg = modal.querySelector("#alarm-alert-icon-bg");
    const icon = modal.querySelector("#alarm-alert-icon");
    const titleEl = modal.querySelector("#alarm-alert-title");
    const msgEl = modal.querySelector("#alarm-alert-msg");
    const closeBtn = modal.querySelector("#alarm-alert-close-btn");

    if (type === "red") {
        contentBox.className = "alarm-modal-content red-alert";
        iconBg.style.backgroundColor = "#FEE2E2";
        icon.setAttribute("data-lucide", "alert-octagon");
        icon.style.color = "var(--accent)";
        titleEl.style.color = "var(--accent)";
        closeBtn.className = "btn btn-primary";
        closeBtn.style.backgroundColor = "var(--accent)";
        closeBtn.style.color = "#FFFFFF";
    } else {
        contentBox.className = "alarm-modal-content orange-alert";
        iconBg.style.backgroundColor = "#FEF3C7";
        icon.setAttribute("data-lucide", "alert-triangle");
        icon.style.color = "var(--secondary)";
        titleEl.style.color = "#B45309";
        closeBtn.className = "btn btn-primary";
        closeBtn.style.backgroundColor = "var(--secondary)";
        closeBtn.style.color = "#1C2D24";
    }

    titleEl.innerText = title;
    msgEl.innerText = message;

    if (typeof lucide !== "undefined") {
        try {
            lucide.createIcons({ node: modal });
        } catch (e) {
            console.error(e);
        }
    }

    // Web Audio API를 활용한 가상 사이렌/비프 사운드 재생
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            if (type === "red") {
                // High alert siren
                osc.type = "sine";
                osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.8);
            } else {
                // Warning beep
                osc.type = "triangle";
                osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.5);
            }
        }
    } catch (e) {
        console.warn("AudioContext blocked or not supported", e);
    }

    modal.style.display = "flex";
    modal.offsetHeight;
    modal.style.pointerEvents = "all";
    modal.style.opacity = "1";
    modal.querySelector("#alarm-alert-content").style.transform = "scale(1)";
}

/**
 * 6. 5초 시네마틱 영상 메이커 초기화
 */
function initVideoGenerator() {
    const canvas = document.getElementById("generator-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const presetGrid = document.getElementById("preset-images-grid");
    const uploader = document.getElementById("image-uploader");
    const uploadTrigger = document.getElementById("upload-trigger");
    const btnRender = document.getElementById("btn-render-video");
    const progressContainer = document.getElementById("render-progress-container");
    const progressBar = document.getElementById("render-progress-bar");
    const progressText = document.getElementById("render-progress-text");
    const motionButtons = document.querySelectorAll(".motion-btn");

    const presets = [
        { name: "강원한우", src: "images/gangwon_hanwoo.jpg" },
        { name: "시래원", src: "images/siraewon.png" },
        { name: "도촌막국수", src: "images/dochon_makguksu.webp" },
        { name: "파로호육개장", src: "images/paroho_yukgaejang.png" },
        { name: "밤나무회집", src: "images/bamnamu_hoejib.png" },
        { name: "금돼지상회", src: "images/geumdaeji_sanghoe.png" },
        { name: "양구고깃집", src: "images/yanggu_gogitjib.png" },
        { name: "재래식손두부", src: "images/yanggu_sondubu.jpg" }
    ];

    let activeImage = new Image();
    let activeImageLoaded = false;
    let activeMotion = "zoomIn"; // default
    let isRecording = false;
    let animFrameId = null;
    let startTime = null;

    // 1. 프리셋 이미지 그리드 생성
    presets.forEach((preset, idx) => {
        const item = document.createElement("div");
        item.className = `preset-item ${idx === 0 ? 'active' : ''}`;
        item.style.backgroundImage = `url('${preset.src}')`;
        item.innerHTML = `<span>${preset.name}</span>`;
        item.dataset.src = preset.src;

        item.addEventListener("click", () => {
            document.querySelectorAll(".preset-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");
            loadImage(preset.src);
        });

        presetGrid.appendChild(item);
    });

    // 2. 업로더 처리
    if (uploadTrigger && uploader) {
        uploadTrigger.addEventListener("click", () => uploader.click());
        uploader.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.querySelectorAll(".preset-item").forEach(el => el.classList.remove("active"));
                    loadImage(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. 모션 버튼 전환
    motionButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            motionButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            activeMotion = this.dataset.motion;
        });
    });

    // 이미지 로드 함수
    function loadImage(src) {
        activeImageLoaded = false;
        activeImage = new Image();
        activeImage.onload = () => {
            activeImageLoaded = true;
            if (!isRecording) {
                startTime = performance.now();
                startPreviewLoop();
            }
        };
        activeImage.src = src;
    }

    // 초기 첫 이미지 로드
    loadImage(presets[0].src);

    // 실시간 루프 드로잉
    function drawFrame(progress) {
        // progress: 0.0 ~ 1.0
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!activeImageLoaded) return;

        ctx.save();

        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = activeImage.width / activeImage.height;
        let sWidth, sHeight, sx, sy;

        if (imgRatio > canvasRatio) {
            sHeight = activeImage.height;
            sWidth = activeImage.height * canvasRatio;
            sx = (activeImage.width - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = activeImage.width;
            sHeight = activeImage.width / canvasRatio;
            sx = 0;
            sy = (activeImage.height - sHeight) / 2;
        }

        let scale = 1.0;
        let tx = 0;
        let ty = 0;
        let alpha = 1.0;

        if (activeMotion === "zoomIn") {
            scale = 1.02 + progress * 0.18; // 1.02 ~ 1.20배 줌인
        } else if (activeMotion === "panRight") {
            scale = 1.15; // 기본 줌 확대 후
            tx = (progress - 0.5) * -50; // 좌측에서 우측으로 50px 패닝
        } else if (activeMotion === "dissolve") {
            scale = 1.05 + progress * 0.10;
            if (progress < 0.3) {
                alpha = progress / 0.3; // 첫 1.5초(30%) 동안 서서히 페이드인
            } else {
                alpha = 1.0;
            }
        }

        ctx.translate(canvas.width / 2 + tx, canvas.height / 2 + ty);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        ctx.globalAlpha = alpha;
        ctx.drawImage(activeImage, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

        ctx.restore();
    }

    // 프리뷰 애니메이션 루프
    function startPreviewLoop() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        
        function tick(timestamp) {
            if (isRecording) return;
            if (!startTime) startTime = timestamp;
            
            // 5초(5000ms) 주기로 반복
            const elapsed = timestamp - startTime;
            const progress = (elapsed % 5000) / 5000;
            
            drawFrame(progress);
            animFrameId = requestAnimationFrame(tick);
        }
        animFrameId = requestAnimationFrame(tick);
    }

    // 4. 비디오 녹화 및 내보내기
    if (btnRender) {
        btnRender.addEventListener("click", () => {
            if (!activeImageLoaded || isRecording) return;

            isRecording = true;
            if (animFrameId) cancelAnimationFrame(animFrameId);

            btnRender.setAttribute("disabled", "true");
            btnRender.innerHTML = '<i data-lucide="loader" class="spin"></i> 렌더링 중...';
            if (typeof lucide !== "undefined") lucide.createIcons({ node: btnRender });

            progressContainer.style.display = "block";
            progressText.style.display = "block";
            progressBar.style.width = "0%";
            progressText.innerText = "영상을 만드는 중... 0%";

            // captureStream(30 fps) 지원 여부 확인
            let stream;
            try {
                stream = canvas.captureStream(30);
            } catch (e) {
                console.error("Canvas captureStream not supported", e);
                showToast("현재 브라우저에서 영상 캡처 기능이 지원되지 않습니다.");
                resetRenderUI();
                return;
            }

            let mimeType = "video/webm";
            if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
                mimeType = "video/webm;codecs=vp9";
            } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
                mimeType = "video/webm;codecs=vp8";
            }

            let mediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
            } catch (e) {
                try {
                    mediaRecorder = new MediaRecorder(stream);
                } catch (e2) {
                    console.error("MediaRecorder creation failed", e2);
                    showToast("비디오 인코더 생성에 실패했습니다.");
                    resetRenderUI();
                    return;
                }
            }

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `yanggu_video_${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                showToast("5초 시네마틱 영상 다운로드가 완료되었습니다!");
                resetRenderUI();
            };

            // 녹화 시작
            mediaRecorder.start();

            // 프레임 바이 프레임 강제 렌더링 루프 (5초 = 150프레임 @ 30fps)
            let currentFrame = 0;
            const totalFrames = 150;

            function renderFrameStep() {
                if (currentFrame > totalFrames) {
                    mediaRecorder.stop();
                    return;
                }

                const progress = currentFrame / totalFrames;
                drawFrame(progress);

                // UI 갱신
                const percent = Math.floor(progress * 100);
                progressBar.style.width = `${percent}%`;
                progressText.innerText = `영상을 만드는 중... ${percent}%`;

                currentFrame++;
                // 30fps 속도로 렌더 진행 시뮬레이션
                setTimeout(renderFrameStep, 1000 / 30);
            }

            renderFrameStep();
        });
    }

    function resetRenderUI() {
        isRecording = false;
        progressBar.style.width = "0%";
        progressContainer.style.display = "none";
        progressText.style.display = "none";
        btnRender.removeAttribute("disabled");
        btnRender.innerHTML = '<i data-lucide="film"></i> 5초 고화질 영상 만들기 (다운로드)';
        if (typeof lucide !== "undefined") {
            lucide.createIcons({ node: btnRender });
        }
        startTime = performance.now();
        startPreviewLoop();
    }
}


