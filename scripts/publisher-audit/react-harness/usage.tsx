/* react-harness/usage.tsx — TypeScript(strict) 가 index.d.ts 를 받아들이는지 보는 시험 파일.
 * 위쪽(OK 구역)은 README 예시와 타입 정의대로 쓴 코드 — 오류가 0 이어야 한다.
 * 아래쪽(EXPECT 구역)은 일부러 틀린 코드 — 각 줄 위 @ts-expect-error 가 "실제로 오류가 났는지"를 tsc 가 확인한다.
 * 오류가 안 나면 tsc 가 "Unused '@ts-expect-error' directive" 를 내고, 검수기는 그 줄을 "타입이 실수를 못 잡음" 으로 기록한다.
 */
import { useRef, useState } from "react";
import { S1Button, S1Input, S1Table, S1Chip, S1BottomSheet, S1Select, S1Modal, S1Checkbox, S1_VERSION } from "./s1-ui/platform/react";

export function Ok() {
  const [name, setName] = useState("");
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const save = () => undefined;
  return (
    <div>
      <p>{S1_VERSION}</p>
      <S1Button variant="primary" size="md" parts={{ label: "확인" }} onClick={save} />
      <S1Input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" inputRef={inputRef} />
      <S1Table headerCells={["이름", "부서", "수량"]} rows={[["김하늘", "디자인", 3], ["박바다", "개발", 5]]} />
      <S1Table rows={[{ cells: ["합계", "", { content: 8, attrs: { "data-align": "center" } }] }]} />
      <S1Chip selected={on} onSelectedChange={(next) => setOn(next)} />
      <S1BottomSheet open={open} onClose={() => setOpen(false)} />
      <S1Select options={["서울", "부산"]} onChange={(event) => console.log(event.detail)} />
      <S1Checkbox checked={on} onChange={(event) => setOn(event.target.checked)} />
      <S1Modal variant="single" />
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
      {/* EXPECT:input-onchange-any — Input onChange 의 event 가 any 라 없는 속성도 통과 */}
      {/* @ts-expect-error */}
      <S1Input onChange={(event) => event.nonexistent.deep} />
    </div>
  );
}
