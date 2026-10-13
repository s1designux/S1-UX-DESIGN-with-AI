/* react-harness/usage.tsx — TypeScript(strict) 가 index.d.ts 를 받아들이는지 보는 시험 파일.
 * 위쪽(OK 구역)은 README 예시와 타입 정의대로 쓴 코드 — 오류가 0 이어야 한다.
 * 아래쪽(EXPECT 구역)은 일부러 틀린 코드 — 각 줄 위 @ts-expect-error 가 "실제로 오류가 났는지"를 tsc 가 확인한다.
 * 오류가 안 나면 tsc 가 "Unused '@ts-expect-error' directive" 를 내고, 검수기는 그 줄을 "타입이 실수를 못 잡음" 으로 기록한다.
 */
import { useRef, useState } from "react";
import {
  S1Button, S1Input, S1Table, S1Chip, S1BottomSheet, S1Select, S1Modal, S1Checkbox, S1Pagination, S1DatePicker, S1TimePicker,
  S1ListRow, S1Gnb, S1Lnb, S1Tab, S1Toggle, S1MultiToggle, S1_VERSION, S1_RELEASED_AT
} from "./s1-ui/platform/react";

export function Ok() {
  const [name, setName] = useState("");
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState<string | number>("busan");
  const [page, setPage] = useState(1);
  const [date, setDate] = useState<string | null>("2026-10-01");
  const [time, setTime] = useState("09:30");
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const save = () => undefined;
  return (
    <div>
      <p>{S1_VERSION} {S1_RELEASED_AT}</p>
      <S1Button variant="primary" size="md" parts={{ label: "확인" }} onClick={save} />
      <S1Button ref={buttonRef} className="x" aria-label="저장" data-test="save" disabled type="submit">저장</S1Button>
      <S1Input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" inputRef={inputRef} label="이름" />
      <S1Input type="password" breakName="mobile" onChange={(event) => setName(event.target.value)} />
      <S1Table headerCells={["이름", "부서", "수량"]} rows={[["김하늘", "디자인", 3], ["박바다", "개발", 5]]} onSelectionChange={(event) => console.log(event.detail.selectedCount)} />
      <S1Table rows={[{ cells: ["합계", "", { content: 8, attrs: { "data-align": "center" } }] }]} />
      <S1Chip selected={on} onSelectedChange={(next) => setOn(next)} value="전체">전체</S1Chip>
      <S1BottomSheet open={open} onOpenChange={setOpen} onClose={() => setOpen(false)} title="글자 크기" options={["작게", { value: 3, label: "크게" }]} value={city} onValueChange={(next) => setCity(next)} />
      <S1Select options={["서울", "부산", { value: 3, label: "제주" }]} value={city} onValueChange={(next) => setCity(next)} onChange={(event) => console.log(event.detail.value)} name="city" placeholder="선택" />
      <S1Modal open={open} onOpenChange={(next, detail) => { setOpen(next); console.log(detail.reason); }} title="삭제" message="되돌릴 수 없습니다" confirmLabel="삭제" cancelLabel="취소" onConfirm={save} onCancel={save} variant="single" />
      <S1Checkbox checked={on} onChange={(event) => setOn(event.target.checked)}>동의</S1Checkbox>
      <S1Pagination page={page} totalPages={20} onPageChange={(next) => setPage(next)} />
      <S1DatePicker value={date} onValueChange={(next) => setDate(typeof next === "string" ? next : null)} name="day" />
      <S1TimePicker value={time} onValueChange={setTime} name="clock" breakName="mobile" />
      <S1ListRow variant="switch" title="알림" description="새 소식" checked={on} onCheckedChange={setOn} />
      <S1Gnb logo="로고" menus={[{ label: "공지", current: true }, { label: "서비스", columns: [{ title: "제목", items: [{ label: "링크", href: "/x" }, "글자"] }] }]} />
      <S1Lnb variant="brand" items={[{ label: "개요", current: true }, { label: "묶음", children: [{ label: "하나" }] }]} />
      <S1Tab tabs={[{ value: "a", label: "가", panel: "내용" }]} defaultValue="a" onValueChange={(next) => console.log(next)} />
      <S1Toggle checked={on} onCheckedChange={setOn} name="notify" />
      <S1MultiToggle cells={[{ value: "a", label: "왼쪽" }, { value: "b", label: "오른쪽", disabled: true }]} defaultValue="a" />
      {/* 0.22.0 코드가 쓰던 모양 — 문자열 aria-checked · 옛 슬롯 이름 · 옛 목록 모양이 타입에서 막히지 않는다 */}
      <S1Toggle aria-checked={String(on)} aria-label="푸시" onClick={() => setOn(!on)} />
      <S1Modal variant="dual" parts={{ title: "T", message: "M", label: "예" }} />
      <S1BottomSheet variant="single" parts={{ sheetTitle: "정렬", label: "완료" }} />
      <S1ListRow variant="switch" parts={{ title: "푸시", chevron: <S1Toggle aria-checked={String(on)} aria-label="푸시" /> }} />
      <S1Lnb parts={{ item: { attrs: { "data-test": "x" } }, itemIcon: "★" }} />
      <S1Select options={[{ optionLabel: "A", attrs: { "data-value": "a" } }]} parts={{ value: "A" }} />
      {/* onChange 는 이벤트(CustomEvent) · onValueChange 는 값 — 둘의 모양이 타입으로 구분된다 */}
      <S1Select options={["a", "b"]} onChange={(event) => console.log(event.detail.value, event.type)} onValueChange={(value, detail) => console.log(value, detail.option)} />
    </div>
  );
}

