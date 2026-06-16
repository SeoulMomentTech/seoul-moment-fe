# 프로필 이미지 크롭

마이페이지 > 프로필 관리에서 "이미지 변경" 시, 파일 선택과 업로드 사이에 **크롭 단계**를 둔다. 사용자는 모달에서 줌/이동으로 1:1(원형 가이드) 영역을 조정한 뒤 잘라낸 이미지를 업로드한다.

## 사용자 플로우

```mermaid
sequenceDiagram
    actor U as 사용자
    participant PS as ProfileSection
    participant H as useProfileImageUpload
    participant CD as ProfileImageCropDialog
    participant CI as getCroppedImageFile
    participant API as 업로드 API

    U->>PS: "이미지 변경" 클릭
    PS->>H: openFilePicker()
    H->>U: 파일 선택창 열기
    U->>H: 이미지 파일 선택
    H->>H: validateProfileImageFile()
    alt 검증 실패 (5MB 초과 / 비이미지)
        H-->>U: toast 에러
    else 검증 통과
        H->>H: URL.createObjectURL() + 크롭 모달 open
        H->>CD: imageSrc 전달
        CD->>U: 크롭 모달 표시 (1:1 원형, 줌 2x)
        U->>CD: 줌/이동 조정 후 "적용"
        CD->>CI: getCroppedImageFile(src, area, name)
        CI-->>CD: 크롭된 JPEG File
        CD->>H: onCropConfirm(file)
        H->>API: uploadImage(file)
        API-->>H: imageUrl
        H->>API: registerProfileImage(imageUrl)
        API-->>H: 성공
        H->>H: closeCropDialog() + URL revoke (effect)
        H-->>U: toast 성공 + 아바타 갱신
    end
```

## 리팩토링 전후 구조

```mermaid
flowchart LR
    subgraph Before["리팩토링 전"]
        PS1["ProfileSection.tsx<br/>(~600줄)"]
        PS1 --- S1["상태 4개<br/>fileInputRef, isCropDialogOpen,<br/>cropImageSrc, cropFileName"]
        PS1 --- H1["핸들러 4개<br/>+ mutation 2개 + 검증"]
        PS1 --- L1["⚠️ revoke는 close 시에만<br/>(언마운트/재선택 누수)"]
    end

    subgraph After["리팩토링 후"]
        PS2["ProfileSection.tsx<br/>(표현만 담당)"]
        HK["useProfileImageUpload<br/>(model/ 훅)"]
        PS2 -->|"const {...} = useProfileImageUpload()"| HK
        HK --- S2["상태 + 핸들러 + mutation + 검증<br/>캡슐화"]
        HK --- L2["✅ useEffect cleanup<br/>(src 변경/언마운트 시 revoke)"]
    end

    Before ==>|extract| After
```

## 파일 구성 (FSD 레이어)

```mermaid
flowchart TD
    subgraph ui["features/mypage/ui"]
        A["ProfileSection.tsx<br/>(수정)"]
        B["ProfileImageCropDialog.tsx<br/>(신규)"]
    end
    subgraph model["features/mypage/model"]
        C["useProfileImageUpload.ts<br/>(신규)"]
    end
    subgraph lib["features/mypage/lib"]
        D["cropImage.ts<br/>(신규)"]
        E["imageValidation.ts<br/>(재사용)"]
    end
    subgraph api["features/mypage/api"]
        F["useUploadUserImageFileMutation<br/>(재사용)"]
        G["useCreateUserProfileImageMutation<br/>(재사용)"]
    end
    subgraph ext["외부 의존성"]
        X["react-easy-crop<br/>(신규 설치)"]
    end

    A --> B
    A --> C
    C --> E
    C --> F
    C --> G
    B --> D
    B --> X
```

## 주요 파일

| 파일 | 역할 |
| --- | --- |
| `features/mypage/ui/ProfileSection.tsx` | 프로필 섹션 (표현). 훅을 소비해 크롭 모달 연결 |
| `features/mypage/ui/ProfileImageCropDialog.tsx` | 크롭 모달 (react-easy-crop, 줌 슬라이더, max-sm 반응형) |
| `features/mypage/model/useProfileImageUpload.ts` | 이미지 상태·핸들러·mutation·검증 캡슐화 + object URL 라이프사이클 |
| `features/mypage/lib/cropImage.ts` | `getCroppedImageFile` — canvas로 크롭 영역을 JPEG `File`로 변환 |
| `features/mypage/lib/imageValidation.ts` | `validateProfileImageFile` — 타입/5MB 검증 (재사용) |

## 비고

- 크롭 비율은 1:1 고정, 초기 줌 2배, 출력은 `image/jpeg`(품질 0.9).
- object URL은 `useEffect` cleanup에서 해제하여 재선택·언마운트 시 누수를 방지한다.
- i18n 키(`crop_profile_image`, `zoom`, `image_crop_failed`)는 Google Sheets에 등록 후 `pnpm i18n:sync`로 반영한다.
