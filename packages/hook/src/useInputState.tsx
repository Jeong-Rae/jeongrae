import {
  useCallback,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type UseInputStateResult = {
  value: string;
  onChange: (event: ChangeEvent<InputElement>) => void;
  setValue: Dispatch<SetStateAction<string>>;
  reset: () => void;
};

/**
 * 문자열 입력 상태를 다루기 위한 훅.
 * @param initial - 초기 문자열 값
 * @returns 문자열 상태와 유틸리티 함수
 */
export function useInputState(initial = ""): UseInputStateResult {
  const [value, setValue] = useState(initial);

  const onChange = useCallback((event: ChangeEvent<InputElement>) => {
    setValue(event.target.value);
  }, []);

  const reset = useCallback(() => setValue(initial), [initial]);

  return { value, onChange, setValue, reset };
}
