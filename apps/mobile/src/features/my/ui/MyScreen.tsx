import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import { Button } from "@shared/ui/button";
import { Touchable } from "@shared/ui/press";
import { Section } from "@shared/ui/section";
import { MY_AVATAR_SIZE, MyProfileSkeleton } from "@shared/ui/skeleton";

import { BottomTabInset, Spacing } from "@/constants/theme";

import { MyLikes } from "./MyLikes";
import {
  MY_MENU_GROUPS,
  type MyMenuGroup,
  type MyMenuItem,
} from "../model/menu";
import { useUserInfo } from "../model/useUserInfo";
import { useUserProfile } from "../model/useUserProfile";

// 줄 높이. 44 는 터치의 바닥이지 디자인이 아니다 — 두 줄짜리 화면에서 56 은 쪼그라들어
// 보인다. body-2 라벨 한 줄(19)을 위아래 22 로 감싸 64 로 둔다.
const MENU_ROW_HEIGHT = 64;

/**
 * 마이페이지. 가입 유도(또는 이름·이메일) 블록 + 관심 목록 + 메뉴.
 *
 * 계정 줄(로그인 정보·프로필 관리·맞춤 정보)은 일부러 두지 않았다. web 에는 있지만
 * 앱에는 그 화면들이 없어서, 줄만 깔면 눌러도 아무 데도 가지 않는 컨트롤이 네 개 생긴다.
 * 메뉴는 아직 로그인 여부와 무관하다 — 계정이 필요한 항목이 생기면 그때 갈린다.
 */
export function MyScreen() {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);

  // 묶음이 하나뿐이면 묶음 제목을 그리지 않는다. 묶음 제목은 "이것과 저것을 가른다"는
  // 뜻이라, 가를 상대가 없으면 제목·구분 띠·간격이 그것이 묶는 두 줄보다 무거워진다.
  // 계정 줄(장바구니·관심상품·프로필)이 들어와 묶음이 둘이 되면 제목이 저절로 돌아온다.
  const hasGroups = MY_MENU_GROUPS.length > 1;

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerStyle={{ paddingBottom: insets.bottom + BottomTabInset }}
      showsVerticalScrollIndicator={false}
    >
      {isAuthenticated ? <SignedInHeader /> : <SignUpPitch />}
      {isAuthenticated ? <MyLikes /> : null}
      {MY_MENU_GROUPS.map((group) => (
        <MenuGroup group={group} key={group.title} withTitle={hasGroups} />
      ))}
    </ScrollView>
  );
}

/**
 * 위 블록과 메뉴가 같은 왼쪽 선에서 시작하도록 둘 다 px-5 왼쪽 정렬이다.
 * 다만 정렬만 맞추면 제목·설명·버튼·메뉴 줄이 같은 폭으로 평평하게 쌓여,
 * 버튼 바로 아래 그어지는 줄 때문에 버튼이 메뉴의 첫 항목처럼 보인다.
 * 그래서 이 블록은 위아래로 제 영역을 확보해 메뉴와 떨어진 한 덩어리로 읽히게 한다.
 */
function ScreenBlock({
  children,
  bottom = Spacing.section,
}: {
  children: React.ReactNode;
  /** 바로 아래 블록이 제 위 여백을 들고 있으면 0 을 준다 — 둘이 겹치면 두 배가 된다. */
  bottom?: number;
}) {
  return (
    <View
      className="px-5"
      style={{
        paddingTop: Spacing.chapter,
        paddingBottom: bottom,
      }}
    >
      {children}
    </View>
  );
}

function SignUpPitch() {
  const router = useRouter();

  return (
    <ScreenBlock>
      <Text className="text-title-3 text-foreground font-bold">
        Join Seoul Moment
      </Text>
      <Text
        className="text-body-3 text-neutral"
        style={{ marginTop: Spacing.tight }}
      >
        Save what you like and pick up where you left off.
      </Text>
      <Button
        label="Sign in"
        onPress={() => router.push("/login")}
        style={{ marginTop: Spacing.inner }}
      />
    </ScreenBlock>
  );
}

/**
 * 로그인한 사람. 이름(닉네임)과 이메일, 그리고 로그아웃.
 *
 * 두 번을 묻는다 — 프로필(user/profile)이 닉네임·사진을, 계정 정보(user/info)가 이메일을
 * 준다. 둘은 서로의 실패를 가리지 않는다: 이메일을 못 받았으면 그 줄만 빠지고,
 * 프로필을 못 받아도 로그아웃 길은 남는다. 이름을 못 받았다고 계정에서 나갈 수 없으면 안 된다.
 *
 * 가드 순서는 앱의 다른 화면과 같다 — 오프라인 → 로딩 → 실패 → 그리기.
 * 어느 갈래에서도 아래 관심 목록과 메뉴는 그대로 동작한다.
 */