export function Expect() {
  return (
    <div>
      {/* EXPECT:variant — 승인 목록에 없는 variant */}
      {/* @ts-expect-error */}
      <S1Button variant="danger" />
      {/* EXPECT:typo-prop — 오타 난 prop 이름(varaint) */}
      {/* @ts-expect-error */}
      <S1Button varaint="primary" />
      {/* EXPECT:size-type — size 에 숫자 */}
      {/* @ts-expect-error */}
      <S1Button size={12} />
      {/* EXPECT:onchange-param — onSelectedChange 에 문자열을 받는 함수 */}
      {/* @ts-expect-error */}
      <S1Chip onSelectedChange={(next: string) => next.toUpperCase()} />
      {/* EXPECT:input-onchange-any — Input onChange 의 event 에 없는 속성을 읽는다 */}
      {/* @ts-expect-error */}
      <S1Input onChange={(event) => event.nonexistent.deep} />
      {/* EXPECT:modal-typo — 오타 난 prop(opne) */}
      {/* @ts-expect-error */}
      <S1Modal opne />
      {/* EXPECT:value-change-param — onValueChange 에 불리언을 받는 함수 */}
      {/* @ts-expect-error */}
      <S1Select onValueChange={(next: boolean) => next} />
      {/* EXPECT:option-shape — 목록 항목에 value 가 없다 */}
      {/* @ts-expect-error */}
      <S1Select options={[{ label: "서울" }]} />
      {/* EXPECT:event-detail — Select onChange 의 detail 에 없는 속성 */}
      {/* @ts-expect-error */}
      <S1Select onChange={(event) => event.detail.nonexistent} />
      {/* EXPECT:parts-key — parts 에 없는 슬롯 이름 */}
      {/* @ts-expect-error */}
      <S1Button parts={{ lable: "확인" }} />
      {/* EXPECT:onchange-is-event — 고르는 부품의 onChange 는 값이 아니라 이벤트를 받는다(값을 받는 함수는 안 된다) */}
      {/* @ts-expect-error */}
      <S1Select options={["a"]} onChange={(value: string) => value.toUpperCase()} />
      {/* EXPECT:onvaluechange-is-value — onValueChange 는 이벤트가 아니라 값을 받는다(이벤트를 받는 함수는 안 된다) */}
      {/* @ts-expect-error */}
      <S1Select options={["a"]} onValueChange={(event: CustomEvent) => event.detail} />
      {/* EXPECT:disabled-type — disabled 에 글자 */}
      {/* @ts-expect-error */}
      <S1Button disabled="yes" />
    </div>
  );
}
