/**
 * component-ids.mjs — 배포본에 담기는 컴포넌트와 그 순서(정본 목록).
 * 빌드(build.mjs)와 번호 매기기(scripts/ui-library-version.js)가 같은 목록을 봐야
 * 조합 지문이 어긋나지 않으므로 한 곳에 둔다. 순서가 곧 CSS 묶음 순서다.
 */
// lnb 는 아직 담지 않는다 — 판 접기 아이콘(ic_패널접기)이 Figma 아이콘 라이브러리에 없어
// 정본(설치기) 신설이 river 결정 대기다(2026-09-29). 원본 코드는 만들어 두었고, 결정이 나면 이 목록에 넣는다.
// data-tag 는 뱃지 전용 색 7줄을 정본에 넣어(river 승인 2026-09-30) 함께 담는다.
export const componentIds = ["input", "button", "checkbox", "radio", "toggle", "chip", "dropdown", "select", "filter-chip", "tab", "pagination", "textarea", "multi-toggle", "modal", "table", "mobile-bottom-nav", "mobile-header", "time-picker", "date-picker", "gnb", "gnb-sub-menu-item", "gnb-sub-menu", "assist-button", "text-button", "modal-content", "bottom-sheet-option", "bottom-sheet", "list-row", "expandable-card", "data-tag", "divider"];
