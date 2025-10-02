export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[1]) : null;
};

interface SetCookieOptions {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  sameSite?: "Lax" | "Strict" | "None";
}

export const setCookie = ({ name, value, maxAge, path, sameSite = "Lax" }: SetCookieOptions) => {
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=${path}; SameSite=${sameSite}`;
}

interface DeleteCookieOptions {
  name: string;
  path?: string;
}

export const deleteCookie = ({name, path}: DeleteCookieOptions) => {
  document.cookie = `${name}=; Max-Age=0; Path=${path}`;
}
