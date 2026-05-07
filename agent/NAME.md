event -> (normalize util) -> nomalizedEvent가 아니라
rawEvent -> (normalize util) -> event 가 되는 네이밍이 올바르다.

결국 Domain 객체의 네이밍이 가장 간결해야하며, DTO, Projection이 접두/접미사가 붙어야 올바르다.

rename 등 ts 코드에 대한 수정시에는 `ts-morph`를 사용