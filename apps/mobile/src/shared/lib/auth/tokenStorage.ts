import * as SecureStore from "expo-secure-store";

/**
 * 토큰 영속 저장소 (iOS Keychain / Android Keystore).
 *
 * 앱에는 localStorage 가 없고, AsyncStorage 는 암호화되지 않으므로 토큰은 SecureStore 에 둔다.
 * SecureStore 는 값 하나당 약 2KB 제한이 있어 두 토큰을 JSON 하나로 묶지 않고 키를 나눠 저장한다.
 */
const ACCESS_TOKEN_KEY = "user-auth.access-token";
const REFRESH_TOKEN_KEY = "user-auth.refresh-token";

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

const write = (key: string, value: string | null) =>
  value
    ? SecureStore.setItemAsync(key, value)
    : SecureStore.deleteItemAsync(key);

export const tokenStorage = {
  async load(): Promise<StoredTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    return { accessToken, refreshToken };
  },
  async save({ accessToken, refreshToken }: StoredTokens) {
    await Promise.all([
      write(ACCESS_TOKEN_KEY, accessToken),
      write(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