function SignedInHeader() {
  const logout = useUserAuthStore((s) => s.logout);
  const profile = useUserProfile();
  const info = useUserInfo();

  const confirmSignOut = () =>
    // 앱에서 되돌릴 수 없는 유일한 동작이라 한 번 묻는다.
    Alert.alert(
      "Sign out?",
      "You'll need to sign in again to see your account.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: logout },
      ],
    );

  const paused =
    (profile.isPending && profile.fetchStatus === "paused") ||
    (info.isPending && info.fetchStatus === "paused");

  if (paused) {
    return (
      <SignedInShell onSignOut={confirmSignOut}>
        <IdentityText
          detail="You appear to be offline."
          nickname="You're signed in"
        />
      </SignedInShell>
    );
  }

  // 둘 중 하나라도 오는 중이면 한 덩어리로 기다린다. 먼저 온 쪽만 그리면
  // 이메일 줄이 뒤늦게 끼어들며 아래 블록이 통째로 내려앉는다.
  if (profile.isPending || info.isPending) {
    return (
      <SignedInShell onSignOut={confirmSignOut}>
        <MyProfileSkeleton />
      </SignedInShell>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <SignedInShell onSignOut={confirmSignOut}>
        <IdentityText
          detail="We couldn't load your profile."
          nickname="You're signed in"
        />
      </SignedInShell>
    );
  }

  return (
    <SignedInShell onSignOut={confirmSignOut}>
      <Avatar uri={profile.data.profileImageUrl} />
      {/* 이메일만 실패한 경우다. 빈 줄을 남기느니 한 줄 짧은 블록이 낫다. */}
      <IdentityText
        detail={info.data?.email}
        nickname={profile.data.nickname}
      />
    </SignedInShell>
  );
}

function SignedInShell({
  children,
  onSignOut,
}: {
  children: React.ReactNode;
  onSignOut(): void;
}) {
  return (
    // 아래 관심 목록의 섹션 위 간격(40)이 이 블록과의 사이를 띄운다.
    <ScreenBlock bottom={0}>
      {children}
      <Button
        label="Sign out"
        onPress={onSignOut}
        style={{ marginTop: Spacing.inner }}
        variant="secondary"
      />
    </ScreenBlock>
  );
}

/** 사진이 없거나 404 여도 흰 구멍이 남지 않도록 회색 원을 깔고 그 위에 얹는다. */
function Avatar({ uri }: { uri?: string }) {
  return (
    <View
      className="bg-surface-muted overflow-hidden"
      style={{
        width: MY_AVATAR_SIZE,
        height: MY_AVATAR_SIZE,
        borderRadius: MY_AVATAR_SIZE / 2,
        marginBottom: Spacing.tight,
      }}
    >
      {uri ? (
        <Image
          contentFit="cover"
          source={uri}
          style={{ width: "100%", height: "100%" }}
          transition={200}
        />
      ) : null}
    </View>
  );
}

/**
 * 이름 두 줄. 가입 유도 블록과 같은 자리·같은 크기를 쓴다 —
 * 로그인 전후로 같은 블록이 내용만 바뀐 것으로 읽혀야 한다.
 */
function IdentityText({
  nickname,
  detail,
}: {
  nickname: string;
  /** 보통은 이메일. 못 받았으면 줄 자체를 그리지 않는다. */
  detail?: string;
}) {
  return (
    <>
      <Text className="text-title-3 text-foreground font-bold">{nickname}</Text>
      {detail ? (
        <Text className="text-body-3 text-neutral mt-1">{detail}</Text>
      ) : null}
    </>
  );
}

function MenuGroup({
  group,
  withTitle,
}: {
  group: MyMenuGroup;
  withTitle: boolean;
}) {
  const router = useRouter();

  const rows = group.items.map((item) => (
    <MenuRow
      item={item}
      key={item.label}
      onPress={() => router.push(item.href)}
    />
  ));

  if (withTitle) {
    return <Section title={group.title}>{rows}</Section>;
  }

  // 위 블록이 자기 아래 여백을 갖고 있으므로 여기서 또 띄우지 않는다.
  // 양쪽이 각자 띄우면 두 배가 되고, 그만큼 화면이 아래로 밀려 더 비어 보인다.
  return <View>{rows}</View>;
}

function MenuRow({ item, onPress }: { item: MyMenuItem; onPress(): void }) {
  return (
    <Touchable
      accessibilityLabel={item.label}
      accessibilityRole="button"
      // 줄 사이 선은 줄의 위에 긋는다. 아래에 그으면 마지막 줄 밑에 아무것도 없는
      // 선이 남는다. 첫 줄의 윗선이 위 블록과 메뉴를 가르는 선을 겸한다.
      className="border-neutral-subtle flex-row items-center justify-between border-t px-5"
      onPress={onPress}
      style={{ height: MENU_ROW_HEIGHT }}
    >
      <Text className="text-body-2 text-foreground">{item.label}</Text>
      <Text className="text-body-1 text-neutral">›</Text>
    </Touchable>
  );
}
